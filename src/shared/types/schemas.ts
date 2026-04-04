import { z } from "zod";

import { t } from "@/shared/lib/i18n";
import type {
  AppLocale,
  AppSnapshot,
  DeletedEntityType,
} from "@/shared/types/domain";

const isoDateTimeSchema = z.string().datetime();

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export function getChecklistItemFormSchema(locale: AppLocale) {
  return z.object({
    id: z.string(),
    label: z
      .string()
      .trim()
      .min(1, t(locale, "validation.addHabitName"))
      .max(80, t(locale, "validation.habitNameMax")),
    isRequired: z.boolean(),
    order: z.number().int().min(0),
  });
}

export function getChallengeFormSchema(locale: AppLocale) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(2, t(locale, "validation.titleMin"))
      .max(80, t(locale, "validation.titleMax")),
    description: z
      .string()
      .trim()
      .max(280, t(locale, "validation.descriptionMax"))
      .optional(),
    durationDays: z
      .number()
      .int()
      .min(7, t(locale, "validation.durationMin"))
      .max(365, t(locale, "validation.durationMax")),
    startDate: dateKeySchema,
    checklistItems: z
      .array(getChecklistItemFormSchema(locale))
      .min(1, t(locale, "validation.checklistMin")),
  });
}

export function getDailyCheckInSchema(locale: AppLocale) {
  return z.object({
    checkedItemIds: z.array(z.string()),
    note: z.string().max(300, t(locale, "validation.noteMax")),
  });
}

export const challengeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  durationDays: z.number().int(),
  startDate: dateKeySchema,
  endDate: dateKeySchema,
  status: z.enum(["active", "completed", "archived"]),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export const checklistItemSchema = z.object({
  id: z.string(),
  challengeId: z.string(),
  label: z.string(),
  order: z.number().int(),
  isRequired: z.boolean(),
  archived: z.boolean(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export const dailyEntrySchema = z.object({
  id: z.string(),
  challengeId: z.string(),
  date: dateKeySchema,
  checkedItemIds: z.array(z.string()),
  note: z.string(),
  derivedStatus: z.enum(["complete", "partial", "failed", "upcoming"]),
  completed: z.boolean(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  syncStatus: z.enum(["local", "pending", "synced", "error"]),
});

export const deletedRecordSchema = z.object({
  id: z.string(),
  entityType: z.custom<DeletedEntityType>(
    (value) =>
      value === "challenge" ||
      value === "checklistItem" ||
      value === "dailyEntry",
  ),
  entityId: z.string(),
  deletedAt: isoDateTimeSchema,
});

export const appSnapshotSchema = z.object({
  schemaVersion: z.number().int().min(1).max(2),
  exportedAt: isoDateTimeSchema,
  challenges: z.array(challengeSchema),
  checklistItems: z.array(checklistItemSchema),
  dailyEntries: z.array(dailyEntrySchema),
  deletedRecords: z.array(deletedRecordSchema).default([]),
});

export type ChallengeFormValues = z.infer<
  ReturnType<typeof getChallengeFormSchema>
>;

export type DailyCheckInValues = z.infer<
  ReturnType<typeof getDailyCheckInSchema>
>;

export function parseAppSnapshot(raw: unknown): AppSnapshot {
  return appSnapshotSchema.parse(raw);
}
