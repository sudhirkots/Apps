/* ═══════════════════════════════════════════════════════════════════════
   Day Tracker — Parkinson's on/off monitor
   ─────────────────────────────────────────────────────────────────────
   The patient logs one of three motor states each hour; the doctor reads
   the result as a squares chart, with a vertical line through the squares
   wherever a tablet was taken. Plain JS on plain HTML, no build step.
   ═══════════════════════════════════════════════════════════════════════ */
'use strict';

const KEY = 'pd-monitor-v1';

const LABELS = {
  red: 'Red — off period',
  yellow: 'Yellow — normal',
  green: 'Green — extra movement'
};
const FILL = { red: '#a8432f', yellow: '#c9a13a', green: '#8fa073' };
const SOFT = { red: '#f7e6e0', yellow: '#f7edd3', green: '#e1eecc' };
const INK  = { red: '#5e2318', yellow: '#4a3a12', green: '#3c4a2b' };
const PENDING_TEXT = {
  red: 'Off period — stiff, frozen, slow, or shaking.',
  yellow: 'Normal — managing on your own.',
  green: 'Too much movement — extra movements getting in the way.'
};
/* Priority order for an hour holding more than one colour: the clinically
   important states win the top-left of the diagonal split. */
const ORDER = ['red', 'green', 'yellow'];
const EMPTY_BG = 'var(--color-neutral-200)';
const EMPTY_BORDER = 'var(--color-neutral-300)';

const LOCK_MS = 15 * 60 * 1000;
const SNOOZE_MS = 10 * 60 * 1000;
const TICK_MS = 15000;

/* The yellow illustration is still to be drawn (a smiling old lady
   standing easily, in the style of the other two). Until it lands, the
   same Lucide-style face stands in everywhere yellow needs art. */
const YELLOW_FACE =
  '<svg width="104" height="104" viewBox="0 0 24 24" fill="none" stroke="#f7edd3" ' +
  'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<circle cx="12" cy="12" r="9.5"></circle>' +
  '<circle cx="9" cy="10" r="1.1" fill="#f7edd3" stroke="none"></circle>' +
  '<circle cx="15" cy="10" r="1.1" fill="#f7edd3" stroke="none"></circle>' +
  '<path d="M8 14.5c1.1 1.6 2.4 2.4 4 2.4s2.9-.8 4-2.4"></path></svg>';

// ── state ──────────────────────────────────────────────────────────────

const state = {
  view: 'welcome',
  tablets: [],
  entries: [],      // { color, ts }
  takes: [],        // { name, dose, time (scheduled HH:mm), ts (actual) }
  profile: { name: '', age: '', year: '', doctor: '', notes: '' },
  waking: { start: '07:00', end: '22:00' },
  range: 7,
  lockUntil: 0,
  pending: null,
  alarm: null,
  toast: null,
  fromMenu: false,
  perm: 'unsupported',
  now: Date.now()
};

/* Which alarm slots have already rung, keyed by day+slot. Persisted, so
   reopening the app inside the same 15-minute window does not ring an
   alarm the patient has already dealt with. */
let fired = {};
let toastTimer = null;
let snoozeTimer = null;
let audioCtx = null;

function load() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { saved = null; }
  if (!saved) return false;

  let tablets = Array.isArray(saved.tablets) ? saved.tablets : [];
  // Migrate the legacy flat shape [{name,dose,time}] into one card per
  // tablet: [{name, doses:[{time,dose}]}].
  if (tablets.length && !tablets[0].doses) {
    const grouped = [];
    tablets.forEach(t => {
      const nm = (t.name || '').trim();
      let g = grouped.filter(x => x.name.toLowerCase() === nm.toLowerCase())[0];
      if (!g) { g = { name: nm, doses: [] }; grouped.push(g); }
      g.doses.push({ time: t.time || '08:00', dose: t.dose || '1 tablet' });
    });
    tablets = grouped;
  }

  state.tablets = tablets;
  state.entries = Array.isArray(saved.entries) ? saved.entries : [];
  state.takes = Array.isArray(saved.takes) ? saved.takes : [];
  if (saved.profile) state.profile = Object.assign(state.profile, saved.profile);
  if (saved.waking) state.waking = Object.assign(state.waking, saved.waking);
  state.lockUntil = saved.lockUntil || 0;

  // Carry over only today's rung slots; yesterday's are dead weight.
  const day = new Date().toDateString();
  if (saved.fired) {
    Object.keys(saved.fired).forEach(k => { if (k.indexOf(day) !== -1) fired[k] = true; });
  }
  return tablets.length > 0;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      tablets: state.tablets,
      entries: state.entries,
      takes: state.takes,
      profile: state.profile,
      waking: state.waking,
      lockUntil: state.lockUntil,
      fired: fired
    }));
  } catch (e) { /* private mode, or the quota is full — keep running */ }
}

// ── small helpers ──────────────────────────────────────────────────────

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function fmtTime(ms) {
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
function fmt12(hhmm) {
  if (!hhmm) return '';
  const p = hhmm.split(':');
  const d = new Date();
  d.setHours(Number(p[0]), Number(p[1]), 0, 0);
  return fmtTime(d.getTime());
}
function toMinutes(hhmm) {
  const p = (hhmm || '00:00').split(':');
  return Number(p[0]) * 60 + Number(p[1]);
}
function hourLabel(h) {
  return (h % 12 === 0 ? 12 : h % 12) + (h < 12 ? 'am' : 'pm');
}
function dayKey(d) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }

