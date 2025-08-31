"use server";

import { z } from "zod";

const availabilityRuleSchema = z.object({
  weekday: z.number().min(0).max(6),
  start: z.string().min(1, "Horário de início é obrigatório"),
  end: z.string().min(1, "Horário de fim é obrigatório"),
  serviceId: z.string().optional(),
});

const blackoutDateSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  reason: z.string().min(5, "Motivo deve ter pelo menos 5 caracteres"),
});

export type AvailabilityRuleFormData = z.infer<typeof availabilityRuleSchema>;
export type BlackoutDateFormData = z.infer<typeof blackoutDateSchema>;

export interface AvailabilityRule {
  id: string;
  weekday: number;
  start: string;
  end: string;
  serviceId?: string;
}

export interface BlackoutDate {
  id: string;
  date: Date;
  reason: string;
}

// Mock database for now - replace with actual Prisma calls
let mockAvailabilityRules: AvailabilityRule[] = [
  {
    id: "1",
    weekday: 1,
    start: "09:00",
    end: "17:00",
  },
  {
    id: "2",
    weekday: 2,
    start: "09:00",
    end: "17:00",
  },
  {
    id: "3",
    weekday: 3,
    start: "09:00",
    end: "17:00",
  },
  {
    id: "4",
    weekday: 4,
    start: "09:00",
    end: "17:00",
  },
  {
    id: "5",
    weekday: 5,
    start: "09:00",
    end: "17:00",
  },
];

let mockBlackoutDates: BlackoutDate[] = [
  {
    id: "1",
    date: new Date("2024-12-25"),
    reason: "Natal",
  },
  {
    id: "2",
    date: new Date("2024-12-31"),
    reason: "Ano Novo",
  },
];

export async function getAvailabilityRules(): Promise<AvailabilityRule[]> {
  try {
    // TODO: Replace with actual Prisma call
    // const rules = await prisma.availabilityRule.findMany({
    //   orderBy: [{ weekday: 'asc' }, { start: 'asc' }]
    // });

    return mockAvailabilityRules;
  } catch (error) {
    console.error("Error fetching availability rules:", error);
    throw new Error("Failed to fetch availability rules");
  }
}

export async function createAvailabilityRule(
  data: AvailabilityRuleFormData
): Promise<AvailabilityRule> {
  try {
    const validatedData = availabilityRuleSchema.parse(data);

    // TODO: Replace with actual Prisma call
    // const rule = await prisma.availabilityRule.create({
    //   data: validatedData
    // });

    const newRule: AvailabilityRule = {
      id: `rule_${Date.now()}`,
      ...validatedData,
    };

    mockAvailabilityRules.push(newRule);
    return newRule;
  } catch (error) {
    console.error("Error creating availability rule:", error);
    throw new Error("Failed to create availability rule");
  }
}

export async function deleteAvailabilityRule(id: string): Promise<void> {
  try {
    // TODO: Replace with actual Prisma call
    // await prisma.availabilityRule.delete({
    //   where: { id }
    // });

    mockAvailabilityRules = mockAvailabilityRules.filter((r) => r.id !== id);
  } catch (error) {
    console.error("Error deleting availability rule:", error);
    throw new Error("Failed to delete availability rule");
  }
}

export async function getBlackoutDates(): Promise<BlackoutDate[]> {
  try {
    // TODO: Replace with actual Prisma call
    // const blackouts = await prisma.blackoutDate.findMany({
    //   orderBy: { date: 'asc' }
    // });

    return mockBlackoutDates;
  } catch (error) {
    console.error("Error fetching blackout dates:", error);
    throw new Error("Failed to fetch blackout dates");
  }
}

export async function createBlackoutDate(
  data: BlackoutDateFormData
): Promise<BlackoutDate> {
  try {
    const validatedData = blackoutDateSchema.parse(data);

    // TODO: Replace with actual Prisma call
    // const blackout = await prisma.blackoutDate.create({
    //   data: validatedData
    // });

    const newBlackout: BlackoutDate = {
      id: `blackout_${Date.now()}`,
      date: new Date(validatedData.date),
      reason: validatedData.reason,
    };

    mockBlackoutDates.push(newBlackout);
    return newBlackout;
  } catch (error) {
    console.error("Error creating blackout date:", error);
    throw new Error("Failed to create blackout date");
  }
}

export async function deleteBlackoutDate(id: string): Promise<void> {
  try {
    // TODO: Replace with actual Prisma call
    // await prisma.blackoutDate.delete({
    //   where: { id }
    // });

    mockBlackoutDates = mockBlackoutDates.filter((b) => b.id !== id);
  } catch (error) {
    console.error("Error deleting blackout date:", error);
    throw new Error("Failed to delete blackout date");
  }
}
