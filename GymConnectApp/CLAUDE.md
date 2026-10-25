@AGENTS.md

# Gym Connect — Project Context

University coursework: **CSSE24H Mobile Application Development**, British University in Egypt.
Module leader: Dr. Amira Abdelaziz. Team SE A3 — Nany Tamer (246755), Zeinab Mohamed (246000), Andro Wageh (242576).

Read this before writing code. It covers what the app is, the rules it must obey, and how it is structured.

**The Figma screens are a loose reference, not a spec.** Use them for ideas on layout and flow; it is fine — encouraged — to differ from them and add features that make the app better. **Colours come from §7 of this file, not from Figma.**

---

## 1. What the app is

**One gym chain with several branches.** Members check in to a branch, then:

- See which equipment is free, busy, or free soon — updated live
- Mark equipment occupied when they start, available when they finish
- Get alternative exercises when the machine they want is taken
- Run a rest timer between sets, with haptic feedback on completion
- Broadcast a "spot me" request to everyone checked in at that branch — **it expires after 2 minutes if nobody accepts**
- Find training partners by style, level and schedule, and message the ones they connect with

Branches are in Cairo (e.g. Nasr City, Maadi, Zamalek).

**The core insight:** equipment status is **member-reported**, not sensor-driven. That is why admins can override stuck statuses, and why occupied flags should auto-expire after a timeout.

---

## 2. Tech stack

The stack is what this repo already uses. Do not switch it.

| Layer | Choice |
|---|---|
| Mobile | React Native + Expo (SDK 58), **TypeScript (strict)** |
| Navigation | **Expo Router** — file-based routes in `src/app/`; use its `Stack` and `Tabs` (built on React Navigation) |
| Backend | Firebase: Firestore, Auth, Storage, Cloud Messaging |
| Admin panel | **Inside this app**, under `src/app/admin/` — admin-only routes, not a separate web app |
| Local storage | AsyncStorage (`@react-native-async-storage/async-storage`) |
| Haptics | `expo-haptics` |
| Images | `expo-image-picker` |

Firebase, AsyncStorage, `expo-haptics` and `expo-image-picker` are not installed yet — add each with `npx expo install <package>` when first needed.

Do not add Redux, Zustand or another state library — see §5.

---

## 3. Functional requirements

| ID | Requirement |
|---|---|
| FR-1 | **Select Branch & Check-In** — select a branch; check in and out |
| FR-2 | **Manage Equipment Availability** — view equipment in the checked-in branch with status (Available / Occupied / Available Soon); update the status of equipment you are using |
| FR-3 | **Suggest Alternative Exercise** — when the wanted equipment is occupied, fetch exercises for the same muscle group from an **external exercise database API** and suggest ones available in that branch |
| FR-4 | **Manage Rest Timer** — start, pause and reset a rest timer; haptic feedback on completion |
| FR-5 | **Create Spotting Request** — broadcast to members checked into the same branch; **expires after 2 minutes** if unaccepted |
| FR-6 | **Manage Spotting Requests** — view and accept active requests; the requester tracks progress and marks it finished |
| FR-7 | **Workout Partner Search** — browse and filter members of the branch by training style, fitness level and schedule |
| FR-8 | **Send Messages** — direct messages to members connected through a spot request or partner search |
| FR-9 | **Manage User Profile** — view and update profile, fitness level, training style, workout schedule, preferred branch |
| FR-10 | **Manage Equipment (Admin)** — add, edit and remove equipment in any branch; override statuses |

### The access rule — this one matters

**Browsing is open. Actions that change shared data require an active check-in.**

| Gated on check-in | Not gated |
|---|---|
| Update Equipment Status | Viewing equipment |
| Create Spotting Request | Requesting alternative exercises |
| Accept Spotting Request | Partner search, messaging, profile |

The test: *does it change something other members see, or commit me to something?* If yes, gate it.

When a gated action is attempted without a check-in, show a **"Check-In Required"** state. Do not hide the control.

---

## 4. Screens to build — 9 total, 3 per team member

