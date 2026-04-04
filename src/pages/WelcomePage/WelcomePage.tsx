import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { connectGoogle } from "@/features/auth/api/googleIdentity";
import { syncService } from "@/features/sync/api/syncService";
import { useI18n } from "@/shared/lib/i18n";
import { LocaleSwitcher } from "@/shared/ui/LocaleSwitcher";
import { SignInCard } from "@/features/auth/ui/SignInCard";
import { useAppStore } from "@/store/useAppStore";

export function WelcomePage(): JSX.Element {
  const { t } = useI18n();
  const navigate = useNavigate();
  const authSession = useAppStore((state) => state.authSession);
  const continueLocalMode = useAppStore((state) => state.continueLocalMode);
  const setGoogleConnection = useAppStore((state) => state.setGoogleConnection);
  const pushToast = useAppStore((state) => state.pushToast);
  const [connecting, setConnecting] = useState(false);
  if (authSession.onboardingCompleted) {
    return <Navigate to="/" replace />;
  }
  async function handleConnect(): Promise<void> {
    setConnecting(true);
    try {
      const connection = await connectGoogle("consent");
      setGoogleConnection(connection);
      await syncService.syncNow({ prompt: "", silent: true });
      navigate("/", { replace: true });
    } catch (error) {
      pushToast({
        title:
          error instanceof Error ? error.message : t("welcome.connectError"),
        tone: "error",
      });
    } finally {
      setConnecting(false);
    }
  }
  function handleContinueLocal(): void {
    continueLocalMode();
    navigate("/", { replace: true });
  }
  return (
    <main className="min-h-screen bg-hero-radial">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-8 px-4 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-6">
        <section className="flex flex-col justify-center gap-8">
          <div className="flex justify-end">
            <LocaleSwitcher />
          </div>
          <div className="space-y-4">
            <p className="font-display text-lg text-moss-700">
              {t("welcome.eyebrow")}
            </p>
            <h1 className="font-display text-5xl text-ink md:text-7xl">
              {t("welcome.title")}
            </h1>
            <p className="max-w-xl text-base text-slate-700">
              {t("welcome.description")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-card">
              <p className="text-sm text-slate-600">
                {t("welcome.offlineFirst")}
              </p>
              <p className="mt-3 text-2xl font-semibold text-ink">IndexedDB</p>
            </div>
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-card">
              <p className="text-sm text-slate-600">
                {t("welcome.cloudBackup")}
              </p>
              <p className="mt-3 text-2xl font-semibold text-ink">
                Drive appData
              </p>
            </div>
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-card">
              <p className="text-sm text-slate-600">
                {t("welcome.dailyCheckIns")}
              </p>
              <p className="mt-3 text-2xl font-semibold text-ink">
                {t("welcome.autosave")}
              </p>
            </div>
          </div>
        </section>
        <section className="flex items-center">
          <SignInCard
            onConnect={handleConnect}
            onContinueLocal={handleContinueLocal}
            connecting={connecting}
          />
        </section>
      </div>
    </main>
  );
}
