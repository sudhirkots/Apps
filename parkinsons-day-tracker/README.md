# Day Tracker

A motor-state diary for a person with Parkinson's disease. The patient logs their state hour by
hour; the treating neurologist reads the result as a chart and adjusts levodopa dose and timing.

Structurally this is a simplified **Hauser-style on/off diary** — three states rather than the usual
four or five, hourly rather than half-hourly. The simplification is deliberate: a patient who cannot
reliably separate troublesome from non-troublesome dyskinesia can still say "stuck", "fine", or
"moving too much".

| State | Meaning | Clinical |
| --- | --- | --- |
| **Red** | Off period | Hypokinesia: stiff, frozen, hard to rise, slow, tremor |
| **Yellow** | On period | Normal: gets up, walks, works, needs no help |
| **Green** | Troublesome period | Dyskinesia: uncontrolled extra movements interfering |

---

## Running it

No build step and no dependencies. Serve the folder over HTTP — `file://` will not do, because
service workers and the manifest need an origin.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`. On a phone, use "Add to home screen" to install it; it then runs
full-screen and works with no connection.

---

## Reading the squares chart

This is the artefact the whole app exists to produce. One row per logged day, one column per waking
hour, and a vertical line through the squares at every tablet.

- **Solid line** — a tablet the patient confirmed taking, drawn at its true minute within the hour.
- **Faint dashed line** — a scheduled dose time that passed with no confirmation. Only drawn for
  times already past; a dashed line for a dose still to come today would be misleading.
- **Diagonally split square** — more than one colour was logged in that hour. A red inside an
  otherwise yellow hour is never overwritten, because losing it would misread the day.

What the patterns mean:

| Pattern | Reading |
| --- | --- |
| Red bunching before each line, yellow after | **Wearing off** — the dose interval is too long |
| Widening gap between the line and the colour change | **Delayed on** — absorption is slowing |
| Green clustering just after a line | **Peak-dose dyskinesia** — the individual dose is too high |
| Red throughout, regardless of lines | **Under-dosed** overall |
| Wandering or dashed lines | Timing drift or missed doses — explains a bad day *without* changing the prescription |

That last row is the one that saves prescriptions. Check the lines before concluding the regimen has
failed.

Both the day report and the chart have a "Print / save" button that produces a clean, colour-exact
page for the notes.

---

## Design decisions that should not be re-litigated

1. The logging screen shows **only** the question, the three buttons, and one Menu button.
2. Colour meanings are fixed. Red = off, yellow = on/normal, green = dyskinesia.
3. Tablet timings are constant day to day. The patient is told not to change them.
4. One tablet = one name + many times. The name is never asked for again per dose time.
5. Logging is **two taps**: select, then Confirm. Never log on a single tap.
6. A **15-minute lock** follows every confirmed entry.
7. Onboarding is one idea per screen and must not scroll.
8. History is for the doctor, not the patient. It lives behind the menu.
9. Timestamps come from the device clock and are **not editable**.

`entries` and `takes` are append-only logs, never edited. That is what makes the chart trustworthy.

---

## Accessibility floor

Users have tremor, bradykinesia and often reduced vision. No hit target under 44px; the three colour
buttons are 132px minimum and grow to fill the height. Body text 18px minimum. All three colour
buttons must be visible without scrolling on a 375×667 phone.

---

## Files

| File | Contents |
| --- | --- |
| `index.html` | Shell — one `#app` div |
| `app.js` | Everything, in three layers: domain rules, persistence, view |
| `styles.css` | Design tokens, components, print rules |
| `manifest.webmanifest`, `service-worker.js` | PWA install and offline shell |
| `assets/` | Illustrations (PNG + editable SVG), fonts, icons, the doctor's video |

`app.js` is deliberately layered so the planned Android port replaces only the third layer:

1. **Domain** — pure functions of data and a clock. No DOM, no storage.
2. **Persistence** — one JSON document under `localStorage["pd-monitor-v1"]`.
3. **View** — screens and events.

Epoch milliseconds for anything that happened, `"HH:mm"` local time for anything scheduled. Never
formatted or timezone-shifted strings.

---

## Data and backups

Everything stays on the device. Nothing is uploaded, and there is no account.

The menu has **Save a backup file** and **Load a backup file**, which read and write the raw JSON
document. Take a backup before changing phones — and note that clearing the browser's site data
erases the history.

---

## The Android port

The web app has one real limitation: **alarms only run while the page is open.** A web page cannot
wake a locked phone. That single fact is the reason to go native; everything else already works.

The port keeps this JSON shape as its contract:

```jsonc
{
  "tablets": [ { "name": "Syndopa",
                 "doses": [ { "time": "08:00", "dose": "1 tablet" } ] } ],
  "entries": [ { "color": "red", "ts": 1786724293937 } ],
  "takes":   [ { "name": "Syndopa", "dose": "1 tablet",
                 "time": "08:00",            // scheduled slot, may be null
                 "ts": 1786724293937 } ],    // when actually taken
  "profile": { "name": "", "age": "", "year": "", "doctor": "", "notes": "" },
  "waking":  { "start": "07:00", "end": "22:00" },
  "lockUntil": 0,
  "fired": { "h<day><hour>": true, "t<day><time><name>": true }
}
```

`takes.time` is the *scheduled* slot; `takes.ts` is when the dose was actually taken. Both are
needed — the gap between them is clinically interesting.

Planned stack: Kotlin, Jetpack Compose, Material 3 carrying these same tokens, minSdk 26. Keep the
domain rules in a pure Kotlin module with no Android dependencies so they stay unit-testable and
mirror the JS one-for-one. Room for `tablets`/`entries`/`takes`, DataStore for settings.

Alarms are the substantive work: `AlarmManager.setExactAndAllowWhileIdle` with one `PendingIntent`
per slot, re-armed from the `BroadcastReceiver` as each fires, a `RECEIVE_BOOT_COMPLETED` receiver
to rebuild the schedule after a reboot, and a full-screen-intent notification so the alarm shows
over the lock screen. Prompt the user to exempt the app from battery optimisation — without it, OEM
power management (Xiaomi, Oppo, Vivo, Samsung especially) silently kills exact alarms. That is the
single most common cause of "the alarm stopped working".

The JSON import above is what lets a patient who started on the web keep their history.
