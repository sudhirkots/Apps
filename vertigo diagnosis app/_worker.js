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
    { id: "first_time", label: "First-time/new dizziness", patientLabel: "This is the first time I am dizzy, or this is a new episode", doctorSummary: "New first-time dizziness episode." },
    { id: "recurrent_triggered", label: "Recurrent head-movement-triggered attacks", patientLabel: "I keep getting attacks triggered by head movement, like lying down, looking up, or turning in bed", doctorSummary: "Recurrent triggered episodic vestibular pattern." },
    { id: "recurrent_spontaneous", label: "Recurrent attacks not linked to head movement", patientLabel: "I keep getting attacks even when sitting, standing, or talking, and they are not clearly triggered by head movement", doctorSummary: "Recurrent spontaneous episodic vestibular pattern." },
    { id: "persistent_unsteady", label: "Persistent dizziness or unsteadiness", patientLabel: "I do not get clear attacks; I feel dizzy or unsteady most of the time, especially while walking", doctorSummary: "Persistent dizziness or unsteadiness without discrete attacks." }
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, url);
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return json({ error: "Static assets binding is not available." }, 404);
  }
};

async function handleApi(request, env, url) {
  try {
    if (request.method === "GET" && url.pathname === "/api/health") {
      return json({ ok: true });
    }

    if (request.method === "GET" && url.pathname === "/api/config") {
      const config = await getActiveConfig(env);
      return json({ config: publicConfig(config) });
    }

    if (request.method === "POST" && url.pathname === "/api/submissions") {
      return createSubmission(request, env);
    }

    if (url.pathname === "/api/doctor/submissions" && request.method === "GET") {
      requirePin(request, env);
      const config = await getActiveConfig(env);
      const submissions = await listSubmissions(env);
      return json({ submissions, config });
    }

    const finalMatch = url.pathname.match(/^\/api\/doctor\/submissions\/([^/]+)\/final$/);
    if (finalMatch && request.method === "PUT") {
      requirePin(request, env);
      return updateFinalDiagnosis(request, env, decodeURIComponent(finalMatch[1]));
    }

    if (url.pathname === "/api/admin/config" && request.method === "GET") {
      requirePin(request, env);
      const config = await getActiveConfig(env);
      return json({ config });
    }

    if (url.pathname === "/api/admin/config" && request.method === "PUT") {
      requirePin(request, env);
      return saveConfig(request, env);
    }

    return json({ error: "Not found" }, 404);
  } catch (error) {
    const status = error.status || 500;
    return json({ error: error.message || "Server error" }, status);
  }
}

async function createSubmission(request, env) {
  requireDb(env);
  const body = await readJson(request);
  const config = await getActiveConfig(env);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const clinicId = String(body.clinicId || "").trim();
  const categoryId = String(body.categoryId || "");
  const redFlags = Array.isArray(body.redFlags) ? body.redFlags : [];
  const answers = body.answers && typeof body.answers === "object" ? body.answers : {};

  if (!clinicId) throw httpError(400, "Clinic ID is required.");
  if (!categoryId) throw httpError(400, "Category is required.");

  const predictions = scoreSubmission(config, answers);
  const submission = {
    id,
    clinicId,
    categoryId,
    redFlags,
    answers,
    predictions,
    questionnaireVersion: config.version,
    ruleVersion: config.ruleVersion,
    createdAt: now
  };

  await env.DB.prepare(
    "INSERT INTO submissions (id, clinic_id, category_id, red_flags_json, answers_json, predictions_json, questionnaire_version, rule_version, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    id,
    clinicId,
    categoryId,
    JSON.stringify(redFlags),
    JSON.stringify(answers),
    JSON.stringify(predictions),
    config.version,
    config.ruleVersion,
    now
  ).run();

  if (env.EXPORTS) {
    await env.EXPORTS.put("submissions/" + id + ".json", JSON.stringify(submission, null, 2), {
      httpMetadata: { contentType: "application/json" }
    });
  }

  return json({ submission });
}

async function listSubmissions(env) {
  requireDb(env);
  const result = await env.DB.prepare(
    "SELECT * FROM submissions ORDER BY created_at DESC LIMIT 500"
  ).all();

  return (result.results || []).map(rowToSubmission);
}

async function updateFinalDiagnosis(request, env, id) {
  requireDb(env);
  const body = await readJson(request);
  const reviewedAt = new Date().toISOString();

  await env.DB.prepare(
    "UPDATE submissions SET final_category_id = ?, final_diagnosis_id = ?, final_diagnosis_text = ?, reviewed_at = ? WHERE id = ?"
  ).bind(
    body.finalCategoryId || "",
    body.finalDiagnosisId || "",
    body.finalDiagnosisText || "",
    reviewedAt,
    id
  ).run();

  return json({ ok: true, reviewedAt });
}

