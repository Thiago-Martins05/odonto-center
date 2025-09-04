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

  // Check if the date is in the past - more robust comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // Additional check: compare date strings to avoid timezone issues
  const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const targetDateString = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
  
  const isPast = targetDateString < todayString;
  
  if (isPast) {
    // Date is in the past, no slots available
    return [];
  }

  // Only apply buffer if the date is today
  const isToday = targetDateString === todayString;
  const bufferTime = isToday
    ? new Date(now.getTime() + bufferMin * 60 * 1000)
    : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

  // Debug log for today
  if (isToday) {
    console.log(`🔍 Debug getDailySlots for today:`);
    console.log(`   now: ${now.toISOString()}`);
    console.log(`   bufferTime: ${bufferTime.toISOString()}`);
    console.log(`   bufferMin: ${bufferMin}`);
  }

  for (const rule of applicableRules) {
    const { start, end } = rule;
    const { hours: startHour, minutes: startMin } = parseHHMM(start);
    const { hours: endHour, minutes: endMin } = parseHHMM(end);

    // Create rule start and end times for this date
    const ruleStart = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      startHour,
      startMin,
      0,
      0
    );
    const ruleEnd = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      endHour,
      endMin,
      0,
      0
    );

    // Generate candidate slots in stepMin increments
    let currentSlot = new Date(ruleStart);

    while (currentSlot < ruleEnd) {
      const slotEnd = addMinutes(currentSlot, serviceDurationMin);

      // Check if slot is in the future (considering buffer time)
      const isSlotInFuture = currentSlot >= bufferTime;
      
      if (slotEnd <= ruleEnd && isSlotInFuture) {
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