function wakeHours() {
  const s = Number((state.waking.start || '07:00').split(':')[0]);
  let e = Number((state.waking.end || '22:00').split(':')[0]);
  if (!(e > s)) e = Math.min(23, s + 1);
  return { start: s, end: e };
}
function hoursList() {
  const w = wakeHours();
  const out = [];
  for (let h = w.start; h <= w.end; h++) out.push(h);
  return out;
}
function isLocked() {
  return !!state.lockUntil && state.now < state.lockUntil && !state.pending;
}
/* Every tablet × every dose time, flattened — the schedule repeats
   unchanged every day, so this is the same list for any date. */
function scheduledDoses() {
  const out = [];
  state.tablets.forEach(t => {
    if (!(t.name || '').trim()) return;
    (t.doses || []).forEach(d => {
      if (d.time) out.push({ name: t.name.trim(), dose: d.dose || '1 tablet', time: d.time });
    });
  });
  return out.sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
}
function takeFor(key, name, time) {
  return state.takes.filter(t => t.name === name && t.time === time &&
    dayKey(new Date(t.ts)) === key)[0] || null;
}

// ── alarms ─────────────────────────────────────────────────────────────

function chime() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      audioCtx = audioCtx || new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const t0 = audioCtx.currentTime;
      [0, 0.42, 0.84].forEach((off, i) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.value = i === 2 ? 784 : 587.33;
        g.gain.setValueAtTime(0, t0 + off);
        g.gain.linearRampToValueAtTime(0.35, t0 + off + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + off + 0.38);
        o.connect(g).connect(audioCtx.destination);
        o.start(t0 + off);
        o.stop(t0 + off + 0.4);
      });
    }
  } catch (e) { /* audio blocked until the first tap — the screen still shows */ }
  if (navigator.vibrate) { try { navigator.vibrate([400, 200, 400, 200, 600]); } catch (e) {} }
}

function fire(title, body, kind, payload) {
  chime();
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try { new Notification(title, { body: body, icon: 'assets/icon-192.png' }); } catch (e) {}
  }
  state.alarm = Object.assign({ kind: kind || 'checkin', title: title, body: body }, payload || {});
  state.view = 'log';
  state.pending = null;
  render();
}

function checkReminders() {
  // Never replace an alarm that is already on screen — the patient may be
  // halfway through answering it. A due alarm keeps its slot and fires on
  // the next tick after the screen is free.
  if (state.alarm) return;
  // Nor interrupt onboarding or a half-filled form: an alarm jumps to the
  // logging screen and would throw away unsaved tablet timings.
  const busy = state.view === 'welcome' || state.view === 'waking' ||
    state.view === 'setup' || state.view === 'profile' || state.view.indexOf('step') === 0;
  if (busy) return;

  const d = new Date();
  const day = d.toDateString();
  const w = wakeHours();
  const hour = d.getHours();

  // Hourly check-in: once per clock hour, only while awake, and only in
  // the first quarter of the hour so a late launch does not fire stale.
  if (hour >= w.start && hour <= w.end && d.getMinutes() < 15 && !fired['h' + day + hour]) {
    fired['h' + day + hour] = true;
    persist();
    fire('Time to check in', 'How are you feeling right now? Tap red, yellow or green.', 'checkin');
    return;
  }

  const mins = hour * 60 + d.getMinutes();
  const due = scheduledDoses().filter(ds => {
    const target = toMinutes(ds.time);
    return mins >= target && mins < target + 15 && !fired['t' + day + ds.time + ds.name];
  })[0];
  if (due) {
    fired['t' + day + due.time + due.name] = true;
    persist();
    fire('Tablet time', 'Take ' + due.dose + ' of ' + due.name, 'tablet', due);
  }
}

// ── actions ────────────────────────────────────────────────────────────

function go(view, fromMenu) {
  state.view = view;
  if (fromMenu !== undefined) state.fromMenu = fromMenu;
  state.pending = null;
  render();
}

function pick(color) {
  if (isLocked()) return;
  state.pending = color;
  render();
}

function confirmPick() {
  const color = state.pending;
  if (!color) return;
  state.entries.push({ color: color, ts: Date.now() });
  state.lockUntil = Date.now() + LOCK_MS;
  state.pending = null;
  state.alarm = null;
  state.toast = LABELS[color] + ' — recorded at ' + fmtTime(Date.now());
  persist();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { state.toast = null; render(); }, 6000);
  render();
}

function recordTake(name, dose, time) {
  state.takes.push({ name: name, dose: dose, time: time || null, ts: Date.now() });
  persist();
}

function addTablet() {
  state.tablets.push({ name: '', doses: [{ time: '08:00', dose: '1 tablet' }] });
  render();
}
function addDose(i) {
  const doses = state.tablets[i].doses || [];
  const last = doses[doses.length - 1];
  // A new time defaults to four hours after the last, same dose — the
  // usual levodopa spacing, so most patients just accept it.
  const nextH = last ? Math.min(23, Number(last.time.split(':')[0]) + 4) : 8;
  doses.push({
    time: (nextH < 10 ? '0' : '') + nextH + ':00',
    dose: last ? last.dose : '1 tablet'
  });
  state.tablets[i].doses = doses;
  render();
}
function removeDose(i, j) {
  const doses = (state.tablets[i].doses || []).filter((x, k) => k !== j);
  state.tablets[i].doses = doses.length ? doses : [{ time: '08:00', dose: '1 tablet' }];
  render();
}

function saveSetup() {
  const named = state.tablets.filter(t => (t.name || '').trim());
  state.tablets = named.length ? named : state.tablets;
  fired = {};                       // new timings, so today's slots re-arm
  persist();
  state.fromMenu = false;
  go('log');
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') askPerm();
}

function askPerm() {
  if (typeof Notification === 'undefined') return;
  Notification.requestPermission().then(p => { state.perm = p; render(); });
}

