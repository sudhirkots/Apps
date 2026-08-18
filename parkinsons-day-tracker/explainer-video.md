# Explainer video — script and production prompt

> **STALE — do not record from this yet.**
>
> The intro video was removed from the app in v10, because it taught three
> colours and the previous palette and so contradicted the app in the patient's
> hand.
>
> This script is still written for **three** colours. The app now defaults to
> **two** — red and green — with blue added only when the doctor turns on
> dyskinesia tracking. Scenes 3–5 and the close all need rewriting, and every
> screenshot in `screenshots/` shows three buttons and the old onboarding.
>
> Left in place because the structure, timings and production notes still hold.
> Say the word and it gets rewritten for two colours, and the screenshots
> re-shot — possibly one set per language.

One video, for the patient and the caregiver together. It explains what the three colours mean and
how to answer. **Target: under two minutes.**

As written it is **194 words** — **1:45** at 110 words per minute, the right pace for this audience,
and **1:56** even at a slow 100 wpm. It stays under two minutes at any sensible pace, with room for
pauses. Do not add lines without removing others.

---

## The colours now work with instinct, not against it

**Red is off. Green is on. Blue is too much movement.**

This matters for the script. An earlier build used yellow for on and green for dyskinesia, and the
video had to spend fifteen seconds fighting the traffic light every patient already knows — a person
having a good day would reach for green, which on the chart reads as peak-dose dyskinesia and argues
for cutting levodopa in someone who is doing fine.

The palette was changed instead, so that warning is gone and the time went back into the script. The
only counter-intuitive item left is **blue**, which nobody has a prior expectation about — so it
needs describing, not un-teaching. Scene 5 does that.

---

## Before recording: the honest constraint

AI video generators cannot draw this app's screens. Ask one for "a Parkinson's tracking app" and it
produces plausible-looking fake UI — wrong colours, invented buttons, garbled text. For a patient
learning where to tap, that is worse than no video.

Build it as **real screenshots + narration**:

- **Screens** — the PNGs in `screenshots/`, captured from the live app.
- **Voice** — preferably your own. Patients who have met you follow your voice more readily than a
  synthetic one. An AI voice prompt is included if you would rather not record.

---

## Script — 1:45

### 1 · What this is — 0:00–0:12 · 25 words
**Screen:** `welcome.png`

> This app keeps a simple diary of how your medicine works through the day.
> I read it at your next visit, and adjust your tablets.

### 2 · The question — 0:12–0:20 · 18 words
**Screen:** `log.png`

> It asks you one question. How are you feeling right now? You answer with one of three colours.

### 3 · Red — 0:20–0:36 · 22 words
**Screen:** `colours.png`, red block full frame

> **Red** means you are off. Stiff, or frozen. Hard to get up from a chair. Movements feel slow.
> Or a shaking tremor.

### 4 · Green — 0:36–0:50 · 21 words
**Screen:** `colours.png`, green block full frame

> **Green** means you are on. You get up, walk, and do your work easily.
> Most of your day should be green.

### 5 · Blue — 0:50–1:12 · 36 words
**Screen:** `colours.png`, blue block full frame

> **Blue** means too much movement. Your body, head or arms move on their own,
> making it hard to eat or sit still.
>
> Blue is not better than green. It means the medicine is working too strongly.

*This is the only colour the viewer has no instinct for. Give it the extra beat.*

### 6 · How to answer — 1:12–1:26 · 19 words
**Screen:** `log.png` → `log-selected.png`

> Press the colour you feel. Then press Confirm. Two taps, so a shaky hand cannot record the wrong
> answer.

### 7 · Alarms and tablets — 1:26–1:40 · 29 words
**Screen:** `alarm-hourly.png` → `today.png`

> Every hour the app will ring and ask. Answer when you can.
> At each tablet time it reminds you — press "I have taken it" after you take it.

### 8 · Close — 1:40–1:52 · 24 words
**Screen:** `log.png`

> Red when you are stuck. Green when you are well. Blue when there is too much movement.
> Bring the phone to your next visit.

**Total: 194 words — 1:45 at 110 wpm, 1:56 at 100 wpm.**

---

## If you need to save time

1. Scene 7, second half — the tablet reminder is self-explanatory on screen (saves ~8s).
2. Scene 1, second sentence (saves ~5s).
3. Scene 6 — only if the two-tap flow looks obvious to you (saves ~11s).

**Never cut** the second half of scene 5. "Blue is not better than green" is the one line carrying
information the viewer cannot guess.

---

## What is deliberately not in this video

These matter but do not survive a two-minute budget. They belong in a printed sheet handed over in
clinic:

- Setting waking hours and entering tablets (`waking.png`, `setup.png`) — done once, in clinic.
- Filling in a missed hour, and "the hours I did not fill were fine" (`today-filling.png`).
- Reading the squares chart (`month.png`) — that is for you, not the patient.
- Backup and restore (`menu.png`).

---

## Production prompt

For an AI voice tool (ElevenLabs, HeyGen, Synthesia). Paste the narration scene by scene with this
as voice direction:

> Narrate this as a neurologist speaking directly to an elderly patient with Parkinson's disease and
> their family caregiver, across a desk in a clinic in India. Indian English accent, warm and
> unhurried — someone who has explained this many times and is in no rush.
>
> Around 110 words per minute. Leave a full beat of silence at every paragraph break. Emphasise the
> colour words — red, green, blue — each time they open a sentence.
>
> Plain, kind, matter-of-fact. Not cheerful, not clinical, never condescending. This person has a
> serious illness and knows it. A competent doctor being clear, not a commercial being upbeat.
>
> Do not add greetings, sign-offs, disclaimers, or any words beyond the script.

### Assembly

| Element | Direction |
| --- | --- |
| Screens | Real screenshots only. Never let a generative tool draw the interface. |
| Colour beats | Scenes 3–5 fill the frame with that colour block, so the colour itself is the visual. |
| Motion | Slow 3–5% push-in on each still; 400ms cross-dissolves. |
| Tap points | Ring or arrow appearing 0.3s before the narration names the button. |
| Captions | Burn in, large, high contrast. Many will watch muted, and some have reduced vision. |
| Music | None, or very low. It competes with comprehension for this audience. |
| Aspect | 9:16 portrait — it is a phone app, watched on a phone. |

### If you want a talking-head presenter

> A South Asian doctor in their fifties, plain shirt, seated in a modestly furnished consulting room.
> Neutral background, soft daylight from one side. Calm, still posture, minimal hand movement. No
> stock-footage gloss, no corporate smiling — an actual clinic, not an advertisement.

Corner inset while screens are shown; full frame only for the opening and close.

---

## Screens referenced

| File | Used in |
| --- | --- |
| `welcome.png` | Scene 1 |
| `log.png` | Scenes 2, 6, 8 |
| `colours.png` | Scenes 3, 4, 5 |
| `log-selected.png` | Scene 6 |
| `alarm-hourly.png` | Scene 7 |
| `today.png` | Scene 7 |

Also in `screenshots/`, unused by this cut but useful for a printed handout: `waking.png`,
`setup.png`, `log-locked.png`, `today-filling.png`, `month.png`, `month-30.png`, `menu.png`,
`profile.png`.

All screenshots are captured from the live app at the current palette. If the palette ever changes
again, re-shoot them — a patient following a video whose colours do not match their screen is worse
off than one with no video.
