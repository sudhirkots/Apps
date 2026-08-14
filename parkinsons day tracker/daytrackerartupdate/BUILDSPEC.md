# Day Tracker — build specification

Everything needed to build this app from scratch, and to carry it to a native Android app
afterwards without a rewrite. Hand this whole file to Claude Code as the brief.

---

## 0. How to use this document

Open a new Claude Code session on the repository and start with something like:

> Build the app described in `BUILD-SPEC.md`. Target a self-contained web PWA in a new folder,
> plain HTML/CSS/JS with no build step, matching the other apps in this repo. Follow the build
> order in §12 and verify against the checklist in §13 in a real browser before telling me it's
> done. Keep the domain rules in §6–§9 platform-neutral, because this becomes a native Android
> app later.

Sections §1–§11 are the specification. §12 is the build order. §13 is the test checklist.
§14 is the Android port. **§11 is the section that saves the most time** — it lists bugs that were
found the hard way and will otherwise be rediscovered.

---

## 1. What the app is

A motor-state diary for a person with Parkinson's disease. The patient logs their state hour by
hour; the treating neurologist reads the result as a chart and adjusts levodopa dose and timing.

Structurally it is a simplified **Hauser-style on/off diary**: three states rather than the usual
four or five, hourly rather than half-hourly. The simplification is deliberate — a patient who
cannot reliably separate troublesome from non-troublesome dyskinesia can still say "stuck",
"fine", or "moving too much".

The three states, fixed and never re-themed:

| State | Meaning | Clinical |
| --- | --- | --- |
| **Red** | Off period | Hypokinesia: stiff, frozen, hard to rise, slow, tremor |
| **Yellow** | On period | Normal: gets up, walks, works, needs no help |
| **Green** | Troublesome period | Dyskinesia: uncontrolled extra movements interfering |

The deliverable that matters is the **squares chart** (§9). Everything else exists to get honest
data into it.

---

## 2. Decisions already made — do not re-litigate

1. The logging screen shows **only** the question and the three buttons, plus one Menu button.
   No clock, no next-dose card, no header, no navigation bar.
2. Colour meanings are fixed. Red = off, yellow = on/normal, green = dyskinesia.
3. Tablet timings are constant day to day. The patient is told not to change them.
4. One tablet = one name + many times. Never ask for the name again per dose time.
5. Logging is **two taps**: select, then Confirm. Never log on a single tap.
6. A **15-minute lock** follows every confirmed entry.
7. Onboarding is one idea per screen, and must not scroll.
8. History is for the doctor, not the patient. It lives behind the menu, never on the home screen.
9. Timestamps come from the device clock and are **not editable**.

---

## 3. Architecture, and what keeps the Android port cheap

Build the web app in three separable layers. The port replaces layer 3 and rewrites layer 2 in
Kotlin; layer 1 is pure rules that transfer as-is.

1. **Domain rules** (§6–§9) — the data model, the alarm schedule, the chart maths. Pure functions
   of data and a clock. No DOM, no storage calls. Keep them as standalone functions.
2. **Persistence** — one JSON document (§6). The web app puts it in `localStorage`; Android puts
   it in Room. The *shape* is the contract and must not diverge.
3. **Presentation** — screens and styling.

Rules that keep the port cheap:

- **Store epoch milliseconds** for anything that happened; store `"HH:mm"` local time for anything
  scheduled. Never store formatted or timezone-shifted strings.
- **Never derive state from the DOM.** All state in one object; the view is a function of it.
- **All user-facing text in one place** — a single strings table. It makes the port a copy-paste
  and makes translation (Hindi, Marathi) possible later without hunting through markup.
- **Ship an export/import of the raw JSON.** Without it, a patient who starts on the web version
  loses their history when they move to the native app.

---

## 4. Design system

"Organic": warm cream ground, terracotta primary, sage second accent, Caprasimo display over
Figtree body, generous radii, pill buttons.