// ── chart maths ────────────────────────────────────────────────────────

/* An hour holding several different colours is drawn as a diagonal split
   rather than letting the last entry overwrite the rest — losing a red
   inside an otherwise yellow hour would misread the day. */
function cellPaint(list) {
  if (!list || !list.length) return { bg: EMPTY_BG, border: EMPTY_BORDER };
  const cols = ORDER.filter(c => list.indexOf(c) !== -1);
  if (cols.length === 1) return { bg: FILL[cols[0]], border: FILL[cols[0]] };
  const step = 100 / cols.length;
  const stops = cols.map((c, i) => FILL[c] + ' ' + (i * step) + '% ' + ((i + 1) * step) + '%').join(',');
  return { bg: 'linear-gradient(135deg,' + stops + ')', border: FILL[cols[0]] };
}

function colorsByCell() {
  const byCell = {};
  state.entries.forEach(e => {
    const d = new Date(e.ts);
    const k = dayKey(d) + '@' + d.getHours();
    if (!byCell[k]) byCell[k] = [];
    if (byCell[k].indexOf(e.color) === -1) byCell[k].push(e.color);
  });
  return byCell;
}

/* The marks laid over one day's squares: a solid line at the minute a
   tablet was actually taken, and a faint dashed line at a scheduled time
   that came and went without a confirmation. */
function doseMarks(key, dayDate, hrs) {
  const first = hrs[0], last = hrs[hrs.length - 1];
  const marks = [];
  const place = (mins) => {
    const h = Math.floor(mins / 60);
    if (h < first || h > last) return null;      // outside the waking window
    return { col: h - first, frac: (mins % 60) / 60 };
  };

  state.takes.forEach(t => {
    if (dayKey(new Date(t.ts)) !== key) return;
    const d = new Date(t.ts);
    const at = place(d.getHours() * 60 + d.getMinutes());
    if (!at) return;
    marks.push({
      col: at.col, frac: at.frac, taken: true,
      title: t.name + ' — ' + t.dose + ', taken ' + fmtTime(t.ts)
    });
  });

  const isToday = key === dayKey(new Date(state.now));
  const nowMins = new Date(state.now).getHours() * 60 + new Date(state.now).getMinutes();
  scheduledDoses().forEach(ds => {
    if (takeFor(key, ds.name, ds.time)) return;             // it was confirmed
    if (isToday && toMinutes(ds.time) > nowMins) return;    // still to come
    const at = place(toMinutes(ds.time));
    if (!at) return;
    marks.push({
      col: at.col, frac: at.frac, taken: false,
      title: ds.name + ' — ' + ds.dose + ' at ' + fmt12(ds.time) + ', not confirmed'
    });
  });

  return marks;
}

function doseLayer(marks) {
  if (!marks.length) return '';
  const spans = marks.map(m =>
    '<span class="dose-slot" style="grid-column:' + (m.col + 2) + '">' +
      '<i class="dose-line' + (m.taken ? '' : ' dose-line-planned') + '"' +
        ' style="left:' + (m.frac * 100).toFixed(1) + '%"' +
        ' title="' + esc(m.title) + '"></i>' +
    '</span>'
  ).join('');
  return '<div class="dose-layer" style="grid-template-columns:' + gridCols() + '">' + spans + '</div>';
}

function gridCols() { return '70px repeat(' + hoursList().length + ',1fr)'; }

// ── views ──────────────────────────────────────────────────────────────

function colourButtons(compact) {
  const cls = 'colour-btn' + (compact ? ' colour-btn-sm' : '');
  /* Short lines, not the full definitions: all three buttons have to sit
     on one phone screen without scrolling. The definitions are taught in
     onboarding and repeated on the confirm panel. */
  const nameRed = compact ? 'Red' : 'Red — off';
  const nameYel = compact ? 'Yellow' : 'Yellow — normal';
  const nameGrn = compact ? 'Green' : 'Green — too much';
  const whatRed = compact ? 'stiff, frozen, slow, tremor' : 'Stiff, frozen, slow, or shaking.';
  const whatYel = compact ? 'managing on your own' : 'Managing on your own.';
  const whatGrn = compact ? 'too much movement' : 'Extra movements you cannot control.';

  return '<div class="colours">' +
    '<button type="button" class="' + cls + ' cb-red" data-act="pick" data-v="red">' +
      '<span class="thumb"><img src="assets/red-freezing.png" alt=""></span>' +
      '<span class="lines"><span class="name">' + nameRed + '</span>' +
      '<span class="what">' + whatRed + '</span></span></button>' +
    '<button type="button" class="' + cls + ' cb-yellow" data-act="pick" data-v="yellow">' +
      '<span class="thumb">' + YELLOW_FACE + '</span>' +
      '<span class="lines"><span class="name">' + nameYel + '</span>' +
      '<span class="what">' + whatYel + '</span></span></button>' +
    '<button type="button" class="' + cls + ' cb-green" data-act="pick" data-v="green">' +
      '<span class="thumb"><img src="assets/green-dyskinesia.png" alt=""></span>' +
      '<span class="lines"><span class="name">' + nameGrn + '</span>' +
      '<span class="what">' + whatGrn + '</span></span></button>' +
    '</div>';
}

/* Selecting a colour never logs it. It swaps in this panel, and only
   Confirm writes the entry — a mis-tap costs one extra tap, not a wrong
   reading in the doctor's chart. */
