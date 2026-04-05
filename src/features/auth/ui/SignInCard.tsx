import { hasGoogleAuthConfig } from "@/shared/lib/env";
import { useI18n } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";

export function SignInCard({
  onConnect,
  onContinueLocal,
  connecting,
}: {
  onConnect: () => Promise<void>;
  onContinueLocal: () => void;
  connecting: boolean;
}): JSX.Element {
  const { t } = useI18n();
  const highlights = [
    t("welcome.offlineFirst"),
    t("welcome.cloudBackup"),
    t("welcome.dailyCheckIns"),
  ];
  return (
    <Card className="space-y-6 bg-white/84">
      <div className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
        Private sync
      </div>
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-600">
          {t("signIn.eyebrow")}
        </p>
        <h2 className="font-display text-4xl text-ink md:text-5xl">
          {t("signIn.title")}
        </h2>
        <p className="text-sm text-slate-600">{t("signIn.description")}</p>
      </div>
      <div className="grid gap-3 rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-4">
        {highlights.map((highlight) => (
          <div
            key={highlight}
            className="flex items-center gap-3 rounded-[24px] bg-white/80 px-4 py-3"
          >
            <span className="h-2 w-2 rounded-full bg-moss-500" />
            <span className="text-sm font-medium text-slate-700">
              {highlight}
            </span>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <Button
          fullWidth
          disabled={connecting || !hasGoogleAuthConfig()}
          onClick={() => void onConnect()}
        >
          {connecting
            ? t("signIn.connectingGoogle")
            : t("signIn.connectGoogle")}
        </Button>
        <Button fullWidth variant="secondary" onClick={onContinueLocal}>
          {t("signIn.continueLocalOnly")}
        </Button>
      </div>
      {!hasGoogleAuthConfig() ? (
        <div className="rounded-[28px] border border-sand-200 bg-sand-50 p-4 text-sm text-sand-800">
          {t("signIn.missingConfig")}
        </div>
      ) : null}
    </Card>
  );
}
