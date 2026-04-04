import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import { useEffect, useEffectEvent, useState } from "react";

import { syncService } from "@/features/sync/api/syncService";
import { useI18n } from "@/shared/lib/i18n";
import { initializeDatabase } from "@/shared/lib/db/repositories";
import { BottomNav } from "@/shared/ui/BottomNav";
import { ToastViewport } from "@/shared/ui/ToastViewport";
import { useAppStore } from "@/store/useAppStore";
import { CreateChallengePage } from "@/pages/CreateChallengePage/CreateChallengePage";
import { DashboardPage } from "@/pages/DashboardPage/DashboardPage";
import { ChallengeDetailPage } from "@/pages/ChallengeDetailPage/ChallengeDetailPage";
import { HistoryPage } from "@/pages/HistoryPage/HistoryPage";
import { SettingsPage } from "@/pages/SettingsPage/SettingsPage";
import { WelcomePage } from "@/pages/WelcomePage/WelcomePage";

function AppBootstrap(): JSX.Element {
  const { locale, t } = useI18n();
  const authSession = useAppStore((state) => state.authSession);
  const setOnline = useAppStore((state) => state.setOnline);
  const [ready, setReady] = useState(false);
  const handleOnlineState = useEffectEvent(() => {
    const online = navigator.onLine;
    setOnline(online);
    if (online && authSession.connected) {
      void syncService.syncNow({ prompt: "", silent: true });
    }
  });
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  useEffect(() => {
    void initializeDatabase().then(() => {
      setReady(true);
      if (navigator.onLine && authSession.connected) {
        void syncService.syncNow({ prompt: "", silent: true });
      }
    });
  }, [authSession.connected]);
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
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-[28px] border border-white/70 bg-white/95 px-6 py-5 shadow-card">
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
      <div className="min-h-screen pb-32">
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}

const router = createBrowserRouter([
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
]);

export function AppRouter(): JSX.Element {
  return <RouterProvider router={router} />;
}