function confirmPanel(color) {
  return '<div class="confirm" style="background:' + SOFT[color] + ';border-color:' + FILL[color] +
    ';color:' + INK[color] + '">' +
    '<div class="confirm-title">Selected ' + color + '</div>' +
    '<div class="confirm-what">' + PENDING_TEXT[color] + '</div>' +
    '<button type="button" class="btn btn-primary btn-block b-xl" data-act="confirm">Confirm</button>' +
    '<button type="button" class="btn btn-secondary btn-block b-sm" data-act="cancel">Change my answer</button>' +
    '</div>';
}

function viewWelcome() {
  return '<div class="screen">' +
    '<h1 style="font-size:34px">Your doctor explains</h1>' +
    '<div class="video-frame">' +
      '<video id="introVideo" src="assets/doctor-intro.mp4" controls playsinline preload="auto"></video>' +
    '</div>' +
    '<button type="button" class="btn btn-secondary btn-block b-md" data-act="play">▶ Play the video</button>' +
    '<button type="button" class="btn btn-primary btn-block b-lg" data-act="go" data-v="stepRed">Next</button>' +
    '</div>';
}

function stepScreen(color, art, title, def, eg, next) {
  return '<div class="screen screen-tall">' +
    '<div class="panel panel-' + color + '">' +
      '<div class="art art-' + color + '">' + art + '</div>' +
      '<div class="panel-title">' + title + '</div>' +
      '<div class="panel-def">' + def + '</div>' +
      '<div class="panel-eg">' + eg + '</div>' +
    '</div>' +
    '<button type="button" class="btn btn-primary btn-block b-lg" data-act="go" data-v="' + next + '">Next</button>' +
    '</div>';
}

function viewStepRed() {
  return stepScreen('red',
    '<img src="assets/red-freezing.png" alt="Stiff and frozen">',
    'Red — you are off',
    'Stiff or frozen. Hard to get up from a chair or from bed. Movements feel slow. Or a shaking tremor.',
    'Your feet feel stuck to the floor, or you need help to stand up. That is red.',
    'stepYellow');
}
function viewStepYellow() {
  return stepScreen('yellow', YELLOW_FACE,
    'Yellow — you are on',
    'You get up, walk and do all your work fairly easily. You do not need anyone\'s help.',
    'This is your good period. Most of the day should be yellow.',
    'stepGreen');
}
function viewStepGreen() {
  return stepScreen('green',
    '<img src="assets/green-dyskinesia.png" alt="Uncontrolled extra movements">',
    'Green — too much',
    'Extra movements you cannot control, getting in the way of what you are doing.',
    'Your body, head or arms move on their own, so eating or sitting still is difficult.',
    'stepAlarms');
}

function viewStepAlarms() {
  const next = state.fromMenu
    ? '<button type="button" class="btn btn-primary btn-block b-lg" data-act="menu">Back to menu</button>'
    : '<button type="button" class="btn btn-primary btn-block b-lg" data-act="go" data-v="waking">Next — your times</button>';
  return '<div class="screen screen-tall">' +
    '<div class="panel panel-accent">' +
      '<div class="panel-title" style="color:var(--color-text)">The alarm rings</div>' +
      '<div class="panel-def">Once every hour while you are awake, to ask you for a colour.</div>' +
      '<div class="panel-def">And again at each tablet time, to remind you to take that tablet.</div>' +
      '<div class="panel-eg">You can also press a colour any time, without waiting for the alarm.</div>' +
    '</div>' + next + '</div>';
}

function viewWaking() {
  const next = state.fromMenu
    ? '<button type="button" class="btn btn-primary btn-block b-lg" data-act="menu">Save and go back</button>'
    : '<button type="button" class="btn btn-primary btn-block b-lg" data-act="go" data-v="setup">Next — your tablets</button>';
  return '<div class="screen">' +
    '<div><h1 style="font-size:34px;margin-bottom:8px">Your waking hours</h1>' +
    '<p class="lede">The app asks you for a colour once every hour between these times, ' +
    'and stays quiet while you sleep.</p></div>' +
    '<div class="card elev-sm" style="gap:16px;padding:22px">' +
      '<div class="field"><label for="wakeStart">I wake up at</label>' +
      '<input class="input" id="wakeStart" type="time" style="min-height:62px;font-size:24px" ' +
      'value="' + esc(state.waking.start) + '" data-act="waking" data-v="start"></div>' +
      '<div class="field"><label for="wakeEnd">I go to bed at</label>' +
      '<input class="input" id="wakeEnd" type="time" style="min-height:62px;font-size:24px" ' +
      'value="' + esc(state.waking.end) + '" data-act="waking" data-v="end"></div>' +
    '</div>' + next + '</div>';
}

