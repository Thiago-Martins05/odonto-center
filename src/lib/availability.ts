import { addMinutes, parseHHMM } from "./time";

export interface AvailabilityRule {
  id: string;
  weekday: number;
  start: string; // 'HH:mm'
  end: string; // 'HH:mm'
  serviceId?: string;
}

export interface BlackoutDate {
  id: string;
  date: Date;
  reason?: string;
}

export interface Appointment {
  id: string;
  startsAt: Date;
  endsAt: Date;
}

export interface DailySlotsOptions {
  date: Date;
  serviceDurationMin: number;
  rules: AvailabilityRule[];
  blackouts: BlackoutDate[];
  existingAppointments: Appointment[];
  stepMin?: number;
  bufferMin?: number;
}

export function getDailySlots({
  date,
  serviceDurationMin,
  rules,
  blackouts,
  existingAppointments,
  stepMin = 15,
  bufferMin = 10,
}: DailySlotsOptions): Date[] {
  // Check if date is blacked out
  const isBlackedOut = blackouts.some(
    (blackout) => blackout.date.toDateString() === date.toDateString()
  );

  if (isBlackedOut) return [];

  // Get rules for this weekday
  const weekday = date.getDay();
  const applicableRules = rules.filter((rule) => rule.weekday === weekday);

  if (applicableRules.length === 0) return [];

  // Generate slots for each rule window
  const allSlots: Date[] = [];
  const now = new Date();
  const bufferTime = new Date(now.getTime() + bufferMin * 60 * 1000);

  for (const rule of applicableRules) {
    const { start, end } = rule;
    const { hours: startHour, minutes: startMin } = parseHHMM(start);
    const { hours: endHour, minutes: endMin } = parseHHMM(end);

    // Create rule start and end times for this date
    const ruleStart = new Date(date);
    ruleStart.setHours(startHour, startMin, 0, 0);
    const ruleEnd = new Date(date);
    ruleEnd.setHours(endHour, endMin, 0, 0);

    // Generate candidate slots in stepMin increments
    let currentSlot = new Date(ruleStart);

    while (currentSlot < ruleEnd) {
      const slotEnd = addMinutes(currentSlot, serviceDurationMin);

      if (slotEnd <= ruleEnd && currentSlot >= bufferTime) {
        // Check for overlaps with existing appointments
        const hasOverlap = existingAppointments.some((appointment) => {
          const appointmentStart = new Date(appointment.startsAt);
          const appointmentEnd = new Date(appointment.endsAt);

          return currentSlot < appointmentEnd && slotEnd > appointmentStart;
        });

        if (!hasOverlap) {
          allSlots.push(new Date(currentSlot));
        }
      }

      currentSlot = addMinutes(currentSlot, stepMin);
    }
  }

  // Return sorted unique slots
  return allSlots
    .filter(
      (slot, index, self) =>
        self.findIndex((s) => s.getTime() === slot.getTime()) === index
    )
    .sort((a, b) => a.getTime() - b.getTime());
}