```css
--color-bg: #f5ead8;         --color-surface: #ebddc5;
--color-text: #201e1d;       --color-divider: rgba(32,30,29,0.16);
--color-accent: #c67139;     /* terracotta: primary buttons, tablet alarm */
--color-accent-2: #7a8a5e;   /* sage: green/dyskinesia UI */

--color-neutral-100: #f9f4ed;  --color-neutral-200: #eee7db;  --color-neutral-300: #dcd3c4;
--color-neutral-400: #c0b6a5;  --color-neutral-500: #a19786;  --color-neutral-600: #82796a;
--color-neutral-700: #645c50;  --color-neutral-800: #474238;  --color-neutral-900: #2e2b25;

--color-accent-100: #fff2eb;  --color-accent-200: #ffe1d0;  --color-accent-300: #ffc6a5;
--color-accent-400: #f6a06b;  --color-accent-500: #d67f48;  --color-accent-600: #b2622d;
--color-accent-700: #8c491a;  --color-accent-800: #643312;  --color-accent-900: #402310;

--color-accent-2-100: #f0fae1; --color-accent-2-200: #e1eecc; --color-accent-2-300: #ccdbb2;
--color-accent-2-400: #aebf92; --color-accent-2-500: #8fa073; --color-accent-2-600: #728157;
--color-accent-2-700: #56633f; --color-accent-2-800: #3d472b; --color-accent-2-900: #272e1b;

--font-heading: "Caprasimo";   /* headings and all big numbers */
--font-body: "Figtree";        /* everything else */
```

The three state colours are **fixed literals, not tokens** — they carry clinical meaning:

| State | Fill | Soft background | Ink | Border |
| --- | --- | --- | --- | --- |
| Red | `#a8432f` | `#f7e6e0` | `#5e2318` | `#a8432f` |
| Yellow | `#c9a13a` | `#f7edd3` | `#4a3a12` | `#a9822a` |
| Green | `#8fa073` | `#e1eecc` | `#272e1b` | `#728157` |
| Not logged | `#eee7db` | — | — | `#dcd3c4` |

Radii: cards 32px, coloured panels 34–36px, buttons fully pill (999px), chart cells 5px.
Animation: one only — `popIn`, 0.25–0.3s ease-out, opacity 0→1 with translateY(10px→0).

**Bundle the fonts** (Caprasimo, Figtree — both SIL OFL) rather than linking Google Fonts. The app
is installed to a phone and must look identical with no connection. Figtree ships as a single
variable file covering weights 300–900.

---

## 5. Accessibility floor — non-negotiable

Users have tremor, bradykinesia and often reduced vision.

- No hit target under **44px**. The three colour buttons are **132px minimum** and should grow to
  fill the available height.
- Body text **18px** minimum; headings 34–44px.
- **All three colour buttons must be visible without scrolling on a 375×667 phone.** This is a hard
  constraint and it is easy to breach — see §11.
- One decision per screen during onboarding; the patient never scrolls to finish a step.
- `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation`,
  `overscroll-behavior-y: contain`, safe-area insets on all edges.

---

## 6. Data model

One JSON document. Web: `localStorage` key `pd-monitor-v1`. This shape is the contract between the
web app and the Android app — keep it identical.

```jsonc
{
  "tablets": [                       // one entry per tablet, not per dose
    { "name": "Syndopa",
      "doses": [ { "time": "08:00", "dose": "1 tablet" },
                 { "time": "12:00", "dose": "half tablet" } ] }
  ],
  "entries": [ { "color": "red", "ts": 1786724293937 } ],          // a logged state
  "takes":   [ { "name": "Syndopa", "dose": "1 tablet",
                 "time": "08:00",                                   // scheduled slot, may be null
                 "ts": 1786724293937 } ],                           // when actually taken
  "profile": { "name": "", "age": "", "year": "", "doctor": "", "notes": "" },
  "waking":  { "start": "07:00", "end": "22:00" },
  "lockUntil": 0,                    // epoch ms; end of the 15-minute lock
  "fired": { "h<day><hour>": true, "t<day><time><name>": true }     // alarm slots already rung
}
```

Notes that matter:

- `entries` and `takes` are **append-only logs**, never edited. That is what makes the chart
  trustworthy.
- `takes.time` is the *scheduled* slot the dose belongs to; `takes.ts` is when it was actually
  taken. Both are needed — the gap between them is clinically interesting.
- `fired` is persisted so that reopening the app inside a 15-minute window does not re-ring an
  alarm the patient already dealt with. Prune it to the current day on load.
- Migrate any legacy flat `{name, dose, time}` tablet rows into the grouped shape on load.

---

## 7. Screens

State machine, one `view` variable:

```
welcome → stepRed → stepYellow → stepGreen → stepAlarms → waking → setup → log
plus: menu, profile, today, month, script
```

First launch starts at `welcome`. If tablets already exist, start at `log`.

A `fromMenu` flag distinguishes onboarding from a revisit — it changes button labels
("Begin" vs "Save timings", "Next" vs "Back to menu"). Plain navigation must **not** reset it;
only entering the menu sets it true, and saving setup sets it false.

### 1. welcome — the doctor's video
H1 "Your doctor explains" (34px). Video in a 32px-radius black container, `max-height: 56vh`,
`controls playsinline preload="auto"`. An explicit **"Play the video"** button (60px) is required —
mobile browsers block autoplay; call `play()` unmuted and fall back to muted-then-play if the
promise rejects. Primary "Next" (66px). Video must stay ≤ 2:00.

### 2–4. stepRed / stepYellow / stepGreen
Identical structure, `min-height: 78dvh`, content vertically centred so nothing scrolls. A 150px
rounded illustration tile, a 40px heading, a 20px definition, an 18px italic example. Panel
background is that state's soft colour, text its ink.

Exact copy:

- **Red — you are off** · "Stiff or frozen. Hard to get up from a chair or from bed. Movements feel
  slow. Or a shaking tremor." · *"Your feet feel stuck to the floor, or you need help to stand up.
  That is red."*
- **Yellow — you are on** · "You get up, walk and do all your work fairly easily. You do not need
  anyone's help." · *"This is your good period. Most of the day should be yellow."*
- **Green — too much** · "Extra movements you cannot control, getting in the way of what you are
  doing." · *"Your body, head or arms move on their own, so eating or sitting still is difficult."*

### 5. stepAlarms
Accent-200 panel, 38px heading "The alarm rings", then "Once every hour while you are awake, to ask
you for a colour." / "And again at each tablet time, to remind you to take that tablet." / italic
"You can also press a colour any time, without waiting for the alarm."

### 6. waking
Two `type="time"` fields, 62px tall, 24px text: "I wake up at" (07:00), "I go to bed at" (22:00).
These bound both the hourly alarm window and the chart's columns.

### 7. setup — tablets
One card per **tablet**. Card heading is the typed name, else "Tablet N", with a "Remove" ghost
button. "Tablet name — write it once" field. Section label "TIMES AND DOSE". Then per dose row, in
a neutral-100 26px-radius sub-card: a time field + "Remove", a free-text "Dose at this time" field,
and four 48px quick-set buttons — **Half tablet / 1 tablet / 1½ tablets / 2 tablets**.
"+ Add another time for this tablet" (56px); "+ Add a different tablet" (58px). New dose rows
default to the last time **+ 4 hours**, same dose text. Primary button reads "Begin" in onboarding,
"Save timings" from the menu. Footnote: "Once saved the timings are locked in and repeat every day."

### 8. log — the home screen
H1 "How are you feeling right now?" then the three colour buttons (red, yellow, green order), then
one "Menu" button (62px). Each colour button: illustration thumb + 30px name + 18px description.
Keep the descriptions **short** — see §11.

### 9. Full-screen alarm overlays
`position: fixed; inset: 0; z-index: 40`.

- **Hourly check-in** — kicker "`<time>` · check in", 44px H1 "How are you feeling right now?",
  three 120px picture buttons, "Not now". Same confirm behaviour inside the overlay.
- **Tablet time** — accent-200 ground, kicker "`<time>` · tablet time", 46px H1
  "Take 1 tablet of Syndopa", body "Take it now, at this time. Keep the same timing every day.",
  78px primary **"I have taken it"** (this is what records the dose), 58px "Remind me in 10 minutes".

### 10. menu
Full-width 64px buttons: Watch the video again / What the colours mean / Waking hours / Your
details / Change tablet timings / Today's report / All days — squares chart / Video script (for the
doctor) / Test the alarm screen / [Turn on alarms — only when notification permission is `default`]
/ primary "Back to logging" (68px). Subhead shows the patient's name or "Patient details not filled
in yet".

### 11. profile
Name, Age, Year diagnosed, Doctor, and a free-text "Anything else to note". Saved on change. These
head the doctor's report.