async function saveConfig(request, env) {
  requireDb(env);
  const body = await readJson(request);
  const config = normalizeConfig(body.config || body);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare("UPDATE questionnaire_versions SET active = 0 WHERE active = 1").run();
  await env.DB.prepare(
    "INSERT INTO questionnaire_versions (id, version, rule_version, data, active, created_at) VALUES (?, ?, ?, ?, 1, ?)"
  ).bind(id, config.version, config.ruleVersion, JSON.stringify(config), now).run();

  if (env.EXPORTS) {
    await env.EXPORTS.put("questionnaires/" + config.version + ".json", JSON.stringify(config, null, 2), {
      httpMetadata: { contentType: "application/json" }
    });
  }

  return json({ ok: true, config });
}

async function getActiveConfig(env) {
  if (!env.DB) return normalizeConfig(DEFAULT_CONFIG);

  const row = await env.DB.prepare(
    "SELECT data FROM questionnaire_versions WHERE active = 1 ORDER BY created_at DESC LIMIT 1"
  ).first();

  if (!row || !row.data) return normalizeConfig(DEFAULT_CONFIG);
  try {
    return normalizeConfig(JSON.parse(row.data));
  } catch (error) {
    return normalizeConfig(DEFAULT_CONFIG);
  }
}

function publicConfig(config) {
  return {
    version: config.version,
    ruleVersion: config.ruleVersion,
    updatedAt: config.updatedAt,
    redFlags: config.redFlags,
    categories: config.categories,
    baseQuestions: config.baseQuestions,
    branchQuestions: config.branchQuestions.map(question => {
      const copy = { ...question };
      delete copy.doctorNote;
      return copy;
    }),
    diagnoses: [],
    rules: []
  };
}

function scoreSubmission(config, answers) {
  const byDiagnosis = {};

  (config.rules || []).filter(rule => rule.active !== false).forEach(rule => {
    const answer = answers[rule.questionId];
    if (!normalizeAnswerValues(answer).includes(rule.optionId)) return;

    const diagnosis = (config.diagnoses || []).find(item => item.id === rule.diagnosisId && item.active !== false);
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

  return Object.keys(byDiagnosis).map(id => byDiagnosis[id])
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 5);
}

function normalizeAnswerValues(answer) {
  if (!answer) return [];
  if (Array.isArray(answer.values)) return answer.values.slice();
  if (answer.value) return [answer.value];
  return [];
}

function normalizeConfig(input) {
  const source = JSON.parse(JSON.stringify(input || DEFAULT_CONFIG));
  source.version = source.version || DEFAULT_CONFIG.version;
  source.ruleVersion = source.ruleVersion || DEFAULT_CONFIG.ruleVersion;
  source.updatedAt = source.updatedAt || new Date().toISOString();
  source.redFlags = Array.isArray(source.redFlags) && source.redFlags.length ? source.redFlags : DEFAULT_CONFIG.redFlags;
  source.categories = DEFAULT_CONFIG.categories;
  source.baseQuestions = DEFAULT_CONFIG.baseQuestions;
  source.branchQuestions = Array.isArray(source.branchQuestions) ? source.branchQuestions : [];
  source.diagnoses = Array.isArray(source.diagnoses) ? source.diagnoses : [];
  source.rules = Array.isArray(source.rules) ? source.rules : [];
  return source;
}

function rowToSubmission(row) {
  return {
    id: row.id,
    clinicId: row.clinic_id,
    categoryId: row.category_id,
    redFlags: parseJson(row.red_flags_json, []),
    answers: parseJson(row.answers_json, {}),
    predictions: parseJson(row.predictions_json, []),
    questionnaireVersion: row.questionnaire_version,
    ruleVersion: row.rule_version,
    finalCategoryId: row.final_category_id || "",
    finalDiagnosisId: row.final_diagnosis_id || "",
    finalDiagnosisText: row.final_diagnosis_text || "",
    reviewedAt: row.reviewed_at || "",
    createdAt: row.created_at
  };
}

function parseJson(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (error) {
    throw httpError(400, "Invalid JSON body.");
  }
}

function requirePin(request, env) {
  const expected = env.CLINIC_PIN;
  if (!expected) throw httpError(500, "CLINIC_PIN is not configured.");
  const actual = request.headers.get("x-clinic-pin") || "";
  if (actual !== expected) throw httpError(401, "Unauthorized.");
}

function requireDb(env) {
  if (!env.DB) throw httpError(500, "D1 binding DB is not configured.");
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
