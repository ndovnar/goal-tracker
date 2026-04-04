import { addSeconds } from "date-fns";

import { env, hasGoogleAuthConfig } from "@/shared/lib/env";
import { translateCurrent } from "@/shared/lib/i18n";
import type { AuthProfile } from "@/shared/types/domain";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          disableAutoSelect: () => void;
        };
        oauth2: {
          initTokenClient: (
            config: GoogleTokenClientConfig,
          ) => GoogleTokenClient;
          revoke: (token: string, callback: () => void) => void;
        };
      };
    };
  }
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface GoogleTokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
  error_callback?: (response: { type: string }) => void;
}

interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: "" | "consent" }) => void;
}

const GOOGLE_SCOPE =
  "openid email profile https://www.googleapis.com/auth/drive.appdata";

let googleIdentityScriptPromise: Promise<void> | null = null;

function getGoogleIdentityScriptPromise(): Promise<void> {
  if (googleIdentityScriptPromise) {
    return googleIdentityScriptPromise;
  }
  googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      "script[data-google-identity]",
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error(translateCurrent("errors.googleScriptFailed"))),
        {
          once: true,
        },
      );
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(translateCurrent("errors.googleScriptFailed")));
    document.head.append(script);
  });
  return googleIdentityScriptPromise;
}

async function getUserProfile(accessToken: string): Promise<AuthProfile> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error(translateCurrent("errors.userProfileFailed"));
  }
  const data = (await response.json()) as {
    email?: string;
    name?: string;
    picture?: string;
  };
  return {
    email: data.email ?? "",
    name: data.name ?? "Google user",
    picture: data.picture ?? "",
  };
}

async function requestToken(
  prompt: "" | "consent",
): Promise<GoogleTokenResponse> {
  if (!hasGoogleAuthConfig()) {
    throw new Error(translateCurrent("errors.missingGoogleClientId"));
  }
  await getGoogleIdentityScriptPromise();
  return new Promise((resolve, reject) => {
    const tokenClient = window.google?.accounts.oauth2.initTokenClient({
      client_id: env.googleClientId,
      scope: GOOGLE_SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error_description ?? response.error));
          return;
        }
        resolve(response);
      },
      error_callback: ({ type }) => {
        reject(new Error(type));
      },
    });
    if (!tokenClient) {
      reject(new Error(translateCurrent("errors.googleUnavailable")));
      return;
    }
    tokenClient.requestAccessToken({ prompt });
  });
}

export async function connectGoogle(prompt: "" | "consent"): Promise<{
  accessToken: string;
  expiresAt: string | null;
  grantedScopes: string[];
  profile: AuthProfile;
}> {
  const response = await requestToken(prompt);
  const accessToken = response.access_token;
  const expiresAt = response.expires_in
    ? addSeconds(new Date(), response.expires_in).toISOString()
    : null;
  const profile = await getUserProfile(accessToken);
  const grantedScopes = response.scope?.split(" ") ?? GOOGLE_SCOPE.split(" ");
  return {
    accessToken,
    expiresAt,
    grantedScopes,
    profile,
  };
}

export async function revokeGoogleAccess(
  accessToken: string | null,
): Promise<void> {
  if (!accessToken) {
    return;
  }
  await getGoogleIdentityScriptPromise();
  await new Promise<void>((resolve) => {
    window.google?.accounts.id.disableAutoSelect();
    window.google?.accounts.oauth2.revoke(accessToken, () => resolve());
  });
}
