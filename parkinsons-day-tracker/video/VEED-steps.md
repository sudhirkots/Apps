# Building the explainer in VEED

VEED is an **editor**, not a generator. That is the right tool here: the screens must be the real
app, and no AI can draw them correctly.

**Do not use VEED's AI Video Generator / text-to-video on this script.** Given "a Parkinson's
tracking app" it will invent an interface — wrong colours, invented buttons, garbled labels. A
patient learning where to tap on a screen that does not match their phone is worse off than a
patient with no video. Use VEED only to assemble real screenshots, audio and captions.

VEED's interface changes fairly often, so the steps below name *what to look for* rather than exact
menu paths.

---

## What to upload

From `../screenshots/` — all fourteen are there, but this cut needs six:

`welcome.png`, `log.png`, `colours.png`, `log-selected.png`, `alarm-hourly.png`, `today.png`

They are 1000×2164, already portrait, so they fill a 9:16 canvas without cropping.

---

## Steps

**1. New project, 9:16 portrait.** Set the canvas to vertical before you start — it is a phone app
and will be watched on a phone. Changing it later reflows everything.

**2. Upload the six screenshots.**

**3. Make the narration.** Two options:

- *Your own voice* — record straight into VEED, one take per scene. **Recommended.** Your patients
  have met you, and they follow a familiar voice more readily than a synthetic one.
- *Text to speech* — open `narration.txt` and paste **one scene at a time**, so each becomes its own
  clip you can retime independently. Pasting all eight as one block means a single fluffed word
  costs you the whole track. Pick an Indian English voice and set the speed slightly below default;
  the default is too fast for this audience.

**4. Lay the screenshots against the audio.** Each scene's still starts when its narration starts.
Scene 5 (blue) is the longest — hold the blue block for the whole line, including "Blue is not
better than green."

For scenes 3, 4 and 5, zoom into the relevant colour block of `colours.png` so that colour fills
the frame. The colour itself should be the visual, not a small panel on a cream page.

**5. Add a slow zoom.** 3–5% push-in on each still over its duration. Stills with no motion read as
a broken video. Keep it subtle — anything faster is distracting rather than alive.

**6. Auto-generate subtitles**, then proofread them. Let VEED transcribe your actual audio rather
than importing a subtitle file; it syncs to what was really said. Check that it got **"off"** and
**"on"** right — speech-to-text mangles those short clinical words more than any other, and they are
the two that matter most.

Make the subtitles large and high contrast. Many people watch muted, and reduced vision is common in
this group.

**7. Highlight the taps.** In scene 6, put a ring or arrow on the colour button, then on Confirm,
each appearing just before the narration names it. VEED's shapes or the draw tool both work.

**8. No music, or very low.** Background music competes with comprehension for an elderly listener.
This is instructional, not promotional.

**9. Export 1080×1920, MP4.**

---

## If you want a presenter on screen

VEED's AI avatars are an option, but a real recording of you is better for this audience, and you
already have footage from the existing intro video. Either way: presenter full-frame for the opening
and close only, corner inset while screens are showing. The screens are the content.

If you do use an avatar, this is the look:

> A South Asian doctor in their fifties, plain shirt, seated in a modestly furnished consulting room.
> Neutral background, soft daylight from one side. Calm, still posture, minimal hand movement. No
> stock-footage gloss, no corporate smiling — an actual clinic, not an advertisement.

---

## Voice direction, if using text to speech

Paste this into any voice tool that accepts a style instruction:

> Narrate as a neurologist speaking directly to an elderly patient with Parkinson's disease and their
> family caregiver, across a desk in a clinic in India. Indian English accent, warm and unhurried —
> someone who has explained this many times and is in no rush.
>
> Around 110 words per minute. A full beat of silence at every paragraph break. Emphasise the colour
> words — red, green, blue — each time they open a sentence.
>
> Plain, kind, matter-of-fact. Not cheerful, not clinical, never condescending. This person has a
> serious illness and knows it. A competent doctor being clear, not a commercial being upbeat.
>
> Do not add greetings, sign-offs, disclaimers, or any words beyond the script.

---

## Before you publish

- Watch it on a phone, not the laptop you edited it on.
- Check the colours on screen match the app: red, green, blue. If the app's palette ever changes,
  re-shoot the screenshots and re-cut, or the video starts actively misleading people.
- Time it. Under two minutes was the requirement, and text to speech often runs longer than the
  written estimate.
