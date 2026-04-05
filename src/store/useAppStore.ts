import { create } from "zustand";

import {
  clearGoogleAccessToken as clearStoredGoogleAccessToken,
  loadAppLocale,
  loadAuthSession,
  loadGoogleAccessToken,
  saveAppLocale,
  saveAuthSession,
  saveGoogleAccessToken,
} from "@/shared/lib/storage";
import type {
  AppLocale,
  AuthProfile,
  AuthSession,
} from "@/shared/types/domain";

type ToastTone = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  tone: ToastTone;
}

interface AppStoreState {
  authSession: AuthSession;
  locale: AppLocale;
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  online: boolean;
  dataVersion: number;
  toasts: ToastMessage[];
  setOnline: (online: boolean) => void;
  setLocale: (locale: AppLocale) => void;
  completeOnboarding: () => void;
  continueLocalMode: () => void;
  setGoogleConnection: (payload: {
    profile: AuthProfile;
    grantedScopes: string[];
    accessToken: string;
    expiresAt: string | null;
  }) => void;
  clearGoogleAccessToken: () => void;
  clearGoogleConnection: () => void;
  syncPersistedAuthState: () => void;
  bumpDataVersion: () => void;
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (toastId: string) => void;
}

const initialAuthSession = loadAuthSession();
const initialLocale = loadAppLocale();
const initialGoogleAccessToken = loadGoogleAccessToken();

export const useAppStore = create<AppStoreState>()((set) => ({
  authSession: initialAuthSession,
  locale: initialLocale,
  accessToken: initialGoogleAccessToken.accessToken,
  accessTokenExpiresAt: initialGoogleAccessToken.accessTokenExpiresAt,
  online: navigator.onLine,
  dataVersion: 0,
  toasts: [],
  setOnline: (online) => set({ online }),
  setLocale: (locale) => {
    saveAppLocale(locale);
    set({ locale });
  },
  completeOnboarding: () =>
    set((state) => {
      const nextSession = {
        ...state.authSession,
        onboardingCompleted: true,
      };
      saveAuthSession(nextSession);
      return {
        authSession: nextSession,
      };
    }),
  continueLocalMode: () =>
    set((state) => {
      const nextSession = {
        ...state.authSession,
        onboardingCompleted: true,
      };
      saveAuthSession(nextSession);
      return {
        authSession: nextSession,
      };
    }),
  setGoogleConnection: ({ profile, grantedScopes, accessToken, expiresAt }) =>
    set(() => {
      const nextSession: AuthSession = {
        profile,
        connected: true,
        grantedScopes,
        onboardingCompleted: true,
      };
      saveAuthSession(nextSession);
      saveGoogleAccessToken(accessToken, expiresAt);
      return {
        authSession: nextSession,
        accessToken,
        accessTokenExpiresAt: expiresAt,
      };
    }),
  clearGoogleConnection: () =>
    set((state) => {
      const nextSession: AuthSession = {
        profile: null,
        connected: false,
        grantedScopes: [],
        onboardingCompleted: state.authSession.onboardingCompleted,
      };
      saveAuthSession(nextSession);
      clearStoredGoogleAccessToken();
      return {
        authSession: nextSession,
        accessToken: null,
        accessTokenExpiresAt: null,
      };
    }),
  clearGoogleAccessToken: () =>
    set((state) => {
      clearStoredGoogleAccessToken();
      return {
        authSession: {
          ...state.authSession,
          connected: Boolean(state.authSession.profile),
        },
        accessToken: null,
        accessTokenExpiresAt: null,
      };
    }),
  syncPersistedAuthState: () =>
    set(() => {
      const authSession = loadAuthSession();
      const { accessToken, accessTokenExpiresAt } = loadGoogleAccessToken();
      return {
        authSession,
        accessToken,
        accessTokenExpiresAt,
      };
    }),
  bumpDataVersion: () =>
    set((state) => ({ dataVersion: state.dataVersion + 1 })),
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  dismissToast: (toastId) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId),
    })),
}));