### 12. today
Header "`<weekday, day month>` · N entries · `<name>`". Three count tiles. "HOUR BY HOUR": one 52px
tile per waking hour with the hour label below. "TABLET SCHEDULE": every scheduled dose with either
"Taken 8:04 AM" or a **"Mark taken"** button — this is the second way a dose gets recorded, and it
matters, because on the web the alarm only fires while the app is open. "Print / save" and "Back to
menu".

### 13. month — the squares chart
See §9. This is the artefact the whole app exists to produce.

### 14. script
Read-only screen holding the ~1:50 narration for re-recording the video, with per-section timings
(Opening 15s, What it asks 20s, Red 30s, Yellow 20s, Green 25s, Tablets and alarms 20s, Close 10s).

---

## 8. Interaction and alarm rules

- **Two-tap logging.** Selecting a colour replaces the buttons with a panel in that colour: 34px
  "Selected red", the definition line, a 70px **Confirm**, and a 56px "Change my answer". Only
  Confirm writes the entry.
- **15-minute lock.** After a confirmed entry, replace the buttons with "Saved" + "You logged red
  just now. You can log again in N minutes." Persist `lockUntil` so it survives app close.
  Count N from the **live clock**, not the tick, or a fresh lock reads as 16 minutes.
- **Toast** "…recorded at `<time>`" for 6 seconds after logging.
- **Hourly check-in** — fires once per clock hour, only when `wakeStart ≤ hour ≤ wakeEnd`, only in
  the first 15 minutes of the hour, deduplicated per day+hour.
- **Tablet alarm** — per tablet × dose time, fires within 15 minutes of the target, deduplicated
  per day+time+name. Snooze re-fires the same payload after 10 minutes.
- **Never replace an alarm already on screen.** The patient may be mid-answer. A due alarm keeps
  its slot and fires on the next tick once the screen is free.
- **Never fire an alarm during onboarding or over a half-filled form** (`welcome`, `step*`,
  `waking`, `setup`, `profile`) — the alarm navigates to the logging screen and would discard
  unsaved tablet timings.
- **Alarm feedback** — system notification if permitted, plus a three-note Web Audio chime
  (587.33 Hz ×2 then 784 Hz, 0.42s apart, gain 0.35, exponential decay) and
  `navigator.vibrate([400, 200, 400, 200, 600])`.
- Clock tick every 15 seconds drives the countdown and the alarm check.

---

## 9. The squares chart — specify this precisely

One row per logged day, one column per waking hour.

**Rows.** The 1 week / 1 month toggle sets only a *window*. Days with nothing logged are skipped
entirely, so 20 logged days render 20 rows, never 30 mostly-empty ones. Today always shows.

**Cells.** `aspect-ratio: 1`, 5px radius, solid state fill. An hour holding **more than one
different colour** renders as a diagonal split — `linear-gradient(135deg, …)` over the colours
present, in priority order **red, green, yellow** — and is never overwritten. Losing a red inside
an otherwise yellow hour would misread the day.

**Grid.** `grid-template-columns: 70px repeat(<waking hours>, 1fr)`, `gap: 3px`, `min-width: 500px`,
inside a horizontally scrollable card. Header row of hour labels ("7am", "8am", …). Row labels are
weekday+day for the week view, "14 Aug" for the month view.

**Tablet lines — the part that makes the chart clinical.**

- A **solid vertical line** through the squares at every tablet actually taken, positioned at its
  true minute inside the hour.
- A **faint dashed line** at a scheduled dose time that passed with no confirmation. Only draw it
  for times already past — a dashed line for a dose still to come today is misleading.

Draw them on a **second grid laid exactly over the cells, sharing the same column template**. Each
marker is placed into its hour column with `grid-column: <index + 2>` and positioned inside that
column with `left: <minutes/60 × 100>%`. Do *not* compute a percentage across the whole row — with
3px gaps across ~17 columns the error reaches 10% and lines land on the wrong hour.

Line style: solid 3px `--color-text` with a small dot cap; dashed 2px neutral-500 via
`repeating-linear-gradient`. Extend 3px above and below the cell so the line reads as passing
*through* the squares. `title` attribute names the tablet, dose and time.

**Legend** must cover: Off/red, Normal/yellow, Extra/green, Not logged, More than one in that hour,
Tablet taken, Tablet time not confirmed.

**Percentages.** Three tiles showing each state's share of entries in the visible days. Count real
entries so they agree with Today's report.