function viewSetup() {
  const cards = state.tablets.map((t, i) => {
    const heading = (t.name || '').trim() ? esc(t.name) : 'Tablet ' + (i + 1);
    const doses = (t.doses || []).map((d, j) =>
      '<div style="border-radius:26px;background:var(--color-neutral-100);' +
      'border:1px solid var(--color-neutral-300);padding:16px;display:flex;' +
      'flex-direction:column;gap:12px">' +
        '<div style="display:flex;align-items:flex-end;gap:12px">' +
          '<div class="field" style="flex:1"><label>Time</label>' +
          '<input class="input" type="time" value="' + esc(d.time || '08:00') + '" ' +
          'data-act="dose" data-i="' + i + '" data-j="' + j + '" data-f="time"></div>' +
          '<button type="button" class="btn btn-ghost" style="font-size:16px;min-height:56px" ' +
          'data-act="rmDose" data-i="' + i + '" data-j="' + j + '">Remove</button>' +
        '</div>' +
        '<div class="field"><label>Dose at this time</label>' +
        '<input class="input" placeholder="e.g. half tablet" value="' + esc(d.dose || '') + '" ' +
        'data-act="dose" data-i="' + i + '" data-j="' + j + '" data-f="dose"></div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
          quickDose(i, j, 'half tablet', 'Half tablet') +
          quickDose(i, j, '1 tablet', '1 tablet') +
          quickDose(i, j, '1½ tablets', '1½ tablets') +
          quickDose(i, j, '2 tablets', '2 tablets') +
        '</div>' +
      '</div>'
    ).join('');

    return '<div class="card elev-sm" style="gap:16px;padding:20px">' +
      '<div style="display:flex;align-items:center;gap:12px">' +
        '<div style="font-family:var(--font-heading);font-size:19px;margin-right:auto">' + heading + '</div>' +
        '<button type="button" class="btn btn-ghost" style="font-size:16px" ' +
        'data-act="rmTablet" data-i="' + i + '">Remove</button>' +
      '</div>' +
      '<div class="field"><label>Tablet name — write it once</label>' +
      '<input class="input" placeholder="e.g. Syndopa" value="' + esc(t.name || '') + '" ' +
      'data-act="tabletName" data-i="' + i + '"></div>' +
      '<div class="section-label">Times and dose</div>' + doses +
      '<button type="button" class="btn btn-secondary btn-block b-sm" data-act="addDose" data-i="' + i + '">' +
      '+ Add another time for this tablet</button>' +
      '</div>';
  }).join('');

  return '<div class="screen">' +
    '<div><h1 style="font-size:34px;margin-bottom:8px">Your tablets</h1>' +
    '<p class="lede" style="font-size:18px">Write the name once, then add each time you take it ' +
    'and how much. The app alarms at every one of these times.</p></div>' +
    cards +
    '<button type="button" class="btn btn-secondary btn-block b-sm" style="font-size:19px;min-height:58px" ' +
    'data-act="addTablet">+ Add a different tablet</button>' +
    '<button type="button" class="btn btn-primary btn-block" style="font-size:22px;min-height:68px" ' +
    'data-act="saveSetup">' + (state.fromMenu ? 'Save timings' : 'Begin') + '</button>' +
    '<p class="note">Once saved the timings are locked in and repeat every day.</p>' +
    '</div>';
}

function quickDose(i, j, value, label) {
  return '<button type="button" class="btn btn-secondary b-quick" data-act="quickDose" ' +
    'data-i="' + i + '" data-j="' + j + '" data-v="' + esc(value) + '">' + label + '</button>';
}

/* After a confirmed entry the buttons are replaced for 15 minutes. The
   deadline is stored, so closing the app does not reset it. */
function lockedPanel() {
  // Counted off the live clock, not the 15-second tick, or a fresh lock
  // reads as "16 minutes".
  const mins = Math.max(1, Math.ceil((state.lockUntil - Date.now()) / 60000));
  const last = state.entries.length ? state.entries[state.entries.length - 1].color : 'a colour';
  return '<div class="panel panel-flat locked-panel" style="border-radius:36px;padding:24px;gap:10px">' +
    '<div class="saved-title">Saved</div>' +
    '<div class="saved-body">You logged ' + esc(last) + ' just now. You can log again in ' +
    mins + (mins === 1 ? ' minute' : ' minutes') + '.</div></div>';
}

/* The home screen is deliberately bare: the question, the three buttons,
   and one way out to the menu. No clock, no schedule, no navigation. */
function viewLog() {
  const middle = state.pending ? confirmPanel(state.pending)
    : isLocked() ? lockedPanel()
    : colourButtons(false);

  const toast = state.toast
    ? '<div class="panel panel-flat" style="border-radius:32px;padding:20px 24px;gap:4px;' +
      'animation:popIn .25s ease-out"><div style="font-family:var(--font-heading);font-size:23px">Saved</div>' +
      '<div class="saved-body">' + esc(state.toast) + '</div></div>'
    : '';

  return '<div class="screen screen-log" style="gap:18px">' +
    '<h1 class="ask">How are you feeling right now?</h1>' +
    middle + toast +
    '<button type="button" class="btn btn-secondary btn-block b-md" data-act="menu">Menu</button></div>';
}

function viewMenu() {
  const item = (act, label, v) =>
    '<button type="button" class="btn btn-secondary btn-block b-menu" data-act="' + act +
    (v ? '" data-v="' + v : '') + '">' + label + '</button>';

  return '<div class="screen" style="gap:14px">' +
    '<div><h1 style="font-size:36px;margin-bottom:6px">Menu</h1>' +
    '<p class="lede">' + esc(state.profile.name || 'Patient details not filled in yet') + '</p></div>' +
    item('go', 'Watch the video again', 'welcome') +
    item('go', 'What the colours mean', 'stepRed') +
    item('go', 'Waking hours', 'waking') +
    item('go', 'Your details', 'profile') +
    item('go', 'Change tablet timings', 'setup') +
    item('go', "Today's report", 'today') +
    item('go', 'All days — squares chart', 'month') +
    item('go', 'Video script (for the doctor)', 'script') +
    item('testAlarm', 'Test the alarm screen') +
    (state.perm === 'default' ? item('askPerm', 'Turn on alarms') : '') +
    '<button type="button" class="btn btn-primary btn-block" style="font-size:22px;min-height:68px;' +
    'margin-top:8px" data-act="go" data-v="log">Back to logging</button></div>';
}

