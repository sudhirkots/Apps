(function () {
  "use strict";

  const LOCAL_PIN = "1234";
  const STORAGE = {
    config: "vertigoIntake.config",
    submissions: "vertigoIntake.submissions",
    pin: "vertigoIntake.pin"
  };

  const SEEDED_CONTENT_VERSION = "first-time-attack-v1";
  const SEEDED_FIRST_TIME_QUESTIONS = [
    {
      id: "ft_started_when",
      categoryId: "first_time",
      type: "single",
      required: true,
      text: "When did this dizziness or vertigo first start?",
      help: "Choose when the present problem began.",
      doctorNote: "Helps separate acute, subacute, and longer first presentations.",
      showIf: null,
      options: [
        { id: "today_under_24h", text: "Today, less than 24 hours ago" },
        { id: "one_to_three_days", text: "1 to 3 days ago" },
        { id: "four_to_fourteen_days", text: "4 to 14 days ago" },
        { id: "more_than_two_weeks", text: "More than 2 weeks ago" },
        { id: "not_sure", text: "I am not sure" }
      ]
    },
    {
      id: "ft_onset_speed",
      categoryId: "first_time",
      type: "single",
      required: true,
      text: "How did it start?",
      help: "Think about the first few minutes or hours.",
      doctorNote: "Documents sudden versus gradual onset.",
      showIf: null,
      options: [
        { id: "sudden_minutes", text: "Suddenly, within a few minutes" },
        { id: "built_over_hours", text: "It built up over hours" },
        { id: "gradual_days", text: "It gradually increased over days" },
        { id: "woke_with_it", text: "I woke up with it" },
        { id: "not_sure", text: "I am not sure" }
      ]
    },
    {
      id: "ft_current_pattern",
      categoryId: "first_time",
      type: "single",
      required: true,
      text: "Since it started, what has happened?",
      help: "This helps separate a continuous attack from short spells.",
      doctorNote: "Key timing pattern for acute vestibular syndrome versus episodic presentations.",
      showIf: null,
      options: [
        { id: "continuous_present", text: "It is continuously present, even when I keep still" },
        { id: "single_attack_better", text: "It was one attack and is now much better" },
        { id: "repeated_attacks_same_day", text: "It comes as repeated attacks in the same day" },
        { id: "intermittent_comes_goes", text: "It comes and goes, with normal periods in between" },
        { id: "not_sure", text: "I am not sure" }
      ]
    },
    {
      id: "ft_attack_duration",
      categoryId: "first_time",
      type: "single",
      required: true,
      text: "How long did the strongest spell last at one time?",
      help: "If it has never fully stopped, choose the continuous option.",
      doctorNote: "Duration supports later rule scoring for positional, migraine, inner-ear, vascular, and other patterns.",
      showIf: null,
      options: [
        { id: "seconds", text: "Only seconds" },
        { id: "under_one_minute", text: "Less than 1 minute" },
        { id: "one_to_twenty_minutes", text: "1 to 20 minutes" },
        { id: "twenty_minutes_to_twelve_hours", text: "20 minutes to 12 hours" },
        { id: "twelve_to_twenty_four_hours", text: "12 to 24 hours" },
        { id: "more_than_twenty_four_hours", text: "More than 24 hours" },
        { id: "continuous_still_present", text: "It has not fully stopped" },
        { id: "not_sure", text: "I am not sure" }
      ]
    },
    {
      id: "ft_head_position_trigger",
      categoryId: "first_time",
      type: "multi",
      required: true,
      text: "Is it brought on or made much worse by any of these?",
      help: "Select all that apply.",
      doctorNote: "Captures positional, head-motion exacerbated, orthostatic, and spontaneous patterns.",
      showIf: null,
      options: [
        { id: "lying_down_turning_bed", text: "Lying down or turning in bed" },
        { id: "looking_up_bending", text: "Looking up or bending forward" },
        { id: "any_head_movement_but_present_at_rest", text: "Any head movement makes it worse, but it is also present at rest" },
        { id: "standing_up", text: "Standing up from sitting or lying down" },
        { id: "no_clear_trigger", text: "No clear trigger" },
        { id: "not_sure", text: "I am not sure" }
      ]
    },
    {
      id: "ft_stillness_effect",
      categoryId: "first_time",
      type: "single",
      required: true,
      text: "If you keep your head completely still, what happens?",
      help: "Choose what usually happens within the next minute or two.",
      doctorNote: "Helps distinguish brief triggered positional vertigo from persistent dizziness worsened by movement.",
      showIf: null,
      options: [
        { id: "stops_under_minute", text: "It stops quickly, usually within 1 minute" },
        { id: "improves_but_continues", text: "It improves but does not fully stop" },
        { id: "continues_same", text: "It continues about the same" },
        { id: "not_applicable", text: "This does not apply to my dizziness" },
        { id: "not_sure", text: "I am not sure" }
      ]
    },
    {
      id: "ft_symptom_quality",
      categoryId: "first_time",
      type: "multi",
      required: true,
      text: "What does the dizziness feel like?",
      help: "Select all words that fit.",
      doctorNote: "Symptom quality is supportive context; timing and triggers remain more important.",
      showIf: null,
      options: [
        { id: "spinning", text: "Spinning or the room moving" },
        { id: "rocking_swaying", text: "Rocking, swaying, or floating" },
        { id: "lightheaded_faint", text: "Lightheaded, faint, or about to black out" },
        { id: "imbalance_walking", text: "Imbalance mainly while walking" },
        { id: "blurred_vision", text: "Blurred vision during the dizziness" },
        { id: "nausea", text: "Nausea with the dizziness" }
      ]
    },
    {
      id: "ft_nausea_vomiting",
      categoryId: "first_time",
      type: "single",
      required: true,
      text: "How much nausea or vomiting is there?",
      help: "Choose the closest answer.",
      doctorNote: "Severity marker and practical triage context.",
      showIf: null,
      options: [
        { id: "none", text: "No nausea or vomiting" },
        { id: "mild_nausea", text: "Mild nausea only" },
        { id: "severe_nausea", text: "Severe nausea but little or no vomiting" },
        { id: "repeated_vomiting", text: "Repeated vomiting" },
        { id: "cannot_keep_fluids", text: "Cannot keep fluids down" }
      ]
    },
    {
      id: "ft_hearing_symptoms",
      categoryId: "first_time",
      type: "multi",
      required: true,
      text: "Do you have any new ear or hearing symptoms?",
      help: "Select all that started with this dizziness.",
      doctorNote: "Screens for acute hearing change, tinnitus, fullness, and ear disease features.",
      showIf: null,
      options: [
        { id: "new_hearing_loss_one_ear", text: "New reduced hearing in one ear" },
        { id: "new_tinnitus", text: "New ringing or buzzing in one ear" },
        { id: "ear_fullness_pressure", text: "Fullness or pressure in one ear" },
        { id: "ear_pain_discharge", text: "Ear pain or discharge" },
        { id: "no_ear_symptoms", text: "No new ear or hearing symptoms" },
        { id: "not_sure", text: "I am not sure" }
      ]
    },
    {
      id: "ft_headache_migraine_features",
      categoryId: "first_time",
      type: "multi",
      required: true,
      text: "Are any headache or migraine features present?",
      help: "Select all that apply.",
      doctorNote: "Supports later vestibular migraine and central feature review; severe sudden headache remains a red flag.",
      showIf: null,
      options: [
        { id: "headache_with_dizziness", text: "Headache with this dizziness" },
        { id: "light_sensitivity", text: "Light sensitivity" },
        { id: "sound_sensitivity", text: "Sound sensitivity" },
        { id: "visual_aura", text: "Zig-zag lights, blind spots, or visual aura" },
        { id: "known_migraine", text: "I have had migraine before" },
        { id: "none", text: "None of these" }
      ]
    },
    {
      id: "ft_recent_context",
      categoryId: "first_time",
      type: "multi",
      required: true,
      text: "Did anything happen shortly before this dizziness started?",
      help: "Select all that apply in the last few days or weeks.",
      doctorNote: "Captures recent infection, trauma, medication, dehydration, and bed-rest context.",
      showIf: null,
      options: [
        { id: "recent_cold_fever", text: "Cold, fever, flu-like illness, or viral infection" },
        { id: "recent_ear_infection", text: "Ear infection" },
        { id: "head_injury_fall", text: "Head injury or fall" },
        { id: "new_medicine", text: "New medicine or recent dose change" },
        { id: "poor_intake_dehydration", text: "Poor food or water intake, diarrhea, or dehydration" },
        { id: "prolonged_bed_rest", text: "Prolonged bed rest or recent surgery" },
        { id: "none", text: "None of these" }
      ]
    },
    {
      id: "ft_standing_faintness",
      categoryId: "first_time",
      type: "single",
      required: true,
      text: "Is it mainly worse after standing up and better after sitting or lying down?",
      help: "This asks about faintness or blood pressure-type dizziness.",
      doctorNote: "Screens for orthostatic or non-vestibular dizziness patterns.",
      showIf: null,
      options: [
        { id: "yes_main_pattern", text: "Yes, this is the main pattern" },
        { id: "sometimes", text: "Sometimes, but not always" },
        { id: "no", text: "No" },
        { id: "not_sure", text: "I am not sure" }
      ]
    },
    {
      id: "ft_walking_ability",
      categoryId: "first_time",
      type: "single",
      required: true,
      text: "How are you walking now?",
      help: "Choose the safest answer.",
      doctorNote: "Inability to walk independently is important for urgent clinician review.",
      showIf: null,
      options: [
        { id: "normal", text: "I can walk normally" },
        { id: "unsteady_but_independent", text: "I am unsteady but can walk without help" },
        { id: "needs_support", text: "I need support from a person or wall" },
        { id: "cannot_walk", text: "I cannot walk safely" }
      ]
    },
    {
      id: "ft_prior_similar",
      categoryId: "first_time",
      type: "single",
      required: true,
      text: "Before this, have you ever had a similar dizzy spell, even a mild one?",
      help: "This checks whether this is truly the first attack.",
      doctorNote: "May redirect interpretation toward recurrent categories if prior similar episodes exist.",
      showIf: null,
      options: [
        { id: "never", text: "No, never" },
        { id: "mild_before", text: "Yes, but only mild or brief spells before" },
        { id: "diagnosed_before", text: "Yes, I was diagnosed or treated before" },
        { id: "not_sure", text: "I am not sure" }
      ]
    }
  ];

  const DEFAULT_CONFIG = {
    version: "v1.1.0",
    ruleVersion: "rules-empty-v1",
    seededContentVersion: SEEDED_CONTENT_VERSION,
    updatedAt: "2026-05-16T00:00:00.000Z",
    redFlags: [
      { id: "new_weakness", text: "New weakness or numbness on one side of the body" },
      { id: "speech_trouble", text: "New difficulty speaking, swallowing, or understanding speech" },
      { id: "new_double_vision", text: "New double vision or severe visual disturbance" },
      { id: "severe_headache", text: "Sudden severe headache or neck pain unlike usual" },
      { id: "fainting_chest_pain", text: "Fainting, chest pain, or severe breathlessness" },
      { id: "cannot_walk", text: "Unable to stand or walk without support" }
    ],
    categories: [
      {
        id: "first_time",
        label: "First-time/new dizziness",
        patientLabel: "This is the first time I am dizzy, or this is a new episode",
        doctorSummary: "New first-time dizziness episode."
      },
      {
        id: "recurrent_triggered",
        label: "Recurrent head-movement-triggered attacks",
        patientLabel: "I keep getting attacks triggered by head movement, like lying down, looking up, or turning in bed",
        doctorSummary: "Recurrent triggered episodic vestibular pattern."
      },
      {
        id: "recurrent_spontaneous",
        label: "Recurrent attacks not linked to head movement",
        patientLabel: "I keep getting attacks even when sitting, standing, or talking, and they are not clearly triggered by head movement",
        doctorSummary: "Recurrent spontaneous episodic vestibular pattern."
      },
      {
        id: "persistent_unsteady",
        label: "Persistent dizziness or unsteadiness",
        patientLabel: "I do not get clear attacks; I feel dizzy or unsteady most of the time, especially while walking",
        doctorSummary: "Persistent dizziness or unsteadiness without discrete attacks."
      }
    ],
    baseQuestions: [
      {
        id: "top_pattern",
        categoryId: "all",
        type: "single",
        required: true,
        text: "Is this the first time you are dizzy, or do you keep getting it recurrently?",
        help: "Choose the option that best describes what is happening now.",
        options: [
          { id: "first_time", text: "This is the first time I am dizzy, or this is a new episode", categoryId: "first_time" },
          { id: "recurrent_triggered", text: "I keep getting attacks triggered by head movement, like lying down, looking up, or turning in bed", categoryId: "recurrent_triggered" },
          { id: "recurrent_spontaneous", text: "I keep getting attacks even when sitting, standing, or talking, and they are not clearly triggered by head movement", categoryId: "recurrent_spontaneous" },
          { id: "persistent_unsteady", text: "I do not get clear attacks; I feel dizzy or unsteady most of the time, especially while walking", categoryId: "persistent_unsteady" }
        ]
      }
    ],
    branchQuestions: SEEDED_FIRST_TIME_QUESTIONS,
    diagnoses: [],
    rules: []
  };

  const state = {
    tab: "patient",
    cloud: false,
    status: "Local mode",
    config: normalizeConfig(loadLocalConfig()),
    patient: freshPatientState(),
    submitted: null,
    doctorUnlocked: false,
    adminUnlocked: false,
    clinicianPin: localStorage.getItem(STORAGE.pin) || "",
    submissions: loadLocalSubmissions(),
    selectedSubmissionId: null
  };

  const app = document.getElementById("app");
  const syncStatus = document.getElementById("syncStatus");
  const tabs = Array.from(document.querySelectorAll("[data-tab]"));

  document.addEventListener("DOMContentLoaded", init);
  app.addEventListener("input", handleInput);
  app.addEventListener("change", handleChange);
  app.addEventListener("click", handleClick);

  tabs.forEach(function (button) {
    button.addEventListener("click", function () {
      setTab(button.dataset.tab);
    });
  });

  async function init() {
    await loadRemotePublicConfig();
    registerServiceWorker();
    render();
  }

  function setTab(tab) {
    state.tab = tab;
    tabs.forEach(function (button) {
      button.classList.toggle("active", button.dataset.tab === tab);
    });
    render();
    app.focus();
  }

  function render() {
    syncStatus.textContent = state.status;

    if (state.tab === "patient") {
      renderPatient();
      return;
    }

    if (state.tab === "doctor") {
      renderDoctor();
      return;
    }

    renderAdmin();
  }

  function renderPatient() {
    if (state.submitted) {
      renderPatientResult();
      return;
    }

    const config = state.config;
    const answers = state.patient.answers;
    const topQuestion = config.baseQuestions[0];
    const categoryId = getCurrentCategoryId(answers, config);
    const category = findCategory(categoryId, config);
    const branchQuestions = getVisibleBranchQuestions(categoryId, answers, config);

    app.innerHTML = [
      '<section class="panel">',
      '<div class="flow-header">',
      '<h2>Patient dizziness intake</h2>',
      '<p class="muted">Please answer the questions as clearly as possible. The doctor will review the answers before making the final diagnosis.</p>',
      '</div>',
      '<div class="field-grid">',
      '<div class="field">',
      '<label for="clinicId">Clinic ID</label>',
      '<input id="clinicId" autocomplete="off" value="' + escapeHtml(state.patient.clinicId) + '" placeholder="Enter clinic ID">',
      '</div>',
      '</div>',
      '</section>',

      '<section class="panel">',
      '<h2>Safety screen</h2>',
      '<p class="muted">Select any warning feature that is present now.</p>',
      '<div class="red-flag-grid">',
      config.redFlags.map(renderRedFlag).join(""),
      '</div>',
      '</section>',

      '<section class="panel">',
      renderQuestion(topQuestion, answers[topQuestion.id]),
      category ? '<div class="category-banner"><strong>Current category:</strong> ' + escapeHtml(category.label) + '<br><span class="muted">' + escapeHtml(category.doctorSummary) + '</span></div>' : "",
      branchQuestions.length ? branchQuestions.map(function (question) {
        return renderQuestion(question, answers[question.id]);
      }).join("") : '<div class="empty-state">No extra questions have been added for this category yet. The doctor can add them in Admin.</div>',
      '<div class="actions">',
      '<button class="button" type="button" data-action="submit-patient">Submit answers</button>',
      '<button class="button secondary" type="button" data-action="reset-patient">Clear form</button>',
      '</div>',
      '</section>'
    ].join("");
  }

  function renderPatientResult() {
    const submission = state.submitted;
    const category = findCategory(submission.categoryId, state.config);
    const hasRedFlags = submission.redFlags.length > 0;

    app.innerHTML = [
      '<section class="panel">',
      '<div class="notice success">',
      '<h2>Answers saved</h2>',
      '<p>Your answers have been saved for doctor review. No diagnosis is shown here because the doctor will compare your answers with the clinical examination.</p>',
      '</div>',
      hasRedFlags ? '<div class="notice danger"><strong>Please inform clinic staff immediately.</strong><br>You selected one or more warning features on the safety screen.</div>' : "",
      category ? '<div class="category-banner"><strong>Your dizziness pattern:</strong> ' + escapeHtml(category.label) + '</div>' : "",
      '<div class="actions">',
      '<button class="button" type="button" data-action="new-patient">Start another intake</button>',
      '</div>',
      '</section>'
    ].join("");
  }

  function renderDoctor() {
    if (!state.doctorUnlocked) {
      renderPinGate("doctor");
      return;
    }

    const analytics = computeAnalytics(state.submissions, state.config);
    const selected = state.submissions.find(function (item) {
      return item.id === state.selectedSubmissionId;
    }) || state.submissions[0] || null;
    if (selected) state.selectedSubmissionId = selected.id;

    app.innerHTML = [
      '<section class="panel">',
      '<div class="row">',
      '<div>',
      '<h2>Doctor review</h2>',
      '<p class="muted">Review patient submissions, app category, red flags, rule-based suggestions, and final clinical diagnosis.</p>',
      '</div>',
      '<button class="button secondary small" type="button" data-action="refresh-doctor">Refresh</button>',
      '</div>',
      renderAnalytics(analytics),
      analytics.categoryMatrix.length ? '<div class="table-wrap" style="margin-top:12px">' + renderCategoryMatrix(analytics.categoryMatrix) + '</div>' : "",
      '</section>',
      '<section class="dashboard-grid">',
      '<div class="panel">',
      '<h3>Submissions</h3>',
      state.submissions.length ? '<div class="list">' + state.submissions.map(renderSubmissionListItem).join("") + '</div>' : '<div class="empty-state">No submissions yet.</div>',
      '</div>',
      '<div class="panel">',
      selected ? renderSubmissionDetail(selected) : '<div class="empty-state">Select a submission to review.</div>',
      '</div>',
      '</section>'
    ].join("");
  }

  function renderAdmin() {
    if (!state.adminUnlocked) {
      renderPinGate("admin");
      return;
    }

    app.innerHTML = [
      '<section class="panel">',
      '<div class="row">',
      '<div>',
      '<h2>Admin editor</h2>',
      '<p class="muted">Add branch questions, doctor-defined diagnoses, and transparent scoring rules without changing code.</p>',
      '</div>',
      '<button class="button secondary small" type="button" data-action="save-config">Save</button>',
      '</div>',
      '<div class="notice"><strong>Questionnaire version:</strong> ' + escapeHtml(state.config.version) + ' <span class="muted">Rule version: ' + escapeHtml(state.config.ruleVersion) + '</span></div>',
      '</section>',
      '<section class="admin-layout">',
      '<div class="panel compact-stack">',
      renderQuestionEditor(),
      renderQuestionList(),
      '</div>',
      '<div class="panel compact-stack">',
      renderDiagnosisEditor(),
      renderRuleEditor(),
      renderConfigTools(),
      '</div>',
      '</section>'
    ].join("");
  }

  function renderPinGate(kind) {
    const title = kind === "admin" ? "Admin access" : "Doctor access";
    app.innerHTML = [
      '<section class="panel">',
      '<h2>' + title + '</h2>',
      '<p class="muted">Enter the clinic PIN. In Cloudflare, this is enforced by the Worker. In local demo mode, the default PIN is 1234.</p>',
      '<div class="field-grid">',
      '<div class="field">',
      '<label for="pinInput">Clinic PIN</label>',
      '<input id="pinInput" type="password" autocomplete="current-password" value="' + escapeHtml(state.clinicianPin) + '">',
      '</div>',
      '</div>',
      '<div class="actions">',
      '<button class="button" type="button" data-action="unlock-' + kind + '">Unlock</button>',
      '</div>',
      '</section>'
    ].join("");
  }

  function renderRedFlag(flag) {
    const checked = state.patient.redFlags.includes(flag.id) ? " checked" : "";
    return '<label class="choice red-flag"><input type="checkbox" data-red-flag="' + escapeHtml(flag.id) + '"' + checked + '><span>' + escapeHtml(flag.text) + '</span></label>';
  }

  function renderQuestion(question, answer) {
    const note = question.help ? '<p class="muted">' + escapeHtml(question.help) + '</p>' : "";
    const required = question.required ? ' <span class="badge">Required</span>' : "";

    if (question.type === "text") {
      const value = answer && typeof answer.value === "string" ? answer.value : "";
      return [
        '<div class="question-block">',
        '<h2>' + escapeHtml(question.text) + required + '</h2>',
        note,
        '<div class="field">',
        '<label class="sr-only" for="answer-' + escapeHtml(question.id) + '">' + escapeHtml(question.text) + '</label>',
        '<textarea id="answer-' + escapeHtml(question.id) + '" data-text-answer="' + escapeHtml(question.id) + '">' + escapeHtml(value) + '</textarea>',
        '</div>',
        '</div>'
      ].join("");
    }

    const inputType = question.type === "multi" ? "checkbox" : "radio";
    const name = "q-" + question.id;
    const values = answer ? normalizeAnswerValues(answer) : [];
    const options = (question.options || []).map(function (option) {
      const checked = values.includes(option.id) ? " checked" : "";
      return '<label class="choice"><input type="' + inputType + '" name="' + escapeHtml(name) + '" data-question-id="' + escapeHtml(question.id) + '" data-option-id="' + escapeHtml(option.id) + '"' + checked + '><span>' + escapeHtml(option.text) + '</span></label>';
    }).join("");

    return [
      '<div class="question-block">',
      '<h2>' + escapeHtml(question.text) + required + '</h2>',
      note,
      '<div class="choice-list">',
      options,
      '</div>',
      '</div>'
    ].join("");
  }

  function renderAnalytics(analytics) {
    return [
      '<div class="summary-grid">',
      '<div class="metric"><span class="muted">Submissions</span><strong>' + analytics.total + '</strong></div>',
      '<div class="metric"><span class="muted">Reviewed</span><strong>' + analytics.reviewed + '</strong></div>',
      '<div class="metric"><span class="muted">Category match</span><strong>' + analytics.categoryRate + '</strong></div>',
      '<div class="metric"><span class="muted">Top-1 match</span><strong>' + analytics.top1Rate + '</strong></div>',
      '<div class="metric"><span class="muted">Top-3 match</span><strong>' + analytics.top3Rate + '</strong></div>',
      '</div>',
      analytics.perDiagnosis.length ? '<div class="table-wrap" style="margin-top:12px">' + renderDiagnosisMetricsTable(analytics.perDiagnosis) + '</div>' : ""
    ].join("");
  }

  function renderDiagnosisMetricsTable(rows) {
    return [
      '<table>',
      '<thead><tr><th>Diagnosis</th><th>Final count</th><th>Predicted count</th><th>Matches</th><th>Sensitivity</th><th>False positives</th></tr></thead>',
      '<tbody>',
      rows.map(function (row) {
        return '<tr><td>' + escapeHtml(row.name) + '</td><td>' + row.finalCount + '</td><td>' + row.predictedCount + '</td><td>' + row.matches + '</td><td>' + row.sensitivity + '</td><td>' + row.falsePositives + '</td></tr>';
      }).join(""),
      '</tbody>',
      '</table>'
    ].join("");
  }

  function renderCategoryMatrix(rows) {
    return [
      '<table>',
      '<thead><tr><th>App category</th><th>Final category</th><th>Count</th></tr></thead>',
      '<tbody>',
      rows.map(function (row) {
        return '<tr><td>' + escapeHtml(row.appCategory) + '</td><td>' + escapeHtml(row.finalCategory) + '</td><td>' + row.count + '</td></tr>';
      }).join(""),
      '</tbody>',
      '</table>'
    ].join("");
  }

  function renderSubmissionListItem(submission) {
    const category = findCategory(submission.categoryId, state.config);
    const active = submission.id === state.selectedSubmissionId ? " active" : "";
    const red = submission.redFlags.length ? '<span class="badge danger">' + submission.redFlags.length + ' red flag</span>' : '<span class="badge">No red flags</span>';
    const reviewed = submission.finalDiagnosisId || submission.finalDiagnosisText ? '<span class="badge violet">Reviewed</span>' : "";
    return [
      '<button class="list-item' + active + '" type="button" data-action="select-submission" data-id="' + escapeHtml(submission.id) + '">',
      '<div class="row"><strong>' + escapeHtml(submission.clinicId) + '</strong>' + red + '</div>',
      '<div class="muted">' + escapeHtml(formatDate(submission.createdAt)) + '</div>',
      '<div>' + escapeHtml(category ? category.label : submission.categoryId) + '</div>',
      reviewed,
      '</button>'
    ].join("");
  }

  function renderSubmissionDetail(submission) {
    const category = findCategory(submission.categoryId, state.config);
    const redFlags = submission.redFlags.map(function (id) {
      const flag = state.config.redFlags.find(function (item) { return item.id === id; });
      return flag ? flag.text : id;
    });

    return [
      '<div class="row">',
      '<div>',
      '<h2>' + escapeHtml(submission.clinicId) + '</h2>',
      '<p class="muted">' + escapeHtml(formatDate(submission.createdAt)) + '</p>',
      '</div>',
      '<span class="badge">' + escapeHtml(submission.questionnaireVersion || state.config.version) + '</span>',
      '</div>',
      '<div class="category-banner"><strong>App category:</strong> ' + escapeHtml(category ? category.label : submission.categoryId) + '</div>',
      redFlags.length ? '<div class="notice danger"><strong>Red flags selected</strong><br>' + redFlags.map(escapeHtml).join("<br>") + '</div>' : '<div class="notice success">No red flags selected.</div>',
      '<h3>Possible diagnoses</h3>',
      renderPredictions(submission.predictions),
      '<h3>Answer summary</h3>',
      renderAnswerSummary(submission.answers),
      '<h3>Final clinical diagnosis</h3>',
      renderFinalDiagnosisForm(submission)
    ].join("");
  }

  function renderPredictions(predictions) {
    if (!predictions || !predictions.length) {
      return '<div class="empty-state">No diagnosis rules are active yet. Add diagnoses and scoring rules in Admin.</div>';
    }

    return '<div class="prediction-list">' + predictions.map(function (prediction, index) {
      const evidence = prediction.evidence && prediction.evidence.length ? '<ul class="evidence-list">' + prediction.evidence.map(function (item) {
        return '<li>' + escapeHtml(item) + '</li>';
      }).join("") + '</ul>' : "";
      return '<div class="prediction"><div class="row"><strong>' + (index + 1) + '. ' + escapeHtml(prediction.name) + '</strong><span class="prediction-score">Score ' + prediction.score + '</span></div>' + evidence + '</div>';
    }).join("") + '</div>';
  }

  function renderAnswerSummary(answers) {
    const rows = Object.keys(answers || {}).map(function (questionId) {
      const question = findQuestion(questionId, state.config);
      return '<tr><td>' + escapeHtml(question ? question.text : questionId) + '</td><td>' + escapeHtml(formatAnswer(answers[questionId], question)) + '</td></tr>';
    }).join("");

    return rows ? '<div class="table-wrap"><table><tbody>' + rows + '</tbody></table></div>' : '<div class="empty-state">No answers recorded.</div>';
  }

  function renderFinalDiagnosisForm(submission) {
    const diagnosisOptions = state.config.diagnoses.map(function (diagnosis) {
      const selected = diagnosis.id === submission.finalDiagnosisId ? " selected" : "";
      return '<option value="' + escapeHtml(diagnosis.id) + '"' + selected + '>' + escapeHtml(diagnosis.name) + '</option>';
    }).join("");
    const categoryOptions = state.config.categories.map(function (category) {
      const selected = category.id === submission.finalCategoryId ? " selected" : "";
      return '<option value="' + escapeHtml(category.id) + '"' + selected + '>' + escapeHtml(category.label) + '</option>';
    }).join("");

    return [
      '<div class="field-grid">',
      '<div class="field">',
      '<label for="finalCategory">Final category</label>',
      '<select id="finalCategory"><option value="">Not selected</option>' + categoryOptions + '</select>',
      '</div>',
      '<div class="field">',
      '<label for="finalDiagnosis">Final diagnosis</label>',
      '<select id="finalDiagnosis"><option value="">Not selected</option>' + diagnosisOptions + '</select>',
      '</div>',
      '<div class="field">',
      '<label for="finalDiagnosisText">Final diagnosis text</label>',
      '<input id="finalDiagnosisText" value="' + escapeHtml(submission.finalDiagnosisText || "") + '" placeholder="Use this if the diagnosis is not in the list">',
      '</div>',
      '</div>',
      '<div class="actions">',
      '<button class="button" type="button" data-action="save-final" data-id="' + escapeHtml(submission.id) + '">Save final diagnosis</button>',
      '</div>'
    ].join("");
  }

  function renderQuestionEditor() {
    return [
      '<div>',
      '<h3>Add branch question</h3>',
      '<div class="field-grid">',
      '<div class="field"><label for="newQuestionCategory">Category</label><select id="newQuestionCategory">' + state.config.categories.map(function (category) {
        return '<option value="' + escapeHtml(category.id) + '">' + escapeHtml(category.label) + '</option>';
      }).join("") + '</select></div>',
      '<div class="field"><label for="newQuestionType">Type</label><select id="newQuestionType"><option value="single">Single choice</option><option value="multi">Multiple choice</option><option value="text">Free text</option></select></div>',
      '<div class="field"><label for="newQuestionText">Question text</label><input id="newQuestionText" placeholder="Patient-friendly wording"></div>',
      '<div class="field"><label for="newQuestionHelp">Help text</label><input id="newQuestionHelp" placeholder="Optional"></div>',
      '<div class="field"><label for="newQuestionOptions">Options</label><textarea id="newQuestionOptions" placeholder="One option per line"></textarea></div>',
      '<div class="field"><label for="newQuestionShowIf">Visible after answer</label><select id="newQuestionShowIf"><option value="">Always show in selected category</option>' + renderRuleTargetOptions() + '</select></div>',
      '<div class="field"><label for="newQuestionNote">Doctor-only note</label><textarea id="newQuestionNote" placeholder="Optional note for clinical review"></textarea></div>',
      '<label class="choice"><input type="checkbox" id="newQuestionRequired" checked><span>Required question</span></label>',
      '</div>',
      '<div class="actions"><button class="button" type="button" data-action="add-question">Add question</button></div>',
      '</div>'
    ].join("");
  }

  function renderQuestionList() {
    if (!state.config.branchQuestions.length) {
      return '<div class="empty-state">No branch questions yet. Add the first subsection question above.</div>';
    }

    return [
      '<div>',
      '<h3>Branch questions</h3>',
      '<div class="list">',
      state.config.branchQuestions.map(function (question) {
        const category = findCategory(question.categoryId, state.config);
        return '<div class="list-item"><div class="row"><strong>' + escapeHtml(question.text) + '</strong><button class="button secondary small" type="button" data-action="delete-question" data-id="' + escapeHtml(question.id) + '">Delete</button></div><div class="muted">' + escapeHtml(category ? category.label : question.categoryId) + ' | ' + escapeHtml(question.type) + ' | ID: ' + escapeHtml(question.id) + '</div></div>';
      }).join(""),
      '</div>',
      '</div>'
    ].join("");
  }

  function renderDiagnosisEditor() {
    return [
      '<div>',
      '<h3>Diagnoses</h3>',
      '<div class="field"><label for="newDiagnosisName">Diagnosis name</label><input id="newDiagnosisName" placeholder="Example: Posterior canal BPPV"></div>',
      '<div class="field"><label for="newDiagnosisDescription">Doctor note</label><textarea id="newDiagnosisDescription" placeholder="Optional"></textarea></div>',
      '<div class="actions"><button class="button" type="button" data-action="add-diagnosis">Add diagnosis</button></div>',
      state.config.diagnoses.length ? '<div class="list">' + state.config.diagnoses.map(function (diagnosis) {
        return '<div class="list-item"><div class="row"><strong>' + escapeHtml(diagnosis.name) + '</strong><button class="button secondary small" type="button" data-action="delete-diagnosis" data-id="' + escapeHtml(diagnosis.id) + '">Delete</button></div><div class="muted">ID: ' + escapeHtml(diagnosis.id) + '</div></div>';
      }).join("") + '</div>' : '<div class="empty-state">No diagnoses added yet.</div>',
      '</div>'
    ].join("");
  }

  function renderRuleEditor() {
    const diagnosisOptions = state.config.diagnoses.map(function (diagnosis) {
      return '<option value="' + escapeHtml(diagnosis.id) + '">' + escapeHtml(diagnosis.name) + '</option>';
    }).join("");

    return [
      '<div>',
      '<h3>Scoring rules</h3>',
      '<div class="field"><label for="newRuleTarget">Answer that triggers score</label><select id="newRuleTarget">' + renderRuleTargetOptions() + '</select></div>',
      '<div class="field"><label for="newRuleDiagnosis">Diagnosis</label><select id="newRuleDiagnosis">' + diagnosisOptions + '</select></div>',
      '<div class="field"><label for="newRuleWeight">Weight</label><input id="newRuleWeight" type="number" step="1" value="1"></div>',
      '<div class="field"><label for="newRuleExplanation">Explanation</label><input id="newRuleExplanation" placeholder="Why this answer supports the diagnosis"></div>',
      '<div class="actions"><button class="button" type="button" data-action="add-rule">Add rule</button></div>',
      state.config.rules.length ? '<div class="list">' + state.config.rules.map(renderRuleItem).join("") + '</div>' : '<div class="empty-state">No scoring rules yet.</div>',
      '</div>'
    ].join("");
  }

  function renderRuleItem(rule) {
    const question = findQuestion(rule.questionId, state.config);
    const diagnosis = state.config.diagnoses.find(function (item) { return item.id === rule.diagnosisId; });
    const option = question && question.options ? question.options.find(function (item) { return item.id === rule.optionId; }) : null;
    return '<div class="list-item"><div class="row"><strong>' + escapeHtml(diagnosis ? diagnosis.name : rule.diagnosisId) + '</strong><button class="button secondary small" type="button" data-action="delete-rule" data-id="' + escapeHtml(rule.id) + '">Delete</button></div><div class="muted">' + escapeHtml(question ? question.text : rule.questionId) + ' -> ' + escapeHtml(option ? option.text : rule.optionId) + ' | Weight ' + Number(rule.weight || 0) + '</div></div>';
  }

  function renderConfigTools() {
    return [
      '<div>',
      '<h3>Config tools</h3>',
      '<div class="actions">',
      '<button class="button secondary" type="button" data-action="export-config">Export config JSON</button>',
      '<button class="button warning" type="button" data-action="reset-config">Reset local config</button>',
      '</div>',
      '<div class="field"><label for="importConfigText">Import config JSON</label><textarea id="importConfigText" placeholder="Paste a previously exported config"></textarea></div>',
      '<div class="actions"><button class="button secondary" type="button" data-action="import-config">Import</button></div>',
      '</div>'
    ].join("");
  }

  function renderRuleTargetOptions() {
    return getChoiceTargets(state.config).map(function (target) {
      return '<option value="' + escapeHtml(target.questionId + "|" + target.optionId) + '">' + escapeHtml(target.label) + '</option>';
    }).join("");
  }

  function handleInput(event) {
    const target = event.target;
    if (target.id === "clinicId") {
      state.patient.clinicId = target.value;
    }
    if (target.id === "pinInput") {
      state.clinicianPin = target.value;
    }
    if (target.dataset.textAnswer) {
      state.patient.answers[target.dataset.textAnswer] = {
        type: "text",
        value: target.value,
        label: target.value
      };
    }
  }

  function handleChange(event) {
    const target = event.target;

    if (target.dataset.redFlag) {
      toggleArrayValue(state.patient.redFlags, target.dataset.redFlag, target.checked);
      return;
    }

    if (target.dataset.questionId && target.dataset.optionId) {
      setChoiceAnswer(target.dataset.questionId, target.dataset.optionId, target.checked, target.type);
      if (target.dataset.questionId === "top_pattern" || hasDependentQuestions(target.dataset.questionId)) {
        removeHiddenAnswers();
        renderPatient();
      }
    }
  }

  async function handleClick(event) {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;

    const action = actionTarget.dataset.action;
    if (action === "submit-patient") await submitPatient();
    if (action === "reset-patient") resetPatientForm();
    if (action === "new-patient") startNewPatient();
    if (action === "unlock-doctor") await unlockClinician("doctor");
    if (action === "unlock-admin") await unlockClinician("admin");
    if (action === "refresh-doctor") await refreshDoctorData();
    if (action === "select-submission") {
      state.selectedSubmissionId = actionTarget.dataset.id;
      renderDoctor();
    }
    if (action === "save-final") await saveFinalDiagnosis(actionTarget.dataset.id);
    if (action === "add-question") await addQuestion();
    if (action === "delete-question") await deleteQuestion(actionTarget.dataset.id);
    if (action === "add-diagnosis") await addDiagnosis();
    if (action === "delete-diagnosis") await deleteDiagnosis(actionTarget.dataset.id);
    if (action === "add-rule") await addRule();
    if (action === "delete-rule") await deleteRule(actionTarget.dataset.id);
    if (action === "save-config") await saveConfig();
    if (action === "export-config") exportConfig();
    if (action === "import-config") await importConfig();
    if (action === "reset-config") await resetConfig();
  }

  async function submitPatient() {
    const validation = validatePatient();
    if (!validation.ok) {
      alert(validation.message);
      return;
    }

    const localSubmission = buildSubmission();

    try {
      const saved = await apiFetch("/api/submissions", {
        method: "POST",
        body: JSON.stringify({
          clinicId: localSubmission.clinicId,
          categoryId: localSubmission.categoryId,
          redFlags: localSubmission.redFlags,
          answers: localSubmission.answers
        })
      });
      state.cloud = true;
      state.status = "Cloud mode";
      state.submitted = normalizeSubmission(saved.submission || saved);
    } catch (error) {
      localSubmission.predictions = scoreSubmission(state.config, localSubmission.answers);
      saveLocalSubmission(localSubmission);
      state.submissions = loadLocalSubmissions();
      state.submitted = localSubmission;
      state.status = "Local mode";
    }

    render();
  }

  function validatePatient() {
    if (!state.patient.clinicId.trim()) {
      return { ok: false, message: "Please enter the clinic ID." };
    }

    const categoryId = getCurrentCategoryId(state.patient.answers, state.config);
    if (!categoryId) {
      return { ok: false, message: "Please choose the dizziness pattern." };
    }

    const missing = getVisibleBranchQuestions(categoryId, state.patient.answers, state.config).find(function (question) {
      return question.required && !hasAnswer(state.patient.answers[question.id]);
    });

    if (missing) {
      return { ok: false, message: "Please answer: " + missing.text };
    }

    return { ok: true };
  }

  function buildSubmission() {
    const now = new Date().toISOString();
    return normalizeSubmission({
      id: makeId("sub"),
      clinicId: state.patient.clinicId.trim(),
      categoryId: getCurrentCategoryId(state.patient.answers, state.config),
      redFlags: state.patient.redFlags.slice(),
      answers: clone(state.patient.answers),
      predictions: [],
      questionnaireVersion: state.config.version,
      ruleVersion: state.config.ruleVersion,
      createdAt: now
    });
  }

  function resetPatientForm() {
    state.patient = freshPatientState();
    state.submitted = null;
    renderPatient();
  }

  function startNewPatient() {
    resetPatientForm();
  }

  async function unlockClinician(kind) {
    const pin = state.clinicianPin.trim();
    if (!pin) {
      alert("Please enter the clinic PIN.");
      return;
    }
    localStorage.setItem(STORAGE.pin, pin);

    try {
      if (kind === "doctor") {
        const data = await apiFetch("/api/doctor/submissions", { headers: authHeaders(pin) });
        state.submissions = (data.submissions || []).map(normalizeSubmission);
        if (data.config) state.config = normalizeConfig(data.config);
        state.doctorUnlocked = true;
      } else {
        const data = await apiFetch("/api/admin/config", { headers: authHeaders(pin) });
        state.config = normalizeConfig(data.config || data);
        state.adminUnlocked = true;
      }
      state.cloud = true;
      state.status = "Cloud mode";
      render();
      return;
    } catch (error) {
      if (pin !== LOCAL_PIN) {
        alert("Could not unlock. Check the clinic PIN or Cloudflare connection.");
        return;
      }
    }

    if (kind === "doctor") state.doctorUnlocked = true;
    if (kind === "admin") state.adminUnlocked = true;
    state.submissions = loadLocalSubmissions();
    state.config = normalizeConfig(loadLocalConfig());
    state.status = "Local mode";
    render();
  }

  async function refreshDoctorData() {
    if (!state.doctorUnlocked) return;
    try {
      const data = await apiFetch("/api/doctor/submissions", { headers: authHeaders(state.clinicianPin) });
      state.submissions = (data.submissions || []).map(normalizeSubmission);
      if (data.config) state.config = normalizeConfig(data.config);
      state.status = "Cloud mode";
    } catch (error) {
      state.submissions = loadLocalSubmissions();
      state.status = "Local mode";
    }
    renderDoctor();
  }

  async function saveFinalDiagnosis(id) {
    const submission = state.submissions.find(function (item) { return item.id === id; });
    if (!submission) return;

    const finalCategoryId = valueOf("finalCategory");
    const finalDiagnosisId = valueOf("finalDiagnosis");
    const finalDiagnosisText = valueOf("finalDiagnosisText").trim();
    const reviewedAt = new Date().toISOString();

    submission.finalCategoryId = finalCategoryId;
    submission.finalDiagnosisId = finalDiagnosisId;
    submission.finalDiagnosisText = finalDiagnosisText;
    submission.reviewedAt = reviewedAt;

    try {
      await apiFetch("/api/doctor/submissions/" + encodeURIComponent(id) + "/final", {
        method: "PUT",
        headers: authHeaders(state.clinicianPin),
        body: JSON.stringify({ finalCategoryId, finalDiagnosisId, finalDiagnosisText })
      });
      state.status = "Cloud mode";
    } catch (error) {
      replaceLocalSubmission(submission);
      state.status = "Local mode";
    }

    renderDoctor();
  }

  async function addQuestion() {
    const text = valueOf("newQuestionText").trim();
    const type = valueOf("newQuestionType");
    const options = linesOf("newQuestionOptions").map(function (line) {
      return { id: slug("opt", line), text: line };
    });

    if (!text) {
      alert("Enter the question text.");
      return;
    }
    if (type !== "text" && !options.length) {
      alert("Choice questions need at least one option.");
      return;
    }

    const showIfValue = valueOf("newQuestionShowIf");
    const showIfParts = showIfValue ? showIfValue.split("|") : [];
    const question = {
      id: makeId("q"),
      categoryId: valueOf("newQuestionCategory"),
      type,
      required: document.getElementById("newQuestionRequired").checked,
      text,
      help: valueOf("newQuestionHelp").trim(),
      doctorNote: valueOf("newQuestionNote").trim(),
      showIf: showIfParts.length === 2 ? { questionId: showIfParts[0], optionId: showIfParts[1] } : null,
      options: type === "text" ? [] : options
    };

    state.config.branchQuestions.push(question);
    await saveConfig();
    renderAdmin();
  }

  async function deleteQuestion(id) {
    state.config.branchQuestions = state.config.branchQuestions.filter(function (question) {
      return question.id !== id;
    });
    state.config.rules = state.config.rules.filter(function (rule) {
      return rule.questionId !== id;
    });
    await saveConfig();
    renderAdmin();
  }

  async function addDiagnosis() {
    const name = valueOf("newDiagnosisName").trim();
    if (!name) {
      alert("Enter a diagnosis name.");
      return;
    }
    state.config.diagnoses.push({
      id: slug("dx", name),
      name,
      description: valueOf("newDiagnosisDescription").trim(),
      active: true
    });
    await saveConfig();
    renderAdmin();
  }

  async function deleteDiagnosis(id) {
    state.config.diagnoses = state.config.diagnoses.filter(function (diagnosis) {
      return diagnosis.id !== id;
    });
    state.config.rules = state.config.rules.filter(function (rule) {
      return rule.diagnosisId !== id;
    });
    await saveConfig();
    renderAdmin();
  }

  async function addRule() {
    const target = valueOf("newRuleTarget");
    const diagnosisId = valueOf("newRuleDiagnosis");
    const weight = Number(valueOf("newRuleWeight"));
    const explanation = valueOf("newRuleExplanation").trim();

    if (!target || !diagnosisId || !Number.isFinite(weight) || weight === 0) {
      alert("Choose an answer, diagnosis, and non-zero weight.");
      return;
    }

    const parts = target.split("|");
    state.config.rules.push({
      id: makeId("rule"),
      questionId: parts[0],
      optionId: parts[1],
      diagnosisId,
      weight,
      explanation,
      active: true
    });
    await saveConfig();
    renderAdmin();
  }

  async function deleteRule(id) {
    state.config.rules = state.config.rules.filter(function (rule) {
      return rule.id !== id;
    });
    await saveConfig();
    renderAdmin();
  }

  async function saveConfig() {
    state.config.updatedAt = new Date().toISOString();
    state.config.version = "v-" + compactTimestamp();
    state.config.ruleVersion = "rules-" + compactTimestamp();
    state.config = normalizeConfig(state.config);
    localStorage.setItem(STORAGE.config, JSON.stringify(state.config));

    try {
      await apiFetch("/api/admin/config", {
        method: "PUT",
        headers: authHeaders(state.clinicianPin),
        body: JSON.stringify({ config: state.config })
      });
      state.status = "Cloud mode";
    } catch (error) {
      state.status = "Local mode";
    }
  }

  function exportConfig() {
    const text = JSON.stringify(state.config, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vertigo-questionnaire-config.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function importConfig() {
    const text = valueOf("importConfigText").trim();
    if (!text) {
      alert("Paste config JSON first.");
      return;
    }

    try {
      state.config = normalizeConfig(JSON.parse(text));
    } catch (error) {
      alert("This is not valid config JSON.");
      return;
    }

    await saveConfig();
    renderAdmin();
  }

  async function resetConfig() {
    if (!confirm("Reset the local questionnaire config to the V1 default?")) return;
    state.config = normalizeConfig(DEFAULT_CONFIG);
    localStorage.setItem(STORAGE.config, JSON.stringify(state.config));
    await saveConfig();
    renderAdmin();
  }

  async function loadRemotePublicConfig() {
    try {
      const data = await apiFetch("/api/config");
      state.config = normalizeConfig(data.config || data);
      state.cloud = true;
      state.status = "Cloud mode";
    } catch (error) {
      state.config = normalizeConfig(loadLocalConfig());
      state.status = "Local mode";
    }
  }

  async function apiFetch(path, options) {
    const settings = options || {};
    const headers = Object.assign({ "Content-Type": "application/json" }, settings.headers || {});
    const response = await fetch(path, Object.assign({}, settings, { headers }));
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Request failed");
    }
    return response.json();
  }

  function authHeaders(pin) {
    return { "x-clinic-pin": pin || "" };
  }

  function getCurrentCategoryId(answers, config) {
    const answer = answers.top_pattern;
    if (!answer || !answer.value) return "";
    const option = config.baseQuestions[0].options.find(function (item) {
      return item.id === answer.value;
    });
    return option ? option.categoryId : "";
  }

  function getVisibleBranchQuestions(categoryId, answers, config) {
    if (!categoryId) return [];
    return config.branchQuestions.filter(function (question) {
      if (question.categoryId !== categoryId) return false;
      if (!question.showIf || !question.showIf.questionId || !question.showIf.optionId) return true;
      const answer = answers[question.showIf.questionId];
      return normalizeAnswerValues(answer).includes(question.showIf.optionId);
    });
  }

  function removeHiddenAnswers() {
    const categoryId = getCurrentCategoryId(state.patient.answers, state.config);
    const visibleIds = new Set(["top_pattern"].concat(getVisibleBranchQuestions(categoryId, state.patient.answers, state.config).map(function (question) {
      return question.id;
    })));

    Object.keys(state.patient.answers).forEach(function (questionId) {
      if (!visibleIds.has(questionId)) delete state.patient.answers[questionId];
    });
  }

  function setChoiceAnswer(questionId, optionId, checked, inputType) {
    const question = findQuestion(questionId, state.config);
    if (!question) return;
    const option = question.options.find(function (item) { return item.id === optionId; });
    if (!option) return;

    if (inputType === "radio") {
      state.patient.answers[questionId] = {
        type: "single",
        value: optionId,
        label: option.text
      };
      return;
    }

    const existing = state.patient.answers[questionId] || { type: "multi", values: [], labels: [] };
    const values = normalizeAnswerValues(existing);
    toggleArrayValue(values, optionId, checked);
    state.patient.answers[questionId] = {
      type: "multi",
      values,
      labels: values.map(function (id) {
        const match = question.options.find(function (item) { return item.id === id; });
        return match ? match.text : id;
      })
    };
  }

  function scoreSubmission(config, answers) {
    const byDiagnosis = {};

    (config.rules || []).filter(function (rule) { return rule.active !== false; }).forEach(function (rule) {
      const answer = answers[rule.questionId];
      if (!normalizeAnswerValues(answer).includes(rule.optionId)) return;

      const diagnosis = config.diagnoses.find(function (item) {
        return item.id === rule.diagnosisId && item.active !== false;
      });
      if (!diagnosis) return;

      if (!byDiagnosis[diagnosis.id]) {
        byDiagnosis[diagnosis.id] = {
          diagnosisId: diagnosis.id,
          name: diagnosis.name,
          score: 0,
          evidence: []
        };
      }

      byDiagnosis[diagnosis.id].score += Number(rule.weight || 0);
      if (rule.explanation) byDiagnosis[diagnosis.id].evidence.push(rule.explanation);
    });

    return Object.keys(byDiagnosis).map(function (id) {
      return byDiagnosis[id];
    }).filter(function (item) {
      return item.score > 0;
    }).sort(function (a, b) {
      return b.score - a.score || a.name.localeCompare(b.name);
    }).slice(0, 5);
  }

  function computeAnalytics(submissions, config) {
    const reviewed = submissions.filter(function (item) {
      return item.finalDiagnosisId || item.finalDiagnosisText || item.finalCategoryId;
    });
    const diagnosisReviewed = submissions.filter(function (item) {
      return item.finalDiagnosisId;
    });
    const categoryReviewed = submissions.filter(function (item) {
      return item.finalCategoryId;
    });
    const categoryMatches = categoryReviewed.filter(function (item) {
      return item.categoryId === item.finalCategoryId;
    }).length;
    const top1 = diagnosisReviewed.filter(function (item) {
      return item.predictions[0] && item.predictions[0].diagnosisId === item.finalDiagnosisId;
    }).length;
    const top3 = diagnosisReviewed.filter(function (item) {
      return item.predictions.slice(0, 3).some(function (prediction) {
        return prediction.diagnosisId === item.finalDiagnosisId;
      });
    }).length;

    const diagnosisIds = new Set();
    config.diagnoses.forEach(function (diagnosis) { diagnosisIds.add(diagnosis.id); });
    diagnosisReviewed.forEach(function (item) { diagnosisIds.add(item.finalDiagnosisId); });

    const perDiagnosis = Array.from(diagnosisIds).map(function (diagnosisId) {
      const diagnosis = config.diagnoses.find(function (item) { return item.id === diagnosisId; });
      const finalCount = diagnosisReviewed.filter(function (item) { return item.finalDiagnosisId === diagnosisId; }).length;
      const predictedCount = submissions.filter(function (item) {
        return item.predictions.some(function (prediction) { return prediction.diagnosisId === diagnosisId; });
      }).length;
      const matches = diagnosisReviewed.filter(function (item) {
        return item.finalDiagnosisId === diagnosisId && item.predictions.some(function (prediction) { return prediction.diagnosisId === diagnosisId; });
      }).length;
      return {
        id: diagnosisId,
        name: diagnosis ? diagnosis.name : diagnosisId,
        finalCount,
        predictedCount,
        matches,
        sensitivity: finalCount ? Math.round((matches / finalCount) * 100) + "%" : "n/a",
        falsePositives: Math.max(0, predictedCount - matches)
      };
    }).filter(function (row) {
      return row.finalCount || row.predictedCount;
    });

    const matrixMap = {};
    categoryReviewed.forEach(function (item) {
      const key = item.categoryId + "|" + item.finalCategoryId;
      matrixMap[key] = (matrixMap[key] || 0) + 1;
    });
    const categoryMatrix = Object.keys(matrixMap).map(function (key) {
      const parts = key.split("|");
      const appCategory = findCategory(parts[0], config);
      const finalCategory = findCategory(parts[1], config);
      return {
        appCategory: appCategory ? appCategory.label : parts[0],
        finalCategory: finalCategory ? finalCategory.label : parts[1],
        count: matrixMap[key]
      };
    }).sort(function (a, b) {
      return b.count - a.count || a.appCategory.localeCompare(b.appCategory);
    });

    return {
      total: submissions.length,
      reviewed: reviewed.length,
      categoryRate: categoryReviewed.length ? Math.round((categoryMatches / categoryReviewed.length) * 100) + "%" : "n/a",
      top1Rate: diagnosisReviewed.length ? Math.round((top1 / diagnosisReviewed.length) * 100) + "%" : "n/a",
      top3Rate: diagnosisReviewed.length ? Math.round((top3 / diagnosisReviewed.length) * 100) + "%" : "n/a",
      perDiagnosis,
      categoryMatrix
    };
  }

  function hasDependentQuestions(questionId) {
    return state.config.branchQuestions.some(function (question) {
      return question.showIf && question.showIf.questionId === questionId;
    });
  }

  function normalizeConfig(input) {
    const source = clone(input || DEFAULT_CONFIG);
    source.version = source.version || DEFAULT_CONFIG.version;
    source.ruleVersion = source.ruleVersion || DEFAULT_CONFIG.ruleVersion;
    source.updatedAt = source.updatedAt || new Date().toISOString();
    source.redFlags = Array.isArray(source.redFlags) && source.redFlags.length ? source.redFlags : clone(DEFAULT_CONFIG.redFlags);
    source.categories = clone(DEFAULT_CONFIG.categories);
    source.baseQuestions = clone(DEFAULT_CONFIG.baseQuestions);
    source.branchQuestions = Array.isArray(source.branchQuestions) ? source.branchQuestions : [];
    source.diagnoses = Array.isArray(source.diagnoses) ? source.diagnoses : [];
    source.rules = Array.isArray(source.rules) ? source.rules : [];
    return source;
  }

  function normalizeSubmission(input) {
    return {
      id: input.id || makeId("sub"),
      clinicId: input.clinicId || input.clinic_id || "",
      categoryId: input.categoryId || input.category_id || "",
      redFlags: Array.isArray(input.redFlags) ? input.redFlags : safeJson(input.red_flags_json, []),
      answers: input.answers && typeof input.answers === "object" ? input.answers : safeJson(input.answers_json, {}),
      predictions: Array.isArray(input.predictions) ? input.predictions : safeJson(input.predictions_json, []),
      questionnaireVersion: input.questionnaireVersion || input.questionnaire_version || "",
      ruleVersion: input.ruleVersion || input.rule_version || "",
      finalCategoryId: input.finalCategoryId || input.final_category_id || "",
      finalDiagnosisId: input.finalDiagnosisId || input.final_diagnosis_id || "",
      finalDiagnosisText: input.finalDiagnosisText || input.final_diagnosis_text || "",
      reviewedAt: input.reviewedAt || input.reviewed_at || "",
      createdAt: input.createdAt || input.created_at || new Date().toISOString()
    };
  }

  function loadLocalConfig() {
    const raw = localStorage.getItem(STORAGE.config);
    if (!raw) return DEFAULT_CONFIG;
    return safeJson(raw, DEFAULT_CONFIG);
  }

  function loadLocalSubmissions() {
    return safeJson(localStorage.getItem(STORAGE.submissions), []).map(normalizeSubmission);
  }

  function saveLocalSubmission(submission) {
    const submissions = loadLocalSubmissions();
    submissions.unshift(submission);
    localStorage.setItem(STORAGE.submissions, JSON.stringify(submissions));
  }

  function replaceLocalSubmission(submission) {
    const submissions = loadLocalSubmissions();
    const index = submissions.findIndex(function (item) { return item.id === submission.id; });
    if (index >= 0) submissions[index] = submission;
    else submissions.unshift(submission);
    localStorage.setItem(STORAGE.submissions, JSON.stringify(submissions));
    state.submissions = submissions;
  }

  function findQuestion(questionId, config) {
    return (config.baseQuestions || []).concat(config.branchQuestions || []).find(function (question) {
      return question.id === questionId;
    });
  }

  function findCategory(categoryId, config) {
    return (config.categories || []).find(function (category) {
      return category.id === categoryId;
    });
  }

  function getChoiceTargets(config) {
    return (config.baseQuestions || []).concat(config.branchQuestions || []).flatMap(function (question) {
      if (question.type === "text") return [];
      return (question.options || []).map(function (option) {
        return {
          questionId: question.id,
          optionId: option.id,
          label: question.text + " -> " + option.text
        };
      });
    });
  }

  function formatAnswer(answer, question) {
    if (!answer) return "";
    if (answer.type === "text") return answer.value || "";
    if (answer.type === "multi") return (answer.labels || normalizeAnswerValues(answer)).join(", ");
    if (answer.label) return answer.label;
    const values = normalizeAnswerValues(answer);
    if (!question) return values.join(", ");
    return values.map(function (id) {
      const option = question.options.find(function (item) { return item.id === id; });
      return option ? option.text : id;
    }).join(", ");
  }

  function hasAnswer(answer) {
    if (!answer) return false;
    if (answer.type === "text") return Boolean((answer.value || "").trim());
    return normalizeAnswerValues(answer).length > 0;
  }

  function normalizeAnswerValues(answer) {
    if (!answer) return [];
    if (Array.isArray(answer.values)) return answer.values.slice();
    if (answer.value) return [answer.value];
    return [];
  }

  function freshPatientState() {
    return {
      clinicId: "",
      redFlags: [],
      answers: {}
    };
  }

  function valueOf(id) {
    const element = document.getElementById(id);
    return element ? element.value : "";
  }

  function linesOf(id) {
    return valueOf(id).split(/\r?\n/).map(function (line) {
      return line.trim();
    }).filter(Boolean);
  }

  function safeJson(raw, fallback) {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function toggleArrayValue(array, value, enabled) {
    const index = array.indexOf(value);
    if (enabled && index === -1) array.push(value);
    if (!enabled && index !== -1) array.splice(index, 1);
  }

  function slug(prefix, text) {
    const base = String(text).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 40);
    return prefix + "_" + (base || compactTimestamp());
  }

  function makeId(prefix) {
    if (window.crypto && window.crypto.randomUUID) {
      return prefix + "_" + window.crypto.randomUUID().replace(/-/g, "").slice(0, 18);
    }
    return prefix + "_" + compactTimestamp() + "_" + Math.random().toString(16).slice(2, 8);
  }

  function compactTimestamp() {
    return new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  }

  function formatDate(value) {
    if (!value) return "";
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(value));
    } catch (error) {
      return value;
    }
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    navigator.serviceWorker.register("service-worker.js").catch(function () {
      return null;
    });
  }
})();
