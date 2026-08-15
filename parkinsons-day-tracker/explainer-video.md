# Explainer video — script and production prompt

A how-to-use video for **the patient and the caregiver together**. This is a different asset from
the intro video already inside the app: that one explains what the three colours mean (~1:50, script
at Menu → Video script). This one explains how to *operate* the app.

Running time as written: **about 4 minutes**. A 1:50 cut is marked at the end.

---

## Before recording: the honest constraint

AI video generators cannot draw this app's screens correctly. Asking one to "show a Parkinson's
tracking app" produces plausible-looking fake UI with wrong colours, invented buttons and garbled
text — worse than useless for a patient learning where to tap.

So build it as **real screenshots + a narrator**, not as generated video:

- **Screens** — the PNG files in `screenshots/`, captured from the live app.
- **Voice** — either record it yourself, or use an AI voice. If patients already know your voice from
  the in-app intro, use your own; the familiarity is doing real work.
- **Presenter** — optional. A small talking-head corner is warmer for elderly patients than a
  disembodied voice, but it is not required.

Assemble in any editor. The screens are stills; add a highlight ring or arrow at each tap point, and
a slow push-in so a static screenshot does not feel dead.

---

## Script

Narration is written to be read aloud at an unhurried pace. Short sentences on purpose — many
viewers will be 65+, some with cognitive slowing, and the caregiver may be watching over
their shoulder.

### 1 · Opening — 0:00–0:15
**Screen:** `welcome.png`

> This app keeps a simple diary of how your Parkinson's medicine works through the day.
> It takes a few seconds each time. At your next visit, your doctor will look at the diary and adjust
> your tablets.

### 2 · The three colours — 0:15–1:05
**Screen:** `colours.png` — hold on each colour block as it is described

> The app asks you one question: how are you feeling right now? You answer with a colour.
>
> **Red** means you are off. Stiff or frozen. Hard to get up from a chair. Movements feel slow. Or a
> shaking tremor.
>
> **Yellow** means you are on. You get up, walk, and do your work fairly easily. You do not need
> anyone's help. Most of the day should be yellow.
>
> **Green** means too much movement. Your body, head or arms move on their own, and it gets in the
> way of eating or sitting still.
>
> Only three. If you are unsure, choose the one closest to how you feel.

### 3 · Waking hours — 1:05–1:20
**Screen:** `waking.png`

> The first time you open the app, tell it when you wake up and when you go to bed. The app will only
> ask you during these hours. It will not disturb your sleep.

### 4 · Your tablets — 1:20–1:50
**Screen:** `setup.png` — highlight the preset row, then the filled card

> Next, enter your tablets. If you take a common one, tap it here and the times are filled in for
> you. Otherwise type the name once, and add each time you take it.
>
> **Caregiver:** this is the part worth doing together, and worth getting exactly right. The whole
> diary is read against these timings.
>
> Once saved, keep the same timings every day. Do not change them on your own.

### 5 · The main screen — 1:50–2:20
**Screen:** `log.png` → `log-selected.png` → `log-locked.png`

> This is the main screen. Three buttons, one question.
>
> Press the colour you feel. Then press **Confirm**. Two taps, so a shaky hand cannot record the
> wrong answer by mistake.
>
> After you confirm, the app rests for fifteen minutes. That is normal. You do not need to do
> anything else.

### 6 · The hourly alarm — 2:20–2:40
**Screen:** `alarm-hourly.png`

> Once every hour while you are awake, the app will ring and ask for a colour. Answer it if you can.
> If you are busy, press **Not now**.
>
> You can also open the app and press a colour any time, without waiting for the alarm.

### 7 · Tablet reminders — 2:40–3:00
**Screen:** `today.png` — highlight the tablet schedule section

> At each tablet time the app reminds you to take that tablet. After you take it, press
> **I have taken it**. That is how the doctor knows your actual timing, not just the plan.
>
> If you miss the reminder, open **Medicines** and press **Mark taken** next to that dose.

### 8 · Filling in a missed hour — 3:00–3:25
**Screen:** `today-filling.png`

> Sometimes you cannot use the phone at the time — especially during a bad off period. That hour is
> not lost.
>
> Open **Medicines**, and tap any hour that is empty. Choose the colour you remember. You can also
> change an hour if you picked the wrong colour.
>
> This only works for today. After midnight the day is closed, because memory from yesterday is not
> reliable enough for the doctor to act on.

