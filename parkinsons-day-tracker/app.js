/* Day Tracker — a motor-state diary for Parkinson's disease.
 *
 * Structured in three layers (BUILDSPEC §3) so the Android port replaces only the last one:
 *   1. DOMAIN   — pure functions of data and a clock. No DOM, no storage.
 *   2. PERSIST  — one JSON document; the shape is the contract with the Android app.
 *   3. VIEW     — screens, rendering, events.
 *
 * Store epoch ms for things that happened, "HH:mm" for things that are scheduled.
 */
(function () {
  "use strict";

  /* =====================================================================
   * STRINGS — every user-facing string lives here, so the port is a
   * copy-paste and translation later needs no hunting through markup.
   * ===================================================================== */
  var S = {
    appName: "Day Tracker",

    // Colour states
    redName: "Red — you are off",
    redShort: "Red",
    redDesc: "Stiff, frozen or slow",
    redFull:
      "Stiff or frozen. Hard to get up from a chair or from bed. Movements feel slow. Or a shaking tremor.",
    redExample:
      "Your feet feel stuck to the floor, or you need help to stand up. That is red.",

    yellowName: "Yellow — you are on",
    yellowShort: "Yellow",
    yellowDesc: "Moving and working easily",
    yellowFull:
      "You get up, walk and do all your work fairly easily. You do not need anyone's help.",
    yellowExample: "This is your good period. Most of the day should be yellow.",

    greenName: "Green — too much",
    greenShort: "Green",
    greenDesc: "Extra movements you cannot control",
    greenFull:
      "Extra movements you cannot control, getting in the way of what you are doing.",
    greenExample:
      "Your body, head or arms move on their own, so eating or sitting still is difficult.",

    // Welcome
    welcomeTitle: "Your doctor explains",
    playVideo: "Play the video",
    next: "Next",

    // Alarms step
    alarmsTitle: "The alarm rings",
    alarmsLine1: "Once every hour while you are awake, to ask you for a colour.",
    alarmsLine2: "And again at each tablet time, to remind you to take that tablet.",
    alarmsLine3: "You can also press a colour any time, without waiting for the alarm.",

    // Waking
    wakingTitle: "When are you awake?",
    wakeStart: "I wake up at",
    wakeEnd: "I go to bed at",

    // Setup
    setupTitle: "Your tablets",
    tabletNameLabel: "Tablet name — write it once",
    timesAndDose: "TIMES AND DOSE",
    doseAtThisTime: "Dose at this time",
    addTime: "+ Add another time for this tablet",
    addTablet: "+ Add a different tablet",
    remove: "Remove",
    begin: "Begin",
    saveTimings: "Save timings",
    setupFootnote: "Once saved the timings are locked in and repeat every day.",
    quickDoses: ["Half tablet", "1 tablet", "1½ tablets", "2 tablets"],

    // Log
    logQuestion: "How are you feeling right now?",
    menu: "Menu",
    selectedPrefix: "Selected ",
    confirm: "Confirm",
    changeAnswer: "Change my answer",
    saved: "Saved",
    lockLine: function (colour, mins) {
      return (
        "You logged " +
        colour +
        " just now. You can log again in " +
        mins +
        (mins === 1 ? " minute." : " minutes.")
      );
    },
    recordedAt: function (colour, time) {
      return colour + " recorded at " + time;
    },

    // Alarm overlays
    checkIn: " · check in",
    notNow: "Not now",
    tabletTime: " · tablet time",
    takeTablet: function (dose, name) {
      return "Take " + dose + " of " + name;
    },
    tabletBody: "Take it now, at this time. Keep the same timing every day.",
    haveTaken: "I have taken it",
    snooze: "Remind me in 10 minutes",
    lockedDuringAlarm:
      "You logged a colour a moment ago, so there is nothing to answer right now.",
    dismiss: "Close",

    // Menu
    menuVideo: "Watch the video again",
    menuColours: "What the colours mean",
    menuWaking: "Waking hours",
    menuProfile: "Your details",
    menuTablets: "Change tablet timings",
    menuToday: "Today's report",
    menuMonth: "All days — squares chart",
    menuScript: "Video script (for the doctor)",
    menuTestAlarm: "Test the alarm screen",
    menuEnableAlarms: "Turn on alarms",
    menuExport: "Save a backup file",
    menuImport: "Load a backup file",
    backToLogging: "Back to logging",
    backToMenu: "Back to menu",
    noProfile: "Patient details not filled in yet",

    // Profile
    profileTitle: "Your details",
    pName: "Name",
    pAge: "Age",
    pYear: "Year diagnosed",
    pDoctor: "Doctor",
    pNotes: "Anything else to note",

    // Reports
    todayTitle: "Today's report",
    hourByHour: "HOUR BY HOUR",
    tabletSchedule: "TABLET SCHEDULE",
    markTaken: "Mark taken",
    takenAt: function (t) {
      return "Taken " + t;
    },
    print: "Print / save",
    entries: " entries",
    monthTitle: "All days",
    week: "1 week",
    month: "1 month",
    off: "Off",
    normal: "Normal",
    extra: "Extra",
    notLogged: "Not logged",
    multiple: "More than one in that hour",
    tabletTaken: "Tablet taken",
    tabletNotConfirmed: "Tablet time not confirmed",
    noDataYet: "Nothing logged yet. Press a colour on the home screen to start.",

    exportDone: "Backup file saved",
    importDone: "Backup loaded",
    importBad: "That file could not be read",

    // Colour explainer (menu revisit path — one screen, not three)
    coloursTitle: "What the colours mean",

    // Chart range label
    showingDays: function (n) {
      return "Showing " + n + (n === 1 ? " day" : " days") + " with entries";
    },
    showingWindow: function (n, win) {
      return (
        "Showing " + n + (n === 1 ? " day" : " days") +
        " with entries, from the last " + win + " days"
      );
    },

    // Tablet presets
    presetsLabel: "COMMON TABLETS — TAP TO FILL",
    presetCustom: "Something else",

    // Navigation experiment
    navToggleOn: "Try the navigation bar",
    navToggleOff: "Turn off the navigation bar",
    navExperimentNote:
      "Experiment. The plain screen has fewer things to mis-tap; the bar is quicker to move around. Try both on the phone.",
    navLog: "Log",
    navChart: "Chart",
    navMeds: "Medicines",
    navMenu: "Menu",
    todayAtAGlance: "TODAY SO FAR",

    // Subtitles
    ccOn: "Subtitles on",
    ccOff: "Subtitles off"
  };

  /* Common tablets and dosing patterns (§9 of the review list). Names are the
   * ones seen most often in Indian PD practice; the patient's actual regimen
   * always overrides, so these only prefill the form. */
  var TABLET_PRESETS = [
    { name: "Syndopa 110", times: ["08:00", "12:00", "16:00", "20:00"], dose: "1 tablet", note: "4× daily" },
    { name: "Syndopa Plus (125)", times: ["08:00", "12:00", "16:00", "20:00"], dose: "1 tablet", note: "4× daily" },
    { name: "Syndopa CR (250)", times: ["22:00"], dose: "1 tablet", note: "At bedtime" },
    { name: "Ropinirole", times: ["08:00", "14:00", "20:00"], dose: "1 tablet", note: "3× daily" },
    { name: "Pramipexole", times: ["08:00", "14:00", "20:00"], dose: "1 tablet", note: "3× daily" },
    // Kept off the evening slot — amantadine late in the day tends to disturb sleep.
    { name: "Amantadine", times: ["08:00", "14:00"], dose: "1 tablet", note: "2× daily" }
  ];

  var COLOURS = ["red", "yellow", "green"];

  var COLOUR_META = {
    red: { name: S.redName, short: S.redShort, desc: S.redDesc, full: S.redFull, art: "assets/red-freezing.png" },
    yellow: { name: S.yellowName, short: S.yellowShort, desc: S.yellowDesc, full: S.yellowFull, art: "assets/yellow-standing.png" },
    green: { name: S.greenName, short: S.greenShort, desc: S.greenDesc, full: S.greenFull, art: "assets/green-dyskinesia.png" }
  };

  var LOCK_MINUTES = 15;
  var SNOOZE_MINUTES = 10;
  var ALARM_WINDOW_MINUTES = 15;
  var TICK_MS = 15000;

  /* =====================================================================
   * LAYER 1 — DOMAIN. Pure functions. These transfer to Kotlin as-is.
   * ===================================================================== */

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  /** "HH:mm" -> minutes since midnight. */
  function hhmmToMinutes(hhmm) {
    var parts = String(hhmm || "00:00").split(":");
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  /** minutes since midnight -> "HH:mm" */
  function minutesToHhmm(mins) {
    return pad2(Math.floor(mins / 60) % 24) + ":" + pad2(mins % 60);
  }

  /** Local day key for an epoch ms, e.g. "2026-08-15". Never UTC. */
  function dayKey(ts) {
    var d = new Date(ts);
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  /** "7am", "12pm", "5pm" — the chart's column headings. */
  function hourLabel(h) {
    if (h === 0) return "12am";
    if (h === 12) return "12pm";
    return (h > 12 ? h - 12 : h) + (h >= 12 ? "pm" : "am");
  }

  /** "8:04 AM" from epoch ms. */
  function clockLabel(ts) {
    var d = new Date(ts);
    var h = d.getHours();
    var ampm = h >= 12 ? "PM" : "AM";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + pad2(d.getMinutes()) + " " + ampm;
  }

  /** "8:00 AM" from "HH:mm". */
  function scheduleLabel(hhmm) {
    var m = hhmmToMinutes(hhmm);
    var h = Math.floor(m / 60);
    var ampm = h >= 12 ? "PM" : "AM";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + pad2(m % 60) + " " + ampm;
  }

  /** The inclusive list of waking hours, e.g. 7..22. */
  function wakingHours(waking) {
    var start = Math.floor(hhmmToMinutes(waking.start) / 60);
    var end = Math.floor(hhmmToMinutes(waking.end) / 60);
    if (end < start) end = 23;
    var out = [];
    for (var h = start; h <= end; h++) out.push(h);
    return out;
  }

  /** Flatten tablets into one row per scheduled dose, sorted by time. */
  function flattenDoses(tablets) {
    var out = [];
    (tablets || []).forEach(function (t) {
      (t.doses || []).forEach(function (d) {
        out.push({ name: t.name || "", time: d.time, dose: d.dose || "" });
      });
    });
    out.sort(function (a, b) {
      return hhmmToMinutes(a.time) - hhmmToMinutes(b.time);
    });
    return out;
  }

  /** Minutes remaining on the lock, counted from the LIVE clock (§8/§11). */
  function lockMinutesLeft(lockUntil, now) {
    if (!lockUntil || now >= lockUntil) return 0;
    return Math.ceil((lockUntil - now) / 60000);
  }

  function isLocked(lockUntil, now) {
    return !!lockUntil && now < lockUntil;
  }

  /**
   * Build the chart model: one row per day that has any entry, columns for
   * waking hours. An hour holding more than one distinct colour is a split and
   * must never be overwritten by a later single colour (§9).
   */
  function buildChart(data, hours, windowDays, now) {
    var cutoff = now - (windowDays - 1) * 86400000;
    var cutoffKey = dayKey(cutoff);
    var todayKey = dayKey(now);

    var byDay = {};
    (data.entries || []).forEach(function (e) {
      var k = dayKey(e.ts);
      if (k < cutoffKey) return;
      if (!byDay[k]) byDay[k] = { key: k, ts: e.ts, hours: {} };
      if (e.ts < byDay[k].ts) byDay[k].ts = e.ts;
      var h = new Date(e.ts).getHours();
      if (!byDay[k].hours[h]) byDay[k].hours[h] = {};
      byDay[k].hours[h][e.color] = true;
    });

    // Today always shows, even with nothing logged yet.
    if (!byDay[todayKey]) byDay[todayKey] = { key: todayKey, ts: now, hours: {} };

    var days = Object.keys(byDay).sort();
    return days.map(function (k) {
      var day = byDay[k];
      var cells = hours.map(function (h) {
        var present = COLOURS.filter(function (c) {
          return day.hours[h] && day.hours[h][c];
        });
        return { hour: h, colours: present };
      });
      return { key: k, ts: day.ts, cells: cells };
    });
  }

  /** Doses to draw on a chart row: solid where taken, dashed where a past slot was missed. */
  function doseMarkersForDay(data, dayK, hours, now) {
    var markers = [];
    var firstHour = hours[0];
    var lastHour = hours[hours.length - 1];

    (data.takes || []).forEach(function (tk) {
      if (dayKey(tk.ts) !== dayK) return;
      var d = new Date(tk.ts);
      var h = d.getHours();
      if (h < firstHour || h > lastHour) return;
      markers.push({
        taken: true,
        hour: h,
        minute: d.getMinutes(),
        title: tk.name + " " + tk.dose + " — taken " + clockLabel(tk.ts)
      });
    });

    // A dashed line only for a scheduled time that has already passed unconfirmed.
    // Drawing one for a dose still to come today would be misleading (§9).
    var isToday = dayK === dayKey(now);
    var nowMinutes = new Date(now).getHours() * 60 + new Date(now).getMinutes();

    flattenDoses(data.tablets).forEach(function (d) {
      var mins = hhmmToMinutes(d.time);
      if (isToday && mins > nowMinutes) return;
      var confirmed = (data.takes || []).some(function (tk) {
        return dayKey(tk.ts) === dayK && tk.time === d.time && tk.name === d.name;
      });
      if (confirmed) return;
      var h = Math.floor(mins / 60);
      if (h < firstHour || h > lastHour) return;
      markers.push({
        taken: false,
        hour: h,
        minute: mins % 60,
        title: d.name + " " + d.dose + " — scheduled " + scheduleLabel(d.time) + ", not confirmed"
      });
    });

    return markers;
  }

  /** Share of each state across the visible days. Rounded independently (§11.6). */
  function statePercentages(data, dayKeys) {
    var set = {};
    dayKeys.forEach(function (k) {
      set[k] = true;
    });
    var counts = { red: 0, yellow: 0, green: 0 };
    var total = 0;
    (data.entries || []).forEach(function (e) {
      if (!set[dayKey(e.ts)]) return;
      if (counts[e.color] === undefined) return;
      counts[e.color]++;
      total++;
    });
    return {
      counts: counts,
      total: total,
      pct: {
        red: total ? Math.round((counts.red / total) * 100) : 0,
        yellow: total ? Math.round((counts.yellow / total) * 100) : 0,
        green: total ? Math.round((counts.green / total) * 100) : 0
      }
    };
  }

  /**
   * Which alarm, if any, is due now. Returns null or a payload.
   * Deduplicated through the `fired` map so reopening the app does not re-ring.
   */
  function dueAlarm(data, now) {
    var d = new Date(now);
    var hour = d.getHours();
    var minute = d.getMinutes();
    var dk = dayKey(now);

    // Tablet alarms take priority over the hourly check-in.
    var doses = flattenDoses(data.tablets);
    for (var i = 0; i < doses.length; i++) {
      var dose = doses[i];
      var target = hhmmToMinutes(dose.time);
      var nowMins = hour * 60 + minute;
      var delta = nowMins - target;
      if (delta >= 0 && delta < ALARM_WINDOW_MINUTES) {
        var tkey = "t" + dk + dose.time + dose.name;
        if (!data.fired[tkey]) {
          return { kind: "tablet", key: tkey, name: dose.name, dose: dose.dose, time: dose.time };
        }
      }
    }

    // Hourly check-in: first 15 minutes of the hour, inside waking hours only.
    var hours = wakingHours(data.waking);
    if (hours.indexOf(hour) !== -1 && minute < ALARM_WINDOW_MINUTES) {
      var hkey = "h" + dk + hour;
      if (!data.fired[hkey]) {
        return { kind: "hourly", key: hkey, hour: hour };
      }
    }

    return null;
  }

  /** Drop fired-slots from previous days so the map cannot grow without bound. */
  function pruneFired(fired, now) {
    var dk = dayKey(now);
    var out = {};
    Object.keys(fired || {}).forEach(function (k) {
      if (k.indexOf(dk) === 1) out[k] = true; // "h2026-08-15..." / "t2026-08-15..."
    });
    return out;
  }

  /* =====================================================================
   * LAYER 2 — PERSISTENCE. One JSON document; this shape is the contract.
   * ===================================================================== */

  var STORAGE_KEY = "pd-monitor-v1";

  function emptyData() {
    return {
      tablets: [],
      entries: [],
      takes: [],
      profile: { name: "", age: "", year: "", doctor: "", notes: "" },
      waking: { start: "07:00", end: "22:00" },
      lockUntil: 0,
      fired: {},
      // Additive to the §6 contract. The Android side may ignore it; it is a
      // presentation preference, never clinical data.
      // captions default OFF until captions-en.vtt is synced to the real audio —
      // subtitles that do not match the spoken words are worse than none.
      settings: { navMode: false, captions: false }
    };
  }

  function migrate(raw) {
    var d = raw && typeof raw === "object" ? raw : {};
    var base = emptyData();

    // Legacy flat tablet rows {name, dose, time} -> grouped {name, doses[]}
    var tablets = [];
    if (Array.isArray(d.tablets)) {
      var grouped = {};
      var order = [];
      d.tablets.forEach(function (t) {
        if (!t) return;
        if (Array.isArray(t.doses)) {
          tablets.push({ name: t.name || "", doses: t.doses.slice() });
        } else if (t.time) {
          var n = t.name || "";
          if (!grouped[n]) {
            grouped[n] = { name: n, doses: [] };
            order.push(n);
          }
          grouped[n].doses.push({ time: t.time, dose: t.dose || "" });
        }
      });
      order.forEach(function (n) {
        tablets.push(grouped[n]);
      });
    }

    base.tablets = tablets;
    base.entries = Array.isArray(d.entries) ? d.entries.filter(function (e) {
      return e && COLOURS.indexOf(e.color) !== -1 && typeof e.ts === "number";
    }) : [];
    base.takes = Array.isArray(d.takes) ? d.takes.filter(function (t) {
      return t && typeof t.ts === "number";
    }) : [];
    if (d.profile) {
      Object.keys(base.profile).forEach(function (k) {
        if (typeof d.profile[k] === "string") base.profile[k] = d.profile[k];
      });
    }
    if (d.waking && d.waking.start && d.waking.end) base.waking = { start: d.waking.start, end: d.waking.end };
    base.lockUntil = typeof d.lockUntil === "number" ? d.lockUntil : 0;
    base.fired = pruneFired(d.fired, Date.now());
    if (d.settings) {
      if (typeof d.settings.navMode === "boolean") base.settings.navMode = d.settings.navMode;
      if (typeof d.settings.captions === "boolean") base.settings.captions = d.settings.captions;
    }
    return base;
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyData();
      return migrate(JSON.parse(raw));
    } catch (err) {
      // Corrupt JSON or blocked storage — start clean rather than crash.
      return emptyData();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      // Private mode and quota-full both throw (§11.8). Losing a write is
      // better than losing the screen; the in-memory state stays correct.
    }
  }

  /* =====================================================================
   * LAYER 3 — VIEW
   * ===================================================================== */

  var data = load();
  var view = data.tablets.length ? "log" : "welcome";
  var fromMenu = false;
  var selected = null; // colour picked but not yet confirmed
  var alarm = null; // active alarm payload
  var alarmSelected = null;
  var toast = null;
  var toastTimer = null;
  var chartRange = 7;
  var draft = null; // in-progress setup edits

  var app = document.getElementById("app");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function go(v) {
    view = v;
    selected = null;
    render();
  }

  function showToast(msg) {
    toast = msg;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast = null;
      render();
    }, 6000);
  }

  /* ---------- Feedback: chime + vibration ---------- */
  function chime() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      [587.33, 587.33, 784].forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = "sine";
        var t0 = ctx.currentTime + i * 0.42;
        gain.gain.setValueAtTime(0.35, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.42);
      });
    } catch (err) {
      /* audio unavailable — the visual alarm still shows */
    }
  }

  function buzz() {
    try {
      if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 600]);
    } catch (err) {
      /* ignore */
    }
  }

  function notify(title, body) {
    try {
      if (window.Notification && Notification.permission === "granted") {
        new Notification(title, { body: body, icon: "assets/icon-192.png" });
      }
    } catch (err) {
      /* ignore */
    }
  }

  /* ---------- Writes ---------- */
  function logColour(colour) {
    var now = Date.now();
    data.entries.push({ color: colour, ts: now });
    data.lockUntil = now + LOCK_MINUTES * 60000;
    save();
    showToast(S.recordedAt(COLOUR_META[colour].short, clockLabel(now)));
  }

  function recordTake(name, dose, time) {
    data.takes.push({ name: name, dose: dose, time: time || null, ts: Date.now() });
    save();
  }

  /* ---------- Screen builders ---------- */

  function screenWelcome() {
    return (
      '<div class="pop">' +
      "<h1>" + S.welcomeTitle + "</h1>" +
      '<div class="video-wrap">' +
      '<video id="intro" controls playsinline preload="auto" crossorigin="anonymous" src="assets/doctor-intro.mp4?v=3">' +
      '<track kind="subtitles" srclang="en" label="English" src="assets/captions-en.vtt?v=3"' +
      (data.settings.captions ? " default" : "") +
      " />" +
      "</video>" +
      "</div>" +
      '<div class="stack">' +
      '<button class="btn-secondary" data-act="play-video" style="min-height:60px">' + S.playVideo + "</button>" +
      '<button class="btn-primary" data-act="go" data-view="stepRed">' + S.next + "</button>" +
      "</div></div>"
    );
  }

  function screenStep(colour, nextView) {
    var m = COLOUR_META[colour];
    var backLabel = fromMenu && colour === "green" ? S.backToMenu : S.next;
    var nextAttr = fromMenu && colour === "green" ? "menu" : nextView;
    return (
      '<div class="step pop">' +
      '<div class="panel panel-' + colour + '">' +
      '<img class="step-art" src="' + m.art + '" alt="" />' +
      "<h2>" + esc(m.name) + "</h2>" +
      '<p class="definition">' + esc(m.full) + "</p>" +
      '<p class="example">' + esc(exampleFor(colour)) + "</p>" +
      "</div>" +
      '<div style="margin-top:18px">' +
      '<button class="btn-primary" data-act="go" data-view="' + nextAttr + '">' + backLabel + "</button>" +
      "</div></div>"
    );
  }

  /* Revisiting from the menu: all three colours on one scrollable screen.
   * Onboarding keeps one-idea-per-screen (§2.7) — a newly-diagnosed patient
   * meeting the states for the first time is a different job from a patient
   * checking "which one was green again?". */
  function screenColours() {
    return (
      '<div class="pop">' +
      "<h1>" + S.coloursTitle + "</h1>" +
      COLOURS.map(function (c) {
        var m = COLOUR_META[c];
        return (
          '<div class="panel panel-' + c + '" style="margin-bottom:14px;padding:20px">' +
          '<div style="display:flex;align-items:center;gap:16px">' +
          '<img src="' + m.art + '" alt="" style="width:88px;height:88px;border-radius:24px;object-fit:contain;background:rgba(255,255,255,0.5);flex:none" />' +
          '<h2 style="font-size:28px;margin:0">' + esc(m.name) + "</h2>" +
          "</div>" +
          '<p style="font-size:18px;margin:14px 0 6px">' + esc(m.full) + "</p>" +
          '<p style="font-size:17px;font-style:italic;margin:0;opacity:0.85">' + esc(exampleFor(c)) + "</p>" +
          "</div>"
        );
      }).join("") +
      '<button class="btn-primary" data-act="go" data-view="menu">' + S.backToMenu + "</button>" +
      "</div>"
    );
  }

  function exampleFor(colour) {
    return colour === "red" ? S.redExample : colour === "yellow" ? S.yellowExample : S.greenExample;
  }

  function screenStepAlarms() {
    return (
      '<div class="step pop">' +
      '<div class="panel panel-accent">' +
      '<h2 style="font-size:38px">' + S.alarmsTitle + "</h2>" +
      '<p class="definition">' + S.alarmsLine1 + "</p>" +
      '<p class="definition">' + S.alarmsLine2 + "</p>" +
      '<p class="example">' + S.alarmsLine3 + "</p>" +
      "</div>" +
      '<div style="margin-top:18px">' +
      '<button class="btn-primary" data-act="go" data-view="waking">' + S.next + "</button>" +
      "</div></div>"
    );
  }

  function screenWaking() {
    return (
      '<div class="step pop">' +
      "<h1>" + S.wakingTitle + "</h1>" +
      '<div class="card">' +
      '<div class="field"><label for="ws">' + S.wakeStart + '</label>' +
      '<input type="time" id="ws" data-field="wakeStart" value="' + esc(data.waking.start) + '" /></div>' +
      '<div class="field"><label for="we">' + S.wakeEnd + '</label>' +
      '<input type="time" id="we" data-field="wakeEnd" value="' + esc(data.waking.end) + '" /></div>' +
      "</div>" +
      '<div style="margin-top:18px">' +
      '<button class="btn-primary" data-act="go" data-view="' + (fromMenu ? "menu" : "setup") + '">' +
      (fromMenu ? S.backToMenu : S.next) +
      "</button>" +
      "</div></div>"
    );
  }

  function screenSetup() {
    if (!draft) {
      draft = data.tablets.length
        ? JSON.parse(JSON.stringify(data.tablets))
        : [{ name: "", doses: [{ time: "08:00", dose: "1 tablet" }] }];
    }

    var cards = draft
      .map(function (t, ti) {
        var heading = t.name && t.name.trim() ? esc(t.name) : "Tablet " + (ti + 1);
        var doses = t.doses
          .map(function (d, di) {
            var quick = S.quickDoses
              .map(function (q) {
                return (
                  '<button data-act="quick-dose" data-t="' + ti + '" data-d="' + di + '" data-val="' +
                  esc(q) + '">' + esc(q) + "</button>"
                );
              })
              .join("");
            return (
              '<div class="subcard" style="margin-top:10px">' +
              '<div class="row-between">' +
              '<input type="time" data-field="dose-time" data-t="' + ti + '" data-d="' + di +
              '" value="' + esc(d.time) + '" style="flex:1" />' +
              (t.doses.length > 1
                ? '<button class="btn-ghost" data-act="remove-dose" data-t="' + ti + '" data-d="' + di + '">' + S.remove + "</button>"
                : "") +
              "</div>" +
              '<div class="field"><label>' + S.doseAtThisTime + "</label>" +
              '<input type="text" data-field="dose-text" data-t="' + ti + '" data-d="' + di +
              '" value="' + esc(d.dose) + '" placeholder="1 tablet" /></div>' +
              '<div class="quick-doses">' + quick + "</div>" +
              "</div>"
            );
          })
          .join("");

        return (
          '<div class="card" style="margin-bottom:14px">' +
          '<div class="row-between"><h2 style="font-size:26px;margin:0">' + heading + "</h2>" +
          (draft.length > 1
            ? '<button class="btn-ghost" data-act="remove-tablet" data-t="' + ti + '">' + S.remove + "</button>"
            : "") +
          "</div>" +
          '<div class="field" style="margin-top:12px"><label>' + S.tabletNameLabel + "</label>" +
          '<input type="text" data-field="tablet-name" data-t="' + ti + '" value="' + esc(t.name) +
          '" placeholder="Syndopa" /></div>' +
          '<div class="section-label">' + S.timesAndDose + "</div>" +
          doses +
          '<button class="btn-secondary" data-act="add-dose" data-t="' + ti +
          '" style="margin-top:12px;min-height:56px">' + S.addTime + "</button>" +
          "</div>"
        );
      })
      .join("");

    // One tap fills a whole tablet — name, times and dose. The patient's real
    // regimen always overrides; this only saves typing on the common cases.
    var presets =
      '<div class="section-label">' + S.presetsLabel + "</div>" +
      '<div class="quick-doses" style="grid-template-columns:repeat(2,1fr);margin-bottom:16px">' +
      TABLET_PRESETS.map(function (p, i) {
        return (
          '<button data-act="preset" data-i="' + i + '" style="min-height:56px;text-align:left;padding:10px 14px">' +
          "<strong>" + esc(p.name) + "</strong><br />" +
          '<span style="font-size:14px;opacity:0.75">' + esc(p.note) + "</span>" +
          "</button>"
        );
      }).join("") +
      "</div>";

    return (
      '<div class="pop">' +
      "<h1>" + S.setupTitle + "</h1>" +
      presets +
      cards +
      '<button class="btn-secondary" data-act="add-tablet" style="min-height:58px">' + S.addTablet + "</button>" +
      '<div style="margin-top:14px">' +
      '<button class="btn-primary" data-act="save-setup">' + (fromMenu ? S.saveTimings : S.begin) + "</button>" +
      '<p class="muted center" style="margin-top:12px;font-size:16px">' + S.setupFootnote + "</p>" +
      "</div></div>"
    );
  }

  function colourButton(colour, act) {
    var m = COLOUR_META[colour];
    return (
      '<button class="colour-btn ' + colour + '" data-act="' + act + '" data-colour="' + colour + '">' +
      '<img src="' + m.art + '" alt="" />' +
      "<span><span class=\"name\">" + esc(m.short) + '</span><span class="desc">' + esc(m.desc) + "</span></span>" +
      "</button>"
    );
  }

  /* Compact strip of today's hours so far — the "home heat table" from the
   * review list. Only rendered in nav mode; §2.8 keeps history off the home
   * screen otherwise. */
  function todayStrip() {
    var dk = dayKey(Date.now());
    var hours = wakingHours(data.waking);
    var byHour = {};
    data.entries.forEach(function (e) {
      if (dayKey(e.ts) !== dk) return;
      var h = new Date(e.ts).getHours();
      if (!byHour[h]) byHour[h] = {};
      byHour[h][e.color] = true;
    });
    return (
      '<div class="today-strip">' +
      '<div class="section-label" style="margin:0 0 6px">' + S.todayAtAGlance + "</div>" +
      '<div class="today-strip-cells">' +
      hours
        .map(function (h) {
          var present = COLOURS.filter(function (c) {
            return byHour[h] && byHour[h][c];
          });
          return '<div class="mini-cell" style="' + cellStyle(present) + '" title="' + hourLabel(h) + '"></div>';
        })
        .join("") +
      "</div></div>"
    );
  }

  function navBar() {
    if (!data.settings.navMode) return "";
    var item = function (act, viewName, label) {
      var on = view === viewName;
      return (
        '<button class="nav-item' + (on ? " on" : "") + '" data-act="' + act +
        '" data-view="' + viewName + '" aria-current="' + on + '">' + label + "</button>"
      );
    };
    return (
      '<nav class="nav-bar">' +
      item("go", "log", S.navLog) +
      item("go", "month", S.navChart) +
      item("go", "today", S.navMeds) +
      item("open-menu", "menu", S.navMenu) +
      "</nav>"
    );
  }

  function screenLog() {
    var now = Date.now();
    var body;

    if (isLocked(data.lockUntil, now)) {
      var last = data.entries[data.entries.length - 1];
      var colour = last ? COLOUR_META[last.color].short.toLowerCase() : "a colour";
      body =
        '<div class="panel panel-' + (last ? last.color : "accent") + ' selected-panel pop" style="flex:1 1 auto;display:flex;flex-direction:column;justify-content:center">' +
        "<h2>" + S.saved + "</h2>" +
        '<p style="font-size:20px">' + esc(S.lockLine(colour, lockMinutesLeft(data.lockUntil, now))) + "</p>" +
        "</div>";
    } else if (selected) {
      var m = COLOUR_META[selected];
      body =
        '<div class="panel panel-' + selected + ' selected-panel pop" style="flex:1 1 auto;display:flex;flex-direction:column;justify-content:center">' +
        "<h2>" + S.selectedPrefix + esc(m.short.toLowerCase()) + "</h2>" +
        '<p style="font-size:19px">' + esc(m.full) + "</p>" +
        '<button class="btn-primary" data-act="confirm" style="min-height:70px;margin-top:10px">' + S.confirm + "</button>" +
        '<button class="btn-secondary" data-act="unselect" style="min-height:56px;margin-top:10px">' + S.changeAnswer + "</button>" +
        "</div>";
    } else {
      body =
        '<div class="colour-buttons">' +
        COLOURS.map(function (c) {
          return colourButton(c, "select");
        }).join("") +
        "</div>";
    }

    var nav = data.settings.navMode;
    return (
      '<div class="log-screen' + (nav ? " with-nav" : "") + '">' +
      (nav ? todayStrip() : "") +
      "<h1>" + S.logQuestion + "</h1>" +
      body +
      // In nav mode the bar carries the menu, so the big button is redundant.
      (nav
        ? ""
        : '<button class="btn-secondary" data-act="open-menu" style="min-height:62px;flex:none">' + S.menu + "</button>") +
      "</div>"
    );
  }

  function screenMenu() {
    var sub = data.profile.name ? esc(data.profile.name) : S.noProfile;
    var canEnable = window.Notification && Notification.permission === "default";
    return (
      '<div class="pop">' +
      "<h1>" + S.menu + "</h1>" +
      '<p class="muted">' + sub + "</p>" +
      '<button class="btn-menu" data-act="go" data-view="welcome">' + S.menuVideo + "</button>" +
      '<button class="btn-menu" data-act="go" data-view="colours">' + S.menuColours + "</button>" +
      '<button class="btn-menu" data-act="go" data-view="waking">' + S.menuWaking + "</button>" +
      '<button class="btn-menu" data-act="go" data-view="profile">' + S.menuProfile + "</button>" +
      '<button class="btn-menu" data-act="go" data-view="setup">' + S.menuTablets + "</button>" +
      '<button class="btn-menu" data-act="go" data-view="today">' + S.menuToday + "</button>" +
      '<button class="btn-menu" data-act="go" data-view="month">' + S.menuMonth + "</button>" +
      '<button class="btn-menu" data-act="go" data-view="script">' + S.menuScript + "</button>" +
      '<button class="btn-menu" data-act="test-alarm">' + S.menuTestAlarm + "</button>" +
      (canEnable ? '<button class="btn-menu" data-act="enable-alarms">' + S.menuEnableAlarms + "</button>" : "") +
      '<button class="btn-menu" data-act="export">' + S.menuExport + "</button>" +
      '<button class="btn-menu" data-act="import">' + S.menuImport + "</button>" +
      '<button class="btn-menu" data-act="toggle-nav">' +
      (data.settings.navMode ? S.navToggleOff : S.navToggleOn) + "</button>" +
      '<p class="muted" style="font-size:15px;margin:2px 4px 10px">' + S.navExperimentNote + "</p>" +
      '<button class="btn-primary" data-act="leave-menu" style="min-height:68px;margin-top:8px">' + S.backToLogging + "</button>" +
      "</div>"
    );
  }

  function screenProfile() {
    var p = data.profile;
    function f(label, key, type) {
      return (
        '<div class="field"><label>' + label + "</label>" +
        '<input type="' + (type || "text") + '" data-field="profile" data-key="' + key +
        '" value="' + esc(p[key]) + '" /></div>'
      );
    }
    return (
      '<div class="pop">' +
      "<h1>" + S.profileTitle + "</h1>" +
      '<div class="card">' +
      f(S.pName, "name") +
      f(S.pAge, "age") +
      f(S.pYear, "year") +
      f(S.pDoctor, "doctor") +
      '<div class="field"><label>' + S.pNotes + "</label>" +
      '<textarea data-field="profile" data-key="notes">' + esc(p.notes) + "</textarea></div>" +
      "</div>" +
      '<div style="margin-top:14px"><button class="btn-primary" data-act="go" data-view="menu">' + S.backToMenu + "</button></div>" +
      "</div>"
    );
  }

  function screenToday() {
    var now = Date.now();
    var dk = dayKey(now);
    var hours = wakingHours(data.waking);
    var todays = data.entries.filter(function (e) {
      return dayKey(e.ts) === dk;
    });

    var counts = { red: 0, yellow: 0, green: 0 };
    todays.forEach(function (e) {
      counts[e.color]++;
    });

    var d = new Date(now);
    var header =
      d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) +
      " · " + todays.length + S.entries +
      (data.profile.name ? " · " + esc(data.profile.name) : "");

    var byHour = {};
    todays.forEach(function (e) {
      var h = new Date(e.ts).getHours();
      if (!byHour[h]) byHour[h] = {};
      byHour[h][e.color] = true;
    });

    var strip = hours
      .map(function (h) {
        var present = COLOURS.filter(function (c) {
          return byHour[h] && byHour[h][c];
        });
        return (
          "<div><div class=\"hour-cell\" style=\"" + cellStyle(present) + '"></div>' +
          '<div class="hour-label">' + hourLabel(h) + "</div></div>"
        );
      })
      .join("");

    var schedule = flattenDoses(data.tablets)
      .map(function (dose) {
        var take = data.takes.filter(function (tk) {
          return dayKey(tk.ts) === dk && tk.time === dose.time && tk.name === dose.name;
        })[0];
        var right = take
          ? '<span class="muted">' + S.takenAt(clockLabel(take.ts)) + "</span>"
          : '<button data-act="mark-taken" data-name="' + esc(dose.name) + '" data-dose="' + esc(dose.dose) +
            '" data-time="' + esc(dose.time) + '">' + S.markTaken + "</button>";
        return (
          '<div class="subcard row-between" style="margin-top:10px">' +
          "<span><strong>" + scheduleLabel(dose.time) + "</strong><br />" +
          '<span style="font-size:17px">' + esc(dose.name) + " · " + esc(dose.dose) + "</span></span>" +
          right +
          "</div>"
        );
      })
      .join("");

    return (
      '<div class="pop">' +
      "<h1>" + S.todayTitle + "</h1>" +
      '<p class="muted">' + header + "</p>" +
      '<div class="tiles">' +
      '<div class="tile red"><span class="big">' + counts.red + '</span><span class="label">' + S.off + "</span></div>" +
      '<div class="tile yellow"><span class="big">' + counts.yellow + '</span><span class="label">' + S.normal + "</span></div>" +
      '<div class="tile green"><span class="big">' + counts.green + '</span><span class="label">' + S.extra + "</span></div>" +
      "</div>" +
      '<div class="section-label">' + S.hourByHour + "</div>" +
      '<div class="hour-strip">' + strip + "</div>" +
      (schedule ? '<div class="section-label">' + S.tabletSchedule + "</div>" + schedule : "") +
      '<div class="stack" style="margin-top:18px">' +
      '<button class="btn-secondary" data-act="print">' + S.print + "</button>" +
      '<button class="btn-primary" data-act="go" data-view="menu">' + S.backToMenu + "</button>" +
      "</div></div>"
    );
  }

  /** Solid fill, or a diagonal split when an hour holds more than one colour (§9). */
  function cellStyle(colours) {
    if (!colours.length) return "";
    var vars = { red: "var(--red-fill)", yellow: "var(--yellow-fill)", green: "var(--green-fill)" };
    if (colours.length === 1) {
      return "background:" + vars[colours[0]] + ";border-color:" + vars[colours[0]] + ";";
    }
    var step = 100 / colours.length;
    var stops = colours
      .map(function (c, i) {
        return vars[c] + " " + i * step + "% " + (i + 1) * step + "%";
      })
      .join(", ");
    return "background:linear-gradient(135deg, " + stops + ");border-color:var(--color-neutral-500);";
  }

  function screenMonth() {
    var now = Date.now();
    var hours = wakingHours(data.waking);
    var rows = buildChart(data, hours, chartRange, now);
    var cols = "70px repeat(" + hours.length + ", 1fr)";

    var head =
      '<div class="chart-grid" style="grid-template-columns:' + cols + '">' +
      "<div></div>" +
      hours
        .map(function (h) {
          return '<div class="chart-head">' + hourLabel(h) + "</div>";
        })
        .join("") +
      "</div>";

    var body = rows
      .map(function (row) {
        var d = new Date(row.ts);
        var label =
          chartRange <= 7
            ? d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })
            : d.getDate() + " " + d.toLocaleDateString(undefined, { month: "short" });

        var cells = row.cells
          .map(function (c) {
            var title = c.colours.length
              ? hourLabel(c.hour) + " — " + c.colours.join(" + ")
              : hourLabel(c.hour) + " — " + S.notLogged;
            return '<div class="chart-cell" style="' + cellStyle(c.colours) + '" title="' + esc(title) + '"></div>';
          })
          .join("");

        // Dose lines ride on a second grid with the SAME column template, each
        // marker placed inside its own hour column (§9) — never a percentage
        // across the whole row, which drifts by ~10% over 17 gapped columns.
        var markers = doseMarkersForDay(data, row.key, hours, now)
          .map(function (mk) {
            var col = hours.indexOf(mk.hour);
            if (col === -1) return "";
            return (
              '<div class="dose-row" style="grid-column:' + (col + 2) + '">' +
              '<div class="dose-line' + (mk.taken ? "" : " missed") + '" style="left:' +
              ((mk.minute / 60) * 100).toFixed(2) + '%" title="' + esc(mk.title) + '"></div>' +
              "</div>"
            );
          })
          .join("");

        return (
          '<div style="position:relative">' +
          '<div class="chart-grid" style="grid-template-columns:' + cols + '">' +
          '<div class="chart-rowlabel">' + esc(label) + "</div>" + cells +
          "</div>" +
          '<div class="dose-layer" style="grid-template-columns:' + cols + '">' + markers + "</div>" +
          "</div>"
        );
      })
      .join("");

    var stats = statePercentages(
      data,
      rows.map(function (r) {
        return r.key;
      })
    );

    var legend =
      '<div class="legend">' +
      '<span class="legend-item"><span class="swatch red"></span>' + S.off + "</span>" +
      '<span class="legend-item"><span class="swatch yellow"></span>' + S.normal + "</span>" +
      '<span class="legend-item"><span class="swatch green"></span>' + S.extra + "</span>" +
      '<span class="legend-item"><span class="swatch unlogged"></span>' + S.notLogged + "</span>" +
      '<span class="legend-item"><span class="swatch split"></span>' + S.multiple + "</span>" +
      '<span class="legend-item"><span class="swatch line" style="height:18px"></span>' + S.tabletTaken + "</span>" +
      '<span class="legend-item"><span class="swatch dashed" style="height:18px"></span>' + S.tabletNotConfirmed + "</span>" +
      "</div>";

    return (
      '<div class="pop">' +
      "<h1>" + S.monthTitle + "</h1>" +
      '<div class="toggle">' +
      '<button data-act="range" data-days="7" aria-pressed="' + (chartRange === 7) + '">' + S.week + "</button>" +
      '<button data-act="range" data-days="30" aria-pressed="' + (chartRange === 30) + '">' + S.month + "</button>" +
      "</div>" +
      // Days with nothing logged are skipped (§9), so with sparse data both
      // ranges can render the same rows. Say the window out loud, or the
      // toggle reads as broken.
      '<p class="muted" style="font-size:15px;margin:-4px 0 12px">' +
      esc(S.showingWindow(rows.length, chartRange)) + "</p>" +
      '<div class="tiles">' +
      '<div class="tile red"><span class="big">' + stats.pct.red + '%</span><span class="label">' + S.off + "</span></div>" +
      '<div class="tile yellow"><span class="big">' + stats.pct.yellow + '%</span><span class="label">' + S.normal + "</span></div>" +
      '<div class="tile green"><span class="big">' + stats.pct.green + '%</span><span class="label">' + S.extra + "</span></div>" +
      "</div>" +
      (stats.total === 0 ? '<p class="muted">' + S.noDataYet + "</p>" : "") +
      '<div class="chart-scroll"><div class="chart">' + head + body + "</div>" + legend + "</div>" +
      '<div class="stack" style="margin-top:18px">' +
      '<button class="btn-secondary" data-act="print">' + S.print + "</button>" +
      '<button class="btn-primary" data-act="go" data-view="menu">' + S.backToMenu + "</button>" +
      "</div></div>"
    );
  }

  var SCRIPT_SECTIONS = [
    ["Opening · 15s", "This app helps me see how your Parkinson's medicine is working through the day. It takes a few seconds each time."],
    ["What it asks · 20s", "Every hour while you are awake, it will ask you one question: how are you feeling right now? You answer with one of three colours."],
    ["Red · 30s", S.redFull + " " + S.redExample],
    ["Yellow · 20s", S.yellowFull + " " + S.yellowExample],
    ["Green · 25s", S.greenFull + " " + S.greenExample],
    ["Tablets and alarms · 20s", "The app will also remind you at each tablet time. Press 'I have taken it' after you take the tablet, so I know the timing."],
    ["Close · 10s", "Bring the phone to your next visit. I will look at the chart and adjust your medicine."]
  ];

  function screenScript() {
    return (
      '<div class="pop">' +
      "<h1>Video script</h1>" +
      '<p class="muted">Roughly 1:50 in total.</p>' +
      '<div class="card">' +
      SCRIPT_SECTIONS.map(function (s) {
        return '<div class="script-section"><div class="script-time">' + s[0] + "</div><p>" + esc(s[1]) + "</p></div>";
      }).join("") +
      "</div>" +
      '<div style="margin-top:14px"><button class="btn-primary" data-act="go" data-view="menu">' + S.backToMenu + "</button></div>" +
      "</div>"
    );
  }

  /* ---------- Alarm overlays ---------- */

  function overlayHtml() {
    if (!alarm) return "";
    var now = Date.now();

    if (alarm.kind === "tablet") {
      return (
        '<div class="overlay tablet pop">' +
        '<div class="kicker">' + scheduleLabel(alarm.time) + S.tabletTime + "</div>" +
        "<h1>" + esc(S.takeTablet(alarm.dose || "your tablet", alarm.name)) + "</h1>" +
        '<p class="center" style="font-size:19px">' + S.tabletBody + "</p>" +
        '<div class="stack" style="margin-top:8px">' +
        '<button class="btn-primary" data-act="took-tablet" style="min-height:78px">' + S.haveTaken + "</button>" +
        '<button class="btn-secondary" data-act="snooze">' + S.snooze + "</button>" +
        "</div></div>"
      );
    }

    // Hourly check-in. If a lock is running there is nothing to answer — say so
    // rather than showing dead buttons (§8).
    var inner;
    if (isLocked(data.lockUntil, now)) {
      inner =
        '<p class="center" style="font-size:20px">' + S.lockedDuringAlarm + "</p>" +
        '<button class="btn-primary" data-act="dismiss-alarm">' + S.dismiss + "</button>";
    } else if (alarmSelected) {
      var m = COLOUR_META[alarmSelected];
      inner =
        '<div class="panel panel-' + alarmSelected + ' selected-panel">' +
        "<h2>" + S.selectedPrefix + esc(m.short.toLowerCase()) + "</h2>" +
        '<p style="font-size:19px">' + esc(m.full) + "</p>" +
        '<button class="btn-primary" data-act="confirm-alarm" style="min-height:70px;margin-top:10px">' + S.confirm + "</button>" +
        '<button class="btn-secondary" data-act="unselect-alarm" style="margin-top:10px">' + S.changeAnswer + "</button>" +
        "</div>";
    } else {
      inner =
        '<div class="pic-buttons">' +
        COLOURS.map(function (c) {
          return colourButton(c, "select-alarm");
        }).join("") +
        "</div>" +
        '<button class="btn-secondary" data-act="dismiss-alarm" style="margin-top:10px">' + S.notNow + "</button>";
    }

    return (
      '<div class="overlay pop">' +
      '<div class="kicker">' + hourLabel(alarm.hour) + S.checkIn + "</div>" +
      "<h1>" + S.logQuestion + "</h1>" +
      inner +
      "</div>"
    );
  }

  /* ---------- Render ---------- */

  var SCREENS = {
    welcome: screenWelcome,
    stepRed: function () {
      return screenStep("red", "stepYellow");
    },
    stepYellow: function () {
      return screenStep("yellow", "stepGreen");
    },
    stepGreen: function () {
      return screenStep("green", "stepAlarms");
    },
    stepAlarms: screenStepAlarms,
    colours: screenColours,
    waking: screenWaking,
    setup: screenSetup,
    log: screenLog,
    menu: screenMenu,
    profile: screenProfile,
    today: screenToday,
    month: screenMonth,
    script: screenScript
  };

  // Screens the nav bar may sit under. It must never appear during onboarding
  // or over a half-filled form, where a stray tap would discard typed timings.
  var NAV_VIEWS = ["log", "month", "today", "menu", "colours", "script"];

  function render() {
    var builder = SCREENS[view] || screenLog;
    var html = builder();
    if (data.settings.navMode && NAV_VIEWS.indexOf(view) !== -1 && !alarm) {
      html += navBar();
    }
    if (toast) html += '<div class="toast">' + esc(toast) + "</div>";
    html += overlayHtml();
    app.innerHTML = html;
    app.classList.toggle("has-nav", data.settings.navMode && NAV_VIEWS.indexOf(view) !== -1 && !alarm);
  }

  /* ---------- Events (delegated on data-act) ---------- */

  app.addEventListener("click", function (ev) {
    var el = ev.target.closest("[data-act]");
    if (!el) return;
    var act = el.getAttribute("data-act");

    switch (act) {
      case "go":
        var target = el.getAttribute("data-view");
        // Plain navigation must not clobber fromMenu (§7/§11.5).
        if (target === "setup" || target === "waking") draft = null;
        go(target);
        break;

      case "play-video":
        var v = document.getElementById("intro");
        if (!v) break;
        var p = v.play();
        if (p && p.catch) {
          p.catch(function () {
            v.muted = true;
            v.play();
          });
        }
        break;

      case "open-menu":
        fromMenu = true;
        go("menu");
        break;

      case "leave-menu":
        fromMenu = false;
        go("log");
        break;

      case "select":
        selected = el.getAttribute("data-colour");
        render();
        break;

      case "unselect":
        selected = null;
        render();
        break;

      case "confirm":
        if (selected) {
          logColour(selected);
          selected = null;
        }
        render();
        break;

      case "select-alarm":
        alarmSelected = el.getAttribute("data-colour");
        render();
        break;

      case "unselect-alarm":
        alarmSelected = null;
        render();
        break;

      case "confirm-alarm":
        if (alarmSelected) {
          logColour(alarmSelected);
          alarmSelected = null;
        }
        alarm = null;
        go("log");
        break;

      case "dismiss-alarm":
        alarm = null;
        alarmSelected = null;
        render();
        break;

      case "took-tablet":
        recordTake(alarm.name, alarm.dose, alarm.time);
        alarm = null;
        showToast(S.takenAt(clockLabel(Date.now())));
        go("log");
        break;

      case "snooze":
        var payload = alarm;
        alarm = null;
        render();
        setTimeout(function () {
          if (!alarm) {
            alarm = payload;
            fireFeedback();
            render();
          }
        }, SNOOZE_MINUTES * 60000);
        break;

      case "mark-taken":
        recordTake(
          el.getAttribute("data-name"),
          el.getAttribute("data-dose"),
          el.getAttribute("data-time")
        );
        render();
        break;

      case "add-dose":
        var ti = +el.getAttribute("data-t");
        var lastDose = draft[ti].doses[draft[ti].doses.length - 1];
        var nextMins = (hhmmToMinutes(lastDose.time) + 240) % 1440;
        draft[ti].doses.push({ time: minutesToHhmm(nextMins), dose: lastDose.dose });
        render();
        break;

      case "remove-dose":
        draft[+el.getAttribute("data-t")].doses.splice(+el.getAttribute("data-d"), 1);
        render();
        break;

      case "add-tablet":
        draft.push({ name: "", doses: [{ time: "08:00", dose: "1 tablet" }] });
        render();
        break;

      case "remove-tablet":
        draft.splice(+el.getAttribute("data-t"), 1);
        render();
        break;

      case "quick-dose":
        draft[+el.getAttribute("data-t")].doses[+el.getAttribute("data-d")].dose =
          el.getAttribute("data-val");
        render();
        break;

      case "save-setup":
        data.tablets = draft
          .map(function (t) {
            return {
              name: (t.name || "").trim(),
              doses: t.doses.filter(function (d) {
                return d.time;
              })
            };
          })
          .filter(function (t) {
            return t.name && t.doses.length;
          });
        draft = null;
        save();
        fromMenu = false;
        go("log");
        break;

      case "range":
        chartRange = +el.getAttribute("data-days");
        render();
        break;

      case "print":
        window.print();
        break;

      case "test-alarm":
        alarm = { kind: "hourly", key: "test", hour: new Date().getHours() };
        fireFeedback();
        render();
        break;

      case "enable-alarms":
        if (window.Notification) {
          Notification.requestPermission().then(function () {
            render();
          });
        }
        break;

      case "preset":
        var preset = TABLET_PRESETS[+el.getAttribute("data-i")];
        // Replace a still-blank first card rather than stacking an empty one.
        var blank =
          draft.length === 1 && !draft[0].name.trim() && draft[0].doses.length === 1;
        var filled = {
          name: preset.name,
          doses: preset.times.map(function (t) {
            return { time: t, dose: preset.dose };
          })
        };
        if (blank) draft[0] = filled;
        else draft.push(filled);
        render();
        break;

      case "toggle-nav":
        data.settings.navMode = !data.settings.navMode;
        save();
        render();
        break;

      case "export":
        exportBackup();
        break;

      case "import":
        importBackup();
        break;
    }
  });

  /* Commit on `change`, never on `input` — per-keystroke re-render pulls the
   * caret out of the field (§11.2). And defer the redraw out of the current
   * gesture, or the tap that follows a blur is swallowed (§11.1). */
  app.addEventListener("change", function (ev) {
    var el = ev.target;
    var field = el.getAttribute("data-field");
    if (!field) return;

    var needsRedraw = false;

    if (field === "wakeStart") {
      data.waking.start = el.value;
      save();
    } else if (field === "wakeEnd") {
      data.waking.end = el.value;
      save();
    } else if (field === "profile") {
      data.profile[el.getAttribute("data-key")] = el.value;
      save();
    } else if (field === "tablet-name") {
      draft[+el.getAttribute("data-t")].name = el.value;
      needsRedraw = true; // card heading follows the name
    } else if (field === "dose-time") {
      draft[+el.getAttribute("data-t")].doses[+el.getAttribute("data-d")].time = el.value;
    } else if (field === "dose-text") {
      draft[+el.getAttribute("data-t")].doses[+el.getAttribute("data-d")].dose = el.value;
    }

    if (needsRedraw) setTimeout(render, 0);
  });

  /* ---------- Backup ---------- */

  function exportBackup() {
    try {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "day-tracker-" + dayKey(Date.now()) + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 1000);
      showToast(S.exportDone);
      render();
    } catch (err) {
      showToast(S.importBad);
      render();
    }
  }

  function importBackup() {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          data = migrate(JSON.parse(String(reader.result)));
          save();
          showToast(S.importDone);
          go("log");
        } catch (err) {
          showToast(S.importBad);
          render();
        }
      };
      reader.readAsText(file);
    });
    input.click();
  }

  /* ---------- The tick ---------- */

  function fireFeedback() {
    chime();
    buzz();
  }

  // Screens that must never be interrupted: an alarm navigates to `log` and
  // would discard half-typed tablet timings (§8).
  var PROTECTED = ["welcome", "stepRed", "stepYellow", "stepGreen", "stepAlarms", "waking", "setup", "profile"];
  // Only these views show live data worth refreshing on the tick (§11.3).
  var LIVE = ["log", "today", "month"];

  function tick() {
    var now = Date.now();

    // Never replace an alarm already on screen — the patient may be mid-answer.
    if (!alarm && PROTECTED.indexOf(view) === -1) {
      var due = dueAlarm(data, now);
      if (due) {
        data.fired[due.key] = true;
        save();
        alarm = due;
        alarmSelected = null;
        fireFeedback();
        notify(
          due.kind === "tablet" ? S.takeTablet(due.dose, due.name) : S.logQuestion,
          due.kind === "tablet" ? S.tabletBody : S.alarmsLine1
        );
        render();
        return;
      }
    }

    // Do not redraw while a field has focus, and only refresh live views.
    var ae = document.activeElement;
    if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA")) return;
    if (alarm || LIVE.indexOf(view) !== -1) render();
  }

  setInterval(tick, TICK_MS);

  /* ---------- Service worker ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("service-worker.js?v=3").catch(function () {
        /* offline support is a bonus, not a requirement */
      });
    });
  }

  render();

  // Exposed for the browser test pass only.
  window.__dayTracker = {
    domain: {
      hhmmToMinutes: hhmmToMinutes,
      minutesToHhmm: minutesToHhmm,
      dayKey: dayKey,
      wakingHours: wakingHours,
      flattenDoses: flattenDoses,
      lockMinutesLeft: lockMinutesLeft,
      buildChart: buildChart,
      doseMarkersForDay: doseMarkersForDay,
      statePercentages: statePercentages,
      dueAlarm: dueAlarm,
      pruneFired: pruneFired,
      migrate: migrate
    },
    get data() {
      return data;
    },
    set data(v) {
      data = v;
      save();
    },
    render: render,
    go: go,
    reset: function () {
      data = emptyData();
      draft = null;
      alarm = null;
      selected = null;
      fromMenu = false;
      save();
      go("welcome");
    }
  };
})();