| # | Screen | Covers | Screen file (code goes here) |
|---|---|---|---|
| 1 | Branch Selection & Check-In | FR-1 | `src/app/member/branches.tsx` |
| 2 | Equipment Availability | FR-2 | `src/app/member/equipment/index.tsx` |
| 3 | Equipment Details & Alternative Exercises | FR-3 | `src/app/member/equipment/[id].tsx` |
| 4 | Spotting Requests | FR-5, FR-6 | `src/app/member/spotting/index.tsx` |
| 5 | Find Workout Partners | FR-7 | `src/app/member/partners.tsx` |
| 6 | Messages | FR-8 | `src/app/member/messages.tsx` |
| 7 | Rest Timer | FR-4 | `src/app/member/timer.tsx` ✅ built |
| 8 | Member Profile | FR-9 | `src/app/member/profile.tsx` |
| 9 | Admin Equipment Management | FR-10 | `src/app/admin/index.tsx` (+ more files in `admin/` for add / edit) |

Paths for screens 1–6 are suggestions — agree them with the team; the rule (screen code in its route file) is not optional.

Sign in and sign up are excluded from the count but still need building.

### Ownership

| Member | Screens |
|---|---|
| Member 1 | 1 Branch Selection & Check-In · 2 Equipment Availability · 3 Equipment Details & Alternatives |
| Member 2 | 4 Spotting Requests · 5 Find Workout Partners · 6 Messages |
| **Member 3 — Andro** | **7 Rest Timer · 8 Member Profile · 9 Admin Equipment Management** |

When working with Andro, build **screens 7, 8 and 9** unless he says otherwise. Shared foundations (Firebase setup, models, navigation, theme) are fair game for anyone.

---

## 5. Architecture — MVVM

Documented in the Phase 1 report, so the code must visibly match it. MVVM layers map onto this repo's folders:

```
src/
├── app/                 # VIEWS — each screen's full code lives in its own route file (see §9)
│   ├── _layout.tsx      #   root Stack (navigation shell)
│   ├── member/          #   member screens, e.g. member/timer.tsx = Rest Timer
│   └── admin/           #   admin-only screens
├── types/               # MODELS — shapes + enums only, no logic
├── services/            # the ONLY layer that touches Firestore or the exercise API
├── logic/               # VIEWMODELS — custom hooks, state + actions, no JSX
├── context/             # app-wide state (auth, active check-in)
├── features/<name>/     # helper components used by only one feature's screens — never screens
├── components/          # reusable presentational pieces
├── hooks/               # generic UI hooks (theme, color scheme) — not viewmodels
├── data/                # seed / static data
└── constants/theme.ts   # design tokens — built on the brand colours in §7
```

**The one rule: a screen never imports from `services/`.**
A screen calls a hook from `logic/`. The hook calls the service. If you are about to `import { db }` inside a screen, stop.

Create whatever hooks each screen needs — name and shape them however makes sense. The only constraint is which layer they live in.

**Why MVVM and not Redux:** Firestore listeners are already observables, so a hook maps onto a ViewModel naturally. Redux would be boilerplate for state the server already owns.

---

## 6. Data model — Cloud Firestore

These are the collections the app reads and writes, with each document's fields. Use these exact names — they match the data model diagram in the Phase 1 report. `?` means the field can be absent; `(FK)` means it holds another document's id.

```
users/{userId}
  fullName, email, avatarUrl?, fitnessLevel (enum),
  trainingStyles[], scheduleDays[], scheduleFrom, scheduleTo,
  homeBranchId (FK), visibleInSearch, createdAt

branches/{branchId}
  name, address, zones[], opensAt, closesAt, memberCount

branches/{branchId}/equipment/{equipmentId}
  name, zone, muscleGroup (enum), units,
  status (enum), occupiedBy? (FK), occupiedAt?, estimatedFreeAt?

checkIns/{checkInId}
  userId (FK), branchId (FK), checkedInAt, checkedOutAt?, isActive

spotRequests/{requestId}
  requesterId (FK), branchId (FK), equipmentId? (FK),
  exercise, weightKg, setsRemaining, note?,
  status (enum), createdAt, expiresAt, acceptedBy? (FK), acceptedAt?

conversations/{conversationId}
  participantIds[2], originType (enum), lastMessage, lastMessageAt

conversations/{conversationId}/messages/{messageId}
  senderId (FK), body, sentAt, readAt?

exercises/{exerciseId}
  name, muscleGroup (enum), equipmentType, externalRef?
```

### Enums

- `EquipmentStatus`: `Available` · `AvailableSoon` · `Occupied` · `Maintenance`
- `RequestStatus`: `Broadcasting` · `Accepted` · `Completed` · `Expired` · `Cancelled`
- `FitnessLevel`: `Beginner` · `Intermediate` · `Advanced`
- `TrainingStyle`: `Powerlifting` · `Bodybuilding` · `Calisthenics` · `CrossFit` · `Cardio`
- `MuscleGroup`: `Chest` · `Back` · `Legs` · `Shoulders` · `Arms` · `FullBody`

