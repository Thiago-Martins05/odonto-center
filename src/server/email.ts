import { Resend } from "resend";
import { makeIcs, type Appointment, type Clinic } from "../lib/ics";
import { Service } from "@/types/service";
import { formatPrice } from "@/types/service";

// Mock Resend se não houver API key
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Mock clinic data - in production, this would come from environment or database
const clinic: Clinic = {
  name: "Odonto Center",
  address: "Rua das Flores, 123 - Centro, São Paulo - SP, 01234-567",
  phone: "(11) 99999-9999",
  email: "contato@odontocenter.com",
};

export async function sendAppointmentConfirmation(appointmentId: string) {
  try {
    // Se não houver Resend configurado, apenas logar
    if (!resend) {
      console.log(
        "Email service not configured. Mock appointment confirmation:",
        appointmentId
      );
      return { success: true, message: "Email service not configured" };
    }

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
      name: "Limpeza Dental Profunda",
      slug: "limpeza-dental-profunda",
      description:
        "A limpeza profissional, também conhecida como profilaxia, é fundamental para a saúde bucal.",
      durationMin: 40,
      priceCents: 8000,
      active: true,
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
              
              <p>Seu agendamento foi confirmado com sucesso! 🎉</p>
              
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
                  <span class="detail-label">Valor:</span>
                  <span class="detail-value">${formatPrice(
                    mockService.priceCents
                  )}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Local:</span>
                  <span class="detail-value">${clinic.name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Endereço:</span>
                  <span class="detail-value">${clinic.address}</span>
                </div>
              </div>
              
              <div class="important">
                <strong>📅 Adicione ao seu calendário:</strong><br>
                O arquivo ICS está anexado a este email para facilitar a adição ao seu calendário pessoal.
              </div>
              
              <p><strong>Observações:</strong> ${
                mockAppointment.observations || "Nenhuma observação adicional."
              }</p>
              
              <p>Se precisar reagendar ou cancelar, entre em contato conosco:</p>
              <p>📞 <strong>Telefone:</strong> ${clinic.phone}<br>
              📧 <strong>E-mail:</strong> ${clinic.email}</p>
              
              <div style="text-align: center;">
                <a href="#" class="cta">Ver detalhes do agendamento</a>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Odonto Center</strong></p>
              <p>${clinic.address}</p>
              <p>${clinic.phone} | ${clinic.email}</p>
              <p>Horário de funcionamento: Segunda a Sexta, 8h às 18h</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: "agendamento.ics",
          content: icsBuffer,
        },
      ],
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error: error.message };
    }

    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error in sendAppointmentConfirmation:", error);
    return { success: false, error: "Failed to send confirmation email" };
  }
}
