import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from "date-fns";
import { enUS, ru } from "date-fns/locale";

import type { AppLocale } from "@/shared/types/domain";
import { t } from "@/shared/lib/i18n";

function getDateFnsLocale(locale: AppLocale) {
  return locale === "ru" ? ru : enUS;
}

export function getToday(): Date {
  return startOfDay(new Date());
}

export function toDateKey(date: Date): string {
  return format(startOfDay(date), "yyyy-MM-dd");
}

export function fromDateKey(dateKey: string): Date {
  const [yearPart, monthPart, dayPart] = dateKey.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  return new Date(year, month - 1, day);
}

export function getTodayDateKey(): string {
  return toDateKey(getToday());
}

export function getNowIso(): string {
  return new Date().toISOString();
}

export function addDaysToDateKey(dateKey: string, amount: number): string {
  return toDateKey(addDays(fromDateKey(dateKey), amount));
}

export function getChallengeEndDate(
  startDate: string,
  durationDays: number,
): string {
  return addDaysToDateKey(startDate, durationDays - 1);
}

export function compareDateKeys(left: string, right: string): number {
  return fromDateKey(left).getTime() - fromDateKey(right).getTime();
}

export function isDateKeyBefore(left: string, right: string): boolean {
  return isBefore(fromDateKey(left), fromDateKey(right));
}

export function isDateKeyAfter(left: string, right: string): boolean {
  return isAfter(fromDateKey(left), fromDateKey(right));
}

export function isDateKeySame(left: string, right: string): boolean {
  return isSameDay(fromDateKey(left), fromDateKey(right));
}

export function getElapsedDays(startDate: string, endDate: string): number {
  const start = fromDateKey(startDate);
  const end = fromDateKey(endDate);
  return differenceInCalendarDays(end, start) + 1;
}

export function getCurrentChallengeDayNumber(
  startDate: string,
  endDate: string,
): number {
  const today = getToday();
  const challengeStart = fromDateKey(startDate);
  const challengeEnd = fromDateKey(endDate);
  if (isBefore(today, challengeStart)) {
    return 0;
  }
  if (isAfter(today, challengeEnd)) {
    return differenceInCalendarDays(challengeEnd, challengeStart) + 1;
  }
  return differenceInCalendarDays(today, challengeStart) + 1;
}

export function isDateEditable(dateKey: string): boolean {
  return compareDateKeys(dateKey, getTodayDateKey()) <= 0;
}

export function isDateWithinRange(
  dateKey: string,
  startDate: string,
  endDate: string,
): boolean {
  return (
    compareDateKeys(dateKey, startDate) >= 0 &&
    compareDateKeys(dateKey, endDate) <= 0
  );
}

export function formatDisplayDate(dateKey: string, locale: AppLocale): string {
  return format(fromDateKey(dateKey), "EEE, MMM d", {
    locale: getDateFnsLocale(locale),
  });
}

export function formatShortDate(dateKey: string, locale: AppLocale): string {
  return format(fromDateKey(dateKey), "MMM d", {
    locale: getDateFnsLocale(locale),
  });
}

export function formatLongDateTime(
  isoDate: string | null,
  locale: AppLocale,
): string {
  if (!isoDate) {
    return t(locale, "common.notYet");
  }
  return format(new Date(isoDate), "MMM d, yyyy p", {
    locale: getDateFnsLocale(locale),
  });
}

export function getDateKeysInRange(
  startDate: string,
  endDate: string,
): string[] {
  return eachDayOfInterval({
    start: fromDateKey(startDate),
    end: fromDateKey(endDate),
  }).map(toDateKey);
}

export function isIsoExpired(isoDate: string | null): boolean {
  if (!isoDate) {
    return true;
  }
  return isBefore(endOfDay(new Date(isoDate)), new Date());
}