function viewProfile() {
  const f = (key, label, ph, extra) =>
    '<div class="field"><label>' + label + '</label>' +
    '<input class="input" placeholder="' + ph + '" value="' + esc(state.profile[key] || '') + '" ' +
    'data-act="profile" data-v="' + key + '"' + (extra || '') + '></div>';

  return '<div class="screen" style="gap:18px">' +
    '<div><h1 style="font-size:36px;margin-bottom:6px">Your details</h1>' +
    '<p class="lede" style="font-size:18px">These sit at the top of the report you show your doctor.</p></div>' +
    '<div class="card elev-sm" style="gap:16px;padding:20px">' +
      f('name', 'Your name', 'Full name') +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px">' +
        f('age', 'Age', 'e.g. 68') + f('year', 'Year diagnosed', 'e.g. 2019') +
      '</div>' +
      f('doctor', 'Doctor', "Doctor's name") +
      '<div class="field"><label>Anything else to note</label>' +
      '<textarea class="input" placeholder="Other conditions, contact number" ' +
      'data-act="profile" data-v="notes">' + esc(state.profile.notes || '') + '</textarea></div>' +
    '</div>' +
    '<button type="button" class="btn btn-primary btn-block b-lg" data-act="menu">Save and go back</button>' +
    '</div>';
}

function viewToday() {
  const now = new Date(state.now);
  const key = dayKey(now);
  const byCell = colorsByCell();
  const todays = state.entries.filter(e => dayKey(new Date(e.ts)) === key);
  const count = c => todays.filter(e => e.color === c).length;

  const cells = hoursList().map(h => {
    const p = cellPaint(byCell[key + '@' + h]);
    return '<div class="hour-cell"><div class="box" style="background:' + p.bg +
      ';border-color:' + p.border + '"></div><div class="lbl">' + hourLabel(h) + '</div></div>';
  }).join('');

  const doses = scheduledDoses();
  const list = doses.length ? doses.map(ds => {
    const taken = takeFor(key, ds.name, ds.time);
    const right = taken
      ? '<span class="done">Taken ' + fmtTime(taken.ts) + '</span>'
      : '<button type="button" class="btn btn-secondary" style="font-size:16px;min-height:44px;' +
        'padding:8px 18px" data-act="markTaken" data-v="' + esc(ds.name) + '" ' +
        'data-t="' + esc(ds.time) + '" data-d="' + esc(ds.dose) + '">Mark taken</button>';
    return '<div class="dose-item"><span class="when">' + fmt12(ds.time) + '</span>' +
      '<span class="what">' + esc(ds.name) + ' — ' + esc(ds.dose) + '</span>' + right + '</div>';
  }).join('') : '<p class="note">No tablets set yet.</p>';

  const header = now.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' }) +
    ' · ' + todays.length + (todays.length === 1 ? ' entry' : ' entries') +
    (state.profile.name ? ' · ' + state.profile.name : '');

  return '<div class="screen" style="gap:18px">' +
    '<div><h1 style="font-size:36px;margin-bottom:6px">Today\'s report</h1>' +
    '<p class="lede" style="font-size:18px">' + esc(header) + '</p></div>' +
    '<div class="tiles">' +
      tile('red', count('red'), 'Red / off') +
      tile('yellow', count('yellow'), 'Yellow / normal') +
      tile('green', count('green'), 'Green / extra') +
    '</div>' +
    '<div class="section-label">Hour by hour</div>' +
    '<div class="hour-strip">' + cells + '</div>' +
    '<div class="section-label">Tablet schedule</div>' +
    '<div class="dose-list">' + list + '</div>' +
    '<div class="row-actions">' +
      '<button type="button" class="btn btn-secondary b-sm b-wide" data-act="print">Print / save</button>' +
      '<button type="button" class="btn btn-primary b-sm b-wide" style="font-size:19px" ' +
      'data-act="menu">Back to menu</button>' +
    '</div></div>';
}

function tile(color, num, cap) {
  return '<div class="tile tile-' + color + '"><div class="tile-num">' + num +
    '</div><div class="tile-cap">' + cap + '</div></div>';
}

/* The doctor's main artefact. The window (7 or 30 days) only bounds how
   far back to look — days with nothing logged are skipped entirely, so
   20 logged days render 20 rows and never 30 mostly-empty ones. */
