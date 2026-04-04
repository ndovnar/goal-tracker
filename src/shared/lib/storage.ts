import type { AppLocale, AuthSession } from "@/shared/types/domain";

const AUTH_SESSION_KEY = "goal-tracker-auth-session";
const APP_LOCALE_KEY = "goal-tracker-locale";

export function loadAuthSession(): AuthSession {
  try {
    const rawValue = localStorage.getItem(AUTH_SESSION_KEY);
    if (!rawValue) {
      return {
        profile: null,
        connected: false,
        grantedScopes: [],
        onboardingCompleted: false,
      };
    }
    const parsedValue = JSON.parse(rawValue) as Partial<AuthSession>;
    return {
      profile: parsedValue.profile ?? null,
      connected: parsedValue.connected ?? false,
      grantedScopes: parsedValue.grantedScopes ?? [],
      onboardingCompleted: parsedValue.onboardingCompleted ?? false,
    };
  } catch {
    return {
      profile: null,
      connected: false,
      grantedScopes: [],
      onboardingCompleted: false,
    };
  }
}

export function saveAuthSession(session: AuthSession): void {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function getBrowserLocale(): AppLocale {
  return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
}

export function loadAppLocale(): AppLocale {
  try {
    const rawValue = localStorage.getItem(APP_LOCALE_KEY);
    if (rawValue === "ru" || rawValue === "en") {
      return rawValue;
    }
    return getBrowserLocale();
  } catch {
    return getBrowserLocale();
  }
}

export function saveAppLocale(locale: AppLocale): void {
  localStorage.setItem(APP_LOCALE_KEY, locale);
}
