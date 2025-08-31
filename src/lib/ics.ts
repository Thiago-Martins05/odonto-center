export interface Appointment {
  id: string;
  startsAt: Date;
  endsAt: Date;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  observations?: string;
}

import { Service } from "@/types/service";

export interface Clinic {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export function makeIcs({
  appointment,
  service,
  clinic,
}: {
  appointment: Appointment;
  service: Service;
  clinic: Clinic;
}): string {
  const formatDate = (date: Date): string => {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  };

  const escapeText = (text: string): string => {
    return text
      .replace(/[\\;,]/g, "\\$&")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r");
  };

  const now = new Date();
  const eventId = appointment.id;
  const startDate = formatDate(appointment.startsAt);
  const endDate = formatDate(appointment.endsAt);
  const createdDate = formatDate(now);

  const summary = `Consulta — ${service.name}`;
  const description = `Consulta agendada para ${service.name}${
    appointment.observations
      ? `\n\nObservações: ${appointment.observations}`
      : ""
  }`;
  const location = clinic.address;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Odonto Center//Agendamento Online//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${eventId}@odontocenter.com`,
    `DTSTAMP:${createdDate}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location)}`,
    `ORGANIZER;CN=${escapeText(clinic.name)}:mailto:${clinic.email}`,
    `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN=${escapeText(
      appointment.patientName
    )}:mailto:${appointment.patientEmail}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(summary)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return icsContent;
}
