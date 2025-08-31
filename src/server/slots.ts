import { prisma } from './db';
import { getDailySlots } from '../lib/availability';
import { startEndOfWeek, formatPt } from '../lib/time';

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
  // Fetch service details if serviceId is provided
  let service;
  if (serviceId) {
    service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, name: true, durationMin: true },
    });
      throw new Error(`Service with id ${serviceId} not found`);
    }
  }

  // Fetch availability rules
  const rules = await prisma.availabilityRule.findMany({
    where: serviceId ? { serviceId } : {},
    orderBy: [{ weekday: 'asc' }, { start: 'asc' }],
  });

  // Fetch blackout dates in range
  const blackouts = await prisma.blackoutDate.findMany({
    where: {
      date: { gte: weekStart, lte: weekEnd },
    },
  });

  // Fetch existing appointments in range
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      startsAt: { gte: weekStart, lte: weekEnd },
      status: { notIn: ['cancelled'] },
    },
    select: { id: true, startsAt: true, endsAt: true },
  });

  // Build slots map for each day
  const daysMap = new Map<string, Date[]>();
  const currentDate = new Date(weekStart);

  while (currentDate <= weekEnd) {
    const dateKey = currentDate.toISOString().split('T')[0];

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
      slots: slots.map(slot => slot.toISOString()),
      dateKey,
    })
  );

  // Sort by date
  days.sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  return { days, service };
}
