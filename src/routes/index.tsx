import {
  createBrowserRouter,
  createHashRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { useEffect, useEffectEvent, useState } from "react";

import { ensureGoogleIdentityReady } from "@/features/auth/api/googleIdentity";
import { syncService } from "@/features/sync/api/syncService";
import { hasGoogleAuthConfig } from "@/shared/lib/env";
import { useI18n } from "@/shared/lib/i18n";
import { initializeDatabase } from "@/shared/lib/db/repositories";
import { BottomNav } from "@/shared/ui/BottomNav";
import { ToastViewport } from "@/shared/ui/ToastViewport";
import { useAppStore } from "@/store/useAppStore";
import { CreateChallengePage } from "@/pages/CreateChallengePage/CreateChallengePage";
import { DashboardPage } from "@/pages/DashboardPage/DashboardPage";
import { ChallengeDetailPage } from "@/pages/ChallengeDetailPage/ChallengeDetailPage";
import { EditChallengePage } from "@/pages/EditChallengePage/EditChallengePage";
import { HistoryPage } from "@/pages/HistoryPage/HistoryPage";
import { SettingsPage } from "@/pages/SettingsPage/SettingsPage";
import { WelcomePage } from "@/pages/WelcomePage/WelcomePage";

function AppBootstrap(): JSX.Element {
  const { locale, t } = useI18n();
  const authSession = useAppStore((state) => state.authSession);
  const accessToken = useAppStore((state) => state.accessToken);
  const accessTokenExpiresAt = useAppStore(
    (state) => state.accessTokenExpiresAt,
  );
  const online = useAppStore((state) => state.online);
  const setOnline = useAppStore((state) => state.setOnline);
  const syncPersistedAuthState = useAppStore(
    (state) => state.syncPersistedAuthState,
  );
  const [ready, setReady] = useState(false);
  const handleOnlineState = useEffectEvent(() => {
    const nextOnline = navigator.onLine;
    setOnline(nextOnline);
    if (nextOnline && authSession.connected) {
      void syncService.syncNow({ prompt: "", silent: true });
    }
  });
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  useEffect(() => {
    if (!hasGoogleAuthConfig()) {
      return;
    }
    void ensureGoogleIdentityReady().catch(() => undefined);
  }, []);
  useEffect(() => {
    void initializeDatabase().then(() => {
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (!ready || !online || !authSession.connected) {
      return;
    }
    void syncService.syncNow({ prompt: "", silent: true });
  }, [ready, online, authSession.connected, accessToken, accessTokenExpiresAt]);
  useEffect(() => {
    function handleStorageSync(event: StorageEvent): void {
      if (event.storageArea !== localStorage) {
        return;
      }
      syncPersistedAuthState();
    }
    window.addEventListener("storage", handleStorageSync);
    return () => {
      window.removeEventListener("storage", handleStorageSync);
    };
  }, [syncPersistedAuthState]);
  useEffect(() => {
    window.addEventListener("online", handleOnlineState);
    window.addEventListener("offline", handleOnlineState);
    return () => {
      window.removeEventListener("online", handleOnlineState);
      window.removeEventListener("offline", handleOnlineState);
    };
  }, [handleOnlineState]);
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas bg-hero-radial px-4 text-ink">
        <div className="rounded-[32px] border border-slate-200/80 bg-slate-50/90 px-6 py-5 shadow-card backdrop-blur-xl">
          <p className="font-display text-2xl text-ink">
            {t("common.loadingTracker")}
          </p>
        </div>
      </div>
    );
  }
  return <Outlet />;
}

function ProtectedLayout(): JSX.Element {
  const onboardingCompleted = useAppStore(
    (state) => state.authSession.onboardingCompleted,
  );
  if (!onboardingCompleted) {
    return <Navigate to="/welcome" replace />;
  }
  return (
    <>
      <ToastViewport />
      <div className="min-h-screen bg-canvas bg-hero-radial pb-32 text-ink">
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}

const routes = [
  {
    element: <AppBootstrap />,
    children: [
      {
        path: "/welcome",
        element: <WelcomePage />,
      },
      {
        element: <ProtectedLayout />,
        children: [
          {
            path: "/",
            element: <DashboardPage />,
          },
          {
            path: "/challenge/new",
            element: <CreateChallengePage />,
          },
          {
            path: "/challenge/:challengeId/edit",
            element: <EditChallengePage />,
          },
          {
            path: "/challenge/:challengeId",
            element: <ChallengeDetailPage />,
          },
          {
            path: "/history",
            element: <HistoryPage />,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
];

const router = (
  import.meta.env.PROD && import.meta.env.BASE_URL !== "/"
    ? createHashRouter
    : createBrowserRouter
)(routes);

export function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />;
}