function viewMonth() {
  const hrs = hoursList();
  const byCell = colorsByCell();
  const cols = gridCols();
  const todayK = dayKey(new Date(state.now));

  const logged = {};
  state.entries.forEach(e => { logged[dayKey(new Date(e.ts))] = true; });
  state.takes.forEach(t => { logged[dayKey(new Date(t.ts))] = true; });

  const rows = [];
  const visible = {};
  for (let i = state.range - 1; i >= 0; i--) {
    const d = new Date(state.now);
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    if (!logged[k] && k !== todayK) continue;
    visible[k] = true;
    const cells = hrs.map(h => {
      const p = cellPaint(byCell[k + '@' + h]);
      return '<div class="chart-cell" style="background:' + p.bg + ';border-color:' + p.border + '"></div>';
    }).join('');
    const label = state.range > 10
      ? d.toLocaleDateString([], { day: 'numeric', month: 'short' })
      : d.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
    rows.push('<div class="chart-row" style="grid-template-columns:' + cols + '">' +
      '<div class="row-label">' + label + '</div>' + cells +
      doseLayer(doseMarks(k, d, hrs)) + '</div>');
  }

  const heads = hrs.map(h => '<div>' + hourLabel(h) + '</div>').join('');
  const inRange = state.entries.filter(e => visible[dayKey(new Date(e.ts))]);
  const tot = inRange.length;
  const pct = c => tot ? Math.round(inRange.filter(x => x.color === c).length * 100 / tot) + '%' : '—';
  const w = wakeHours();
  const dayWord = rows.length === 1 ? '1 day logged' : rows.length + ' days logged';
  const subtitle = (state.range === 7 ? 'Up to the last 7 days' : 'Up to the last 30 days') +
    ' · ' + dayWord + ' · ' + hourLabel(w.start) + '–' + hourLabel(w.end) +
    ', one square per hour' + (state.profile.name ? ' · ' + state.profile.name : '');

  const seg = (r, label) =>
    '<button type="button" class="btn btn-secondary b-sm b-wide" style="min-height:54px;background:' +
    (state.range === r ? 'var(--color-accent)' : 'transparent') + ';color:' +
    (state.range === r ? 'var(--color-bg)' : 'var(--color-text)') +
    '" data-act="range" data-v="' + r + '">' + label + '</button>';

  return '<div class="screen" style="gap:18px">' +
    '<div><h1 style="font-size:36px;margin-bottom:6px">All days</h1>' +
    '<p class="lede" style="font-size:18px">' + esc(subtitle) + '</p></div>' +
    '<div class="row-actions no-print">' + seg(7, '1 week') + seg(30, '1 month') + '</div>' +
    '<div class="card elev-sm chart"><div class="chart-inner">' +
      '<div class="chart-head" style="grid-template-columns:' + cols + '"><div></div>' + heads + '</div>' +
      (rows.length ? rows.join('') : '<p class="note">Nothing logged yet.</p>') +
    '</div></div>' +
    '<div class="legend">' +
      '<span><span class="swatch" style="background:#a8432f"></span>Off / red</span>' +
      '<span><span class="swatch" style="background:#c9a13a"></span>Normal / yellow</span>' +
      '<span><span class="swatch" style="background:#8fa073"></span>Extra / green</span>' +
      '<span><span class="swatch" style="background:var(--color-neutral-200);' +
      'border:1px solid var(--color-neutral-300)"></span>Not logged</span>' +
      '<span><span class="swatch" style="background:linear-gradient(135deg,#a8432f 0 50%,#8fa073 50% 100%)">' +
      '</span>More than one in that hour</span>' +
      '<span><span class="swatch-line"></span>Tablet taken</span>' +
      '<span><span class="swatch-line swatch-line-planned"></span>Tablet time, not confirmed</span>' +
    '</div>' +
    '<div class="tiles">' +
      '<div class="tile tile-red"><div class="tile-num" style="font-size:30px">' + pct('red') +
      '</div><div class="tile-cap" style="font-size:15px">entries red</div></div>' +
      '<div class="tile tile-yellow"><div class="tile-num" style="font-size:30px">' + pct('yellow') +
      '</div><div class="tile-cap" style="font-size:15px">entries yellow</div></div>' +
      '<div class="tile tile-green"><div class="tile-num" style="font-size:30px">' + pct('green') +
      '</div><div class="tile-cap" style="font-size:15px">entries green</div></div>' +
    '</div>' +
    '<div class="row-actions">' +
      '<button type="button" class="btn btn-secondary b-sm b-wide" data-act="print">Print / save</button>' +
      '<button type="button" class="btn btn-primary b-sm b-wide" style="font-size:19px" ' +
      'data-act="menu">Back to menu</button>' +
    '</div></div>';
}

function viewScript() {
  const p = (head, text) => '<p><strong>' + head + '</strong> ' + text + '</p>';
  return '<div class="screen" style="gap:16px">' +
    '<div><h1 style="font-size:34px;margin-bottom:6px">Video script</h1>' +
    '<p class="lede" style="font-size:18px">About 1 minute 50 seconds when read at a calm pace. ' +
    'Read it to camera, facing the patient.</p></div>' +
    '<div class="card elev-sm script">' +
      p('Opening (15s).', 'Hello. I am your doctor. This little app helps me see how your day really goes, hour by hour, so I can set your tablets correctly. It takes you five seconds each time.') +
      p('What it asks (20s).', 'Every hour the phone will ring once and ask you one question: how are you feeling right now? You will see three big buttons — red, yellow and green. Press one. That is all.') +
      p('Red (30s).', 'Press red when you are stiff or frozen, when it is hard to get up from a chair or from your bed, when your movements feel slow, or when you have a shaking tremor. If your feet feel stuck to the floor, that is red. If you need help to stand up, that is red. Red means your tablet is not working at that moment.') +
      p('Yellow (20s).', 'Press yellow when you are managing well — you can get up, walk about and do your own work without help. This is your good period. Most of the day should be yellow, and that is what we are aiming for.') +
      p('Green (25s).', 'Press green when you have too much movement — your body, head or arms move on their own and it gets in the way of eating, writing or sitting still. That is also something I need to know, because it usually means the dose is a little high.') +
      p('Tablets and alarms (20s).', 'The app also rings at each of your tablet times. When it rings, take that tablet at that time. Please keep the same timings every day — do not change them yourself; that is very important for us to read your chart properly.') +
      p('Close (10s).', 'You can press a colour at any time, not only when it rings. Bring the phone to your next visit and we will look at your chart together. Thank you.') +
    '</div>' +
    '<button type="button" class="btn btn-primary btn-block b-menu" data-act="menu">Back to menu</button>' +
    '</div>';
}

function viewAlarm() {
  const a = state.alarm;
  if (!a) return '';
  const clock = new Date(state.now).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  if (a.kind === 'tablet') {
    return '<div class="alarm alarm-tablet">' +
      '<div class="alarm-kicker">' + clock + ' · tablet time</div>' +
      '<h1>' + esc(a.body) + '</h1>' +
      '<p style="font-size:20px;margin:0">Take it now, at this time. Keep the same timing every day.</p>' +
      '<button type="button" class="btn btn-primary btn-block" style="font-size:24px;min-height:78px" ' +
      'data-act="tookIt">I have taken it</button>' +
      '<button type="button" class="btn btn-secondary btn-block" style="font-size:19px;min-height:58px" ' +
      'data-act="snooze">Remind me in 10 minutes</button>' +
      '</div>';
  }

  // A check-in can land inside the 15-minute lock if the patient logged by
  // hand a moment ago. Say so, rather than showing buttons that do nothing.
  const middle = state.pending ? confirmPanel(state.pending)
    : isLocked() ? lockedPanel()
    : colourButtons(true);
  return '<div class="alarm">' +
    '<div class="alarm-kicker">' + clock + ' · check in</div>' +
    '<h1>How are you feeling right now?</h1>' + middle +
    '<button type="button" class="btn btn-secondary btn-block" style="font-size:19px;min-height:60px" ' +
    'data-act="dismiss">Not now</button></div>';
}

