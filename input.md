Codex prompt

Build a production-quality mobile-first web app called Goal Tracker Challenge using React + TypeScript + Vite.

Product concept

The app helps a user complete time-based challenges such as 30, 60, or 90 days.

A user can create multiple challenges.
Each challenge has:

a title
optional description
duration in days
start date
a reusable list of daily habits/items

For each day of a challenge, the user checks off the items they completed.
The app should clearly show progress, failed days, streaks, and completion history.

This is a private single-user app. No social, coach, or collaboration features are needed.

Core requirements

1. Tech stack

Use:

React
TypeScript
Vite
Tailwind CSS
React Hook Form
Zod
date-fns
Zustand or a similarly lightweight state approach
IndexedDB for local persistence
Google Identity Services for auth
Google Drive API v3 for sync/backup

Make it mobile-first and polished enough to feel like a real app.

2. Storage architecture

Use a hybrid model:

Local source of truth
Use IndexedDB as the primary on-device database.
App must work offline.
All writes must go to IndexedDB first.
Cloud sync
Use Google Drive appDataFolder for hidden app-specific cloud storage.
Sync should happen automatically in the background when online and authenticated.
Include a manual Sync now button in Settings as a fallback.
Sync must never overwrite or lose unsynced local data.

For MVP:

storing all app data in one JSON file in Drive is acceptable
but code should be structured so the sync layer can be expanded later 3. Main product behavior

The app supports multiple active or completed challenges.

Each challenge contains a list of reusable daily checklist items/habits, for example:

Drink 2L water
Exercise
Read 20 minutes
No sugar

For each day:

the user can check completed items
a day is:
complete if all required items are checked
partial if some are checked
failed if the date is in the past and completion criteria were not met
upcoming if the date is in the future

Rules:

user can backfill previous days
user cannot edit future days
current day is editable
past incomplete days must visibly show as failed
failed days remain failed unless the user later backfills them and satisfies completion rules 4. Data model

Implement strong TypeScript domain types.

Challenge

Fields:

id
title
description
durationDays
startDate
endDate
status: active | completed | archived
checklistItems
createdAt
updatedAt
ChecklistItem

Fields:

id
challengeId
label
order
isRequired
archived
createdAt
updatedAt
DailyEntry

Fields:

id
challengeId
date (YYYY-MM-DD)
checkedItemIds: string[]
note
derivedStatus: complete | partial | failed | upcoming
completed: boolean
createdAt
updatedAt
syncStatus: local | pending | synced | error
SyncMetadata

Fields:

id
remoteFileId
lastSyncedAt
lastSyncAttemptAt
syncState: idle | syncing | success | error
pendingChangesCount
lastError
PendingChange

Fields:

id
entityType
entityId
operation
payload
createdAt 5. Screens to implement
Sign In
simple landing screen
Google sign-in button
short message explaining local storage + Drive sync
Dashboard

Show:

active challenges
completed challenges
quick stats
today’s due check-ins
progress summaries
streak summaries

Each challenge card should include:

title
day progress like Day 12 / 60
progress bar
today status
completion percentage
Create Challenge

Fields:

title
optional description
duration in days, default 60
start date
dynamic list of daily checklist items
per item: label, required toggle, sort order
Challenge Detail

Show:

title and metadata
progress bar
current day number
stats
list/calendar of all days in challenge
visual states for complete / partial / failed / upcoming
quick access to today or selected past day
Daily Check-in

Show:

selected date
checklist items with checkboxes
optional note
autosave behavior
readonly mode for future dates
History / Calendar

Show:

challenge timeline
day-by-day completion states
filters for failed / partial / complete days
Settings

Show:

signed-in account
sync status
last sync time
sync now button
export JSON
import JSON
sign out
local data reset with confirmation 6. UX requirements

The UI must be:

mobile-first
clean, minimal, modern
thumb-friendly
fast and low-friction

Include:

sticky bottom navigation on mobile
large tap targets
progress visualization
empty states
loading skeletons
inline validation
optimistic UI where safe
autosave for check-ins
toast notifications for important actions
clear sync indicators:
local only
syncing
synced
error

Use a calm design style with strong readability.

7. Domain logic

Implement functions/selectors for:

