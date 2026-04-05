import { isAfter } from "date-fns";
import { useState } from "react";

import { connectGoogleDriveAndSync } from "@/features/auth/api/connectGoogleDriveAndSync";
import { revokeGoogleAccess } from "@/features/auth/api/googleIdentity";
import { hasGoogleAuthConfig } from "@/shared/lib/env";
import { useI18n } from "@/shared/lib/i18n";
import { Button } from "@/shared/ui/Button";
import { useAppStore } from "@/store/useAppStore";

function hasValidAccessToken(
  accessToken: string | null,
  accessTokenExpiresAt: string | null,
): boolean {
  if (!accessToken || !accessTokenExpiresAt) {
    return false;
  }
  return isAfter(new Date(accessTokenExpiresAt), new Date());
}

export function GoogleLoginButton(): JSX.Element | null {
  const { t } = useI18n();
  const authSession = useAppStore((state) => state.authSession);
  const accessToken = useAppStore((state) => state.accessToken);
  const accessTokenExpiresAt = useAppStore(
    (state) => state.accessTokenExpiresAt,
  );
  const clearGoogleConnection = useAppStore(
    (state) => state.clearGoogleConnection,
  );
  const pushToast = useAppStore((state) => state.pushToast);
  const [pending, setPending] = useState(false);
  const hasActiveToken = hasValidAccessToken(accessToken, accessTokenExpiresAt);
  if (!hasGoogleAuthConfig()) {
    return null;
  }
  async function handleAuthAction(): Promise<void> {
    setPending(true);
    try {
      if (authSession.connected && hasActiveToken) {
        await revokeGoogleAccess(accessToken);
        clearGoogleConnection();
        return;
      }
      await connectGoogleDriveAndSync();
    } catch (error) {
      pushToast({
        title:
          error instanceof Error
            ? error.message
            : t("settings.connectGoogleError"),
        tone: "error",
      });
    } finally {
      setPending(false);
    }
  }
  return (
    <Button
      className="min-h-10 px-4 py-2"
      disabled={pending}
      onClick={() => void handleAuthAction()}
      variant={
        authSession.connected && hasActiveToken ? "secondary" : "primary"
      }
    >
      {pending
        ? authSession.connected && hasActiveToken
          ? t("auth.loggingOut")
          : t("auth.loggingIn")
        : authSession.connected && hasActiveToken
          ? t("auth.logOut")
          : t("auth.logIn")}
    </Button>
  );
}