const VIEWS = {
  welcome: viewWelcome, stepRed: viewStepRed, stepYellow: viewStepYellow,
  stepGreen: viewStepGreen, stepAlarms: viewStepAlarms, waking: viewWaking,
  setup: viewSetup, log: viewLog, menu: viewMenu, profile: viewProfile,
  today: viewToday, month: viewMonth, script: viewScript
};

// ── render ─────────────────────────────────────────────────────────────

const appEl = document.getElementById('app');
const alarmEl = document.getElementById('alarm');

function render() {
  const build = VIEWS[state.view] || viewLog;
  appEl.innerHTML = '<div class="wrap">' + build() + '</div>';
  alarmEl.innerHTML = viewAlarm();
}

/* The 15-second tick keeps the clock, the countdown and the alarm check
   moving. It must not redraw a screen the patient is typing on, and must
   not restart the doctor's video, so it only refreshes the live views. */
function tickRender() {
  const live = state.view === 'log' || state.view === 'today' || state.view === 'month';
  if (!live && !state.alarm) return;
  const el = document.activeElement;
  if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
  render();
}

// ── events ─────────────────────────────────────────────────────────────

function handleClick(e) {
  const el = e.target.closest('[data-act]');
  if (!el || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return;
  const act = el.dataset.act;
  const v = el.dataset.v;
  const i = Number(el.dataset.i);
  const j = Number(el.dataset.j);

  switch (act) {
    // Plain navigation leaves fromMenu alone: it is what tells the shared
    // screens whether they are mid-onboarding ("Begin") or being revisited
    // from the menu ("Save timings", "Back to menu").
    case 'go': go(v); break;
    case 'menu': go('menu', true); break;
    case 'pick': pick(v); break;
    case 'confirm': confirmPick(); break;
    case 'cancel': state.pending = null; render(); break;
    case 'play': {
      const vid = document.getElementById('introVideo');
      if (vid) {
        vid.muted = false;
        const pr = vid.play();
        // Mobile browsers block unmuted autoplay; fall back rather than fail.
        if (pr && pr.catch) pr.catch(() => { vid.muted = true; vid.play(); });
      }
      break;
    }
    case 'addTablet': addTablet(); break;
    case 'rmTablet': state.tablets = state.tablets.filter((x, k) => k !== i); render(); break;
    case 'addDose': addDose(i); break;
    case 'rmDose': removeDose(i, j); break;
    case 'quickDose': state.tablets[i].doses[j].dose = v; render(); break;
    case 'saveSetup': saveSetup(); break;
    case 'range': state.range = Number(v); render(); break;
    case 'print': window.print(); break;
    case 'askPerm': askPerm(); break;
    case 'testAlarm': fire('Time to check in', 'How are you feeling right now?', 'checkin'); break;
    case 'markTaken': recordTake(v, el.dataset.d, el.dataset.t); render(); break;
    case 'tookIt': {
      const a = state.alarm;
      if (a && a.name) recordTake(a.name, a.dose, a.time);
      state.alarm = null;
      render();
      break;
    }
    case 'dismiss': state.alarm = null; render(); break;
    case 'snooze': {
      const a = state.alarm;
      state.alarm = null;
      render();
      clearTimeout(snoozeTimer);
      snoozeTimer = setTimeout(() => { state.alarm = a; chime(); render(); }, SNOOZE_MS);
      break;
    }
  }
}

/* Redraw after the current gesture instead of inside it. Tapping a button
   straight after typing fires blur → change → click; redrawing during the
   change would delete the button before its click landed, and the tap
   would be silently lost. */
let renderTimer = null;
function renderSoon() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 0);
}

/* Inputs commit on change (i.e. on blur), never on keystroke — so a
   re-render can never pull the caret out from under a shaking hand. */
function handleChange(e) {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  const i = Number(el.dataset.i);
  const j = Number(el.dataset.j);

  switch (act) {
    case 'waking':
      state.waking[el.dataset.v] = el.value;
      persist();
      break;
    case 'profile':
      state.profile[el.dataset.v] = el.value;
      persist();
      return;                                   // no redraw: keep the form still
    case 'tabletName':
      state.tablets[i].name = el.value;
      break;
    case 'dose':
      state.tablets[i].doses[j][el.dataset.f] = el.value;
      return;                                   // the card heading is unaffected
    default:
      return;
  }
  renderSoon();
}

document.addEventListener('click', handleClick);
document.addEventListener('change', handleChange);

// ── start ──────────────────────────────────────────────────────────────

function start() {
  const hasTablets = load();
  if (!state.tablets.length) {
    state.tablets = [{ name: '', doses: [{ time: '08:00', dose: '1 tablet' }] }];
  }
  state.view = hasTablets ? 'log' : 'welcome';
  state.perm = (typeof Notification !== 'undefined') ? Notification.permission : 'unsupported';
  render();

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }

  setInterval(() => {
    state.now = Date.now();
    checkReminders();
    tickRender();
  }, TICK_MS);
}

start();
