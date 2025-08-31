import { Resend } from "resend";
import {
  makeIcs,
  type Appointment,
  type Service,
  type Clinic,
} from "../lib/ics";

const resend = new Resend(process.env.RESEND_API_KEY);

// Mock clinic data - in production, this would come from environment or database
const clinic: Clinic = {
  name: "Odonto Center",
  address: "Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567",
  phone: "(11) 99999-9999",
  email: "contato@odontocenter.com",
};

export async function sendAppointmentConfirmation(appointmentId: string) {
  try {
    // TODO: Replace with actual database fetch
    // For now, using mock data structure
    const mockAppointment: Appointment = {
      id: appointmentId,
      startsAt: new Date(), // This would come from the actual appointment
      endsAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
      patientName: "Paciente Mock",
      patientEmail: "paciente@example.com",
      patientPhone: "(11) 88888-8888",
      observations: "Observação de teste",
    };

    const mockService: Service = {
      id: "1",
      name: "Consulta de Avaliação",
      description: "Avaliação completa da saúde bucal",
      durationMin: 60,
      price: 15000,
    };

    // Generate ICS calendar file
    const icsContent = makeIcs({
      appointment: mockAppointment,
      service: mockService,
      clinic,
    });

    // Convert ICS content to Buffer for attachment
    const icsBuffer = Buffer.from(icsContent, "utf-8");

    // Format appointment date for email
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    };

    const formatPrice = (priceInCents: number) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(priceInCents / 100);
    };

    // Send email
    const { data, error } = await resend.emails.send({
      from: "Odonto Center <noreply@odontocenter.com>",
      to: [mockAppointment.patientEmail],
      bcc: [clinic.email], // Optional BCC to clinic mailbox
      subject: `Confirmação de Agendamento - ${mockService.name}`,
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmação de Agendamento</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #e5e7eb; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .content { padding: 30px 0; }
            .appointment-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .detail-label { font-weight: bold; color: #6b7280; }
            .detail-value { color: #111827; }
            .footer { text-align: center; padding: 20px 0; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            .cta { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .important { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Odonto Center</div>
              <p>Confirmação de Agendamento</p>
            </div>
            
            <div class="content">
              <h2>Olá, ${mockAppointment.patientName}!</h2>
              
              <p>Seu agendamento foi confirmado com sucesso. Aqui estão os detalhes:</p>
              
              <div class="appointment-details">
                <div class="detail-row">
                  <span class="detail-label">Serviço:</span>
                  <span class="detail-value">${mockService.name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Data e Hora:</span>
                  <span class="detail-value">${formatDate(
                    mockAppointment.startsAt
                  )}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Duração:</span>
                  <span class="detail-value">${
                    mockService.durationMin
                  } minutos</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Preço:</span>
                  <span class="detail-value">${formatPrice(
                    mockService.price
                  )}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Local:</span>
                  <span class="detail-value">${clinic.address}</span>
                </div>
              </div>
              
              ${
                mockAppointment.observations
                  ? `
                <div class="important">
                  <strong>Observações:</strong><br>
                  ${mockAppointment.observations}
                </div>
              `
                  : ""
              }
              
              <div class="important">
                <strong>⚠️ Importante:</strong><br>
                • Chegue 10 minutos antes do horário agendado<br>
                • Em caso de cancelamento, entre em contato com pelo menos 24h de antecedência<br>
                • Traga documentos de identificação
              </div>
              
              <p>O arquivo .ics está anexado para você adicionar ao seu calendário.</p>
              
              <p>Em caso de dúvidas, entre em contato conosco:</p>
              <p>
                📞 <strong>${clinic.phone}</strong><br>
                📧 <strong>${clinic.email}</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>Odonto Center - Cuidando do seu sorriso com excelência</p>
              <p>Este é um e-mail automático, não responda a esta mensagem.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `consulta-${appointmentId}.ics`,
          content: icsBuffer,
          contentType: "text/calendar",
        },
      ],
    });

    if (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send confirmation email");
    }

    console.log("Confirmation email sent successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in sendAppointmentConfirmation:", error);
    throw error;
  }
}
