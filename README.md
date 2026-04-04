# Goal Tracker Challenge

Goal Tracker Challenge is an offline-first mobile-first web app for private day-based habit challenges. Users can create multiple 30, 60, or 90-day style challenges, check off daily habits, backfill past days, review streaks and failures, and optionally back everything up to a hidden Google Drive `appDataFolder` file.

## Stack

- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS
- React Hook Form + Zod
- Zustand
- Dexie / IndexedDB
- Google Identity Services
- Google Drive API v3
- PWA install support with service worker and manifest

## Features

- Offline-first local persistence with IndexedDB
- Multiple active and completed challenges
- Daily check-ins with autosave
- Backfill support for past days
- Future-day editing lock
- Failed-day and streak calculation
- Dashboard, challenge detail, history, settings, and welcome/sign-in flows
- JSON export and import
- Background sync to Google Drive `appDataFolder`
- Manual sync fallback in Settings

## Installation

```bash
npm install
```

## Local Development

1. Copy the environment file:

```bash
cp .env.example .env
```

2. Add your Google OAuth client ID:

```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_GOOGLE_APP_NAME=Goal Tracker Challenge
VITE_GOOGLE_DRIVE_FILE_NAME=goal-tracker-challenge.json
```

3. Start the Vite dev server:

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Quality Checks

```bash
npm run lint
npm run typecheck
```

## Google Cloud Setup

1. Create a Google Cloud project.
2. Open `APIs & Services`.
3. Enable `Google Drive API`.
4. Open `OAuth consent screen` and configure an external or internal app.
5. Add yourself as a test user if the app is still in testing mode.
6. Create an `OAuth client ID` for a `Web application`.
7. Add your development origin, for example `http://localhost:5173`, to the authorized JavaScript origins.
8. Put the generated client ID into `VITE_GOOGLE_CLIENT_ID`.

## Required Google Scope

The app requests:

- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/drive.appdata`

`drive.appdata` keeps the sync file hidden from the user’s regular Drive UI and limits access to the app-specific storage area.

## How Sync Works

1. All writes go to IndexedDB first.
2. Local writes create pending changes.
3. When the app is online and a Google account is connected, background sync can run.
4. The sync engine downloads the current `appDataFolder` snapshot if it exists.
5. Local and remote entities are merged by `updatedAt` using last-write-wins.
6. The merged snapshot is uploaded back to Google Drive.
7. Only after upload succeeds are pending changes cleared and daily entries marked as synced.

## Import / Export

- `Export JSON` downloads the current local snapshot.
- `Import JSON` validates the file with Zod and merges it into the current local snapshot using the same merge rules as cloud sync.

## PWA / Offline Notes

- The app registers a service worker in production builds.
- Static assets and the app shell are cached for offline use.
- Local challenge viewing and daily check-ins keep working offline.
- Sync resumes later when the app is back online and Google is connected.

## Known MVP Limitations

- Sync stores the whole dataset as a single JSON file.
- Conflict resolution is last-write-wins based on `updatedAt`.
- Silent token refresh depends on Google session state and prior consent.
- The current PWA setup uses SVG icons in the manifest for simplicity.
- Challenge editing, archiving, and analytics are not implemented yet.

## Project Structure

```text
src/
  app/
  features/
    auth/
    challenges/
    checkins/
    dashboard/
    history/
    settings/
    sync/
  pages/
  routes/
  shared/
    lib/
    styles/
    types/
    ui/
  store/
```
