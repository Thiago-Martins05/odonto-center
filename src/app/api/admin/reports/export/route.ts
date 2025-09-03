import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/server/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type") || "all";
    const format = searchParams.get("format") || "csv";

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch data based on report type
    let data: any = {};
    let filename = "";

    if (type === "appointments" || type === "all") {
      const appointments = await prisma.appointment.findMany({
        where: {
          startsAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          service: true,
        },
        orderBy: {
          startsAt: "asc",
        },
      });

      data.appointments = appointments.map(appointment => ({
        id: appointment.id,
        patientName: appointment.patientName,
        email: appointment.email,
        phone: appointment.phone,
        serviceName: appointment.service.name,
        servicePrice: appointment.service.priceCents / 100,
        startsAt: appointment.startsAt.toLocaleString("pt-BR"),
        endsAt: appointment.endsAt.toLocaleString("pt-BR"),
        status: appointment.status,
        notes: appointment.notes,
        createdAt: appointment.createdAt.toLocaleString("pt-BR"),
      }));

      filename = `agendamentos-${startDate}-${endDate}`;
    }

    if (type === "financial" || type === "all") {
      const completedAppointments = await prisma.appointment.findMany({
        where: {
          startsAt: {
            gte: start,
            lte: end,
          },
          status: "done",
        },
        include: {
          service: true,
        },
        orderBy: {
          startsAt: "asc",
        },
      });

      const totalRevenue = completedAppointments.reduce(
        (sum, appointment) => sum + appointment.service.priceCents,
        0
      );

      const serviceRevenue = completedAppointments.reduce((acc, appointment) => {
        const serviceName = appointment.service.name;
        if (!acc[serviceName]) {
          acc[serviceName] = {
            serviceName,
            count: 0,
            revenue: 0,
          };
        }
        acc[serviceName].count++;
        acc[serviceName].revenue += appointment.service.priceCents;
        return acc;
      }, {} as Record<string, { serviceName: string; count: number; revenue: number }>);

      data.financial = {
        summary: {
          totalRevenue: totalRevenue / 100,
          totalAppointments: completedAppointments.length,
          averageTicket: completedAppointments.length > 0 ? (totalRevenue / completedAppointments.length) / 100 : 0,
        },
        byService: Object.values(serviceRevenue).map(service => ({
          ...service,
          revenue: service.revenue / 100,
        })),
        details: completedAppointments.map(appointment => ({
          id: appointment.id,
          patientName: appointment.patientName,
          serviceName: appointment.service.name,
          servicePrice: appointment.service.priceCents / 100,
          startsAt: appointment.startsAt.toLocaleString("pt-BR"),
        })),
      };

      filename = `financeiro-${startDate}-${endDate}`;
    }

    if (type === "services" || type === "all") {
      const services = await prisma.service.findMany({
        orderBy: {
          name: "asc",
        },
      });

      const serviceStats = await Promise.all(
        services.map(async (service) => {
          const appointments = await prisma.appointment.findMany({
            where: {
              serviceId: service.id,
              startsAt: {
                gte: start,
                lte: end,
              },
            },
          });

          const completedAppointments = appointments.filter(a => a.status === "done");
          const revenue = completedAppointments.length * service.priceCents;

          return {
            id: service.id,
            name: service.name,
            slug: service.slug,
            durationMin: service.durationMin,
            price: service.priceCents / 100,
            active: service.active,
            totalBookings: appointments.length,
            completedBookings: completedAppointments.length,
            cancelledBookings: appointments.filter(a => a.status === "cancelled").length,
            revenue: revenue / 100,
          };
        })
      );

      data.services = serviceStats;
      filename = `servicos-${startDate}-${endDate}`;
    }

    if (type === "availability" || type === "all") {
      const availabilityRules = await prisma.availabilityRule.findMany({
        include: {
          service: true,
        },
      });

      const blackoutDates = await prisma.blackoutDate.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      });

      const appointments = await prisma.appointment.findMany({
        where: {
          startsAt: {
            gte: start,
            lte: end,
          },
        },
        include: {
          service: true,
        },
      });

      data.availability = {
        rules: availabilityRules.map(rule => ({
          id: rule.id,
          weekday: rule.weekday,
          weekdayName: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][rule.weekday],
          start: rule.start,
          end: rule.end,
          serviceName: rule.service?.name || "Geral",
        })),
        blackoutDates: blackoutDates.map(blackout => ({
          date: blackout.date.toLocaleDateString("pt-BR"),
          reason: blackout.reason,
        })),
        appointments: appointments.map(appointment => ({
          id: appointment.id,
          patientName: appointment.patientName,
          serviceName: appointment.service.name,
          startsAt: appointment.startsAt.toLocaleString("pt-BR"),
          endsAt: appointment.endsAt.toLocaleString("pt-BR"),
          status: appointment.status,
        })),
      };

      filename = `disponibilidade-${startDate}-${endDate}`;
    }

    if (format === "csv") {
      return generateCSV(data, type, filename);
    } else if (format === "pdf") {
      return generatePDF(data, type, filename, startDate, endDate);
    } else {
      return NextResponse.json(
        { error: "Unsupported format" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error exporting reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateCSV(data: any, type: string, filename: string) {
  let csvContent = "";
  let headers: string[] = [];

  if (type === "appointments" || type === "all") {
    if (data.appointments) {
      headers = [
        "ID",
        "Nome do Paciente",
        "Email",
        "Telefone",
        "Serviço",
        "Preço (R$)",
        "Data/Hora Início",
        "Data/Hora Fim",
        "Status",
        "Observações",
        "Data de Criação"
      ];
      csvContent += headers.join(",") + "\n";
      
      data.appointments.forEach((appointment: any) => {
        const row = [
          appointment.id,
          `"${appointment.patientName}"`,
          appointment.email,
          appointment.phone || "",
          `"${appointment.serviceName}"`,
          appointment.servicePrice,
          `"${appointment.startsAt}"`,
          `"${appointment.endsAt}"`,
          appointment.status,
          `"${appointment.notes || ""}"`,
          `"${appointment.createdAt}"`
        ];
        csvContent += row.join(",") + "\n";
      });
    }
  }

  if (type === "financial" || type === "all") {
    if (data.financial) {
      csvContent += "\n\nRELATÓRIO FINANCEIRO\n";
      csvContent += "Receita Total (R$),Total de Agendamentos,Ticket Médio (R$)\n";
      csvContent += `${data.financial.summary.totalRevenue},${data.financial.summary.totalAppointments},${data.financial.summary.averageTicket}\n`;
      
      csvContent += "\nRECEITA POR SERVIÇO\n";
      csvContent += "Serviço,Quantidade,Receita (R$)\n";
      data.financial.byService.forEach((service: any) => {
        csvContent += `"${service.serviceName}",${service.count},${service.revenue}\n`;
      });
    }
  }

  if (type === "services" || type === "all") {
    if (data.services) {
      csvContent += "\n\nRELATÓRIO DE SERVIÇOS\n";
      headers = [
        "ID",
        "Nome",
        "Slug",
        "Duração (min)",
        "Preço (R$)",
        "Ativo",
        "Total Agendamentos",
        "Agendamentos Concluídos",
        "Agendamentos Cancelados",
        "Receita (R$)"
      ];
      csvContent += headers.join(",") + "\n";
      
      data.services.forEach((service: any) => {
        const row = [
          service.id,
          `"${service.name}"`,
          service.slug,
          service.durationMin,
          service.price,
          service.active ? "Sim" : "Não",
          service.totalBookings,
          service.completedBookings,
          service.cancelledBookings,
          service.revenue
        ];
        csvContent += row.join(",") + "\n";
      });
    }
  }

  if (type === "availability" || type === "all") {
    if (data.availability) {
      csvContent += "\n\nRELATÓRIO DE DISPONIBILIDADE\n";
      csvContent += "REGRAS DE DISPONIBILIDADE\n";
      csvContent += "Dia da Semana,Início,Fim,Serviço\n";
      data.availability.rules.forEach((rule: any) => {
        csvContent += `"${rule.weekdayName}","${rule.start}","${rule.end}","${rule.serviceName}"\n`;
      });
      
      csvContent += "\nDATAS BLOQUEADAS\n";
      csvContent += "Data,Motivo\n";
      data.availability.blackoutDates.forEach((blackout: any) => {
        csvContent += `"${blackout.date}","${blackout.reason || ""}"\n`;
      });
    }
  }

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}

function generatePDF(data: any, type: string, filename: string, startDate: string, endDate: string) {
  try {

    
    // Import jsPDF dynamically
    const { jsPDF } = require('jspdf');
    require('jspdf-autotable');
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Relatório OdontoCenter', 20, 30);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Período: ${startDate} a ${endDate}`, 20, 45);
    doc.text(`Tipo: ${getReportTypeName(type)}`, 20, 55);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 20, 65);
    
    let yPosition = 80;
    
    // Appointments Report
    if (type === "appointments" || type === "all") {
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Agendamentos', 20, yPosition);
      yPosition += 15;
      
      if (data.appointments && data.appointments.length > 0) {
        const appointmentsData = data.appointments.map((appointment: any) => [
          appointment.patientName,
          appointment.serviceName,
          appointment.startsAt,
          appointment.status,
          `R$ ${appointment.servicePrice.toFixed(2)}`
        ]);
        
        doc.autoTable({
          head: [['Paciente', 'Serviço', 'Data/Hora', 'Status', 'Valor']],
          body: appointmentsData,
          startY: yPosition,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [66, 139, 202] }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 20;
      } else {
        // Show summary even if no detailed data
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text('Resumo de Agendamentos:', 20, yPosition);
        yPosition += 10;
        
        if (data.appointments) {
          doc.text(`Total: ${data.appointments.total || 0}`, 30, yPosition);
          yPosition += 8;
          doc.text(`Agendados: ${data.appointments.scheduled || 0}`, 30, yPosition);
          yPosition += 8;
          doc.text(`Concluídos: ${data.appointments.completed || 0}`, 30, yPosition);
          yPosition += 8;
          doc.text(`Cancelados: ${data.appointments.cancelled || 0}`, 30, yPosition);
          yPosition += 15;
        } else {
          doc.text('Nenhum agendamento encontrado no período.', 30, yPosition);
          yPosition += 15;
        }
      }
    }
    
    // Financial Report
    if (type === "financial" || type === "all") {
      if (data.financial) {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Relatório Financeiro', 20, yPosition);
        yPosition += 15;
        
        // Summary
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Receita Total: R$ ${data.financial.summary.totalRevenue.toFixed(2)}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Total de Agendamentos: ${data.financial.summary.totalAppointments}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Ticket Médio: R$ ${data.financial.summary.averageTicket.toFixed(2)}`, 20, yPosition);
        yPosition += 20;
        
        // Services breakdown
        if (data.financial.byService && data.financial.byService.length > 0) {
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.text('Receita por Serviço', 20, yPosition);
          yPosition += 15;
          
          const servicesData = data.financial.byService.map((service: any) => [
            service.serviceName,
            service.count,
            `R$ ${service.revenue.toFixed(2)}`
          ]);
          
          doc.autoTable({
            head: [['Serviço', 'Quantidade', 'Receita']],
            body: servicesData,
            startY: yPosition,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [40, 167, 69] }
          });
          
          yPosition = (doc as any).lastAutoTable.finalY + 20;
        }
      }
    }
    
    // Services Report
    if (type === "services" || type === "all") {
      if (data.services && data.services.length > 0) {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Relatório de Serviços', 20, yPosition);
        yPosition += 15;
        
        const servicesData = data.services.map((service: any) => [
          service.name,
          service.active ? 'Ativo' : 'Inativo',
          service.totalBookings,
          service.completedBookings,
          service.cancelledBookings,
          `R$ ${service.revenue.toFixed(2)}`
        ]);
        
        doc.autoTable({
          head: [['Serviço', 'Status', 'Total', 'Concluídos', 'Cancelados', 'Receita']],
          body: servicesData,
          startY: yPosition,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [255, 193, 7] }
        });
        
        yPosition = (doc as any).lastAutoTable.finalY + 20;
      }
    }
    
    // Availability Report
    if (type === "availability" || type === "all") {
      if (data.availability) {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Relatório de Disponibilidade', 20, yPosition);
        yPosition += 15;
        
        // Summary
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(`Total de Horários: ${data.availability.totalSlots}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Horários Ocupados: ${data.availability.bookedSlots}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Horários Disponíveis: ${data.availability.availableSlots}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Taxa de Utilização: ${data.availability.utilizationRate}%`, 20, yPosition);
        yPosition += 20;
        
        // Rules
        if (data.availability.rules && data.availability.rules.length > 0) {
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.text('Regras de Disponibilidade', 20, yPosition);
          yPosition += 15;
          
          const rulesData = data.availability.rules.map((rule: any) => [
            rule.weekdayName,
            rule.start,
            rule.end,
            rule.serviceName
          ]);
          
          doc.autoTable({
            head: [['Dia da Semana', 'Início', 'Fim', 'Serviço']],
            body: rulesData,
            startY: yPosition,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [108, 117, 125] }
          });
          
          yPosition = (doc as any).lastAutoTable.finalY + 20;
        }
      }
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text(`Página ${i} de ${pageCount}`, 20, doc.internal.pageSize.height - 10);
      doc.text('OdontoCenter - Sistema de Gestão Odontológica', doc.internal.pageSize.width - 100, doc.internal.pageSize.height - 10);
    }
    
    const pdfBuffer = doc.output('arraybuffer');
    
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Fallback to simple PDF
    return generateSimplePDF(data, type, filename, startDate, endDate);
  }
}

function generateSimplePDF(data: any, type: string, filename: string, startDate: string, endDate: string) {
  // Generate a more detailed simple PDF with actual data
  let content = `RELATORIO ODONTOCENTER\n\n`;
  content += `Periodo: ${startDate} a ${endDate}\n`;
  content += `Tipo: ${getReportTypeName(type)}\n`;
  content += `Gerado em: ${new Date().toLocaleString("pt-BR")}\n\n`;
  
  // Add appointments data
  if (type === "appointments" || type === "all") {
    content += `=== AGENDAMENTOS ===\n`;
    if (data.appointments) {
      content += `Total: ${data.appointments.total || 0}\n`;
      content += `Agendados: ${data.appointments.scheduled || 0}\n`;
      content += `Concluidos: ${data.appointments.completed || 0}\n`;
      content += `Cancelados: ${data.appointments.cancelled || 0}\n\n`;
    } else {
      content += `Nenhum agendamento encontrado no periodo.\n\n`;
    }
  }
  
  // Add financial data
  if (type === "financial" || type === "all") {
    content += `=== RELATORIO FINANCEIRO ===\n`;
    if (data.financial && data.financial.summary) {
      content += `Receita Total: R$ ${(data.financial.summary.totalRevenue || 0).toFixed(2)}\n`;
      content += `Total de Agendamentos: ${data.financial.summary.totalAppointments || 0}\n`;
      content += `Ticket Medio: R$ ${(data.financial.summary.averageTicket || 0).toFixed(2)}\n\n`;
    } else {
      content += `Dados financeiros nao disponiveis.\n\n`;
    }
  }
  
  // Add services data
  if (type === "services" || type === "all") {
    content += `=== RELATORIO DE SERVICOS ===\n`;
    if (data.services) {
      content += `Total de Servicos: ${data.services.total || 0}\n`;
      content += `Servicos Ativos: ${data.services.active || 0}\n`;
      content += `Servicos Inativos: ${data.services.inactive || 0}\n\n`;
    } else {
      content += `Nenhum servico encontrado.\n\n`;
    }
  }
  
  // Add availability data
  if (type === "availability" || type === "all") {
    content += `=== RELATORIO DE DISPONIBILIDADE ===\n`;
    if (data.availability) {
      content += `Total de Horarios: ${data.availability.totalSlots || 0}\n`;
      content += `Horarios Ocupados: ${data.availability.bookedSlots || 0}\n`;
      content += `Horarios Disponiveis: ${data.availability.availableSlots || 0}\n`;
      content += `Taxa de Utilizacao: ${data.availability.utilizationRate || 0}%\n\n`;
    } else {
      content += `Dados de disponibilidade nao disponiveis.\n\n`;
    }
  }
  
  content += `\nOdontoCenter - Sistema de Gestao Odontologica\n`;
  content += `Relatorio gerado automaticamente em ${new Date().toLocaleString("pt-BR")}`;

  // Create a simple PDF with proper encoding
  let pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj

4 0 obj
<<
/Length ${content.length * 2 + 200}
>>
stream
BT
/F1 12 Tf
72 720 Td
(${content.replace(/[()\\]/g, '\\$&').replace(/\n/g, ') Tj 0 -15 Td (')}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${754 + content.length * 2}
%%EOF`;

  return new NextResponse(pdfContent, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
    },
  });
}

function getReportTypeName(type: string): string {
  switch (type) {
    case "appointments": return "Agendamentos";
    case "financial": return "Financeiro";
    case "services": return "Serviços";
    case "availability": return "Disponibilidade";
    case "all": return "Completo";
    default: return "Relatório";
  }
}
