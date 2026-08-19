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
  // Bump with every deploy, together with CACHE and the ?v= query strings.
  // Shown in the menu so a device can be identified at a glance — an installed
  // PWA silently running an old build is otherwise invisible.
  var APP_VERSION = "v34";

  /* Strings are per language. English is the base; every other language is an
   * OVERRIDE MAP merged over it, so a missing or not-yet-translated key falls
   * back to English rather than rendering blank. A half-translated app is
   * usable; a blank button is not. */
  var LANGS = {};

  LANGS.en = {
    langName: "English",
    langEn: "English",
    appName: "Day Tracker",

    // The three states. Stored as off / on / extra — the clinical state, never
    // the colour — so the palette can change without touching data.
    offName: "Red — Off period",
    offShort: "Red",
    offDesc: "Slow, tremor, stiff or frozen",
    offFull:
      "Stiff or frozen. Hard to get up from a chair or from bed. Movements feel slow. Or a shaking tremor.",
    offExample:
      "Your feet feel stuck to the floor, or you need help to stand up. That is red.",

    onName: "Green — On period",
    onShort: "Green",
    onDesc: "Moving and working easily, mild tremor or none",
    onFull:
      "You get up, walk and do all your work fairly easily. You do not need anyone's help.",
    onExample: "This is your good period. Most of the day should be green.",

    extraName: "Blue — Dyskinesia",
    extraShort: "Blue",
    extraDesc: "Unwanted extra movements",
    extraFull:
      "Unwanted and extra movements that you cannot control. They get in the way of what you are doing.",
    extraExample:
      "Your body, head or arms move on their own, so eating or sitting still is difficult.",

    // Welcome
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
    menuColours: "What the colours mean",
    menuWaking: "Waking hours",
    menuProfile: "Your details",
    menuTablets: "Change tablet timings",
    menuToday: "Today's report",
    menuMonth: "All days — squares chart",
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
    tabletTaken: "Tablet taken",
    tabletNotConfirmed: "Tablet time not confirmed",
    noDataYet: "Nothing logged yet. Press a colour on the home screen to start.",

    exportDone: "Backup file saved",
    importDone: "Backup loaded",
    importBad: "That file could not be read",

    // Colour explainer (menu revisit path — one screen, not three)
    coloursTitle: "What the colours mean",

    // Chart range label

    // Tablet presets
    presetsLabel: "COMMON TABLETS — TAP TO FILL",
    presetCustom: "Something else",

    // Navigation experiment
    navToggleOn: "Try the navigation bar",
    navToggleOff: "Turn off the navigation bar",
    navExperimentNote:
      "Turn this off for a plainer screen with fewer things to mis-tap.",
    navLog: "Log",
    navChart: "Chart",
    navMeds: "Medicines",
    navMenu: "Menu",
    todayAtAGlance: "TODAY SO FAR",

    // Subtitles

    // Filling in later
    fillTitle: "Fill in a missed hour",
    fillPrompt: function (hour) {
      return "How were you at " + hour + "?";
    },
    fillHint: "Tap any hour to fill it in or change it.",
    clearHour: "Clear this hour",
    prevDay: "◀",
    nextDay: "▶",
    today: "Today",
    yesterday: "Yesterday",
    restOfDayTitle: "The rest of the day",
    restOfDayFine: "The hours I did not fill were fine",
    restOfDayNote:
      "Marks every empty hour up to now as green. Only press this if that is true — an hour left blank tells the doctor more than a wrong colour.",
    restOfDayDone: function (n) {
      return n + (n === 1 ? " hour" : " hours") + " marked green";
    },
    restOfDayNothing: "No empty hours to fill",
    cancelFill: "Never mind",
    pastDayReadOnly:
      "This day is finished and cannot be changed. Hours are filled in on the day itself, while you still remember.",

    // End-of-day prompt
    endOfDayKicker: "Before you sleep",
    endOfDayTitle: "Fill in the rest of today?",
    endOfDayBody:
      "Some hours today are still empty. You can fill them in now, while you still remember. After tonight this day is closed.",
    endOfDayGo: "Fill in today",
    endOfDaySkip: "Leave them empty",

    // ---- Language ----
    languageTitle: "Which language?",
    languageHint: "This can be changed later from the menu.",
    menuLanguage: "Language",

    // ---- Staff setup wizard ----
    staffTitle: "Set up for the patient",
    staffIntro:
      "Fill this in with the patient before handing over the phone. One tablet at a time.",
    staffBegin: "Start",
    tabletNumber: function (n) {
      return "Tablet " + n;
    },
    wakingStaffHint:
      "Ask the patient. The app only asks for a colour between these hours, and these also set the suggested tablet times.",
    askName: "What is the tablet called?",
    askNameHint: "Write the name once. It is not asked again.",
    askDose: "How much is taken each time?",
    askDoseHint: "For example: 1 tablet, half tablet.",
    askFreq: "How many times a day?",
    askFreqHint: "The number of doses in a day.",
    askTimes: "At what times?",
    askTimesHint: "Use the patient's usual timings. These repeat every day.",
    timeN: function (n) {
      return "Dose " + n;
    },
    askMore: "Any other tablet?",
    addAnotherTablet: "Yes, add another tablet",
    noMoreTablets: "No, that is all",
    askDyskinesia: "Track extra movements as well?",
    dyskinesiaExplain:
      "By default the patient answers with two colours only — red when off, green when on. Turn this on to add a third colour for dyskinesia, when that is the question you are trying to answer.",
    dyskinesiaYes: "Yes, add the blue button",
    dyskinesiaNo: "No, two colours only",
    reviewTitle: "Check before handing over",
    reviewNone: "No tablets entered yet.",
    editTablet: "Edit",
    handOver: "Save and hand over",
    backStep: "Back",
    nextStep: "Next",
    twoColours: "Two colours — red and green",
    threeColours: "Three colours — red, green and blue",
    menuDyskinesia: "Track extra movements",
    dyskinesiaOn: "On — three colours",
    dyskinesiaOff: "Off — two colours"
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

  /* The stored vocabulary is clinical, not chromatic. Entries record off / on /
   * extra; the palette below is presentation only and can be re-themed without
   * migrating a single row.
   *
   * On is GREEN and dyskinesia is INDIGO, deliberately. Everyone arrives
   * expecting a traffic light, and an earlier scheme where green meant
   * "too much movement" invited a patient having a good day to press green —
   * which reads on the chart as peak-dose dyskinesia and argues for cutting
   * levodopa in someone who is doing fine. Wrong-direction error, caused by
   * nothing but colour convention.
   *
   * Indigo rather than black for extra: the chart draws tablet times as dark
   * vertical lines through the cells, and black cells would swallow them
   * exactly where peak-dose clustering needs to be read.
   */
  /* ---------------------------------------------------------------------
   * TRANSLATIONS — DRAFT, NOT YET CLINICALLY REVIEWED
   *
   * These cover the PATIENT-FACING surface only. The staff setup wizard stays
   * in English deliberately: it is filled in by clinic staff who write drug
   * names and dosing in English anyway, and translating it would double the
   * volume of unreviewed clinical text for no benefit to the patient.
   *
   * Any key omitted here falls back to English, so a partial translation is
   * safe to ship.
   *
   * These must be read by a clinician who speaks the language before any
   * patient sees them. The risk is not grammar — it is a word like "off" or
   * "stiff" landing with the wrong clinical sense and quietly changing what
   * gets logged.
   * ------------------------------------------------------------------- */

  LANGS.hi = {
    langName: "हिंदी",
    langEn: "Hindi",

    offName: "लाल — दवा का असर नहीं है",
    offShort: "लाल",
    offDesc: "धीमापन, कँपकँपी, अकड़न या जकड़न",
    offFull:
      "अकड़न या जकड़न। कुर्सी या बिस्तर से उठना मुश्किल। चलने-फिरने में धीमापन। या कँपकँपी।",
    offExample:
      "पैर ज़मीन से चिपके हुए लगते हैं, या उठने के लिए किसी की मदद चाहिए। यही लाल है।",

    onName: "हरा — दवा का असर है",
    onShort: "हरा",
    onDesc: "आराम से चलना-फिरना और काम करना",
    onFull: "आप उठते हैं, चलते हैं और अपना काम आसानी से करते हैं। किसी की मदद नहीं चाहिए।",
    onExample: "यह आपका अच्छा समय है। दिन का ज़्यादातर हिस्सा हरा होना चाहिए।",

    extraName: "नीला — बहुत ज़्यादा हलचल",
    extraShort: "नीला",
    extraDesc: "अनचाही, अतिरिक्त हलचल",
    extraFull: "ऐसी हलचल जो आपके काबू में नहीं है और आपके काम में रुकावट डालती है।",
    extraExample:
      "शरीर, सिर या हाथ अपने आप हिलते हैं, जिससे खाना या स्थिर बैठना मुश्किल होता है।",
    next: "आगे",

    alarmsTitle: "अलार्म बजेगा",
    alarmsLine1: "जब तक आप जागे हैं, हर घंटे — आपसे एक रंग पूछने के लिए।",
    alarmsLine2: "और हर गोली के समय पर, वह गोली लेने की याद दिलाने के लिए।",
    alarmsLine3: "आप अलार्म का इंतज़ार किए बिना, कभी भी रंग दबा सकते हैं।",

    wakingTitle: "आप कब जागते हैं?",
    wakeStart: "मैं उठता हूँ",
    wakeEnd: "मैं सोने जाता हूँ",

    logQuestion: "अभी आप कैसा महसूस कर रहे हैं?",
    menu: "मेन्यू",
    selectedPrefix: "चुना गया ",
    confirm: "पक्का करें",
    changeAnswer: "जवाब बदलें",
    saved: "सहेज लिया",
    lockLine: function (colour, mins) {
      return "आपने अभी " + colour + " दर्ज किया है। आप " + mins + " मिनट बाद फिर दर्ज कर सकते हैं।";
    },
    recordedAt: function (colour, time) {
      return colour + " — " + time + " पर दर्ज";
    },

    checkIn: " · जाँच",
    notNow: "अभी नहीं",
    tabletTime: " · गोली का समय",
    takeTablet: function (dose, name) {
      return name + " — " + dose + " लीजिए";
    },
    tabletBody: "अभी, इसी समय पर लीजिए। हर दिन यही समय रखिए।",
    haveTaken: "मैंने ले ली है",
    snooze: "10 मिनट बाद याद दिलाएँ",
    lockedDuringAlarm: "आपने अभी-अभी रंग दर्ज किया है, इसलिए अभी कुछ करने की ज़रूरत नहीं।",
    dismiss: "बंद करें",
    menuColours: "रंगों का मतलब",
    coloursTitle: "रंगों का मतलब",
    menuWaking: "जागने का समय",
    menuProfile: "आपकी जानकारी",
    menuTablets: "गोलियों का समय बदलें",
    menuToday: "आज की रिपोर्ट",
    menuMonth: "सभी दिन — चार्ट",
    menuExport: "बैकअप फ़ाइल सहेजें",
    menuImport: "बैकअप फ़ाइल खोलें",
    menuLanguage: "भाषा",
    backToLogging: "वापस दर्ज करने पर",
    backToMenu: "मेन्यू पर वापस",
    noProfile: "मरीज़ की जानकारी अभी नहीं भरी गई",

    profileTitle: "आपकी जानकारी",
    pName: "नाम",
    pAge: "उम्र",
    pYear: "किस साल पता चला",
    pDoctor: "डॉक्टर",
    pNotes: "और कुछ लिखना हो तो",

    todayTitle: "आज की रिपोर्ट",
    hourByHour: "घंटे दर घंटे",
    tabletSchedule: "गोलियों का समय",
    markTaken: "ले ली",
    takenAt: function (t) {
      return t + " पर ली";
    },
    print: "प्रिंट / सहेजें",
    entries: " बार दर्ज",
    monthTitle: "सभी दिन",
    week: "1 हफ़्ता",
    month: "1 महीना",
    off: "असर नहीं",
    normal: "ठीक",
    extra: "ज़्यादा",
    notLogged: "दर्ज नहीं",
    tabletTaken: "गोली ली गई",
    tabletNotConfirmed: "गोली का समय पक्का नहीं",
    noDataYet: "अभी कुछ दर्ज नहीं हुआ। शुरू करने के लिए होम स्क्रीन पर रंग दबाएँ।",

    fillPrompt: function (hour) {
      return hour + " बजे आप कैसे थे?";
    },
    fillHint: "किसी भी घंटे को भरने या बदलने के लिए उस पर दबाएँ।",
    clearHour: "इस घंटे को खाली करें",
    today: "आज",
    yesterday: "कल",
    restOfDayTitle: "बाकी दिन",
    restOfDayFine: "जो घंटे मैंने नहीं भरे, वे ठीक थे",
    restOfDayNote:
      "अभी तक के सभी खाली घंटों को हरा कर देगा। यह तभी दबाएँ जब यह सच हो — खाली घंटा गलत रंग से बेहतर है।",
    cancelFill: "रहने दें",
    pastDayReadOnly: "यह दिन पूरा हो चुका है और अब बदला नहीं जा सकता।",

    endOfDayKicker: "सोने से पहले",
    endOfDayTitle: "आज के बाकी घंटे भर दें?",
    endOfDayBody: "आज के कुछ घंटे अभी खाली हैं। जब तक याद है, अभी भर सकते हैं।",
    endOfDayGo: "आज भरें",
    endOfDaySkip: "खाली रहने दें",

    languageTitle: "कौन सी भाषा?",
    languageHint: "इसे बाद में मेन्यू से बदला जा सकता है।"
  };

  LANGS.mr = {
    langName: "मराठी",
    langEn: "Marathi",

    offName: "लाल — औषध काम करत नाही",
    offShort: "लाल",
    offDesc: "शरीराचा कडकपणा, ताठरता, संथपणा",
    offFull:
      "लाल म्हणजे औषधाचा परिणाम उतरला आहे. शरीर ताठ होतं, जड होतं, अंग जखडल्यासारखं वाटतं. खुर्चीतून किंवा अंथरुणातून उठणं कठीण जातं. हालचाल मंद होते. कधी कधी हात-पाय कापतात, कंपण येतो.",
    offExample: "पाय जमिनीला चिकटल्यासारखे वाटतात. उठायला कोणाची तरी मदत लागते.",

    onName: "हिरवा — औषध चांगलं काम करत आहे",
    onShort: "हिरवा",
    onDesc: "शरीराची सहज आणि सुरळीत हालचाल",
    onFull:
      "हिरवा म्हणजे औषधाचा परिणाम सुरू आहे. शरीर ठीक आहे. तुम्ही स्वतः उठता, चालता. दिवसाची कामं सहज करता. कोणाची मदत लागत नाही.",
    onExample: "हा तुमचा चांगला काळ आहे. दिवसाचा बहुतेक वेळ हिरवा असायला हवा.",

    extraName: "निळा — हालचाली आवरत नाहीत",
    extraShort: "निळा",
    extraDesc: "शरीराची अनियंत्रित हालचाल",
    extraFull:
      "निळा म्हणजे शरीर आपल्या ताब्यात राहत नाही. डोकं, हात किंवा शरीर आपोआप हलतं. आपल्याला नको असूनही हालचाली होतात. या हालचालींमुळे कामात अडथळा येतो.",
    extraExample: "जेवणं किंवा स्थिर बसणं कठीण होतं.",
    next: "पुढे",

    alarmsTitle: "अलार्म वाजेल",
    alarmsLine1: "तुम्ही जागे असताना दर तासाला — तुम्हाला एक रंग विचारण्यासाठी.",
    alarmsLine2: "आणि प्रत्येक गोळीच्या वेळी, ती गोळी घ्यायची आठवण करण्यासाठी.",
    alarmsLine3: "अलार्मची वाट न पाहता तुम्ही कधीही रंग दाबू शकता.",

    wakingTitle: "तुम्ही कधी जागे असता?",
    wakeStart: "मी उठतो",
    wakeEnd: "मी झोपायला जातो",

    logQuestion: "आत्ता तुम्हाला कसं वाटतंय?",
    menu: "मेनू",
    selectedPrefix: "निवडलं ",
    confirm: "नक्की करा",
    changeAnswer: "उत्तर बदला",
    saved: "साठवलं",
    lockLine: function (colour, mins) {
      return "तुम्ही आत्ताच " + colour + " नोंदवलं आहे. " + mins + " मिनिटांनी पुन्हा नोंदवू शकता.";
    },
    recordedAt: function (colour, time) {
      return colour + " — " + time + " ला नोंदवलं";
    },

    checkIn: " · तपासणी",
    notNow: "आत्ता नको",
    tabletTime: " · गोळीची वेळ",
    takeTablet: function (dose, name) {
      return name + " — " + dose + " घ्या";
    },
    tabletBody: "आत्ता, याच वेळी घ्या. दररोज हीच वेळ ठेवा.",
    haveTaken: "मी घेतली आहे",
    snooze: "10 मिनिटांनी आठवण करा",
    lockedDuringAlarm: "तुम्ही आत्ताच रंग नोंदवला आहे, त्यामुळे आता काही करायची गरज नाही.",
    dismiss: "बंद करा",
    menuColours: "रंगांचा अर्थ",
    coloursTitle: "रंगांचा अर्थ",
    menuWaking: "जागण्याची वेळ",
    menuProfile: "तुमची माहिती",
    menuTablets: "गोळ्यांच्या वेळा बदला",
    menuToday: "आजचा अहवाल",
    menuMonth: "सर्व दिवस — तक्ता",
    menuExport: "बॅकअप फाइल साठवा",
    menuImport: "बॅकअप फाइल उघडा",
    menuLanguage: "भाषा",
    backToLogging: "पुन्हा नोंदवण्याकडे",
    backToMenu: "मेनूकडे परत",
    noProfile: "रुग्णाची माहिती अजून भरलेली नाही",

    profileTitle: "तुमची माहिती",
    pName: "नाव",
    pAge: "वय",
    pYear: "कोणत्या वर्षी निदान झालं",
    pDoctor: "डॉक्टर",
    pNotes: "आणखी काही लिहायचं असल्यास",

    todayTitle: "आजचा अहवाल",
    hourByHour: "तासागणिक",
    tabletSchedule: "गोळ्यांच्या वेळा",
    markTaken: "घेतली",
    takenAt: function (t) {
      return t + " ला घेतली";
    },
    print: "प्रिंट / साठवा",
    entries: " नोंदी",
    monthTitle: "सर्व दिवस",
    week: "1 आठवडा",
    month: "1 महिना",
    off: "परिणाम नाही",
    normal: "ठीक",
    extra: "जास्त",
    notLogged: "नोंद नाही",
    tabletTaken: "गोळी घेतली",
    tabletNotConfirmed: "गोळीची वेळ नक्की नाही",
    noDataYet: "अजून काही नोंदवलेलं नाही. सुरू करण्यासाठी होम स्क्रीनवर रंग दाबा.",

    fillPrompt: function (hour) {
      return hour + " वाजता तुम्हाला कसं वाटत होतं?";
    },
    fillHint: "कोणताही तास भरण्यासाठी किंवा बदलण्यासाठी त्यावर दाबा.",
    clearHour: "हा तास रिकामा करा",
    today: "आज",
    yesterday: "काल",
    restOfDayTitle: "दिवसाचा उरलेला भाग",
    restOfDayFine: "मी न भरलेले तास ठीक होते",
    restOfDayNote:
      "आतापर्यंतचे सर्व रिकामे तास हिरवे करेल. हे खरं असेल तरच दाबा — रिकामा तास चुकीच्या रंगापेक्षा बरा.",
    cancelFill: "राहू द्या",
    pastDayReadOnly: "हा दिवस संपला आहे आणि आता बदलता येणार नाही.",

    endOfDayKicker: "झोपण्यापूर्वी",
    endOfDayTitle: "आजचे उरलेले तास भरायचे?",
    endOfDayBody: "आजचे काही तास अजून रिकामे आहेत. आठवत असताना आत्ता भरू शकता.",
    endOfDayGo: "आज भरा",
    endOfDaySkip: "रिकामे राहू द्या",

    languageTitle: "कोणती भाषा?",
    languageHint: "हे नंतर मेनूमधून बदलता येईल."
  };

  LANGS.gu = {
    langName: "ગુજરાતી",
    langEn: "Gujarati",

    offName: "લાલ — દવાની અસર નથી",
    offShort: "લાલ",
    offDesc: "જકડાવું, અક્કડ કે ધીમા થઇ જવું",
    offFull:
      "જકડાઈ જવું કે થીજી જવું. ખુરશી કે પથારીમાંથી ઊઠવું મુશ્કેલ. હલનચલન ધીમું. અથવા ધ્રુજારી.",
    offExample: "પગ જમીન સાથે ચોંટી ગયા હોય એવું લાગે, અથવા ઊઠવા મદદ જોઈએ. એ જ લાલ.",

    onName: "લીલો — દવા કામ કરે છે",
    onShort: "લીલો",
    onDesc: "સહેલાઈથી હરવું-ફરવું અને કામ કરી શકવું",
    onFull: "તમે ઊઠો છો, ચાલો છો અને તમારું કામ સહેલાઈથી કરો છો. કોઈની મદદની જરૂર નથી.",
    onExample: "આ તમારો સારો સમય છે. દિવસનો મોટા ભાગનો સમય લીલો હોવો જોઈએ.",

    extraName: "વાદળી — વધુ પડતી હલનચલન",
    extraShort: "વાદળી",
    extraDesc: "વધારે પડતું હલન-ચલન જે તમે સંભાળી ના શકો",
    extraFull: "તમારા કાબૂ બહારની વધારાની હલનચલન, જે તમારા કામમાં નડે છે.",
    extraExample: "શરીર, માથું કે હાથ જાતે હલે છે, જેથી ખાવું કે સ્થિર બેસવું મુશ્કેલ થાય છે.",
    next: "આગળ",

    alarmsTitle: "એલાર્મ વાગશે",
    alarmsLine1: "તમે જાગતા હો ત્યાં સુધી દર કલાકે — તમને એક રંગ પૂછવા માટે.",
    alarmsLine2: "અને દરેક ગોળીના સમયે, એ ગોળી લેવાની યાદ અપાવવા માટે.",
    alarmsLine3: "એલાર્મની રાહ જોયા વગર તમે ગમે ત્યારે રંગ દબાવી શકો છો.",

    wakingTitle: "તમે ક્યારે જાગો છો?",
    wakeStart: "હું ઊઠું છું",
    wakeEnd: "હું સૂવા જાઉં છું",

    logQuestion: "અત્યારે તમને કેવું લાગે છે?",
    menu: "મેનુ",
    selectedPrefix: "પસંદ કર્યું ",
    confirm: "ખાતરી કરો",
    changeAnswer: "જવાબ બદલો",
    saved: "સાચવ્યું",
    lockLine: function (colour, mins) {
      return "તમે હમણાં જ " + colour + " નોંધ્યું છે. " + mins + " મિનિટ પછી ફરી નોંધી શકશો.";
    },
    recordedAt: function (colour, time) {
      return colour + " — " + time + " વાગ્યે નોંધ્યું";
    },

    checkIn: " · તપાસ",
    notNow: "અત્યારે નહીં",
    tabletTime: " · ગોળીનો સમય",
    takeTablet: function (dose, name) {
      return name + " — " + dose + " લો";
    },
    tabletBody: "અત્યારે, આ જ સમયે લો. દરરોજ આ જ સમય રાખો.",
    haveTaken: "મેં લઈ લીધી છે",
    snooze: "10 મિનિટ પછી યાદ કરાવો",
    lockedDuringAlarm: "તમે હમણાં જ રંગ નોંધ્યો છે, તેથી અત્યારે કંઈ કરવાની જરૂર નથી.",
    dismiss: "બંધ કરો",
    menuColours: "રંગોનો અર્થ",
    coloursTitle: "રંગોનો અર્થ",
    menuWaking: "જાગવાનો સમય",
    menuProfile: "તમારી માહિતી",
    menuTablets: "ગોળીઓનો સમય બદલો",
    menuToday: "આજનો અહેવાલ",
    menuMonth: "બધા દિવસ — ચાર્ટ",
    menuExport: "બૅકઅપ ફાઇલ સાચવો",
    menuImport: "બૅકઅપ ફાઇલ ખોલો",
    menuLanguage: "ભાષા",
    backToLogging: "ફરી નોંધવા પર",
    backToMenu: "મેનુ પર પાછા",
    noProfile: "દર્દીની માહિતી હજી ભરી નથી",

    profileTitle: "તમારી માહિતી",
    pName: "નામ",
    pAge: "ઉંમર",
    pYear: "કયા વર્ષે નિદાન થયું",
    pDoctor: "ડૉક્ટર",
    pNotes: "બીજું કંઈ લખવું હોય તો",

    todayTitle: "આજનો અહેવાલ",
    hourByHour: "કલાક પ્રમાણે",
    tabletSchedule: "ગોળીઓનો સમય",
    markTaken: "લીધી",
    takenAt: function (t) {
      return t + " વાગ્યે લીધી";
    },
    print: "પ્રિન્ટ / સાચવો",
    entries: " નોંધ",
    monthTitle: "બધા દિવસ",
    week: "1 અઠવાડિયું",
    month: "1 મહિનો",
    off: "અસર નથી",
    normal: "ઠીક",
    extra: "વધુ",
    notLogged: "નોંધ નથી",
    tabletTaken: "ગોળી લીધી",
    tabletNotConfirmed: "ગોળીનો સમય નક્કી નથી",
    noDataYet: "હજી કંઈ નોંધાયું નથી. શરૂ કરવા હોમ સ્ક્રીન પર રંગ દબાવો.",

    fillPrompt: function (hour) {
      return hour + " વાગ્યે તમને કેવું હતું?";
    },
    fillHint: "કોઈ પણ કલાક ભરવા કે બદલવા તેના પર દબાવો.",
    clearHour: "આ કલાક ખાલી કરો",
    today: "આજે",
    yesterday: "ગઈકાલે",
    restOfDayTitle: "દિવસનો બાકીનો ભાગ",
    restOfDayFine: "મેં ન ભરેલા કલાકો ઠીક હતા",
    restOfDayNote:
      "અત્યાર સુધીના બધા ખાલી કલાકોને લીલા કરશે. આ સાચું હોય તો જ દબાવો — ખાલી કલાક ખોટા રંગ કરતાં સારો.",
    cancelFill: "રહેવા દો",
    pastDayReadOnly: "આ દિવસ પૂરો થઈ ગયો છે અને હવે બદલી શકાતો નથી.",

    endOfDayKicker: "સૂતા પહેલાં",
    endOfDayTitle: "આજના બાકીના કલાકો ભરવા છે?",
    endOfDayBody: "આજના કેટલાક કલાકો હજી ખાલી છે. યાદ હોય ત્યાં સુધી અત્યારે ભરી શકો છો.",
    endOfDayGo: "આજે ભરો",
    endOfDaySkip: "ખાલી રહેવા દો",

    languageTitle: "કઈ ભાષા?",
    languageHint: "આ પછીથી મેનુમાંથી બદલી શકાય છે."
  };

  LANGS.ta = {
    langName: "தமிழ்",
    langEn: "Tamil",

    offName: "சிவப்பு — மருந்தின் வேலை இல்லை",
    offShort: "சிவப்பு",
    offDesc: "மந்தம், நடுக்கம், விறைப்பு அல்லது உறைவு",
    offFull:
      "விறைப்பு அல்லது உறைந்தது போல். நாற்காலியிலிருந்தோ படுக்கையிலிருந்தோ எழுவது கடினம். அசைவுகள் மெதுவாக. அல்லது நடுக்கம்.",
    offExample: "கால்கள் தரையில் ஒட்டிக்கொண்டது போல் இருக்கும், அல்லது எழ உதவி தேவைப்படும். அதுதான் சிவப்பு.",

    onName: "பச்சை — மருந்து வேலை செய்கிறது",
    onShort: "பச்சை",
    onDesc: "எளிதாக நடமாடுதல், வேலை செய்தல்",
    onFull: "நீங்கள் எழுந்து நடந்து உங்கள் வேலைகளை எளிதாகச் செய்கிறீர்கள். யாருடைய உதவியும் தேவையில்லை.",
    onExample: "இது உங்கள் நல்ல நேரம். நாளின் பெரும்பகுதி பச்சையாக இருக்க வேண்டும்.",

    extraName: "நீலம் — மிக அதிக அசைவு",
    extraShort: "நீலம்",
    extraDesc: "தேவையற்ற கூடுதல் அசைவுகள்",
    extraFull: "உங்கள் கட்டுப்பாட்டில் இல்லாத கூடுதல் அசைவுகள், அவை உங்கள் வேலைக்கு இடையூறாக இருக்கும்.",
    extraExample: "உடல், தலை அல்லது கைகள் தானாக அசைகின்றன, அதனால் சாப்பிடுவதோ அமைதியாக உட்காருவதோ கடினம்.",
    next: "அடுத்து",

    alarmsTitle: "அலாரம் ஒலிக்கும்",
    alarmsLine1: "நீங்கள் விழித்திருக்கும் வரை ஒவ்வொரு மணி நேரமும் — ஒரு நிறத்தைக் கேட்க.",
    alarmsLine2: "ஒவ்வொரு மாத்திரை நேரத்திலும், அதை எடுக்க நினைவூட்ட.",
    alarmsLine3: "அலாரத்திற்குக் காத்திராமல் எப்போது வேண்டுமானாலும் நிறத்தை அழுத்தலாம்.",

    wakingTitle: "நீங்கள் எப்போது விழித்திருக்கிறீர்கள்?",
    wakeStart: "நான் எழுவது",
    wakeEnd: "நான் தூங்கச் செல்வது",

    logQuestion: "இப்போது உங்களுக்கு எப்படி இருக்கிறது?",
    menu: "பட்டி",
    selectedPrefix: "தேர்ந்தெடுத்தது ",
    confirm: "உறுதி செய்",
    changeAnswer: "பதிலை மாற்று",
    saved: "சேமிக்கப்பட்டது",
    lockLine: function (colour, mins) {
      return "நீங்கள் இப்போதுதான் " + colour + " பதிவு செய்தீர்கள். " + mins + " நிமிடங்களில் மீண்டும் பதிவு செய்யலாம்.";
    },
    recordedAt: function (colour, time) {
      return colour + " — " + time + " மணிக்கு பதிவு";
    },

    checkIn: " · சரிபார்ப்பு",
    notNow: "இப்போது வேண்டாம்",
    tabletTime: " · மாத்திரை நேரம்",
    takeTablet: function (dose, name) {
      return name + " — " + dose + " எடுத்துக் கொள்ளுங்கள்";
    },
    tabletBody: "இப்போதே, இதே நேரத்தில் எடுத்துக் கொள்ளுங்கள். தினமும் இதே நேரத்தை வைத்திருங்கள்.",
    haveTaken: "நான் எடுத்துக் கொண்டேன்",
    snooze: "10 நிமிடங்களில் நினைவூட்டு",
    lockedDuringAlarm: "நீங்கள் இப்போதுதான் ஒரு நிறத்தைப் பதிவு செய்தீர்கள், இப்போது ஒன்றும் செய்யத் தேவையில்லை.",
    dismiss: "மூடு",
    menuColours: "நிறங்களின் பொருள்",
    coloursTitle: "நிறங்களின் பொருள்",
    menuWaking: "விழிப்பு நேரம்",
    menuProfile: "உங்கள் விவரங்கள்",
    menuTablets: "மாத்திரை நேரங்களை மாற்று",
    menuToday: "இன்றைய அறிக்கை",
    menuMonth: "எல்லா நாட்களும் — விளக்கப்படம்",
    menuExport: "காப்புப் படிவத்தைச் சேமி",
    menuImport: "காப்புப் படிவத்தைத் திற",
    menuLanguage: "மொழி",
    backToLogging: "பதிவு செய்யத் திரும்பு",
    backToMenu: "பட்டிக்குத் திரும்பு",
    noProfile: "நோயாளியின் விவரங்கள் இன்னும் நிரப்பப்படவில்லை",

    profileTitle: "உங்கள் விவரங்கள்",
    pName: "பெயர்",
    pAge: "வயது",
    pYear: "எந்த ஆண்டு கண்டறியப்பட்டது",
    pDoctor: "மருத்துவர்",
    pNotes: "வேறு ஏதேனும் குறிப்பு",

    todayTitle: "இன்றைய அறிக்கை",
    hourByHour: "மணி வாரியாக",
    tabletSchedule: "மாத்திரை நேரங்கள்",
    markTaken: "எடுத்தேன்",
    takenAt: function (t) {
      return t + " மணிக்கு எடுத்தது";
    },
    print: "அச்சிடு / சேமி",
    entries: " பதிவுகள்",
    monthTitle: "எல்லா நாட்களும்",
    week: "1 வாரம்",
    month: "1 மாதம்",
    off: "வேலை இல்லை",
    normal: "சரி",
    extra: "அதிகம்",
    notLogged: "பதிவு இல்லை",
    tabletTaken: "மாத்திரை எடுக்கப்பட்டது",
    tabletNotConfirmed: "மாத்திரை நேரம் உறுதிப்படுத்தப்படவில்லை",
    noDataYet: "இன்னும் எதுவும் பதிவாகவில்லை. தொடங்க முகப்புத் திரையில் ஒரு நிறத்தை அழுத்துங்கள்.",

    fillPrompt: function (hour) {
      return hour + " மணிக்கு உங்களுக்கு எப்படி இருந்தது?";
    },
    fillHint: "எந்த மணி நேரத்தையும் நிரப்ப அல்லது மாற்ற அதை அழுத்துங்கள்.",
    clearHour: "இந்த மணி நேரத்தை காலி செய்",
    today: "இன்று",
    yesterday: "நேற்று",
    restOfDayTitle: "நாளின் மீதி",
    restOfDayFine: "நான் நிரப்பாத மணி நேரங்கள் நன்றாக இருந்தன",
    restOfDayNote:
      "இதுவரை உள்ள எல்லா காலி மணி நேரங்களையும் பச்சையாக்கும். இது உண்மையாக இருந்தால் மட்டும் அழுத்துங்கள் — காலி மணி நேரம் தவறான நிறத்தை விட மேல்.",
    cancelFill: "வேண்டாம்",
    pastDayReadOnly: "இந்த நாள் முடிந்துவிட்டது, இனி மாற்ற முடியாது.",

    endOfDayKicker: "தூங்கும் முன்",
    endOfDayTitle: "இன்றைய மீதி மணி நேரங்களை நிரப்பவா?",
    endOfDayBody: "இன்றைய சில மணி நேரங்கள் இன்னும் காலியாக உள்ளன. நினைவிருக்கும் போதே நிரப்பலாம்.",
    endOfDayGo: "இன்று நிரப்பு",
    endOfDaySkip: "காலியாக விடு",

    languageTitle: "எந்த மொழி?",
    languageHint: "இதை பின்னர் பட்டியிலிருந்து மாற்றலாம்."
  };

  LANGS.te = {
    langName: "తెలుగు",
    langEn: "Telugu",

    offName: "ఎరుపు — మందు పని చేయడం లేదు",
    offShort: "ఎరుపు",
    offDesc: "నెమ్మది, వణుకు, బిగుసుకుపోవడం లేదా కదలలేకపోవడం",
    offFull:
      "బిగుసుకుపోవడం లేదా కదలలేకపోవడం. కుర్చీ నుంచి లేదా మంచం నుంచి లేవడం కష్టం. కదలికలు నెమ్మది. లేదా వణుకు.",
    offExample: "కాళ్లు నేలకు అతుక్కుపోయినట్టు అనిపిస్తుంది, లేదా లేవడానికి సాయం కావాలి. అదే ఎరుపు.",

    onName: "ఆకుపచ్చ — మందు పని చేస్తోంది",
    onShort: "ఆకుపచ్చ",
    onDesc: "సులభంగా కదలడం, పని చేయడం",
    onFull: "మీరు లేస్తారు, నడుస్తారు, మీ పనులు సులభంగా చేసుకుంటారు. ఎవరి సాయం అవసరం లేదు.",
    onExample: "ఇది మీ మంచి సమయం. రోజులో ఎక్కువ భాగం ఆకుపచ్చగా ఉండాలి.",

    extraName: "నీలం — మరీ ఎక్కువ కదలిక",
    extraShort: "నీలం",
    extraDesc: "అవసరం లేని అదనపు కదలికలు",
    extraFull: "మీ అదుపులో లేని అదనపు కదలికలు, అవి మీ పనికి అడ్డుపడతాయి.",
    extraExample: "శరీరం, తల లేదా చేతులు వాటంతట అవే కదులుతాయి, దాంతో తినడం లేదా కదలకుండా కూర్చోవడం కష్టం.",
    next: "తర్వాత",

    alarmsTitle: "అలారం మోగుతుంది",
    alarmsLine1: "మీరు మేల్కొని ఉన్నంత సేపు ప్రతి గంటకు — ఒక రంగు అడగడానికి.",
    alarmsLine2: "ప్రతి మాత్ర సమయంలో, ఆ మాత్ర వేసుకోవడం గుర్తు చేయడానికి.",
    alarmsLine3: "అలారం కోసం ఎదురు చూడకుండా ఎప్పుడైనా రంగు నొక్కవచ్చు.",

    wakingTitle: "మీరు ఎప్పుడు మేల్కొని ఉంటారు?",
    wakeStart: "నేను లేచేది",
    wakeEnd: "నేను పడుకునేది",

    logQuestion: "ఇప్పుడు మీకు ఎలా ఉంది?",
    menu: "మెనూ",
    selectedPrefix: "ఎంచుకున్నది ",
    confirm: "నిర్ధారించండి",
    changeAnswer: "సమాధానం మార్చండి",
    saved: "భద్రపరిచాం",
    lockLine: function (colour, mins) {
      return "మీరు ఇప్పుడే " + colour + " నమోదు చేశారు. " + mins + " నిమిషాల తర్వాత మళ్లీ నమోదు చేయవచ్చు.";
    },
    recordedAt: function (colour, time) {
      return colour + " — " + time + " కి నమోదు";
    },

    checkIn: " · తనిఖీ",
    notNow: "ఇప్పుడు వద్దు",
    tabletTime: " · మాత్ర సమయం",
    takeTablet: function (dose, name) {
      return name + " — " + dose + " వేసుకోండి";
    },
    tabletBody: "ఇప్పుడే, ఇదే సమయానికి వేసుకోండి. ప్రతి రోజూ ఇదే సమయం ఉంచండి.",
    haveTaken: "నేను వేసుకున్నాను",
    snooze: "10 నిమిషాల తర్వాత గుర్తు చేయి",
    lockedDuringAlarm: "మీరు ఇప్పుడే ఒక రంగు నమోదు చేశారు, కాబట్టి ఇప్పుడు ఏమీ చేయనవసరం లేదు.",
    dismiss: "మూసివేయి",
    menuColours: "రంగుల అర్థం",
    coloursTitle: "రంగుల అర్థం",
    menuWaking: "మేల్కొనే సమయం",
    menuProfile: "మీ వివరాలు",
    menuTablets: "మాత్రల సమయాలు మార్చండి",
    menuToday: "ఈ రోజు నివేదిక",
    menuMonth: "అన్ని రోజులు — చార్ట్",
    menuExport: "బ్యాకప్ ఫైల్ భద్రపరచండి",
    menuImport: "బ్యాకప్ ఫైల్ తెరవండి",
    menuLanguage: "భాష",
    backToLogging: "తిరిగి నమోదుకు",
    backToMenu: "మెనూకు తిరిగి",
    noProfile: "రోగి వివరాలు ఇంకా నింపలేదు",

    profileTitle: "మీ వివరాలు",
    pName: "పేరు",
    pAge: "వయసు",
    pYear: "ఏ సంవత్సరంలో నిర్ధారణ అయింది",
    pDoctor: "డాక్టర్",
    pNotes: "ఇంకేమైనా రాయాలంటే",

    todayTitle: "ఈ రోజు నివేదిక",
    hourByHour: "గంట గంటకు",
    tabletSchedule: "మాత్రల సమయాలు",
    markTaken: "వేసుకున్నాను",
    takenAt: function (t) {
      return t + " కి వేసుకున్నారు";
    },
    print: "ప్రింట్ / భద్రపరచు",
    entries: " నమోదులు",
    monthTitle: "అన్ని రోజులు",
    week: "1 వారం",
    month: "1 నెల",
    off: "పని చేయడం లేదు",
    normal: "బాగుంది",
    extra: "ఎక్కువ",
    notLogged: "నమోదు కాలేదు",
    tabletTaken: "మాత్ర వేసుకున్నారు",
    tabletNotConfirmed: "మాత్ర సమయం నిర్ధారణ కాలేదు",
    noDataYet: "ఇంకా ఏమీ నమోదు కాలేదు. మొదలుపెట్టడానికి హోమ్ స్క్రీన్‌లో ఒక రంగు నొక్కండి.",

    fillPrompt: function (hour) {
      return hour + " గంటలకు మీకు ఎలా ఉండేది?";
    },
    fillHint: "ఏ గంటనైనా నింపడానికి లేదా మార్చడానికి దానిపై నొక్కండి.",
    clearHour: "ఈ గంటను ఖాళీ చేయి",
    today: "ఈ రోజు",
    yesterday: "నిన్న",
    restOfDayTitle: "రోజులో మిగిలినది",
    restOfDayFine: "నేను నింపని గంటలు బాగానే ఉన్నాయి",
    restOfDayNote:
      "ఇప్పటివరకు ఉన్న అన్ని ఖాళీ గంటలను ఆకుపచ్చ చేస్తుంది. ఇది నిజమైతేనే నొక్కండి — ఖాళీ గంట తప్పు రంగు కంటే మేలు.",
    cancelFill: "వద్దులే",
    pastDayReadOnly: "ఈ రోజు పూర్తయింది, ఇక మార్చలేరు.",

    endOfDayKicker: "పడుకునే ముందు",
    endOfDayTitle: "ఈ రోజు మిగిలిన గంటలు నింపాలా?",
    endOfDayBody: "ఈ రోజు కొన్ని గంటలు ఇంకా ఖాళీగా ఉన్నాయి. గుర్తున్నప్పుడే నింపవచ్చు.",
    endOfDayGo: "ఈ రోజు నింపు",
    endOfDaySkip: "ఖాళీగా వదిలేయి",

    languageTitle: "ఏ భాష?",
    languageHint: "దీన్ని తర్వాత మెనూ నుంచి మార్చవచ్చు."
  };

  LANGS.kn = {
    langName: "ಕನ್ನಡ",
    langEn: "Kannada",

    offName: "ಕೆಂಪು — ಔಷಧದ ಪರಿಣಾಮ ಇಲ್ಲ",
    offShort: "ಕೆಂಪು",
    offDesc: "ನಿಧಾನ, ನಡುಕ, ಬಿಗಿತ ಅಥವಾ ಸ್ತಬ್ಧತೆ",
    offFull:
      "ಬಿಗಿತ ಅಥವಾ ಸ್ತಬ್ಧವಾದಂತೆ. ಕುರ್ಚಿಯಿಂದ ಅಥವಾ ಹಾಸಿಗೆಯಿಂದ ಏಳುವುದು ಕಷ್ಟ. ಚಲನೆ ನಿಧಾನ. ಅಥವಾ ನಡುಕ.",
    offExample: "ಕಾಲುಗಳು ನೆಲಕ್ಕೆ ಅಂಟಿಕೊಂಡಂತೆ ಅನಿಸುತ್ತದೆ, ಅಥವಾ ಏಳಲು ಸಹಾಯ ಬೇಕಾಗುತ್ತದೆ. ಅದೇ ಕೆಂಪು.",

    onName: "ಹಸಿರು — ಔಷಧ ಕೆಲಸ ಮಾಡುತ್ತಿದೆ",
    onShort: "ಹಸಿರು",
    onDesc: "ಸುಲಭವಾಗಿ ಓಡಾಟ ಮತ್ತು ಕೆಲಸ",
    onFull: "ನೀವು ಏಳುತ್ತೀರಿ, ನಡೆಯುತ್ತೀರಿ ಮತ್ತು ನಿಮ್ಮ ಕೆಲಸಗಳನ್ನು ಸುಲಭವಾಗಿ ಮಾಡುತ್ತೀರಿ. ಯಾರ ಸಹಾಯವೂ ಬೇಕಿಲ್ಲ.",
    onExample: "ಇದು ನಿಮ್ಮ ಒಳ್ಳೆಯ ಸಮಯ. ದಿನದ ಹೆಚ್ಚಿನ ಭಾಗ ಹಸಿರಾಗಿರಬೇಕು.",

    extraName: "ನೀಲಿ — ತುಂಬಾ ಹೆಚ್ಚು ಚಲನೆ",
    extraShort: "ನೀಲಿ",
    extraDesc: "ಬೇಡವಾದ ಹೆಚ್ಚುವರಿ ಚಲನೆ",
    extraFull: "ನಿಮ್ಮ ಹಿಡಿತದಲ್ಲಿಲ್ಲದ ಹೆಚ್ಚುವರಿ ಚಲನೆಗಳು, ಅವು ನಿಮ್ಮ ಕೆಲಸಕ್ಕೆ ಅಡ್ಡಿಯಾಗುತ್ತವೆ.",
    extraExample: "ದೇಹ, ತಲೆ ಅಥವಾ ಕೈಗಳು ತಾವಾಗಿಯೇ ಅಲುಗಾಡುತ್ತವೆ, ಇದರಿಂದ ಊಟ ಮಾಡುವುದು ಅಥವಾ ಸುಮ್ಮನೆ ಕೂರುವುದು ಕಷ್ಟ.",
    next: "ಮುಂದೆ",

    alarmsTitle: "ಅಲಾರಂ ಮೊಳಗುತ್ತದೆ",
    alarmsLine1: "ನೀವು ಎಚ್ಚರವಿರುವಷ್ಟು ಹೊತ್ತು ಪ್ರತಿ ಗಂಟೆಗೆ — ಒಂದು ಬಣ್ಣ ಕೇಳಲು.",
    alarmsLine2: "ಪ್ರತಿ ಮಾತ್ರೆಯ ಸಮಯದಲ್ಲಿ, ಆ ಮಾತ್ರೆ ತೆಗೆದುಕೊಳ್ಳಲು ನೆನಪಿಸಲು.",
    alarmsLine3: "ಅಲಾರಂಗೆ ಕಾಯದೆ ಯಾವಾಗ ಬೇಕಾದರೂ ಬಣ್ಣ ಒತ್ತಬಹುದು.",

    wakingTitle: "ನೀವು ಯಾವಾಗ ಎಚ್ಚರವಿರುತ್ತೀರಿ?",
    wakeStart: "ನಾನು ಏಳುವುದು",
    wakeEnd: "ನಾನು ಮಲಗುವುದು",

    logQuestion: "ಈಗ ನಿಮಗೆ ಹೇಗಿದೆ?",
    menu: "ಮೆನು",
    selectedPrefix: "ಆಯ್ಕೆ ಮಾಡಿದ್ದು ",
    confirm: "ಖಚಿತಪಡಿಸಿ",
    changeAnswer: "ಉತ್ತರ ಬದಲಿಸಿ",
    saved: "ಉಳಿಸಲಾಗಿದೆ",
    lockLine: function (colour, mins) {
      return "ನೀವು ಈಗಷ್ಟೇ " + colour + " ದಾಖಲಿಸಿದ್ದೀರಿ. " + mins + " ನಿಮಿಷಗಳ ನಂತರ ಮತ್ತೆ ದಾಖಲಿಸಬಹುದು.";
    },
    recordedAt: function (colour, time) {
      return colour + " — " + time + " ಕ್ಕೆ ದಾಖಲು";
    },

    checkIn: " · ಪರಿಶೀಲನೆ",
    notNow: "ಈಗ ಬೇಡ",
    tabletTime: " · ಮಾತ್ರೆ ಸಮಯ",
    takeTablet: function (dose, name) {
      return name + " — " + dose + " ತೆಗೆದುಕೊಳ್ಳಿ";
    },
    tabletBody: "ಈಗಲೇ, ಇದೇ ಸಮಯಕ್ಕೆ ತೆಗೆದುಕೊಳ್ಳಿ. ಪ್ರತಿದಿನ ಇದೇ ಸಮಯ ಇಟ್ಟುಕೊಳ್ಳಿ.",
    haveTaken: "ನಾನು ತೆಗೆದುಕೊಂಡಿದ್ದೇನೆ",
    snooze: "10 ನಿಮಿಷಗಳ ನಂತರ ನೆನಪಿಸಿ",
    lockedDuringAlarm: "ನೀವು ಈಗಷ್ಟೇ ಬಣ್ಣ ದಾಖಲಿಸಿದ್ದೀರಿ, ಆದ್ದರಿಂದ ಈಗ ಏನೂ ಮಾಡಬೇಕಿಲ್ಲ.",
    dismiss: "ಮುಚ್ಚಿ",
    menuColours: "ಬಣ್ಣಗಳ ಅರ್ಥ",
    coloursTitle: "ಬಣ್ಣಗಳ ಅರ್ಥ",
    menuWaking: "ಎಚ್ಚರದ ಸಮಯ",
    menuProfile: "ನಿಮ್ಮ ವಿವರಗಳು",
    menuTablets: "ಮಾತ್ರೆಗಳ ಸಮಯ ಬದಲಿಸಿ",
    menuToday: "ಇಂದಿನ ವರದಿ",
    menuMonth: "ಎಲ್ಲಾ ದಿನಗಳು — ಚಾರ್ಟ್",
    menuExport: "ಬ್ಯಾಕಪ್ ಫೈಲ್ ಉಳಿಸಿ",
    menuImport: "ಬ್ಯಾಕಪ್ ಫೈಲ್ ತೆರೆಯಿರಿ",
    menuLanguage: "ಭಾಷೆ",
    backToLogging: "ಮತ್ತೆ ದಾಖಲಿಸಲು",
    backToMenu: "ಮೆನುಗೆ ಹಿಂತಿರುಗಿ",
    noProfile: "ರೋಗಿಯ ವಿವರಗಳನ್ನು ಇನ್ನೂ ಭರ್ತಿ ಮಾಡಿಲ್ಲ",

    profileTitle: "ನಿಮ್ಮ ವಿವರಗಳು",
    pName: "ಹೆಸರು",
    pAge: "ವಯಸ್ಸು",
    pYear: "ಯಾವ ವರ್ಷ ಪತ್ತೆಯಾಯಿತು",
    pDoctor: "ವೈದ್ಯರು",
    pNotes: "ಇನ್ನೇನಾದರೂ ಬರೆಯಬೇಕಿದ್ದರೆ",

    todayTitle: "ಇಂದಿನ ವರದಿ",
    hourByHour: "ಗಂಟೆಗೊಮ್ಮೆ",
    tabletSchedule: "ಮಾತ್ರೆಗಳ ಸಮಯ",
    markTaken: "ತೆಗೆದುಕೊಂಡೆ",
    takenAt: function (t) {
      return t + " ಕ್ಕೆ ತೆಗೆದುಕೊಂಡರು";
    },
    print: "ಮುದ್ರಿಸಿ / ಉಳಿಸಿ",
    entries: " ದಾಖಲೆಗಳು",
    monthTitle: "ಎಲ್ಲಾ ದಿನಗಳು",
    week: "1 ವಾರ",
    month: "1 ತಿಂಗಳು",
    off: "ಪರಿಣಾಮ ಇಲ್ಲ",
    normal: "ಸರಿ",
    extra: "ಹೆಚ್ಚು",
    notLogged: "ದಾಖಲಾಗಿಲ್ಲ",
    tabletTaken: "ಮಾತ್ರೆ ತೆಗೆದುಕೊಂಡರು",
    tabletNotConfirmed: "ಮಾತ್ರೆ ಸಮಯ ಖಚಿತವಾಗಿಲ್ಲ",
    noDataYet: "ಇನ್ನೂ ಏನೂ ದಾಖಲಾಗಿಲ್ಲ. ಶುರು ಮಾಡಲು ಮುಖಪುಟದಲ್ಲಿ ಒಂದು ಬಣ್ಣ ಒತ್ತಿ.",

    fillPrompt: function (hour) {
      return hour + " ಗಂಟೆಗೆ ನಿಮಗೆ ಹೇಗಿತ್ತು?";
    },
    fillHint: "ಯಾವುದೇ ಗಂಟೆಯನ್ನು ಭರ್ತಿ ಮಾಡಲು ಅಥವಾ ಬದಲಿಸಲು ಅದನ್ನು ಒತ್ತಿ.",
    clearHour: "ಈ ಗಂಟೆಯನ್ನು ಖಾಲಿ ಮಾಡಿ",
    today: "ಇಂದು",
    yesterday: "ನಿನ್ನೆ",
    restOfDayTitle: "ದಿನದ ಉಳಿದ ಭಾಗ",
    restOfDayFine: "ನಾನು ಭರ್ತಿ ಮಾಡದ ಗಂಟೆಗಳು ಚೆನ್ನಾಗಿದ್ದವು",
    restOfDayNote:
      "ಇಲ್ಲಿಯವರೆಗಿನ ಎಲ್ಲಾ ಖಾಲಿ ಗಂಟೆಗಳನ್ನು ಹಸಿರು ಮಾಡುತ್ತದೆ. ಇದು ನಿಜವಾಗಿದ್ದರೆ ಮಾತ್ರ ಒತ್ತಿ — ಖಾಲಿ ಗಂಟೆ ತಪ್ಪು ಬಣ್ಣಕ್ಕಿಂತ ಒಳ್ಳೆಯದು.",
    cancelFill: "ಬೇಡ",
    pastDayReadOnly: "ಈ ದಿನ ಮುಗಿದಿದೆ ಮತ್ತು ಈಗ ಬದಲಾಯಿಸಲಾಗದು.",

    endOfDayKicker: "ಮಲಗುವ ಮೊದಲು",
    endOfDayTitle: "ಇಂದಿನ ಉಳಿದ ಗಂಟೆಗಳನ್ನು ಭರ್ತಿ ಮಾಡುವುದೇ?",
    endOfDayBody: "ಇಂದಿನ ಕೆಲವು ಗಂಟೆಗಳು ಇನ್ನೂ ಖಾಲಿ ಇವೆ. ನೆನಪಿರುವಾಗಲೇ ಭರ್ತಿ ಮಾಡಬಹುದು.",
    endOfDayGo: "ಇಂದು ಭರ್ತಿ ಮಾಡಿ",
    endOfDaySkip: "ಖಾಲಿ ಬಿಡಿ",

    languageTitle: "ಯಾವ ಭಾಷೆ?",
    languageHint: "ಇದನ್ನು ನಂತರ ಮೆನುವಿನಿಂದ ಬದಲಾಯಿಸಬಹುದು."
  };

  LANGS.ml = {
    langName: "മലയാളം",
    langEn: "Malayalam",

    offName: "ചുവപ്പ് — മരുന്നിന്റെ ഫലം ഇല്ല",
    offShort: "ചുവപ്പ്",
    offDesc: "മന്ദത, വിറയൽ, മുറുക്കം അല്ലെങ്കിൽ ഉറഞ്ഞുപോകൽ",
    offFull:
      "മുറുക്കം അല്ലെങ്കിൽ ഉറഞ്ഞുപോയതു പോലെ. കസേരയിൽ നിന്നോ കിടക്കയിൽ നിന്നോ എഴുന്നേൽക്കാൻ പ്രയാസം. ചലനങ്ങൾ മന്ദം. അല്ലെങ്കിൽ വിറയൽ.",
    offExample: "കാലുകൾ നിലത്ത് ഒട്ടിപ്പിടിച്ചതു പോലെ തോന്നും, അല്ലെങ്കിൽ എഴുന്നേൽക്കാൻ സഹായം വേണം. അതാണ് ചുവപ്പ്.",

    onName: "പച്ച — മരുന്ന് പ്രവർത്തിക്കുന്നു",
    onShort: "പച്ച",
    onDesc: "എളുപ്പത്തിൽ നടക്കാനും ജോലി ചെയ്യാനും",
    onFull: "നിങ്ങൾ എഴുന്നേൽക്കുന്നു, നടക്കുന്നു, നിങ്ങളുടെ ജോലികൾ എളുപ്പത്തിൽ ചെയ്യുന്നു. ആരുടെയും സഹായം വേണ്ട.",
    onExample: "ഇത് നിങ്ങളുടെ നല്ല സമയമാണ്. ദിവസത്തിന്റെ ഭൂരിഭാഗവും പച്ചയായിരിക്കണം.",

    extraName: "നീല — അമിതമായ ചലനം",
    extraShort: "നീല",
    extraDesc: "വേണ്ടാത്ത അധിക ചലനങ്ങൾ",
    extraFull: "നിങ്ങളുടെ നിയന്ത്രണത്തിലില്ലാത്ത അധിക ചലനങ്ങൾ, അവ നിങ്ങളുടെ ജോലിക്ക് തടസ്സമാകുന്നു.",
    extraExample: "ശരീരം, തല അല്ലെങ്കിൽ കൈകൾ തനിയെ ചലിക്കുന്നു, അതിനാൽ ഭക്ഷണം കഴിക്കാനോ അനങ്ങാതെ ഇരിക്കാനോ പ്രയാസം.",
    next: "അടുത്തത്",

    alarmsTitle: "അലാറം മുഴങ്ങും",
    alarmsLine1: "നിങ്ങൾ ഉണർന്നിരിക്കുന്ന സമയത്ത് ഓരോ മണിക്കൂറിലും — ഒരു നിറം ചോദിക്കാൻ.",
    alarmsLine2: "ഓരോ ഗുളികയുടെ സമയത്തും, അത് കഴിക്കാൻ ഓർമ്മിപ്പിക്കാൻ.",
    alarmsLine3: "അലാറത്തിനായി കാത്തിരിക്കാതെ എപ്പോൾ വേണമെങ്കിലും നിറം അമർത്താം.",

    wakingTitle: "നിങ്ങൾ എപ്പോൾ ഉണർന്നിരിക്കുന്നു?",
    wakeStart: "ഞാൻ എഴുന്നേൽക്കുന്നത്",
    wakeEnd: "ഞാൻ ഉറങ്ങാൻ പോകുന്നത്",

    logQuestion: "ഇപ്പോൾ നിങ്ങൾക്ക് എങ്ങനെയുണ്ട്?",
    menu: "മെനു",
    selectedPrefix: "തിരഞ്ഞെടുത്തത് ",
    confirm: "ഉറപ്പിക്കുക",
    changeAnswer: "ഉത്തരം മാറ്റുക",
    saved: "സൂക്ഷിച്ചു",
    lockLine: function (colour, mins) {
      return "നിങ്ങൾ ഇപ്പോൾ " + colour + " രേഖപ്പെടുത്തി. " + mins + " മിനിറ്റിനു ശേഷം വീണ്ടും രേഖപ്പെടുത്താം.";
    },
    recordedAt: function (colour, time) {
      return colour + " — " + time + " ന് രേഖപ്പെടുത്തി";
    },

    checkIn: " · പരിശോധന",
    notNow: "ഇപ്പോൾ വേണ്ട",
    tabletTime: " · ഗുളികയുടെ സമയം",
    takeTablet: function (dose, name) {
      return name + " — " + dose + " കഴിക്കുക";
    },
    tabletBody: "ഇപ്പോൾ തന്നെ, ഈ സമയത്ത് കഴിക്കുക. എല്ലാ ദിവസവും ഇതേ സമയം സൂക്ഷിക്കുക.",
    haveTaken: "ഞാൻ കഴിച്ചു",
    snooze: "10 മിനിറ്റിനു ശേഷം ഓർമ്മിപ്പിക്കുക",
    lockedDuringAlarm: "നിങ്ങൾ ഇപ്പോൾ ഒരു നിറം രേഖപ്പെടുത്തി, അതിനാൽ ഇപ്പോൾ ഒന്നും ചെയ്യേണ്ടതില്ല.",
    dismiss: "അടയ്ക്കുക",
    menuColours: "നിറങ്ങളുടെ അർത്ഥം",
    coloursTitle: "നിറങ്ങളുടെ അർത്ഥം",
    menuWaking: "ഉണർന്നിരിക്കുന്ന സമയം",
    menuProfile: "നിങ്ങളുടെ വിവരങ്ങൾ",
    menuTablets: "ഗുളികകളുടെ സമയം മാറ്റുക",
    menuToday: "ഇന്നത്തെ റിപ്പോർട്ട്",
    menuMonth: "എല്ലാ ദിവസങ്ങളും — ചാർട്ട്",
    menuExport: "ബാക്കപ്പ് ഫയൽ സൂക്ഷിക്കുക",
    menuImport: "ബാക്കപ്പ് ഫയൽ തുറക്കുക",
    menuLanguage: "ഭാഷ",
    backToLogging: "വീണ്ടും രേഖപ്പെടുത്താൻ",
    backToMenu: "മെനുവിലേക്ക് മടങ്ങുക",
    noProfile: "രോഗിയുടെ വിവരങ്ങൾ ഇതുവരെ പൂരിപ്പിച്ചിട്ടില്ല",

    profileTitle: "നിങ്ങളുടെ വിവരങ്ങൾ",
    pName: "പേര്",
    pAge: "വയസ്സ്",
    pYear: "ഏത് വർഷം കണ്ടെത്തി",
    pDoctor: "ഡോക്ടർ",
    pNotes: "മറ്റെന്തെങ്കിലും എഴുതാനുണ്ടെങ്കിൽ",

    todayTitle: "ഇന്നത്തെ റിപ്പോർട്ട്",
    hourByHour: "മണിക്കൂർ തോറും",
    tabletSchedule: "ഗുളികകളുടെ സമയം",
    markTaken: "കഴിച്ചു",
    takenAt: function (t) {
      return t + " ന് കഴിച്ചു";
    },
    print: "പ്രിന്റ് / സൂക്ഷിക്കുക",
    entries: " രേഖകൾ",
    monthTitle: "എല്ലാ ദിവസങ്ങളും",
    week: "1 ആഴ്ച",
    month: "1 മാസം",
    off: "ഫലം ഇല്ല",
    normal: "ശരി",
    extra: "കൂടുതൽ",
    notLogged: "രേഖപ്പെടുത്തിയിട്ടില്ല",
    tabletTaken: "ഗുളിക കഴിച്ചു",
    tabletNotConfirmed: "ഗുളികയുടെ സമയം ഉറപ്പിച്ചിട്ടില്ല",
    noDataYet: "ഇതുവരെ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല. തുടങ്ങാൻ ഹോം സ്ക്രീനിൽ ഒരു നിറം അമർത്തുക.",

    fillPrompt: function (hour) {
      return hour + " ന് നിങ്ങൾക്ക് എങ്ങനെയായിരുന്നു?";
    },
    fillHint: "ഏത് മണിക്കൂറും പൂരിപ്പിക്കാനോ മാറ്റാനോ അതിൽ അമർത്തുക.",
    clearHour: "ഈ മണിക്കൂർ ഒഴിവാക്കുക",
    today: "ഇന്ന്",
    yesterday: "ഇന്നലെ",
    restOfDayTitle: "ദിവസത്തിന്റെ ബാക്കി",
    restOfDayFine: "ഞാൻ പൂരിപ്പിക്കാത്ത മണിക്കൂറുകൾ കുഴപ്പമില്ലായിരുന്നു",
    restOfDayNote:
      "ഇതുവരെയുള്ള എല്ലാ ഒഴിഞ്ഞ മണിക്കൂറുകളും പച്ചയാക്കും. ഇത് ശരിയാണെങ്കിൽ മാത്രം അമർത്തുക — ഒഴിഞ്ഞ മണിക്കൂർ തെറ്റായ നിറത്തേക്കാൾ ഭേദമാണ്.",
    cancelFill: "വേണ്ട",
    pastDayReadOnly: "ഈ ദിവസം കഴിഞ്ഞു, ഇനി മാറ്റാൻ കഴിയില്ല.",

    endOfDayKicker: "ഉറങ്ങുന്നതിന് മുമ്പ്",
    endOfDayTitle: "ഇന്നത്തെ ബാക്കി മണിക്കൂറുകൾ പൂരിപ്പിക്കണോ?",
    endOfDayBody: "ഇന്നത്തെ ചില മണിക്കൂറുകൾ ഇപ്പോഴും ഒഴിഞ്ഞുകിടക്കുന്നു. ഓർമ്മയുള്ളപ്പോൾ തന്നെ പൂരിപ്പിക്കാം.",
    endOfDayGo: "ഇന്ന് പൂരിപ്പിക്കുക",
    endOfDaySkip: "ഒഴിഞ്ഞു കിടക്കട്ടെ",

    languageTitle: "ഏത് ഭാഷ?",
    languageHint: "ഇത് പിന്നീട് മെനുവിൽ നിന്ന് മാറ്റാം."
  };

  LANGS.bn = {
    langName: "বাংলা",
    langEn: "Bengali",

    offName: "লাল — ওষুধের কাজ হচ্ছে না",
    offShort: "লাল",
    offDesc: "ধীরগতি, কাঁপুনি, শক্ত হয়ে যাওয়া বা আটকে যাওয়া",
    offFull:
      "শক্ত হয়ে যাওয়া বা আটকে যাওয়ার মতো। চেয়ার বা বিছানা থেকে উঠতে কষ্ট। নড়াচড়া ধীর। অথবা কাঁপুনি।",
    offExample: "পা যেন মেঝেতে আটকে আছে মনে হয়, বা উঠতে কারও সাহায্য লাগে। সেটাই লাল।",

    onName: "সবুজ — ওষুধ কাজ করছে",
    onShort: "সবুজ",
    onDesc: "সহজে চলাফেরা ও কাজ",
    onFull: "আপনি উঠছেন, হাঁটছেন এবং নিজের কাজ সহজেই করছেন। কারও সাহায্য লাগছে না।",
    onExample: "এটি আপনার ভালো সময়। দিনের বেশির ভাগ সময় সবুজ থাকা উচিত।",

    extraName: "নীল — খুব বেশি নড়াচড়া",
    extraShort: "নীল",
    extraDesc: "অবাঞ্ছিত বাড়তি নড়াচড়া",
    extraFull: "আপনার নিয়ন্ত্রণের বাইরে বাড়তি নড়াচড়া, যা আপনার কাজে বাধা দেয়।",
    extraExample: "শরীর, মাথা বা হাত নিজে থেকেই নড়ে, ফলে খাওয়া বা স্থির হয়ে বসা কঠিন হয়।",

    next: "পরবর্তী",

    alarmsTitle: "অ্যালার্ম বাজবে",
    alarmsLine1: "আপনি জেগে থাকা অবস্থায় প্রতি ঘণ্টায় — একটি রঙ জিজ্ঞাসা করার জন্য।",
    alarmsLine2: "এবং প্রতিটি ওষুধের সময়ে, সেই ওষুধ খাওয়ার কথা মনে করিয়ে দিতে।",
    alarmsLine3: "অ্যালার্মের অপেক্ষা না করে যেকোনো সময় রঙ চাপতে পারেন।",

    wakingTitle: "আপনি কখন জেগে থাকেন?",
    wakeStart: "আমি উঠি",
    wakeEnd: "আমি ঘুমাতে যাই",

    logQuestion: "এখন আপনার কেমন লাগছে?",
    menu: "মেনু",
    selectedPrefix: "বেছে নেওয়া হয়েছে ",
    confirm: "নিশ্চিত করুন",
    changeAnswer: "উত্তর বদলান",
    saved: "সংরক্ষিত হয়েছে",
    lockLine: function (colour, mins) {
      return "আপনি এইমাত্র " + colour + " লিখেছেন। " + mins + " মিনিট পরে আবার লিখতে পারবেন।";
    },
    recordedAt: function (colour, time) {
      return colour + " — " + time + " এ লেখা হয়েছে";
    },

    checkIn: " · যাচাই",
    notNow: "এখন নয়",
    tabletTime: " · ওষুধের সময়",
    takeTablet: function (dose, name) {
      return name + " — " + dose + " খান";
    },
    tabletBody: "এখনই, এই সময়েই খান। প্রতিদিন একই সময় রাখুন।",
    haveTaken: "আমি খেয়ে নিয়েছি",
    snooze: "১০ মিনিট পরে মনে করিয়ে দিন",
    lockedDuringAlarm: "আপনি এইমাত্র একটি রঙ লিখেছেন, তাই এখন কিছু করার নেই।",
    dismiss: "বন্ধ করুন",

    menuColours: "রঙের অর্থ",
    coloursTitle: "রঙের অর্থ",
    menuWaking: "জেগে থাকার সময়",
    menuProfile: "আপনার তথ্য",
    menuTablets: "ওষুধের সময় বদলান",
    menuToday: "আজকের রিপোর্ট",
    menuMonth: "সব দিন — চার্ট",
    menuExport: "ব্যাকআপ ফাইল সংরক্ষণ করুন",
    menuImport: "ব্যাকআপ ফাইল খুলুন",
    menuLanguage: "ভাষা",
    backToLogging: "আবার লেখায় ফিরুন",
    backToMenu: "মেনুতে ফিরুন",
    noProfile: "রোগীর তথ্য এখনও ভরা হয়নি",

    profileTitle: "আপনার তথ্য",
    pName: "নাম",
    pAge: "বয়স",
    pYear: "কোন বছরে ধরা পড়ে",
    pDoctor: "ডাক্তার",
    pNotes: "আর কিছু লেখার থাকলে",

    todayTitle: "আজকের রিপোর্ট",
    hourByHour: "ঘণ্টা ধরে",
    tabletSchedule: "ওষুধের সময়",
    markTaken: "খেয়েছি",
    takenAt: function (t) {
      return t + " এ খাওয়া হয়েছে";
    },
    print: "প্রিন্ট / সংরক্ষণ",
    entries: " টি নথি",
    monthTitle: "সব দিন",
    week: "১ সপ্তাহ",
    month: "১ মাস",
    off: "কাজ হচ্ছে না",
    normal: "ঠিক আছে",
    extra: "বেশি",
    notLogged: "লেখা হয়নি",
    tabletTaken: "ওষুধ খাওয়া হয়েছে",
    tabletNotConfirmed: "ওষুধের সময় নিশ্চিত নয়",
    noDataYet: "এখনও কিছু লেখা হয়নি। শুরু করতে হোম স্ক্রিনে একটি রঙ চাপুন।",

    fillPrompt: function (hour) {
      return hour + " এ আপনার কেমন ছিল?";
    },
    fillHint: "যেকোনো ঘণ্টা ভরতে বা বদলাতে সেটির উপর চাপুন।",
    clearHour: "এই ঘণ্টাটি খালি করুন",
    today: "আজ",
    yesterday: "গতকাল",
    restOfDayTitle: "দিনের বাকি অংশ",
    restOfDayFine: "যে ঘণ্টাগুলো ভরিনি সেগুলো ভালোই ছিল",
    restOfDayNote:
      "এখন পর্যন্ত সব খালি ঘণ্টা সবুজ করে দেবে। সত্যি হলে তবেই চাপুন — খালি ঘণ্টা ভুল রঙের চেয়ে ভালো।",
    cancelFill: "থাক",
    pastDayReadOnly: "এই দিনটি শেষ হয়ে গেছে, আর বদলানো যাবে না।",

    endOfDayKicker: "ঘুমানোর আগে",
    endOfDayTitle: "আজকের বাকি ঘণ্টাগুলো ভরবেন?",
    endOfDayBody: "আজকের কিছু ঘণ্টা এখনও খালি। মনে থাকতে থাকতেই ভরে নিতে পারেন।",
    endOfDayGo: "আজ ভরুন",
    endOfDaySkip: "খালি থাকতে দিন",

    languageTitle: "কোন ভাষা?",
    languageHint: "এটি পরে মেনু থেকে বদলানো যাবে।"
  };

  // Active strings. Replaced wholesale by setLang(); never reference LANGS.en
  // directly outside setLang, or a translated build will show English.
  var S = LANGS.en;

  var STATES = ["off", "on", "extra"];

  var STATE_META = {};

  function buildStateMeta() {
    STATE_META = {
      off: { name: S.offName, short: S.offShort, desc: S.offDesc, full: S.offFull, art: "assets/off-freezing.png" },
      on: { name: S.onName, short: S.onShort, desc: S.onDesc, full: S.onFull, art: "assets/on-standing.png" },
      extra: { name: S.extraName, short: S.extraShort, desc: S.extraDesc, full: S.extraFull, art: "assets/extra-dyskinesia.png" }
    };
  }

  function setLang(code) {
    var base = LANGS.en;
    var over = LANGS[code] || {};
    // Merge rather than swap, so an untranslated key falls back to English.
    S = Object.keys(base).reduce(function (acc, k) {
      acc[k] = Object.prototype.hasOwnProperty.call(over, k) ? over[k] : base[k];
      return acc;
    }, {});
    buildStateMeta();
    document.documentElement.lang = code;
    // Indic scripts fall back to the phone's own fonts — the bundled Latin
    // faces carry no Devanagari or Gujarati glyphs.
    document.documentElement.setAttribute("data-lang", code);
  }

  buildStateMeta();

  /* Which colours the patient is offered.
   *
   * Two by default. Most patients do not have troublesome dyskinesia, and a
   * third button is a cost every patient pays to serve a minority — more to
   * explain, more to mis-tap, and a state they may log wrongly because they
   * never really understood it. The doctor turns blue on when dyskinesia is
   * the question being asked.
   *
   * Existing 'extra' entries still render on the chart even when the button is
   * hidden; turning the question off must not erase answers already given. */
  function activeStates() {
    return data.settings.trackDyskinesia ? STATES : ["off", "on"];
  }

  /* What the reports show. The active states, plus any state already present in
   * the log. Turning the blue button off must not hide dyskinesia a patient
   * already recorded — that would quietly delete evidence from the chart the
   * doctor is reading. */
  function reportStates() {
    var active = activeStates();
    return STATES.filter(function (s) {
      return (
        active.indexOf(s) !== -1 ||
        (data.entries || []).some(function (e) {
          return e.state === s;
        })
      );
    });
  }

  // Old colour-named values, for migrating data written before v7.
  var LEGACY_STATE = { red: "off", yellow: "on", green: "extra" };

  /* The clinical words stay in English in every language. "On", "off" and
   * "dyskinesia" are what the doctor says across the desk and what the family
   * repeats at home — they are shared vocabulary, not jargon to be translated
   * away. Keeping them on the button also means a doctor can read a patient's
   * phone in a script they do not know. */
  var CLINICAL_EN = { off: "OFF", on: "ON", extra: "DYSKINESIA" };

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
   * Resolve what each (day, hour) actually shows.
   *
   * Real-time entries are point observations: two different colours inside one
   * hour is real information and renders as a split (§9). An entry with
   * `edit` is different — it is the patient asserting "that hour was X",
   * filled in after the fact, so it supersedes everything else in that hour
   * rather than adding to it. The superseded rows stay in the log; the log is
   * still append-only. Nothing is ever rewritten, only outranked.
   *
   * Returns { "<dayKey>": { "<hour>": {colours:[…], late:bool} } }
   */
  function resolveHours(entries) {
    var byDayHour = {};
    (entries || []).forEach(function (e) {
      var k = dayKey(e.ts);
      var h = new Date(e.ts).getHours();
      if (!byDayHour[k]) byDayHour[k] = {};
      if (!byDayHour[k][h]) byDayHour[k][h] = [];
      byDayHour[k][h].push(e);
    });

    var out = {};
    Object.keys(byDayHour).forEach(function (k) {
      out[k] = {};
      Object.keys(byDayHour[k]).forEach(function (h) {
        var list = byDayHour[k][h];
        var edits = list.filter(function (e) {
          return e.edit;
        });
        if (edits.length) {
          // Latest assertion wins. Appended in order, so the last one is newest.
          var winner = edits[edits.length - 1];
          out[k][h] = { colours: winner.state ? [winner.state] : [] };
        } else {
          var seen = STATES.filter(function (c) {
            return list.some(function (e) {
              return e.state === c;
            });
          });
          // One square, one colour. Where an hour holds more than one state the
          // WORST wins — off over dyskinesia over on. Losing an off period
          // inside an otherwise good hour is the error that changes a
          // prescription; losing a good half-hour inside a bad one is not.
          var priority = ["off", "extra", "on"];
          var winner2 = priority.filter(function (c) {
            return seen.indexOf(c) !== -1;
          })[0];
          out[k][h] = { colours: winner2 ? [winner2] : [] };
        }
      });
    });
    return out;
  }

  /** One effective entry per resolved (day, hour) — what the counts should use. */
  function effectiveEntries(entries) {
    var resolved = resolveHours(entries);
    var out = [];
    Object.keys(resolved).forEach(function (k) {
      Object.keys(resolved[k]).forEach(function (h) {
        resolved[k][h].colours.forEach(function (c) {
          out.push({ state: c, dayKey: k, hour: +h, late: resolved[k][h].late });
        });
      });
    });
    return out;
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

    var resolved = resolveHours(data.entries);

    var byDay = {};
    (data.entries || []).forEach(function (e) {
      var k = dayKey(e.ts);
      if (k < cutoffKey) return;
      if (!byDay[k]) byDay[k] = { key: k, ts: e.ts, hours: resolved[k] || {} };
      if (e.ts < byDay[k].ts) byDay[k].ts = e.ts;
    });

    // Today always shows, even with nothing logged yet.
    if (!byDay[todayKey]) byDay[todayKey] = { key: todayKey, ts: now, hours: {} };

    var days = Object.keys(byDay).sort();
    return days.map(function (k) {
      var day = byDay[k];
      var cells = hours.map(function (h) {
        var cell = day.hours[h];
        return {
          hour: h,
          colours: cell ? cell.colours : [],
          late: cell ? cell.late : false
        };
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
    var counts = { off: 0, on: 0, extra: 0 };
    var total = 0;
    // Count resolved hours, not raw rows — otherwise a corrected hour would be
    // counted twice, once as its old colour.
    effectiveEntries(data.entries).forEach(function (e) {
      if (!set[e.dayKey]) return;
      if (counts[e.state] === undefined) return;
      counts[e.state]++;
      total++;
    });
    return {
      counts: counts,
      total: total,
      pct: {
        off: total ? Math.round((counts.off / total) * 100) : 0,
        on: total ? Math.round((counts.on / total) * 100) : 0,
        extra: total ? Math.round((counts.extra / total) * 100) : 0
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

    // End-of-day sweep, roughly an hour before the stated bedtime — 9:20pm for
    // the default 22:00. The last chance to complete the day while recall is
    // still same-day; after midnight the day is closed deliberately.
    //
    // Offset clear of the top of the hour on purpose: at exactly 9pm the hourly
    // check-in wins, and the patient would get two prompts seconds apart. The
    // hourly asks what is true right now, which is better data than recall, so
    // it keeps priority and the sweep follows later in the hour.
    var sweepMins = hhmmToMinutes(data.waking.end) - 40;
    var nowMins2 = hour * 60 + minute;
    if (sweepMins > 0 && nowMins2 >= sweepMins && nowMins2 < sweepMins + ALARM_WINDOW_MINUTES) {
      var ekey = "e" + dk;
      if (!data.fired[ekey] && countEmptyHoursToday(data, now) > 0) {
        return { kind: "endOfDay", key: ekey, empty: countEmptyHoursToday(data, now) };
      }
    }

    return null;
  }

  /** Waking hours already past today that still hold nothing. */
  function countEmptyHoursToday(data, now) {
    var dk = dayKey(now);
    var resolved = resolveHours(data.entries)[dk] || {};
    var nowHour = new Date(now).getHours();
    return wakingHours(data.waking).filter(function (h) {
      return h <= nowHour && !(resolved[h] && resolved[h].colours.length);
    }).length;
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
      //
      // navMode defaults ON as of v6: tested on a phone and adopted, superseding
      // the original "no navigation bar" and "history never on the home screen"
      // rules. The toggle stays, so it can be turned off for a patient who
      // mis-taps it.
      settings: { navMode: true, lang: "en", trackDyskinesia: false }
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
    // A cleared hour is recorded as an edit carrying state:null, so null is
    // valid but only on an edit row.
    //
    // Rows written before v7 carry `color: "red"|"yellow"|"green"`. Translate
    // them to the clinical vocabulary on load; a patient's history survives the
    // palette change untouched.
    base.entries = Array.isArray(d.entries) ? d.entries.reduce(function (acc, e) {
      if (!e || typeof e.ts !== "number") return acc;
      var row = { ts: e.ts };
      if (e.state !== undefined) row.state = e.state;
      else if (e.color !== undefined) row.state = e.color === null ? null : LEGACY_STATE[e.color];
      else return acc;
      if (row.state !== null && STATES.indexOf(row.state) === -1) return acc;
      if (row.state === null && !e.edit) return acc;
      if (e.enteredTs) row.enteredTs = e.enteredTs;
      if (e.edit) row.edit = true;
      acc.push(row);
      return acc;
    }, []) : [];
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
      if (typeof d.settings.lang === "string" && LANGS[d.settings.lang]) base.settings.lang = d.settings.lang;
      if (typeof d.settings.trackDyskinesia === "boolean") base.settings.trackDyskinesia = d.settings.trackDyskinesia;
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
  var view = data.tablets.length ? "log" : "language";
  var fromMenu = false;
  var selected = null; // colour picked but not yet confirmed
  var alarm = null; // active alarm payload
  var alarmSelected = null;
  var toast = null;
  var toastTimer = null;
  var chartRange = 7;
  var draft = null; // in-progress setup edits
  var reportOffset = 0; // 0 = today; earlier days are read-only
  var fillHour = null; // hour currently being filled in, or null
  var wizard = null; // staff setup wizard: array of {name, dose, times[]}
  var setupStage = "intro";
  var setupIdx = 0;
  var langReturn = null; // where to return after changing language mid-flow

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
  function logState(state) {
    var now = Date.now();
    data.entries.push({ state: state, ts: now });
    data.lockUntil = now + LOCK_MINUTES * 60000;
    save();
    showToast(S.recordedAt(STATE_META[state].short, clockLabel(now)));
  }

  /* Filling in an hour appends an assertion; it never rewrites a row. `ts` is
   * the hour being described, `enteredTs` is when the patient actually said so,
   * and `edit` marks it as superseding whatever else sits in that hour. The
   * gap between ts and enteredTs is what tells the doctor this was recalled
   * rather than logged live. Same day only — overnight recall is not reliable
   * enough to be worth recording. */
  function assertHour(hour, state) {
    var now = Date.now();
    var slot = new Date(now);
    slot.setHours(hour, 0, 0, 0);
    if (slot.getTime() > now) return false; // never the future
    data.entries.push({
      state: state,
      ts: slot.getTime(),
      enteredTs: now,
      edit: true
    });
    save();
    return true;
  }

  function recordTake(name, dose, time) {
    data.takes.push({ name: name, dose: dose, time: time || null, ts: Date.now() });
    save();
  }

  /* ---------- Screen builders ---------- */

  /* The doctor's intro video was removed in v10: it taught three colours and the
   * previous palette, so it actively contradicted the app a patient was holding.
   * Onboarding now runs language -> the colour screens directly. Re-recording it
   * against the current two-colour default is a separate job; the script lives in
   * explainer-video.md. */

  /** One colour per screen during onboarding — one idea at a time (§2.7). */
  function screenStep(colour, nextView) {
    var m = STATE_META[colour];
    return (
      '<div class="step pop">' +
      '<div class="panel panel-' + colour + '">' +
      '<img class="step-art" src="' + m.art + '" alt="" />' +
      "<h2>" + esc(m.name) + "</h2>" +
      '<p class="definition">' + esc(m.full) + "</p>" +
      '<p class="example">' + esc(exampleFor(colour)) + "</p>" +
      "</div>" +
      '<div style="margin-top:18px">' +
      '<button class="btn-primary" data-act="go" data-view="' + nextView + '">' + S.next + "</button>" +
      "</div></div>"
    );
  }

  /* Revisiting from the menu: every colour in play on one scrollable screen.
   * Onboarding keeps one-idea-per-screen (§2.7) — a newly-diagnosed patient
   * meeting the states for the first time is a different job from a patient
   * checking "which one was green again?". */
  function screenColours() {
    return (
      '<div class="pop">' +
      "<h1>" + S.coloursTitle + "</h1>" +
      activeStates().map(function (c) {
        var m = STATE_META[c];
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

  /* Language is asked first, before anything else is read — a patient who does
   * not read English cannot be expected to work out that the menu has a
   * language switch. Each option is written in its own script, so it needs no
   * translation to be found. */
  function screenLanguage() {
    return (
      '<div class="step pop">' +
      "<h1>" + S.languageTitle + "</h1>" +
      // Two columns: eight languages in one column overflows a small phone, and
      // this screen must not scroll — a patient who cannot read the list cannot
      // be expected to discover that it continues below the fold.
      '<div class="lang-grid">' +
      Object.keys(LANGS)
        .map(function (code) {
          var on = data.settings.lang === code;
          return (
            '<button class="lang-btn' + (on ? " lang-on" : "") + '" data-act="set-lang" data-code="' +
            code + '" lang="' + code + '">' +
            '<span class="lang-native">' + esc(LANGS[code].langName) + "</span>" +
            (LANGS[code].langEn !== LANGS[code].langName
              ? '<span class="lang-en">' + esc(LANGS[code].langEn) + "</span>"
              : "") +
            "</button>"
          );
        })
        .join("") +
      "</div>" +
      '<p class="muted center" style="margin-top:12px;font-size:15px">' + esc(S.languageHint) + "</p>" +
      '<div style="margin-top:14px">' +
      '<button class="btn-primary" data-act="go" data-view="' +
      (langReturn || (fromMenu ? "menu" : "stepOff")) + '">' +
      (langReturn || fromMenu ? S.backToMenu : S.next) + "</button></div>" +
      "</div>"
    );
  }

  /* A language button on every patient-facing screen. The language question is
   * asked once at the start, but the wrong answer there — or a patient handed
   * the phone after someone else set it up — leaves them stuck reading a script
   * they cannot. This is the way out, from wherever they are. */
  function langBar() {
    return (
      '<div class="lang-bar">' +
      '<button data-act="open-language" aria-label="change language">' +
      "🌐 " + esc(S.langEn) +
      "</button></div>"
    );
  }

  function exampleFor(colour) {
    return colour === "off" ? S.offExample : colour === "on" ? S.onExample : S.extraExample;
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
      '<button class="btn-primary" data-act="go" data-view="setup">' + S.next + "</button>" +
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

  /* ---------- Staff setup wizard ----------
   *
   * Filled in by the doctor or nurse before the phone reaches the patient, so
   * it optimises for someone entering a regimen they already know, quickly,
   * across a desk — not for a tremoring patient discovering the app.
   *
   * One question per screen, one tablet at a time: name, dose, how many times a
   * day, then the actual clock times. The old all-cards-at-once form asked
   * staff to parse the whole structure before typing anything, which is the
   * wrong shape for dictation from a prescription.
   */
  var SETUP_STAGES = ["intro", "waking", "name", "dose", "freq", "times", "more", "dysk", "review"];

  function blankTablet() {
    return { name: "", dose: "1 tablet", times: ["08:00"] };
  }

  function wizardTablet() {
    if (!wizard[setupIdx]) wizard[setupIdx] = blankTablet();
    return wizard[setupIdx];
  }

  /** Sensible default clock times for n doses a day, spread across waking hours. */
  function suggestTimes(n) {
    var start = hhmmToMinutes(data.waking.start) + 60;
    var end = hhmmToMinutes(data.waking.end) - 60;
    if (n === 1) return [minutesToHhmm(start)];
    var span = Math.max(0, end - start);
    var out = [];
    for (var i = 0; i < n; i++) {
      // round to the nearest half hour — staff enter tidy times, not 09:47
      var m = start + Math.round((span * i) / (n - 1) / 30) * 30;
      out.push(minutesToHhmm(m));
    }
    return out;
  }

  function wizardStep(title, hint, body, opts) {
    opts = opts || {};
    return (
      '<div class="pop wizard">' +
      '<div class="wiz-pos">' + esc(opts.pos || "") + "</div>" +
      "<h1>" + esc(title) + "</h1>" +
      (hint ? '<p class="muted">' + esc(hint) + "</p>" : "") +
      body +
      '<div class="wiz-foot">' +
      (opts.hideBack
        ? ""
        : '<button class="btn-secondary" data-act="setup-back" style="flex:1">' + S.backStep + "</button>") +
      (opts.hideNext
        ? ""
        : '<button class="btn-primary" data-act="setup-next" style="flex:2">' +
          esc(opts.nextLabel || S.nextStep) + "</button>") +
      "</div></div>"
    );
  }

  function screenSetup() {
    if (!wizard) wizard = data.tablets.length ? tabletsToWizard(data.tablets) : [blankTablet()];
    var tab = wizardTablet();
    var n = setupIdx + 1;
    var pos = S.tabletNumber(n);

    switch (setupStage) {
      case "intro":
        return wizardStep(
          S.staffTitle,
          S.staffIntro,
          '<div class="card"><p style="margin:0">' + esc(S.setupFootnote) + "</p></div>",
          { hideBack: true, nextLabel: S.staffBegin }
        );

      case "waking":
        // Asked before the tablets, because it also decides the suggested
        // dose times further down the wizard.
        return wizardStep(S.wakingTitle, S.wakingStaffHint,
          '<div class="card">' +
          '<div class="field"><label>' + S.wakeStart + "</label>" +
          '<input type="time" data-field="wakeStart" value="' + esc(data.waking.start) + '" /></div>' +
          '<div class="field"><label>' + S.wakeEnd + "</label>" +
          '<input type="time" data-field="wakeEnd" value="' + esc(data.waking.end) + '" /></div>' +
          "</div>",
          {});

      case "name":
        return wizardStep(S.askName, S.askNameHint,
          '<div class="card">' +
          '<input type="text" data-field="wiz-name" value="' + esc(tab.name) +
          '" placeholder="Syndopa 110" autocomplete="off" />' +
          '<div class="section-label">' + S.presetsLabel + "</div>" +
          '<div class="quick-doses">' +
          TABLET_PRESETS.map(function (p, i) {
            return (
              '<button data-act="wiz-preset" data-i="' + i + '" style="min-height:52px;text-align:left;padding:8px 12px">' +
              "<strong>" + esc(p.name) + "</strong></button>"
            );
          }).join("") +
          "</div></div>",
          { pos: pos });

      case "dose":
        return wizardStep(S.askDose, S.askDoseHint,
          '<div class="card">' +
          '<input type="text" data-field="wiz-dose" value="' + esc(tab.dose) + '" placeholder="1 tablet" />' +
          '<div class="quick-doses">' +
          S.quickDoses.map(function (q) {
            return '<button data-act="wiz-dose-quick" data-val="' + esc(q) + '">' + esc(q) + "</button>";
          }).join("") +
          "</div></div>",
          { pos: pos });

      case "freq":
        return wizardStep(S.askFreq, S.askFreqHint,
          '<div class="card"><div class="freq-grid">' +
          [1, 2, 3, 4, 5, 6].map(function (f) {
            return (
              '<button class="freq-btn' + (tab.times.length === f ? " on" : "") +
              '" data-act="wiz-freq" data-f="' + f + '">' + f + "</button>"
            );
          }).join("") +
          "</div></div>",
          { pos: pos });

      case "times":
        return wizardStep(S.askTimes, S.askTimesHint,
          '<div class="card">' +
          tab.times.map(function (tm, i) {
            return (
              '<div class="field"><label>' + esc(S.timeN(i + 1)) + "</label>" +
              '<input type="time" data-field="wiz-time" data-i="' + i + '" value="' + esc(tm) + '" /></div>'
            );
          }).join("") +
          "</div>",
          { pos: pos });

      case "more":
        return wizardStep(S.askMore, "",
          '<div class="card"><p style="margin:0 0 4px"><strong>' + esc(tab.name || S.tabletNumber(n)) +
          "</strong></p>" +
          '<p class="muted" style="margin:0">' + esc(tab.dose) + " · " +
          tab.times.map(function (x) { return scheduleLabel(x); }).join(", ") + "</p></div>" +
          '<div class="stack" style="margin-top:14px">' +
          '<button class="btn-secondary" data-act="wiz-add-tablet">' + S.addAnotherTablet + "</button>" +
          "</div>",
          { pos: pos, nextLabel: S.noMoreTablets });

      case "dysk":
        return wizardStep(S.askDyskinesia, "",
          '<div class="card"><p style="margin:0">' + esc(S.dyskinesiaExplain) + "</p></div>" +
          '<div class="stack" style="margin-top:14px">' +
          '<button class="btn-secondary" data-act="wiz-dysk" data-v="1">' + S.dyskinesiaYes + "</button>" +
          '<button class="btn-secondary" data-act="wiz-dysk" data-v="0">' + S.dyskinesiaNo + "</button>" +
          "</div>",
          { hideNext: true });

      default:
        return setupReview();
    }
  }

  /** Wizard shape -> stored shape. */
  function wizardToTablets(w) {
    return w
      .map(function (t) {
        return {
          name: (t.name || "").trim(),
          doses: t.times.map(function (tm) {
            return { time: tm, dose: t.dose || "" };
          })
        };
      })
      .filter(function (t) {
        return t.name && t.doses.length;
      });
  }

  function tabletsToWizard(tabs) {
    return tabs.map(function (t) {
      return {
        name: t.name,
        dose: (t.doses[0] && t.doses[0].dose) || "1 tablet",
        times: t.doses.map(function (d) {
          return d.time;
        })
      };
    });
  }

  function setupReview() {
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
    var m = STATE_META[colour];
    return (
      '<button class="colour-btn ' + colour + '" data-act="' + act + '" data-state="' + colour + '">' +
      '<img src="' + m.art + '" alt="" />' +
      "<span><span class=\"name\">" + esc(m.short) +
      ' <span class="clinical">' + CLINICAL_EN[colour] + "</span></span>" +
      '<span class="desc">' + esc(m.desc) + "</span></span>" +
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
      byHour[h][e.state] = true;
    });
    return (
      '<div class="today-strip">' +
      '<div class="section-label" style="margin:0 0 6px">' + S.todayAtAGlance + "</div>" +
      '<div class="today-strip-cells">' +
      hours
        .map(function (h) {
          var present = STATES.filter(function (c) {
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
      var colour = last ? STATE_META[last.state].short.toLowerCase() : "a colour";
      body =
        '<div class="panel panel-' + (last ? last.state : "accent") + ' selected-panel pop" style="flex:1 1 auto;display:flex;flex-direction:column;justify-content:center">' +
        "<h2>" + S.saved + "</h2>" +
        '<p style="font-size:20px">' + esc(S.lockLine(colour, lockMinutesLeft(data.lockUntil, now))) + "</p>" +
        "</div>";
    } else if (selected) {
      var m = STATE_META[selected];
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
        activeStates().map(function (c) {
          return colourButton(c, "select");
        }).join("") +
        "</div>";
    }

    var nav = data.settings.navMode;
    // Flagged so the CSS can shed chrome when three buttons and a short screen
    // would otherwise push them under the 132px floor.
    var three = activeStates().length > 2;
    return (
      '<div class="log-screen' + (nav ? " with-nav" : "") + (three ? " three" : "") + '">' +
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
    var sub =
      (data.profile.name ? esc(data.profile.name) : S.noProfile) +
      ' <span style="opacity:0.6">· ' + APP_VERSION + "</span>";
    var canEnable = window.Notification && Notification.permission === "default";
    return (
      '<div class="pop">' +
      "<h1>" + S.menu + "</h1>" +
      '<p class="muted">' + sub + "</p>" +
      '<button class="btn-menu" data-act="go" data-view="colours">' + S.menuColours + "</button>" +
      '<button class="btn-menu" data-act="go" data-view="language">' + S.menuLanguage +
      ' <span style="opacity:0.6">· ' + esc(S.langName) + "</span></button>" +
      '<button class="btn-menu" data-act="toggle-dysk">' + S.menuDyskinesia +
      ' <span style="opacity:0.6">· ' +
      (data.settings.trackDyskinesia ? S.dyskinesiaOn : S.dyskinesiaOff) + "</span></button>" +
      '<button class="btn-menu" data-act="go" data-view="waking">' + S.menuWaking + "</button>" +
      '<button class="btn-menu" data-act="go" data-view="profile">' + S.menuProfile + "</button>" +
      '<button class="btn-menu" data-act="go" data-view="setup">' + S.menuTablets + "</button>" +
      '<button class="btn-menu" data-act="go" data-view="today">' + S.menuToday + "</button>" +
      '<button class="btn-menu" data-act="go" data-view="month">' + S.menuMonth + "</button>" +
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
    var viewing = now - reportOffset * 86400000;
    var dk = dayKey(viewing);
    var isToday = reportOffset === 0;
    var hours = wakingHours(data.waking);
    var resolved = resolveHours(data.entries)[dk] || {};

    var counts = { off: 0, on: 0, extra: 0 };
    var logged = 0;
    hours.forEach(function (h) {
      if (!resolved[h] || !resolved[h].colours.length) return;
      resolved[h].colours.forEach(function (c) {
        if (counts[c] !== undefined) counts[c]++;
      });
      logged++;
    });

    var d = new Date(viewing);
    var dayName =
      reportOffset === 0 ? S.today : reportOffset === 1 ? S.yesterday : "";
    var header =
      d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) +
      " · " + logged + S.entries +
      (data.profile.name ? " · " + esc(data.profile.name) : "");

    // Hours still to come today have not happened; they are not an omission.
    var nowHour = new Date(now).getHours();
    function isFuture(h) {
      return isToday && h > nowHour;
    }

    var strip = hours
      .map(function (h) {
        var cell = resolved[h];
        var present = cell ? cell.colours : [];
        var editable = isToday && !isFuture(h);
        var classes =
          "hour-cell" +
          (isFuture(h) ? " future" : "") +
          (fillHour === h ? " picking" : "") +
          (editable ? " hour-tap" : "");
        var inner = editable
          ? '<button class="' + classes + '" style="' + cellStyle(present) +
            '" data-act="pick-hour" data-hour="' + h + '" aria-label="' + hourLabel(h) + '"></button>'
          : '<div class="' + classes + '" style="' + cellStyle(present) + '"></div>';
        return "<div>" + inner + '<div class="hour-label">' + hourLabel(h) + "</div></div>";
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

    // The editor sits under the strip so the hour being changed stays visible.
    var editor = "";
    if (isToday && fillHour !== null) {
      var existing = resolved[fillHour];
      editor =
        '<div class="card pop" style="margin-top:12px">' +
        '<h2 style="font-size:24px;margin-bottom:12px">' + esc(S.fillPrompt(hourLabel(fillHour))) + "</h2>" +
        '<div class="fill-choices">' +
        activeStates().map(function (c) {
          return (
            '<button class="fill-btn ' + c + '" data-act="fill-colour" data-state="' + c + '">' +
            esc(STATE_META[c].short) + "</button>"
          );
        }).join("") +
        "</div>" +
        (existing && existing.colours.length
          ? '<button class="btn-ghost" data-act="clear-hour" style="margin-top:10px">' + S.clearHour + "</button>"
          : "") +
        '<button class="btn-secondary" data-act="cancel-fill" style="margin-top:8px">' + S.cancelFill + "</button>" +
        "</div>";
    }

    // Bulk assertion — never a silent default. The patient states the empty
    // hours were fine; the app does not assume it on their behalf.
    var emptyPast = isToday
      ? hours.filter(function (h) {
          return !isFuture(h) && !(resolved[h] && resolved[h].colours.length);
        })
      : [];
    var restOfDay = emptyPast.length
      ? '<div class="section-label">' + S.restOfDayTitle + "</div>" +
        '<button class="btn-secondary" data-act="fill-rest">' + S.restOfDayFine + "</button>" +
        '<p class="muted" style="font-size:15px;margin-top:8px">' + S.restOfDayNote + "</p>"
      : "";

    return (
      '<div class="pop">' +
      "<h1>" + S.todayTitle + "</h1>" +
      '<div class="day-nav">' +
      '<button data-act="report-day" data-delta="1" aria-label="previous day">' + S.prevDay + "</button>" +
      '<span class="day-nav-label">' + esc(dayName) + "</span>" +
      '<button data-act="report-day" data-delta="-1"' + (isToday ? " disabled" : "") +
      ' aria-label="next day">' + S.nextDay + "</button>" +
      "</div>" +
      '<p class="muted">' + header + "</p>" +
      tilesHtml(counts) +
      '<div class="section-label">' + S.hourByHour + "</div>" +
      '<p class="muted" style="font-size:15px;margin:-4px 0 10px">' +
      (isToday ? S.fillHint : S.pastDayReadOnly) + "</p>" +
      '<div class="hour-strip">' + strip + "</div>" +
      editor +
      restOfDay +
      (schedule ? '<div class="section-label">' + S.tabletSchedule + "</div>" + schedule : "") +
      '<div class="stack" style="margin-top:18px">' +
      '<button class="btn-secondary" data-act="print">' + S.print + "</button>" +
      '<button class="btn-primary" data-act="go" data-view="menu">' + S.backToMenu + "</button>" +
      "</div></div>"
    );
  }

  /** Count/percentage tiles, limited to the states in play. */
  function tilesHtml(values, suffix) {
    var label = { off: S.off, on: S.normal, extra: S.extra };
    return (
      '<div class="tiles" style="grid-template-columns:repeat(' + reportStates().length + ',1fr)">' +
      reportStates()
        .map(function (s) {
          return (
            '<div class="tile ' + s + '"><span class="big">' + values[s] + (suffix || "") +
            '</span><span class="label">' + label[s] + "</span></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  /** Solid fill for the hour's state, or nothing when the hour is unlogged. */
  function cellStyle(colours) {
    if (!colours.length) return "";
    var vars = { off: "var(--off-fill)", on: "var(--on-fill)", extra: "var(--extra-fill)" };
    return "background:" + vars[colours[0]] + ";border-color:" + vars[colours[0]] + ";";
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
            return (
              '<div class="chart-cell" style="' + cellStyle(c.colours) +
              '" title="' + esc(title) + '"></div>'
            );
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

    /* One line, two marks. The colour names, "not logged" and the split square
     * were captioning things that are either self-evident or already known to
     * the doctor reading this; solid-versus-dashed is the only encoding here
     * that nothing on screen otherwise explains. Percentage tiles are gone for
     * the same reason — a screen of caption text pushes the squares themselves
     * off a phone. */
    /* The full key, kept OUT of the chart container so it reads as a separate
     * thing rather than a caption on the squares. On a phone it sits under the
     * chart; given the width of a tablet or a printed page it moves alongside. */
    var legend =
      '<div class="chart-key">' +
      reportStates()
        .map(function (s) {
          var label = { off: S.off, on: S.normal, extra: S.extra }[s];
          return '<span class="legend-item"><span class="swatch ' + s + '"></span>' + label + "</span>";
        })
        .join("") +
      '<span class="legend-item"><span class="swatch unlogged"></span>' + S.notLogged + "</span>" +
      '<span class="legend-item"><span class="swatch line" style="height:16px"></span>' +
      S.tabletTaken + "</span>" +
      '<span class="legend-item"><span class="swatch dashed" style="height:16px"></span>' +
      S.tabletNotConfirmed + "</span>" +
      "</div>";

    /* The chart owns this screen. No heading — the only thing worth looking at
     * is the squares, and a title just pushes them down. Every control lives in
     * one bar at the foot, and the standard navigation bar is suppressed here
     * (see NAV_VIEWS) so there is never a second bar competing with it. */
    return (
      '<div class="chart-screen pop">' +
      // No caption. It existed only to prove the week/month toggle was doing
      // something when sparse data made both ranges render the same rows; the
      // toggle now shows its own pressed state in the bar below, which says the
      // same thing without a line of text above the chart.
      (stats.total === 0 ? '<p class="muted">' + S.noDataYet + "</p>" : "") +
      '<div class="chart-middle">' +
      '<div class="chart-scroll"><div class="chart">' + head + body + "</div></div>" +
      legend +
      "</div>" +
      '<nav class="chart-bar">' +
      '<button data-act="range" data-days="7" aria-pressed="' + (chartRange === 7) + '">' + S.week + "</button>" +
      '<button data-act="range" data-days="30" aria-pressed="' + (chartRange === 30) + '">' + S.month + "</button>" +
      '<button data-act="print">' + S.print + "</button>" +
      '<button data-act="go" data-view="menu">' + S.menu + "</button>" +
      "</nav></div>"
    );
  }

  /* ---------- Alarm overlays ---------- */

  function overlayHtml() {
    if (!alarm) return "";
    var now = Date.now();

    if (alarm.kind === "endOfDay") {
      return (
        '<div class="overlay pop">' +
        '<div class="kicker">' + S.endOfDayKicker + "</div>" +
        "<h1>" + S.endOfDayTitle + "</h1>" +
        '<p class="center" style="font-size:19px">' + S.endOfDayBody + "</p>" +
        '<div class="stack" style="margin-top:8px">' +
        '<button class="btn-primary" data-act="end-of-day-go" style="min-height:70px">' + S.endOfDayGo + "</button>" +
        '<button class="btn-secondary" data-act="dismiss-alarm">' + S.endOfDaySkip + "</button>" +
        "</div></div>"
      );
    }

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
      var m = STATE_META[alarmSelected];
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
        activeStates().map(function (c) {
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
    stepOff: function () {
      return screenStep("off", "stepOn");
    },
    stepOn: function () {
      // Skip the blue screen entirely when dyskinesia is not being tracked —
      // explaining a colour the patient will never see is worse than useless.
      return screenStep("on", data.settings.trackDyskinesia ? "stepExtra" : "stepAlarms");
    },
    stepExtra: function () {
      return screenStep("extra", "stepAlarms");
    },
    stepAlarms: screenStepAlarms,
    language: screenLanguage,
    colours: screenColours,
    waking: screenWaking,
    setup: screenSetup,
    log: screenLog,
    menu: screenMenu,
    profile: screenProfile,
    today: screenToday,
    month: screenMonth
  };

  // Screens the nav bar may sit under. It must never appear during onboarding
  // or over a half-filled form, where a stray tap would discard typed timings.
  // The chart screen carries its own bar, so the standard navigation bar is
  // suppressed there — two bars stacked at the foot of a phone is one too many.
  var NAV_VIEWS = ["log", "today", "menu", "colours"];

  /* The chart is doctor-facing and already carries its own bar; the language
   * screen would be showing a button to itself. Everything else gets it. */
  var LANG_BAR_VIEWS = ["stepOff", "stepOn", "stepExtra", "stepAlarms", "waking",
                        "setup", "log", "colours", "today", "menu", "profile"];

  function render() {
    var builder = SCREENS[view] || screenLog;
    var showLangBar = LANG_BAR_VIEWS.indexOf(view) !== -1 && !alarm;
    var html = (showLangBar ? langBar() : "") + builder();
    if (data.settings.navMode && NAV_VIEWS.indexOf(view) !== -1 && !alarm) {
      html += navBar();
    }
    if (toast) html += '<div class="toast">' + esc(toast) + "</div>";
    html += overlayHtml();
    app.innerHTML = html;
    // Full-height screens subtract the bar, or they overflow by exactly its height.
    app.style.setProperty("--topbar", showLangBar ? "46px" : "0px");
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
        if (view === "language") langReturn = null;
        // Plain navigation must not clobber fromMenu (§7/§11.5).
        if (target === "setup" || target === "waking") draft = null;
        if (target === "setup") {
          wizard = null;
          setupIdx = 0;
          // From the menu the regimen already exists and needs editing, not
          // re-dictating, so land on the card view.
          setupStage = fromMenu && data.tablets.length ? "review" : "intro";
        }
        go(target);
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
        selected = el.getAttribute("data-state");
        render();
        break;

      case "unselect":
        selected = null;
        render();
        break;

      case "confirm":
        if (selected) {
          logState(selected);
          selected = null;
        }
        render();
        break;

      case "select-alarm":
        alarmSelected = el.getAttribute("data-state");
        render();
        break;

      case "unselect-alarm":
        alarmSelected = null;
        render();
        break;

      case "confirm-alarm":
        if (alarmSelected) {
          logState(alarmSelected);
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

      case "pick-hour":
        var picked = +el.getAttribute("data-hour");
        fillHour = fillHour === picked ? null : picked;
        render();
        break;

      case "fill-colour":
        if (fillHour !== null) {
          assertHour(fillHour, el.getAttribute("data-state"));
          showToast(S.recordedAt(STATE_META[el.getAttribute("data-state")].short, hourLabel(fillHour)));
          fillHour = null;
        }
        render();
        break;

      case "clear-hour":
        if (fillHour !== null) {
          assertHour(fillHour, null);
          fillHour = null;
        }
        render();
        break;

      case "cancel-fill":
        fillHour = null;
        render();
        break;

      case "fill-rest":
        var wh = wakingHours(data.waking);
        var res = resolveHours(data.entries)[dayKey(Date.now())] || {};
        var nowH = new Date().getHours();
        var filled = 0;
        wh.forEach(function (h) {
          if (h > nowH) return;
          if (res[h] && res[h].colours.length) return;
          if (assertHour(h, "on")) filled++;
        });
        showToast(filled ? S.restOfDayDone(filled) : S.restOfDayNothing);
        render();
        break;

      case "report-day":
        reportOffset = Math.max(0, reportOffset + +el.getAttribute("data-delta"));
        fillHour = null;
        render();
        break;

      case "end-of-day-go":
        alarm = null;
        reportOffset = 0;
        fillHour = null;
        go("today");
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
        wizard = null;
        setupIdx = 0;
        setupStage = "intro";
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

      case "setup-next":
        advanceWizard(1);
        break;

      case "setup-back":
        advanceWizard(-1);
        break;

      case "wiz-preset":
        var wp = TABLET_PRESETS[+el.getAttribute("data-i")];
        var wt = wizardTablet();
        wt.name = wp.name;
        wt.dose = wp.dose;
        wt.times = wp.times.slice();
        // A preset PREFILLS; it does not answer. Carry on through dose,
        // frequency and times so staff can change any of them — a patient's
        // real regimen rarely matches the common pattern exactly.
        setupStage = "dose";
        render();
        break;

      case "wiz-dose-quick":
        wizardTablet().dose = el.getAttribute("data-val");
        render();
        break;

      case "wiz-freq":
        var f = +el.getAttribute("data-f");
        var wtf = wizardTablet();
        if (wtf.times.length !== f) wtf.times = suggestTimes(f);
        setupStage = "times";
        render();
        break;

      case "wiz-add-tablet":
        setupIdx++;
        wizard[setupIdx] = blankTablet();
        setupStage = "name";
        render();
        break;

      case "wiz-dysk":
        data.settings.trackDyskinesia = el.getAttribute("data-v") === "1";
        save();
        setupStage = "review";
        draft = wizardToTablets(wizard);
        if (!draft.length) draft = null;
        render();
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

      case "open-language":
        langReturn = view;
        go("language");
        break;

      case "set-lang":
        data.settings.lang = el.getAttribute("data-code");
        save();
        setLang(data.settings.lang);
        render();
        break;

      case "toggle-dysk":
        data.settings.trackDyskinesia = !data.settings.trackDyskinesia;
        save();
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
    } else if (field === "wiz-name") {
      wizardTablet().name = el.value;
    } else if (field === "wiz-dose") {
      wizardTablet().dose = el.value;
    } else if (field === "wiz-time") {
      wizardTablet().times[+el.getAttribute("data-i")] = el.value;
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

  /* Move through the wizard. Validation is deliberately light — staff are
   * entering a regimen they already know, and blocking on an empty field mid-
   * dictation is more obstructive than a blank they can fix at the review. The
   * one thing enforced is a tablet name, since a nameless tablet cannot be
   * matched to a dose on the chart. */
  function advanceWizard(dir) {
    var i = SETUP_STAGES.indexOf(setupStage);
    if (dir > 0) {
      if (setupStage === "name" && !wizardTablet().name.trim()) return; // needs a name
      if (setupStage === "times") {
        setupStage = "more";
        render();
        return;
      }
      if (setupStage === "more") {
        setupStage = "dysk";
        render();
        return;
      }
      setupStage = SETUP_STAGES[Math.min(i + 1, SETUP_STAGES.length - 1)];
    } else {
      if (setupStage === "name" && setupIdx > 0) {
        // stepping back out of a second tablet returns to the previous one
        wizard.pop();
        setupIdx--;
        setupStage = "more";
        render();
        return;
      }
      setupStage = SETUP_STAGES[Math.max(i - 1, 0)];
    }
    render();
  }

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
  var PROTECTED = ["language", "stepOff", "stepOn", "stepExtra", "stepAlarms", "waking", "setup", "profile"];
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
          due.kind === "tablet"
            ? S.takeTablet(due.dose, due.name)
            : due.kind === "endOfDay"
            ? S.endOfDayTitle
            : S.logQuestion,
          due.kind === "tablet"
            ? S.tabletBody
            : due.kind === "endOfDay"
            ? S.endOfDayBody
            : S.alarmsLine1
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
      navigator.serviceWorker
        .register("service-worker.js")
        .then(function (reg) {
          // Ask for a new worker on every launch. Without this an installed PWA
          // can sit on an old build indefinitely and give no sign of it.
          reg.update();
          setInterval(function () {
            reg.update();
          }, 60 * 60 * 1000);
        })
        .catch(function () {
          /* offline support is a bonus, not a requirement */
        });

      // When a new worker takes over, reload once so the fresh shell is what the
      // patient is actually looking at. `hadController` keeps the very first
      // install (which claims immediately) from causing a pointless reload.
      var hadController = !!navigator.serviceWorker.controller;
      var reloaded = false;
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (!hadController || reloaded) return;
        reloaded = true;
        location.reload();
      });
    });
  }

  setLang(data.settings.lang);
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
      resolveHours: resolveHours,
      effectiveEntries: effectiveEntries,
      countEmptyHoursToday: countEmptyHoursToday,
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
      setLang("en");
      save();
      go("language");
    }
  };
})();
