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

### Filling in a missed hour

Rule 9 says timestamps are not editable, and that still holds — but a patient who is frozen at 11am
physically cannot log at 11am, and that is the hour you most want to see. So hours can be filled in
or corrected, under three constraints that protect what rule 9 was defending:

1. **Same day only.** Today's hours can be filled until midnight; earlier days are read-only.
   Overnight recall is not reliable enough to be worth recording, and a chart is more useful with an
   honest gap than with a guess.
2. **Nothing is ever rewritten.** A correction appends a new row carrying `edit: true`, which
   outranks whatever else sits in that hour. The superseded row stays in the log. Clearing an hour
   appends `color: null`. The log remains append-only; only the *resolved view* changes.
3. **Late entries stay visibly late.** Every filled-in row carries `enteredTs` — when the patient
   actually typed it, as against `ts`, the hour it describes. Those cells carry a dot on the chart
   and in the legend. Recall is weaker evidence than real-time logging, and you should be able to
   see which is which before changing a dose.

At 40 minutes before the stated bedtime — 9:20pm for the default 22:00 — the app offers to complete
the day, but only if hours are actually empty. It sits clear of the top of the hour deliberately:
the hourly check-in asks what is true *now*, which beats recall, so it keeps priority.

**Why unlogged hours are not silently treated as yellow.** It is tempting, since most of the day
should be yellow, and it would cut the patient's work. But it erases the difference between "I was
fine" and "I did not log", and the bias runs the wrong way: a patient deep in an off period is the
least able to operate a phone, so the hours most likely to go unfilled are exactly the red ones.
Defaulting them to yellow would make an under-treated patient look well controlled. Instead the
patient can *assert* it — "the hours I did not fill were fine" — which is data rather than an
assumption, and is marked as filled-in-later like any other recall.

### Deploying

`APP_VERSION` in `app.js`, `CACHE` in `service-worker.js`, and the `?v=N` query strings move
together on every deploy. The version shows in the menu, because an installed PWA quietly running an
old build is otherwise invisible — a device can be identified at a glance instead of guessed at.

### Under review

Two of the rules above are currently being tested rather than assumed. **Menu → Try the navigation
bar** turns on a bottom nav (Log / Chart / Medicines / Menu) and a "today so far" strip on the home
screen — reversing rules 1 and 8. It is off by default.

Measured at 375×667, the bar costs 17px of colour-button height (152px → 135px) and still clears the
132px accessibility floor with no scrolling, so the trade-off is not as sharp as feared. The open
question is not layout but mis-taps: whether a patient with tremor reaching for "yellow" catches
"Chart" instead. That needs a real phone and a real patient, not a measurement.

Decide it on the device, then delete whichever branch loses.

---

## The intro video

`assets/doctor-intro.mp4` is the treating doctor's own recording. That is deliberate and worth
protecting — a patient follows their own neurologist's face and voice more readily than a synthetic
one, and the app is handed over in clinic.

The current cut runs **3:44** against a target of ≤2:00. The narration it should follow is in the app
at Menu → Video script, timed to roughly 1:50.

`assets/captions-en.vtt` exists but is a **scaffold, not a transcript** — the cue text is the script
and the timings are placeholders. Subtitles are therefore off by default, because captions that do
not match the spoken words are worse than none. To finish them: re-record to the script (then only
timings need adjusting), or transcribe the existing audio and replace the cue text. Then set
`settings.captions = true` in `emptyData()`.

Translation is ready on the code side — every string is in one table at the top of `app.js` — but
each language also needs its own recording, which is the real cost.

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
