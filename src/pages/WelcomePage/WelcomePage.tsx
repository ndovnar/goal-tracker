import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { connectGoogleDriveAndSync } from "@/features/auth/api/connectGoogleDriveAndSync";
import { useI18n } from "@/shared/lib/i18n";
import { LocaleSwitcher } from "@/shared/ui/LocaleSwitcher";
import { SignInCard } from "@/features/auth/ui/SignInCard";
import { useAppStore } from "@/store/useAppStore";

export function WelcomePage(): JSX.Element {
  const { t } = useI18n();
  const navigate = useNavigate();
  const authSession = useAppStore((state) => state.authSession);
  const continueLocalMode = useAppStore((state) => state.continueLocalMode);
  const pushToast = useAppStore((state) => state.pushToast);
  const [connecting, setConnecting] = useState(false);
  if (authSession.onboardingCompleted) {
    return <Navigate to="/" replace />;
  }
  async function handleConnect(): Promise<void> {
    setConnecting(true);
    try {
      await connectGoogleDriveAndSync();
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
    <main className="min-h-screen bg-canvas bg-hero-radial text-ink">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-10 px-4 pb-8 pt-6 md:grid-cols-[1.08fr_0.92fr] md:px-6">
        <section className="flex flex-col justify-center gap-8 md:py-8">
          <div className="flex justify-end md:hidden">
            <LocaleSwitcher />
          </div>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-slate-100/84 px-4 py-2 shadow-soft backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-moss-500" />
              <p className="text-sm font-semibold text-slate-700">
                {t("welcome.eyebrow")}
              </p>
            </div>
            <h1 className="max-w-4xl font-display text-5xl text-ink md:text-7xl">
              {t("welcome.title")}
            </h1>
            <p className="max-w-2xl text-base text-slate-600 md:text-lg">
              {t("welcome.description")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/86 p-5 shadow-card backdrop-blur">
              <p className="text-sm font-medium text-slate-500">
                {t("welcome.offlineFirst")}
              </p>
              <p className="mt-4 break-words text-2xl font-semibold text-ink lg:text-3xl">
                IndexedDB
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/86 p-5 shadow-card backdrop-blur">
              <p className="text-sm font-medium text-slate-500">
                {t("welcome.cloudBackup")}
              </p>
              <p className="mt-4 break-words text-2xl font-semibold text-ink lg:text-3xl">
                Drive appData
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/86 p-5 shadow-card backdrop-blur">
              <p className="text-sm font-medium text-slate-500">
                {t("welcome.dailyCheckIns")}
              </p>
              <p className="mt-4 break-words text-2xl font-semibold text-ink lg:text-3xl">
                {t("welcome.autosave")}
              </p>
            </div>
          </div>
        </section>
        <section className="flex flex-col justify-center gap-6 md:items-end">
          <div className="hidden md:flex">
            <LocaleSwitcher />
          </div>
          <div className="flex w-full max-w-xl items-center">
            <SignInCard
              onConnect={handleConnect}
              onContinueLocal={handleContinueLocal}
              connecting={connecting}
            />
          </div>
          <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/78 p-4 backdrop-blur">
              <p className="text-sm font-medium text-slate-500">
                Recovery ready
              </p>
              <p className="mt-2 text-base font-semibold text-ink">
                Export snapshots or merge backups without leaving the app.
              </p>
            </div>
            <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/78 p-4 backdrop-blur">
              <p className="text-sm font-medium text-slate-500">
                Quiet by default
              </p>
              <p className="mt-2 text-base font-semibold text-ink">
                Daily check-ins stay focused, with sync and status details kept
                in calmer panels.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
