# Day Tracker

A motor-state diary for a person with Parkinson's disease. The patient logs their state hour by
hour; the treating neurologist reads the result as a chart and adjusts levodopa dose and timing.

Structurally this is a simplified **Hauser-style on/off diary** — three states rather than the usual
four or five, hourly rather than half-hourly. The simplification is deliberate: a patient who cannot
reliably separate troublesome from non-troublesome dyskinesia can still say "stuck", "fine", or
"moving too much".

| Stored state | Shown as | Meaning | Clinical |
| --- | --- | --- | --- |
| `off` | **Red** | Off period | Hypokinesia: stiff, frozen, hard to rise, slow, tremor |
| `on` | **Green** | On period | Normal: gets up, walks, works, needs no help |
| `extra` | **Indigo** | Troublesome period | Dyskinesia: uncontrolled extra movements interfering |

Entries store the **clinical state**, never the colour, so the palette can be re-themed without
migrating data or touching the Android contract.

Green means on, and indigo — not green — means dyskinesia. An earlier build used yellow for on and
green for dyskinesia, which fought the traffic light every patient already knows: someone having a
good day would reach for green, and that reads on the chart as peak-dose dyskinesia, arguing for
*less* levodopa in a patient who is doing fine. A wrong-direction error caused by nothing but colour
convention.

Off and on are the two commonest states and the classic red-green confusion pair, so they are
separated by **lightness** as well as hue — around 8% of men cannot distinguish the hues, and can
still read the chart by tone. Indigo rather than black for dyskinesia: the chart draws tablet times
as dark vertical lines through the cells, and black cells would swallow them exactly where
peak-dose clustering needs to be read. Data written before v7 (`color: "red"|"yellow"|"green"`) is
migrated on load.

---

## Where it lives

**https://daytracker.sudhir-kothari.net** — the address to give patients. Cloudflare Pages project
`day-tracker`, custom domain on a zone already in the Cloudflare account.

Deploy with `./deploy.sh` after any change that should reach patients. **A git push alone does not
update it** — that only refreshes the GitHub Pages copy at
`sudhirkots.github.io/Apps/parkinsons-day-tracker/`, which still exists because the repository serves
other projects from the same site. Two addresses running different versions is how an afternoon gets
lost; the script exists to stop that.

`deploy.sh` refuses to run when `APP_VERSION`, the `?v=` query strings and the service worker
`CACHE` name disagree, because shipping a changed `app.js` under an unchanged version string leaves
installed phones serving the old build with no visible sign of it.

**Moving a patient between addresses loses their history.** Browser storage is per-origin, so the app
opens empty at a new address. Export from the old one and import at the new one
(Menu → Save a backup file / Load a backup file) before switching anybody.

## Running it locally