### Two decisions to preserve

1. **`expiresAt` is a stored field**, written as `createdAt + 2 minutes`. Do not compute expiry from a client clock at read time — a client with a wrong clock would break FR-5.
2. **Equipment is a subcollection of Branch**, not a top-level collection. Members only ever query one branch, so reads stay cheap and the security rule is one line.

### AsyncStorage (local only, never Firestore)

Rest timer state · last selected branch · cached equipment list for instant first paint · notification toggles.

**The rule:** if another member needs to see it, Firestore. If only this device does, AsyncStorage.

---

### Which collections each screen touches

| Screen | Collections |
|---|---|
| 7 Rest Timer | none — AsyncStorage only |
| 8 Member Profile | `users` (+ `branches` for the picker) |
| 9 Admin Equipment Management | `branches/{id}/equipment` |

---

## 7. Brand colours

Two confirmed brand colours — **these override the Figma file** (Figma uses a crimson red; do not copy it):

```
Midnight  #14213D
Marigold  #FCA311
```

Build the palette around these two: derive neutrals, surfaces, status colours, type scale and spacing to fit them, in light and dark mode, and replace the Expo starter values in `src/constants/theme.ts`. The splash colour in `app.json` is still Expo's default and should change too.

Status colours must be distinguishable by more than hue: every status chip also carries its word (Available / Soon / Occupied / Maintenance). That is an accessibility requirement, not a style preference.

---

## 8. Build order for Member 3

1. **Shared foundation first** — `types/` (models + enums), `services/firebase.ts`, navigation shell (`src/app/_layout.tsx` + member tabs), theme tokens from §7, seed data for one branch in `data/`. Coordinate so this isn't built three times.
2. **Rest Timer (7)** — fully self-contained. No Firestore, no dependency on anyone else's work. Start here.
3. **Member Profile (8)** — needs auth and the `users` collection.
4. **Admin Equipment Management (9)** — needs `branches/{id}/equipment`; overlaps with Member 1's equipment screens, so agree the shape of `equipment` documents with them before writing.

---

## 9. Conventions

- TypeScript, functional components only, hooks throughout
- Never hardcode colours (no hex codes like `#14213D` in screens or components) — define every colour once in `Colors` in `src/constants/theme.ts` and read it through `useTheme()` from `@/hooks/use-theme`, so all screens share it and dark mode works
- **Each screen's code goes directly in its own route file in `src/app/`** — e.g. the Rest Timer is written in full in `src/app/member/timer.tsx`, not in a separate file that the route re-exports. One screen per file; the default export is named `<Name>Screen` (e.g. `RestTimerScreen`)
- Pieces a screen uses that are not screens go outside `src/app/` (every file there becomes a route): shared UI in `components/`, one-feature helpers in `features/<name>/`, logic in `logic/`
- Every file in `src/app/` must default-export a component — no empty route files
- Hooks return `{ data, loading, error, ...actions }`
- No inline Firestore queries in components — ever
- Every pressable has a minimum 44px touch target
- Firebase config via env vars (`EXPO_PUBLIC_*`) — move `app.json` to `app.config.ts` when Firebase is added; never commit keys
- Commits: `feat(equipment): ...`, `fix(timer): ...`

---

## 10. Status

**Done:** requirements, use case diagram, activity diagrams, architecture decision, data model, screen designs in Figma, Expo project scaffold with the folder structure above (all feature folders still empty; `src/app/index.tsx` is still the Expo starter screen).

**Built:** Rest Timer (screen 7), Midnight/Marigold theme tokens.

**Shared check-in hook — use it, don't make another one:** `useCheckIn()` in `src/context/check-in.tsx` returns `{ activeCheckIn }` (type `CheckIn` in `src/types/check-in.ts`). It is a **placeholder** that always says "not checked in". Member 1 fills it in with the real Firestore check-in and adds check-in / check-out there, keeping the name and the `activeCheckIn` field. Screens react to it changing (e.g. the Rest Timer resets to Set 1 when the check-in changes); check-out never calls other screens.

**Not started:** the other feature screens, Firebase setup, the remaining models.

Figma reference: https://www.figma.com/design/bWvey1tCsTVWvBmVHCKI4C/Gym-Connect-%E2%80%94-Mobile-Screens — frames 09 (Rest timer), 16 (My profile) and 17–20 (Admin) are Andro's screens. Treat them as inspiration only (see top of file).
