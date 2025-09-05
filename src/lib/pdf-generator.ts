import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface ReportData {
  period: {
    startDate: string;
    endDate: string;
    type?: string;
  };
  summary: {
    totalAppointments: number;
    totalServices: number;
    totalContacts?: number;
    completedAppointments: number;
    cancelledAppointments: number;
  };
  appointments: Array<{
    id: string;
    patientName: string;
    email: string;
    phone: string | null;
    service: string;
    startsAt: string;
    endsAt: string;
    status: string;
    notes?: string;
  }>;
  services: Array<{
    id: string;
    name: string;
    duration: number;
    price: number;
    active: boolean;
    appointmentCount: number;
  }>;
  contacts?: Array<{
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string;
    createdAt: string;
  }>;
}

export function generateReportPDF(data: ReportData): jsPDF {
  try {
    const doc = new jsPDF();
    
    // Configurações
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Função para adicionar texto com quebra de linha
    const addText = (text: string, x: number, y: number, options: any = {}) => {
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      doc.text(lines, x, y);
      return y + (lines.length * 5) + 5;
    };

    // Cabeçalho
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    yPosition = addText('Relatório Odonto Center', margin, yPosition);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    yPosition = addText(`Período: ${formatDate(data.period.startDate)} a ${formatDate(data.period.endDate)}`, margin, yPosition);
    
    if (data.period.type && data.period.type !== 'all') {
      yPosition = addText(`Tipo: ${getTypeLabel(data.period.type)}`, margin, yPosition);
    }
    
    yPosition += 10;

    // Resumo
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPosition = addText('Resumo', margin, yPosition);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const summaryText = [
      `Total de Agendamentos: ${data.summary.totalAppointments}`,
      `Agendamentos Concluídos: ${data.summary.completedAppointments}`,
      `Agendamentos Cancelados: ${data.summary.cancelledAppointments}`,
      `Total de Serviços: ${data.summary.totalServices}`,
    ];
    
    if (data.summary.totalContacts !== undefined) {
      summaryText.push(`Total de Contatos: ${data.summary.totalContacts}`);
    }
    
    summaryText.forEach(text => {
      yPosition = addText(text, margin, yPosition);
    });
    
    yPosition += 10;

    // Tabela de Agendamentos
    if (data.appointments.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      yPosition = addText('Agendamentos', margin, yPosition);
      
      // Lista simples de agendamentos
      data.appointments.forEach((apt, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        yPosition = addText(`${index + 1}. ${apt.patientName} - ${apt.service}`, margin, yPosition);
        yPosition = addText(`   Data: ${formatDateTime(apt.startsAt)} | Status: ${getStatusLabel(apt.status)}`, margin, yPosition);
        yPosition += 5;
      });
      
      yPosition += 10;
    }

    // Tabela de Serviços
    if (data.services.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      yPosition = addText('Serviços', margin, yPosition);
      
      // Lista simples de serviços
      data.services.forEach((service, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        yPosition = addText(`${index + 1}. ${service.name}`, margin, yPosition);
        yPosition = addText(`   Duração: ${service.duration} min | Preço: ${formatCurrency(service.price)} | Status: ${service.active ? 'Ativo' : 'Inativo'}`, margin, yPosition);
        yPosition += 5;
      });
      
      yPosition += 10;
    }

    // Tabela de Contatos (se disponível)
    if (data.contacts && data.contacts.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      yPosition = addText('Mensagens de Contato', margin, yPosition);
      
      // Lista simples de contatos
      data.contacts.forEach((contact, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        yPosition = addText(`${index + 1}. ${contact.name}`, margin, yPosition);
        yPosition = addText(`   Email: ${contact.email} | Telefone: ${contact.phone || 'N/A'}`, margin, yPosition);
        yPosition = addText(`   Data: ${formatDate(contact.createdAt)}`, margin, yPosition);
        yPosition = addText(`   Mensagem: ${contact.message.length > 50 ? contact.message.substring(0, 50) + '...' : contact.message}`, margin, yPosition);
        yPosition += 5;
      });
    }

    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Página ${i} de ${pageCount} - Gerado em ${formatDateTime(new Date().toISOString())}`,
        margin,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    return doc;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    // Retornar um PDF simples em caso de erro
    const fallbackDoc = new jsPDF();
    fallbackDoc.setFontSize(16);
    fallbackDoc.text("Erro ao gerar relatório", 20, 20);
    fallbackDoc.setFontSize(12);
    fallbackDoc.text("Ocorreu um erro ao processar os dados do relatório.", 20, 40);
    fallbackDoc.text("Tente novamente ou entre em contato com o suporte.", 20, 60);
    return fallbackDoc;
  }
}

// Funções auxiliares
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('pt-BR');
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

function getStatusLabel(status: string): string {
  const statusLabels: { [key: string]: string } = {
    'scheduled': 'Agendado',
    'done': 'Concluído',
    'cancelled': 'Cancelado',
    'no_show': 'Não Compareceu'
  };
  return statusLabels[status] || status;
}

function getTypeLabel(type: string): string {
  const typeLabels: { [key: string]: string } = {
    'appointments': 'Agendamentos',
    'services': 'Serviços',
    'contacts': 'Contatos',
    'all': 'Todos'
  };
  return typeLabels[type] || type;
}