No build step and no dependencies. Serve the folder over HTTP — `file://` will not do, because
service workers and the manifest need an origin.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`. On a phone, use "Add to home screen" to install it; it then runs
full-screen and works with no connection.

---

## Two colours by default

The patient answers with **red and green only**. Blue is added by the doctor at setup, or from
Menu → Track extra movements, when dyskinesia is the question being asked.

Most patients do not have troublesome dyskinesia, and a third button is a cost every patient pays to
serve a minority — more to explain, more to mis-tap, and a state some will log wrongly because they
never really grasped it. Dropping to two also lets the buttons grow from 135px to 246px.

Turning it off never hides data: an `extra` entry already in the log still renders on the chart, and
the legend and percentage tiles show whatever states are actually present. Hiding a state the patient
recorded would delete evidence from the chart the doctor is reading.

## Setup is filled in by staff, not the patient

`setup` is a wizard for the doctor or nurse to complete before handing the phone over: one question
per screen, one tablet at a time — name, dose, how many times a day, then the clock times. It is
shaped for someone dictating a regimen they already know, not for a patient discovering the app.
Choosing a preset fills dose and timings too and skips those questions.

The last question asks whether to track dyskinesia. Then a review card list, which is also where
Menu → Change tablet timings lands — editing an existing regimen in place beats walking back through
one question per screen.

## Languages

English, Hindi, Marathi, Gujarati, Tamil, Telugu, Kannada and Malayalam. The language question is the
first screen on a fresh install, with each option written in its own script so it needs no
translation to be found. Eight options are laid out two-up, because a single column overflows a
375×667 phone and someone who cannot read the interface cannot be expected to discover that the list
continues below the fold.

Every language is an **override map merged over English**, so a missing key falls back to English
rather than rendering blank. Only the patient-facing surface is translated; the staff wizard stays in
English, since clinic staff enter drug names and dosing in English anyway.

**All seven non-English translations are drafts and have not been clinically reviewed.** They
must be read by a clinician who speaks the language before any patient sees them. The risk is not
grammar — it is a word like "off" or "stiff" landing with the wrong clinical sense and quietly
changing what gets logged.

The bundled fonts are Latin-only, so every Indic script falls through to the phone's own fonts
(Android and iOS both ship Noto for all of these). Those scripts also get a looser line height,
because matras and vowel signs clip at the Latin default.

---

## Reading the squares chart

This is the artefact the whole app exists to produce. One row per logged day, one column per waking
hour, and a vertical line through the squares at every tablet.

- **Solid line** — a tablet the patient confirmed taking, drawn at its true minute within the hour.
- **Faint dashed line** — a scheduled dose time that passed with no confirmation. Only drawn for
  times already past; a dashed line for a dose still to come today would be misleading.
- **Diagonally split square** — more than one state was logged in that hour. A red inside an
  otherwise green hour is never overwritten, because losing it would misread the day.

What the patterns mean:

| Pattern | Reading |
| --- | --- |
| Red bunching before each line, green after | **Wearing off** — the dose interval is too long |
| Widening gap between the line and the colour change | **Delayed on** — absorption is slowing |
| Indigo clustering just after a line | **Peak-dose dyskinesia** — the individual dose is too high |
| Red throughout, regardless of lines | **Under-dosed** overall |
| Wandering or dashed lines | Timing drift or missed doses — explains a bad day *without* changing the prescription |

That last row is the one that saves prescriptions. Check the lines before concluding the regimen has
failed.

Both the day report and the chart have a "Print / save" button that produces a clean, colour-exact
page for the notes.

---

## Design decisions that should not be re-litigated

1. The logging screen shows **only** the question, the three buttons, and one Menu button.
2. State meanings are fixed. Red = off, green = on/normal, indigo = dyskinesia.
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
   appends `state: null`. The log remains append-only; only the *resolved view* changes.
3. **Late entries stay visibly late.** Every filled-in row carries `enteredTs` — when the patient
   actually typed it, as against `ts`, the hour it describes. Those cells carry a dot on the chart
   and in the legend. Recall is weaker evidence than real-time logging, and you should be able to
   see which is which before changing a dose.

At 40 minutes before the stated bedtime — 9:20pm for the default 22:00 — the app offers to complete
the day, but only if hours are actually empty. It sits clear of the top of the hour deliberately:
the hourly check-in asks what is true *now*, which beats recall, so it keeps priority.

**Why unlogged hours are not silently treated as on.** It is tempting, since most of the day should
be green, and it would cut the patient's work. But it erases the difference between "I was fine" and
"I did not log", and the bias runs the wrong way: a patient deep in an off period is the least able
to operate a phone, so the hours most likely to go unfilled are exactly the red ones. Defaulting
them to green would make an under-treated patient look well controlled. Instead the patient can
*assert* it — "the hours I did not fill were fine" — which is data rather than an assumption, and is
marked as filled-in-later like any other recall.

### Deploying

`APP_VERSION` in `app.js`, `CACHE` in `service-worker.js`, and the `?v=N` query strings move
together on every deploy. The version shows in the menu, because an installed PWA quietly running an
old build is otherwise invisible — a device can be identified at a glance instead of guessed at.

### Superseded, by decision

Rules 1 and 8 above no longer hold. As of v6 the app ships with a bottom navigation bar
(Log / Chart / Medicines / Menu) and a "today so far" strip on the home screen, both on by default.
This was tested on a phone and adopted deliberately, not drifted into.

The measured cost is 17px of colour-button height at 375×667 (152px → 135px), still clear of the
132px accessibility floor, with no scrolling. **Menu → Turn off the navigation bar** restores the
plain screen for a patient who mis-taps it — the "Blue" button sits directly above "Chart", which is the one
adjacency worth watching in clinic.

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