### 9 · Finishing the day — 3:25–3:45
**Screen:** `today.png` — highlight "The hours I did not fill were fine"

> At night the app will ask whether you want to complete the day. If the hours you missed were all
> good hours, press **The hours I did not fill were fine**, and they are marked yellow together.
>
> Only press it if it is true. An empty hour tells the doctor more than a wrong colour does.

### 10 · The chart — 3:45–4:10
**Screen:** `month.png`, then `month-30.png`

> **Caregiver, this is the part that matters.** Every day is a row. Every hour is a square. The
> vertical lines are the tablets.
>
> The doctor reads the pattern between the lines and the colours — whether the medicine is wearing
> off before the next dose, or working too strongly after it. That is what decides the next
> prescription.
>
> Nothing needs to be done here. Just keep the diary honest.

### 11 · Close — 4:10–4:25
**Screen:** `menu.png`, then back to `log.png`

> Everything stays on this phone. Nothing is shared without you.
>
> Bring the phone to your next visit. Answer the alarms when you can, take your tablets at the same
> times, and let the diary do the rest.

---

## Short cut — about 1:50

For patients who will not sit through four minutes, use scenes **1, 2, 5, 6, 7, 11** only. That
covers what the colours mean and how to answer, which is the minimum needed for usable data. The
caregiver can watch the full version separately — scenes 4, 8, 9 and 10 are mostly for them.

---

## Production prompt

For an AI voice or presenter tool (ElevenLabs, HeyGen, Synthesia, D-ID). Paste the narration
scene by scene, with this as the voice direction:

> Narrate this as a neurologist speaking directly to an elderly patient with Parkinson's disease and
> their family caregiver, sitting across a desk in a clinic in India. Indian English accent, warm and
> unhurried, the pace of someone who has said this many times and is in no rush.
>
> Speak slowly — roughly 110 words per minute. Leave a full beat of silence at every paragraph break;
> the listener may be processing slowly. Emphasise the colour words — red, yellow, green — and the
> button names the viewer must find on screen.
>
> Plain, kind, and matter-of-fact. Not cheerful, not clinical, and never condescending. This person
> has a serious illness and knows it; the tone is a competent doctor being clear, not a
> commercial being upbeat.
>
> Do not add greetings, sign-offs, disclaimers, or any words beyond the script.

### Assembly notes

| Element | Direction |
| --- | --- |
| Screens | Real screenshots only. Never let a generative tool draw the interface. |
| Motion | Slow 3–5% push-in on each still. Cross-dissolve between scenes, 400ms. |
| Tap points | Ring or arrow appearing 0.3s before the narration names the button. |
| Captions | Burn in, large, high contrast. Many viewers watch muted, and some have reduced vision. |
| Colour blocks | When narrating red / yellow / green, fill the screen with that colour block from `colours.png`. |
| Music | None, or very low. It competes with comprehension for this audience. |
| Aspect | 9:16 portrait — it is a phone app and will be watched on a phone. |

### If you want a talking-head presenter

> A South Asian doctor in their fifties, in a plain shirt, seated in a modestly furnished consulting
> room. Neutral background, soft daylight from one side. Calm, still posture, minimal hand movement.
> No stock-footage gloss, no white teeth, no corporate smiling — this should look like an actual
> clinic, not an advertisement.

Keep the presenter in a corner inset while screens are shown, full-frame only for the opening and
close.

---

## Screens referenced

| File | Screen |
| --- | --- |
| `welcome.png` | Opening — the doctor's intro video |
| `colours.png` | All three colours on one screen |
| `waking.png` | Waking hours setup |
| `setup.png` | Tablets, with quick-set presets |
| `log.png` | Main logging screen |
| `log-selected.png` | Colour chosen, awaiting Confirm |
| `log-locked.png` | Saved, fifteen-minute rest |
| `alarm-hourly.png` | Hourly check-in alarm |
| `today.png` | Day report, hour strip and tablet schedule |
| `today-filling.png` | Filling in a missed hour |
| `month.png` | Squares chart, one week |
| `month-30.png` | Squares chart, one month |
| `menu.png` | Menu |
| `profile.png` | Patient details |
