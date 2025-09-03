import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET(request: NextRequest) {
  try {
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
    console.log("Generating PDF with data:", JSON.stringify(data, null, 2));
    
    // Use PDFKit for better server-side compatibility
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    
    // Collect PDF data
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    return new Promise<NextResponse>((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(new NextResponse(pdfBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}.pdf"`,
          },
        }));
      });
      
      doc.on('error', (error: any) => {
        console.error("PDF generation error:", error);
        reject(error);
      });
      
      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('Relatório OdontoCenter', 50, 50);
      
      doc.fontSize(12).font('Helvetica').text(`Período: ${startDate} a ${endDate}`, 50, 80);
      doc.text(`Tipo: ${getReportTypeName(type)}`, 50, 100);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 50, 120);
      
      let yPosition = 150;
    
      // Appointments Report
      if (type === "appointments" || type === "all") {
        doc.fontSize(16).font('Helvetica-Bold').text('Agendamentos', 50, yPosition);
        yPosition += 30;
        
        if (data.appointments && data.appointments.length > 0) {
          // Table header
          doc.fontSize(10).font('Helvetica-Bold');
          doc.text('Paciente', 50, yPosition);
          doc.text('Serviço', 150, yPosition);
          doc.text('Data/Hora', 250, yPosition);
          doc.text('Status', 350, yPosition);
          doc.text('Valor', 450, yPosition);
          yPosition += 20;
          
          // Table data
          doc.fontSize(9).font('Helvetica');
          data.appointments.forEach((appointment: any) => {
            doc.text(appointment.patientName || '', 50, yPosition);
            doc.text(appointment.serviceName || '', 150, yPosition);
            doc.text(appointment.startsAt || '', 250, yPosition);
            doc.text(appointment.status || '', 350, yPosition);
            doc.text(`R$ ${(appointment.servicePrice || 0).toFixed(2)}`, 450, yPosition);
            yPosition += 15;
          });
          yPosition += 20;
        } else {
          // Show summary even if no detailed data
          doc.fontSize(12).font('Helvetica');
          doc.text('Resumo de Agendamentos:', 50, yPosition);
          yPosition += 20;
          
          if (data.appointments) {
            doc.text(`Total: ${data.appointments.total || 0}`, 70, yPosition);
            yPosition += 15;
            doc.text(`Agendados: ${data.appointments.scheduled || 0}`, 70, yPosition);
            yPosition += 15;
            doc.text(`Concluídos: ${data.appointments.completed || 0}`, 70, yPosition);
            yPosition += 15;
            doc.text(`Cancelados: ${data.appointments.cancelled || 0}`, 70, yPosition);
            yPosition += 25;
          } else {
            doc.text('Nenhum agendamento encontrado no período.', 70, yPosition);
            yPosition += 25;
          }
        }
      }
    
      // Financial Report
      if (type === "financial" || type === "all") {
        doc.fontSize(16).font('Helvetica-Bold').text('Relatório Financeiro', 50, yPosition);
        yPosition += 30;
        
        if (data.financial) {
          // Summary
          doc.fontSize(12).font('Helvetica');
          doc.text(`Receita Total: R$ ${(data.financial.summary?.totalRevenue || 0).toFixed(2)}`, 50, yPosition);
          yPosition += 20;
          doc.text(`Total de Agendamentos: ${data.financial.summary?.totalAppointments || 0}`, 50, yPosition);
          yPosition += 20;
          doc.text(`Ticket Médio: R$ ${(data.financial.summary?.averageTicket || 0).toFixed(2)}`, 50, yPosition);
          yPosition += 30;
          
          // Services breakdown
          if (data.financial.byService && data.financial.byService.length > 0) {
            doc.fontSize(14).font('Helvetica-Bold').text('Receita por Serviço', 50, yPosition);
            yPosition += 25;
            
            // Table header
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Serviço', 50, yPosition);
            doc.text('Quantidade', 250, yPosition);
            doc.text('Receita', 350, yPosition);
            yPosition += 20;
            
            // Table data
            doc.fontSize(9).font('Helvetica');
            data.financial.byService.forEach((service: any) => {
              doc.text(service.serviceName || '', 50, yPosition);
              doc.text((service.count || 0).toString(), 250, yPosition);
              doc.text(`R$ ${(service.revenue || 0).toFixed(2)}`, 350, yPosition);
              yPosition += 15;
            });
            yPosition += 20;
          } else {
            doc.text('Nenhuma receita registrada no período.', 50, yPosition);
            yPosition += 25;
          }
        } else {
          doc.text('Dados financeiros não disponíveis.', 50, yPosition);
          yPosition += 25;
        }
      }
    
      // Services Report
      if (type === "services" || type === "all") {
        doc.fontSize(16).font('Helvetica-Bold').text('Relatório de Serviços', 50, yPosition);
        yPosition += 30;
        
        if (data.services && data.services.length > 0) {
          // Table header
          doc.fontSize(10).font('Helvetica-Bold');
          doc.text('Serviço', 50, yPosition);
          doc.text('Status', 200, yPosition);
          doc.text('Total', 250, yPosition);
          doc.text('Concluídos', 300, yPosition);
          doc.text('Cancelados', 380, yPosition);
          doc.text('Receita', 450, yPosition);
          yPosition += 20;
          
          // Table data
          doc.fontSize(9).font('Helvetica');
          data.services.forEach((service: any) => {
            doc.text(service.name || '', 50, yPosition);
            doc.text(service.active ? 'Ativo' : 'Inativo', 200, yPosition);
            doc.text((service.totalBookings || 0).toString(), 250, yPosition);
            doc.text((service.completedBookings || 0).toString(), 300, yPosition);
            doc.text((service.cancelledBookings || 0).toString(), 380, yPosition);
            doc.text(`R$ ${(service.revenue || 0).toFixed(2)}`, 450, yPosition);
            yPosition += 15;
          });
          yPosition += 20;
        } else {
          // Show summary even if no detailed data
          doc.fontSize(12).font('Helvetica');
          doc.text('Resumo de Serviços:', 50, yPosition);
          yPosition += 20;
          
          if (data.services) {
            doc.text(`Total de Serviços: ${data.services.total || 0}`, 70, yPosition);
            yPosition += 15;
            doc.text(`Serviços Ativos: ${data.services.active || 0}`, 70, yPosition);
            yPosition += 15;
            doc.text(`Serviços Inativos: ${data.services.inactive || 0}`, 70, yPosition);
            yPosition += 25;
          } else {
            doc.text('Nenhum serviço encontrado.', 70, yPosition);
            yPosition += 25;
          }
        }
      }
      
      // Availability Report
      if (type === "availability" || type === "all") {
        doc.fontSize(16).font('Helvetica-Bold').text('Relatório de Disponibilidade', 50, yPosition);
        yPosition += 30;
        
        if (data.availability) {
          // Summary
          doc.fontSize(12).font('Helvetica');
          doc.text(`Total de Horários: ${data.availability.totalSlots || 0}`, 50, yPosition);
          yPosition += 20;
          doc.text(`Horários Ocupados: ${data.availability.bookedSlots || 0}`, 50, yPosition);
          yPosition += 20;
          doc.text(`Horários Disponíveis: ${data.availability.availableSlots || 0}`, 50, yPosition);
          yPosition += 20;
          doc.text(`Taxa de Utilização: ${data.availability.utilizationRate || 0}%`, 50, yPosition);
          yPosition += 30;
          
          // Rules
          if (data.availability.rules && data.availability.rules.length > 0) {
            doc.fontSize(14).font('Helvetica-Bold').text('Regras de Disponibilidade', 50, yPosition);
            yPosition += 25;
            
            // Table header
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Dia da Semana', 50, yPosition);
            doc.text('Início', 200, yPosition);
            doc.text('Fim', 250, yPosition);
            doc.text('Serviço', 300, yPosition);
            yPosition += 20;
            
            // Table data
            doc.fontSize(9).font('Helvetica');
            data.availability.rules.forEach((rule: any) => {
              doc.text(rule.weekdayName || '', 50, yPosition);
              doc.text(rule.start || '', 200, yPosition);
              doc.text(rule.end || '', 250, yPosition);
              doc.text(rule.serviceName || '', 300, yPosition);
              yPosition += 15;
            });
            yPosition += 20;
          } else {
            doc.text('Nenhuma regra de disponibilidade configurada.', 50, yPosition);
            yPosition += 25;
          }
        } else {
          doc.text('Dados de disponibilidade não disponíveis.', 50, yPosition);
          yPosition += 25;
        }
      }
      
      // Footer
      doc.fontSize(8).font('Helvetica');
      doc.text('OdontoCenter - Sistema de Gestão Odontológica', 50, doc.page.height - 50);
      doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 50, doc.page.height - 30);
      
      // Finalize the PDF
      doc.end();
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
