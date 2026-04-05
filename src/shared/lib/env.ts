const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
const googleAppName =
  import.meta.env.VITE_GOOGLE_APP_NAME ?? "Goal Tracker Challenge";
const googleDriveFileName =
  import.meta.env.VITE_GOOGLE_DRIVE_FILE_NAME ?? "goal-tracker-challenge.json";

console.log(!!googleClientId);

export const env = {
  googleClientId,
  googleAppName,
  googleDriveFileName,
};

export function hasGoogleAuthConfig(): boolean {
  return Boolean(env.googleClientId);
}
