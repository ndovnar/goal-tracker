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
  return (
    <Card className="space-y-6 bg-white/95">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-moss-700">
          {t("signIn.eyebrow")}
        </p>
        <h2 className="font-display text-4xl text-ink">{t("signIn.title")}</h2>
        <p className="text-sm text-slate-600">{t("signIn.description")}</p>
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
        <p className="text-sm text-sand-800">{t("signIn.missingConfig")}</p>
      ) : null}
    </Card>
  );
}