**How it reads clinically** — this is the payoff, and worth stating in the app's README:
red bunching before each line with yellow after = wearing off; a widening gap between line and
colour change = delayed on; green clustering just after a line = peak-dose dyskinesia; red
throughout regardless of lines = under-dosed; wandering or dashed lines = timing drift or missed
doses, which explains a bad day without changing the prescription.

---

## 10. Reports and printing

Both `today` and `month` carry "Print / save" (`window.print()`) and "Back to menu". Add
`@media print` rules: hide buttons and the range toggle, remove the scroll container, force
`print-color-adjust: exact` on cells, tiles, swatches and dose lines, and `break-inside: avoid` on
the chart.

---

## 11. Implementation notes — the traps

These were all found by testing in a real browser. They will recur.

1. **A redraw fired from an input's blur swallows the next tap.** Tapping a button straight after
   typing fires blur → change → click. Redrawing synchronously during `change` removes the button
   before its click lands, and the tap is silently lost — brutal for a tremoring user who thinks
   they mis-tapped. Defer the redraw out of the current gesture (`setTimeout(render, 0)`).
2. **Commit inputs on `change`, never on `input`.** Per-keystroke updates plus re-render pull the
   caret out of the field.
3. **Do not re-render live views while a field has focus.** The 15-second tick must skip the redraw
   when `document.activeElement` is an input or textarea, and must only refresh `log`, `today`,
   `month` or an active alarm — otherwise it restarts the doctor's video on the welcome screen.
4. **The three colour buttons overflow a small phone.** With the full definition sentences they
   reach ~230px each and the home screen scrolls. Fix by making the log screen fill the viewport
   with the buttons flexing to share the space (`flex: 1 1 0` with `min-height: 132px`), keeping
   the button descriptions to one short line, and making the H1 fluid
   (`clamp(31px, 8.6vw, 38px)`). Verify at 375×667.
5. **Navigation must not clobber `fromMenu`** (§7) or setup shows "Begin" when opened from the menu.
6. **Percentages are rounded independently** and can sum to 101%. Accepted; don't "fix" it by
   fudging a value.
7. Escape all user-supplied text before inserting it into markup — tablet names and profile notes
   are free text.
8. Guard `localStorage` writes in try/catch: private mode and quota-full both throw.

---

## 12. Build order

1. Folder skeleton: `index.html`, `app.js`, `styles.css`, `manifest.webmanifest`,
   `service-worker.js`, `assets/`. No build step, no dependencies.
2. Design tokens and component classes in `styles.css`; bundle the two fonts.
3. State object, load/persist, and the legacy migration (§6).
4. Render loop: one function per view, full re-render into a container, event delegation via
   `data-act` attributes on click and change.
5. The `log` screen with two-tap confirm and the lock. Get §11.1 and §11.4 right here.
6. Onboarding chain and `setup`.
7. Alarms: the 15-second tick, the schedule rules, the two overlays, chime and vibration.
8. `today`, including the "Mark taken" checklist.
9. The squares chart with dose lines (§9) — budget the most time here.
10. `profile`, `menu`, `script`, print styles.
11. PWA: manifest, service worker precaching the shell. Do **not** precache the video; cache it at
    runtime. Bump the cache name and the `?v=` query strings whenever assets change.
12. README covering what the chart means clinically.

---

## 13. Test checklist — verify in a real browser, not by reading the code

Drive it with Playwright (Chromium is preinstalled in Claude Code on the web) at 412×915 and
375×667:

- [ ] Onboarding runs end to end; no screen scrolls; the video does not restart on the tick.
- [ ] Tapping a colour does not log. Confirm does. The entry lands in storage.
- [ ] The lock panel appears, reads "15 minutes" not 16, and survives a reload.
- [ ] Type a tablet name then immediately tap "+ Add another time" — the tap registers first time,
      and no page error appears in the console.
- [ ] Setup opened from the menu shows "Save timings"; onboarding shows "Begin".
- [ ] The hourly check-in fires on the tick; the tablet alarm fires and "I have taken it" writes a
      `take`; snooze dismisses.
