import { getDailySlots, BlackoutDate, Appointment } from "../lib/availability";
import { formatPt } from "../lib/time";

export interface AvailableSlotsOptions {
  weekStart: Date;
  weekEnd: Date;
  serviceId?: string;
}

export interface DaySlots {
  date: string; // 'DD/MM/YYYY'
  slots: string[]; // ISO strings
  dateKey: string; // 'YYYY-MM-DD'
}

export interface AvailableSlotsResult {
  days: DaySlots[];
  service?: {
    id: string;
    name: string;
    durationMin: number;
  };
}

export async function getAvailableSlots({
  weekStart,
  weekEnd,
  serviceId,
}: AvailableSlotsOptions): Promise<AvailableSlotsResult> {
  // TODO: Replace with actual database calls when models are defined
  // For now, using mock data

  // Mock service data
  let service;
  if (serviceId) {
    service = {
      id: serviceId,
      name: "Mock Service",
      durationMin: 60,
    };
  }

  // Mock availability rules (weekdays 9 AM - 5 PM)
  const rules = [
    { id: "1", weekday: 1, start: "09:00", end: "17:00", serviceId },
    { id: "2", weekday: 2, start: "09:00", end: "17:00", serviceId },
    { id: "3", weekday: 3, start: "09:00", end: "17:00", serviceId },
    { id: "4", weekday: 4, start: "09:00", end: "17:00", serviceId },
    { id: "5", weekday: 5, start: "09:00", end: "17:00", serviceId },
  ];

  // Mock blackout dates (none for now)
  const blackouts: BlackoutDate[] = [];

  // Mock existing appointments (none for now)
  const existingAppointments: Appointment[] = [];

  // Build slots map for each day
  const daysMap = new Map<string, string[]>();
  const currentDate = new Date(weekStart);

  while (currentDate <= weekEnd) {
    const dateKey = currentDate.toISOString().split("T")[0];

    const slots = getDailySlots({
      date: new Date(currentDate),
      serviceDurationMin: service?.durationMin || 60,
      rules,
      blackouts,
      existingAppointments,
      stepMin: 15,
      bufferMin: 10,
    });

    if (slots.length > 0) {
      daysMap.set(dateKey, slots);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Convert to result format
  const days: DaySlots[] = Array.from(daysMap.entries()).map(
    ([dateKey, slots]) => ({
      date: formatPt(new Date(dateKey)),
      slots: slots, // slots are already strings
      dateKey,
    })
  );

  // Sort by date
  days.sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  return { days, service };
}
