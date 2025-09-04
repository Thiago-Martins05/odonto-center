"use server";

import { z } from "zod";
import { prisma } from "@/server/db";

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

export async function getAvailabilityRules(): Promise<AvailabilityRule[]> {
  try {
    const rules = await prisma.availabilityRule.findMany({
      orderBy: [{ weekday: 'asc' }, { start: 'asc' }]
    });

    return rules.map(rule => ({
      id: rule.id,
      weekday: rule.weekday,
      start: rule.start,
      end: rule.end,
      serviceId: rule.serviceId || undefined,
    }));
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

    const rule = await prisma.availabilityRule.create({
      data: validatedData
    });

    return {
      id: rule.id,
      weekday: rule.weekday,
      start: rule.start,
      end: rule.end,
      serviceId: rule.serviceId || undefined,
    };
  } catch (error) {
    console.error("Error creating availability rule:", error);
    throw new Error("Failed to create availability rule");
  }
}

export async function deleteAvailabilityRule(id: string): Promise<void> {
  try {
    await prisma.availabilityRule.delete({
      where: { id }
    });
  } catch (error) {
    console.error("Error deleting availability rule:", error);
    throw new Error("Failed to delete availability rule");
  }
}

export async function getBlackoutDates(): Promise<BlackoutDate[]> {
  try {
    const blackouts = await prisma.blackoutDate.findMany({
      orderBy: { date: 'asc' }
    });

    return blackouts.map(blackout => ({
      id: blackout.id,
      date: blackout.date,
      reason: blackout.reason || "",
    }));
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

    const blackout = await prisma.blackoutDate.create({
      data: {
        date: new Date(validatedData.date),
        reason: validatedData.reason,
      }
    });

    return {
      id: blackout.id,
      date: blackout.date,
      reason: blackout.reason || "",
    };
  } catch (error) {
    console.error("Error creating blackout date:", error);
    throw new Error("Failed to create blackout date");
  }
}

export async function deleteBlackoutDate(id: string): Promise<void> {
  try {
    await prisma.blackoutDate.delete({
      where: { id }
    });
  } catch (error) {
    console.error("Error deleting blackout date:", error);
    throw new Error("Failed to delete blackout date");
  }
}