- [ ] An alarm arriving during the lock explains itself instead of showing dead buttons.
- [ ] A tick during setup does not navigate away or lose typed text.
- [ ] Chart: a dose at 08:00 sits at 0% of the 8am column; 12:30 at 50%. Measure it, don't eyeball.
- [ ] A missed dose shows a dashed line; a future dose today shows nothing.
- [ ] An hour with two colours renders a diagonal split.
- [ ] All three colour buttons are visible without scrolling at 375×667.
- [ ] No console errors other than the browser's vibrate-needs-a-gesture notice.

---

## 14. The native Android port

The web app's one real limitation: **alarms only run while the page is open.** A web page cannot
wake a locked phone. That single fact is the reason to go native — everything else already works.

**Stack.** Kotlin, Jetpack Compose, Material 3 with a custom theme carrying the §4 tokens. minSdk
26. Keep the §6 model and the §8–§9 rules in a pure Kotlin module with no Android dependencies, so
they stay unit-testable and mirror the JS one-for-one.

**Room schema**, mapping directly from §6:

```kotlin
@Entity data class Tablet(@PrimaryKey(autoGenerate=true) val id: Long = 0, val name: String)
@Entity data class Dose(@PrimaryKey(autoGenerate=true) val id: Long = 0,
                        val tabletId: Long, val minuteOfDay: Int, val doseText: String)
@Entity data class Entry(@PrimaryKey(autoGenerate=true) val id: Long = 0,
                         val color: String, val ts: Long)
@Entity data class Take(@PrimaryKey(autoGenerate=true) val id: Long = 0,
                        val tabletName: String, val doseText: String,
                        val scheduledMinuteOfDay: Int?, val ts: Long)
```

Settings (waking hours, profile, `lockUntil`) go in DataStore rather than Room.

**Alarms.**

- `AlarmManager.setExactAndAllowWhileIdle` — one `PendingIntent` per hourly slot and per tablet
  dose time. Re-arm the next occurrence from the `BroadcastReceiver` when each one fires.
- `RECEIVE_BOOT_COMPLETED` receiver to re-arm the whole schedule after a reboot.
- **Full-screen-intent notification** so the alarm screen appears over the lock screen; the alarm
  activity sets `showWhenLocked` and `turnScreenOn`.
- Notification channel at `IMPORTANCE_HIGH` with a custom sound and vibration pattern
  `[400, 200, 400, 200, 600]`.
- Permissions: `POST_NOTIFICATIONS` (Android 13+), `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM`
  (12+), `USE_FULL_SCREEN_INTENT` (14+ requires a granted special permission),
  `RECEIVE_BOOT_COMPLETED`.
- Prompt the user to exempt the app from battery optimisation — without it, OEM power management
  (particularly Xiaomi, Oppo, Vivo, Samsung) will silently kill exact alarms. Add a short
  in-app explainer for this; it is the single most common cause of "the alarm stopped working".

**Other replacements.**

| Web | Android |
| --- | --- |
| `<video>` + play button | Media3/ExoPlayer, video as a raw resource |
| `window.print()` | `PdfDocument` + `FileProvider` share intent |
| CSS grid chart | Compose `Canvas` — draw cells and dose lines directly |
| Web Audio chime | Notification channel sound, or `ToneGenerator` |
| `localStorage` JSON | Room + DataStore |

**Migration.** Ship a JSON import that accepts the exact §6 document, so a patient who started on
the web version keeps their history. Add the matching export to the web app before anyone uses it
in earnest.

**Illustrations.** Keep the vector sources. Android wants either the PNGs at several densities or
the SVGs converted to vector drawables — the latter is cleaner and smaller.

---

## 15. Assets

| File | Notes |
| --- | --- |
| `red-freezing.png` | Heaving on both armrests, unable to rise. 800×800, transparent. |
| `yellow-standing.png` | Up and clear of the chair, smiling. 800×800, transparent. |
| `green-dyskinesia.png` | Seated, limbs flung, sweep arcs. 800×800, transparent. |
| `doctor-intro.mp4` | The doctor's own explainer. Must stay ≤ 2:00. |
| `icon-192.png`, `icon-512.png` | Launcher icon. |
| `fonts/` | Caprasimo + Figtree variable, both SIL OFL. |

The three illustrations are **one set**: the same woman in the same chair, attempting the same
thing — getting out of it. Only the ease changes, so the patient compares like with like. Keep an
editable `.svg` beside every PNG. Any replacement art should hold to that: transparent ground,
square-ish, legible at 88px.
