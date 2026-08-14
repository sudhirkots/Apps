# Day Tracker — Parkinson's on/off monitor

A phone app for a Parkinson's patient to log their motor state hour by hour, and to be
reminded of fixed daily tablet timings. The patient taps one of three big colour buttons:

- **RED** — OFF period (hypokinesia): stiff, frozen, hard to rise, slow movements, tremor.
- **YELLOW** — ON period (normal): gets up, walks, does their work, needs no help.
- **GREEN** — troublesome period (dyskinesia): uncontrolled extra movements.

The clinical purpose is the **squares chart**: an hour-by-hour colour grid across days, with a
vertical line drawn through the squares at every tablet the patient took, so levodopa dose and
timing can be adjusted against what actually happened.

Open `index.html`. No build step, no dependencies, no server — everything is local to the phone.

## The squares chart

One row per logged day, one column per waking hour.

| Mark | Meaning |
| --- | --- |
| Solid square | The state logged in that hour (red / yellow / green) |
| Diagonal split square | More than one different state logged in that hour — never overwritten |
| Pale empty square | Nothing logged |
| **Solid vertical line** | A tablet was taken, positioned at the exact minute inside the hour |
| **Faint dashed line** | A scheduled tablet time that passed with no confirmation |

The lines are drawn on a second CSS grid laid over the squares, sharing the same column
template, so a line lands on its true hour and minute whatever the gaps and screen width. Hovering
a line names the tablet, the dose and the time.

This is what makes the chart readable: red squares bunched *before* each line and yellow *after*
say the dose is working but wearing off early; green just after a line says the dose is a little
high; a late or dashed line explains a bad morning without changing the prescription.

A tablet is recorded as taken when the patient presses **"I have taken it"** on the tablet alarm,
or **"Mark taken"** against a dose in Today's report.

## Screens

`welcome → stepRed → stepYellow → stepGreen → stepAlarms → waking → setup → log`, plus
`menu, profile, today, month, script` behind the menu. First launch starts at `welcome`; once
tablets exist it starts at `log`.

- **welcome** — the doctor's own explainer video, with an explicit "Play the video" button
  (mobile browsers block autoplay).
- **stepRed / stepYellow / stepGreen / stepAlarms** — one idea per screen, vertically centred so
  nothing scrolls.
- **waking** — the two times that bound both the hourly alarm window and the chart's columns.
- **setup** — one card per *tablet*, not per dose: the name is typed once and carries however many
  dose times it needs. New times default to the last one + 4h.
- **log** — the home screen. Deliberately bare: the question, the three buttons, one Menu button.
- **today** — counts, the hour strip, and the day's dose checklist.
- **month** — the squares chart, 1 week / 1 month.
- **script** — the ~1:50 narration, for re-recording the video.

## Interaction rules

- **Two taps to log.** Selecting a colour never records it; a confirm panel does. Tremor causes
  mis-taps, and a wrong colour is worse than a missing one.
- **15-minute lock** after each confirmed entry, persisted, so it survives closing the app.
- **Hourly check-in** fires once per clock hour inside the waking window, in the first 15 minutes.
- **Tablet alarm** fires per tablet × dose time, within 15 minutes of the target, with a 10-minute
  snooze. Alarms are de-duplicated per day and slot, and the record of what has already rung is
  persisted — reopening the app does not re-ring an alarm already dealt with.
- An alarm never replaces one already on screen, and never interrupts onboarding or a half-filled
  form.
- Feedback is a system notification (where permitted) plus a three-note Web Audio chime and a
  vibration pattern.

## Accessibility floor

Users have tremor, bradykinesia and often reduced vision.

- No hit target under 44px; the three colour buttons are 132px minimum and grow to fill the screen.
- Body text 18px+, headings 34px+.
- All three colour buttons fit on one screen without scrolling, down to a 375×667 phone.
- Inputs commit on blur, never per keystroke, and redraws are deferred out of the current gesture
  so a tap straight after typing is never swallowed.

## Files

```
index.html            shell
app.js                state machine, alarms, chart maths, all views
styles.css            "Organic" design tokens, then the app's own classes
manifest.webmanifest  installable PWA
service-worker.js     offline shell
assets/               illustrations, the doctor's video, icons, bundled fonts
```

State lives in one `localStorage` key, `pd-monitor-v1`:

```
tablets   [{ name, doses: [{ time: "HH:mm", dose }] }]
entries   [{ color, ts }]
takes     [{ name, dose, time, ts }]      // time = scheduled, ts = actual
profile   { name, age, year, doctor, notes }
waking    { start, end }
lockUntil epoch ms
fired     which alarm slots have rung today
```

Legacy flat `{name, dose, time}` tablet rows are migrated to the grouped shape on load.

Caprasimo and Figtree (both SIL OFL) are bundled rather than fetched from Google Fonts, so the
installed app looks identical with no connection.

## Known gaps

- **The yellow illustration is still a placeholder** — a Lucide-style smiling face. The intended
  art is a smiling old lady standing easily, drawn to match the red and green cartoons.
- **Alarms only run while the app is open.** This is a browser limitation, not a bug: a web app
  cannot wake a locked phone. Reliable alarms need the native Android port — `AlarmManager`
  `setExactAndAllowWhileIdle` per slot, a full-screen-intent notification, `RECEIVE_BOOT_COMPLETED`
  to survive reboot, and a battery-optimisation exemption. The data model here maps directly onto
  Room tables (`tablet`, `dose`, `entry`, `take`, `settings`).
- The doctor's report prints via `window.print()`; the native port should produce a real PDF.