calculate challenge end date from start date + duration
determine current challenge day number
compute daily derived status
compute challenge completion percentage
compute total completed days
compute failed days
compute current streak
compute longest streak
compute habit adherence percentages
determine whether a date is editable

Be careful with date boundaries and local timezone handling.

8. Sync behavior

Implement a robust but simple sync engine.

Requirements:

background sync when app loads and user is online
background sync after local changes, with debounce/throttle
retry on transient network errors
preserve pending changes until confirmed synced
graceful behavior if auth expires

Conflict strategy for MVP:

use last-write-wins based on updatedAt

Sync flow:

load local data first
detect auth + connectivity
fetch remote JSON from appDataFolder
merge remote and local
upload merged result
mark pending local changes as synced

Keep sync code isolated from UI code.

9. Google Drive integration

Use:

Google Identity Services for sign-in and token handling
Google Drive API v3
hidden appDataFolder storage

Implement:

find existing app data file
create file if missing
fetch file contents
update file contents
background sync service

Use environment variables for:

Google client ID
API key if needed
Drive config

Keep setup documented in README.

10. IndexedDB implementation

Build a clean local database layer.

Stores:

challenges
checklistItems
dailyEntries
syncMetadata
pendingChanges

Requirements:

indexes for challengeId
indexes for date
efficient query for entries by challenge and date range
transactional updates where useful

You may use a lightweight helper library like Dexie if it improves code quality.

11. PWA support

Make the app installable.

Include:

manifest
service worker
offline shell
cached static assets
app remains usable for local check-ins offline

The user should be able to:

open app offline
view local challenges
mark tasks done
sync later when back online 12. Suggested folder structure

Use a clean scalable structure like:

src/
app/
components/
features/
auth/
challenges/
checkins/
dashboard/
history/
settings/
sync/
db/
lib/
services/
googleDrive/
sync/
hooks/
store/
types/
utils/

Avoid giant files. Keep business logic separated from presentational components.

13. Key implementation details

Important rules:

do not allow editing future daily entries
allow editing/backfilling past days
failed day state should update automatically based on date + completion
autosave daily entries
support multiple concurrent challenges
private single-user architecture only
no backend required for MVP
no server database required
IndexedDB + Google Drive should be enough 14. Deliverables

Generate a complete working project with:

full source code
reusable components
IndexedDB layer
Google auth integration
Google Drive sync integration
PWA support
.env.example
README.md

README must include:

how to install dependencies
how to run locally
how to build for production
how to configure Google Cloud project
how to enable Google Drive API
how to create OAuth credentials
what scopes are needed
how sync works
known MVP limitations 15. Nice-to-have enhancements

If time allows, add:

dark mode
duplicate challenge
archive challenge
simple analytics charts
“today completed” celebration animation
quick-add challenge templates 16. Quality bar

The final result should:

compile and run
be organized and readable
use TypeScript properly
feel polished on mobile
be resilient offline
not lose user data during sync issues
avoid placeholder-only code

Do not output pseudo-code only. Generate real working implementation files.

Extra-short version for Codex

If you want a more compact version, use this:

Build a mobile-first React + TypeScript + Vite web app called Goal Tracker Challenge. Users can create multiple day-based challenges like 60-day challenges. Each challenge has a reusable daily checklist of habits/items. Users check off items each day, can backfill past days, cannot edit future days, and missed past days should show as failed. Use IndexedDB as the primary local offline database and Google Drive appDataFolder as automatic background sync/backup using Google Identity Services and Drive API v3. Use Tailwind, React Hook Form, Zod, and a clean scalable architecture. Include screens for Sign In, Dashboard, Create Challenge, Challenge Detail, Daily Check-in, History, and Settings. Show progress, streaks, failed days, and sync state. Add PWA support, autosave, offline capability, export/import JSON, and a README with full Google setup instructions. Generate complete working code, not pseudo-code.

There are two small product decisions still worth locking in before implementation:

Should a challenge start immediately on the chosen start date at local midnight, or only once the user first opens it?
For completion, should all items be required by default, or do you want optional habits too?

I can also turn this into a technical spec + architecture doc for Codex with schema, sync algorithm, and page-by-page acceptance criteria.
