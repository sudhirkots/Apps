(function () {
  "use strict";

  const LOCAL_PIN = "1234";
  const STORAGE = {
    config: "vertigoIntake.config",
    submissions: "vertigoIntake.submissions",
    pin: "vertigoIntake.pin"
  };

  const SEEDED_CONTENT_VERSION = "recurrent-flow-v6";
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
      text: "Since it started, which best describes your dizziness?",
      help: "Choose the one that fits best — this is the most important question.",
      doctorNote: "Primary branch: continuous (AVS/neuritis territory), positional-stops (BPPV — auto-redirects to triggered category), brief spontaneous (migraine/TIA range).",
      showIf: null,
      options: [
        { id: "continuous_present", text: "It has been continuously present since it started — it never fully stops, even when I am completely still. It may feel better or worse in some positions, but it is always there." },
        { id: "positional_stops", text: "It is clearly related to head position — it comes on with certain movements, or it stops completely when the head is in a certain position." },
        { id: "brief_spells", text: "It comes in brief spells that stop on their own after a few minutes — not clearly caused by or stopped by head position." },
        { id: "not_sure", text: "I am not sure." }
      ]
    },
    {
      id: "ft_movement_effect",
      categoryId: "first_time",
      type: "single",
      required: true,
      text: "When you move your head, turn, sit up, or lie down — is there any change in the dizziness?",
      help: "Think about what happens during the movement itself.",
      doctorNote: "Distinguishes pure acute vestibular syndrome (dizziness present at rest, worsened by movement) from a positional component.",
      showIf: { questionId: "ft_current_pattern", optionId: "continuous_present" },
      options: [
        { id: "no_change", text: "No change — it stays exactly the same" },
        { id: "gets_less", text: "It gets less, but does not stop" },
        { id: "gets_worse", text: "It gets worse, but does not stop" },
        { id: "not_sure", text: "I am not sure" }
      ]
    },
    {
      id: "ft_brief_spell_duration",
      categoryId: "first_time",
      type: "single",
      required: true,
      text: "How long does each spell last before it stops on its own?",
      help: "Choose the closest answer.",
      doctorNote: "Duration of brief spontaneous spells. Under 20 minutes points to migraine-range or TIA-type episodes.",
      showIf: { questionId: "ft_current_pattern", optionId: "brief_spells" },
      options: [
        { id: "under_1_min", text: "Under 1 minute" },
        { id: "one_to_twenty_min", text: "1 to 20 minutes" },
        { id: "over_20_min", text: "More than 20 minutes" },
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
      showIf: { questionId: "ft_current_pattern", optionId: "continuous_present" },
      options: [
        { id: "stops_under_minute", text: "It stops quickly, usually within 1 minute" },
        { id: "improves_but_continues", text: "It improves but does not fully stop" },
        { id: "continues_same", text: "It continues about the same" },
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

  const SEEDED_DRAFT_BRANCH_QUESTIONS = [
    {
      id: "rt_attack_trigger",
      categoryId: "recurrent_triggered",
      type: "multi",
      required: true,
      text: "Which positional movements trigger the attacks?",
      help: "Select all that reliably bring on the dizziness.",
      doctorNote: "Recurrent positional branch. Typical brief position-triggered spells support BPPV; atypical central signs should prompt central positional vertigo review.",
      showIf: null,
      options: [
        { id: "looking_up", text: "Looking up" },
        { id: "looking_down", text: "Looking down or bending forward" },
        { id: "lying_down", text: "Lying down" },
        { id: "getting_up", text: "Getting up from lying down" },
        { id: "rolling_in_bed", text: "Rolling over in bed" },
        { id: "not_sure", text: "I am not sure" }
      ]
    },
    {
      id: "rt_attack_duration",
      categoryId: "recurrent_triggered",
      type: "single",
      required: true,
      text: "After the triggering movement, how long does the spinning or dizziness usually last?",
      help: "Choose the usual duration of the strongest part.",
      doctorNote: "Brief positional spells, especially under 1 minute, support BPPV. Longer or unusual spells need central positional vertigo and migraine review.",
      showIf: null,
      options: [
        { id: "under_one_minute", text: "Less than 1 minute" },
        { id: "one_to_five_minutes", text: "1 to 5 minutes" },
        { id: "five_to_twenty_minutes", text: "5 to 20 minutes" },
        { id: "more_than_twenty_minutes", text: "More than 20 minutes" },
        { id: "varies", text: "It varies a lot" }
      ]
    },
    {
      id: "rt_central_features",
      categoryId: "recurrent_triggered",
      type: "multi",
      required: true,
      text: "During positional attacks, do any of these happen?",
      help: "Select all that apply.",
      doctorNote: "Central positional vertigo screen alongside BPPV. Neurologic symptoms, severe headache, or marked gait impairment need urgent clinician review.",
      showIf: null,
      options: [
        { id: "double_vision", text: "Double vision" },
        { id: "slurred_speech", text: "Slurring of speech or difficulty speaking" },
        { id: "one_sided_tingling_weakness", text: "Tingling, numbness, or weakness on one side of the body" },
        { id: "cannot_walk", text: "Inability to walk during the attack" },
        { id: "severe_headache_neck_pain", text: "Sudden severe headache or neck pain" },
        { id: "none", text: "None of these" }
      ]
    },
    {
      id: "rs_spontaneous_pattern",
      categoryId: "recurrent_spontaneous",
      type: "single",
      required: true,
      text: "Are these attacks unrelated to looking up, looking down, lying down, getting up, or rolling in bed?",
      help: "Choose yes if attacks can happen while sitting, standing, watching TV, using a computer, or doing other work without a head-position trigger.",
      doctorNote: "Confirms spontaneous non-positional recurrent vertigo pattern before migraine, TIA, and Meniere feature screens.",
      showIf: null,
      options: [
        { id: "yes_spontaneous", text: "Yes, they can happen without those positional triggers" },
        { id: "sometimes_positional", text: "Sometimes there is a positional trigger" },
        { id: "not_sure", text: "I am not sure" }
      ]
    },
    {
      id: "rs_migraine_profile",
      categoryId: "recurrent_spontaneous",
      type: "multi",
      required: true,
      text: "Do any migraine features fit these vertigo attacks?",
      help: "Select all that apply during, before, or around the vertigo attacks.",
      doctorNote: "Possible vestibular migraine screen: migraine history, migraine-timed headaches, travel or stress triggers, nausea, photophobia, phonophobia, and vomiting.",
      showIf: null,
      options: [
        { id: "young_patient", text: "The patient is young" },
        { id: "migraine_history", text: "History of migraine headaches" },
        { id: "headache_before_during_after", text: "Headache occurs before, during, at the same time as, or after the vertigo attack" },
        { id: "late_night_travel_stress", text: "Late-night travel or stress can trigger the vertigo attack" },
        { id: "nausea", text: "Nausea during the vertigo attack" },
        { id: "photophobia", text: "Light sensitivity during the attack" },
        { id: "phonophobia", text: "Sound sensitivity during the attack" },
        { id: "vomiting", text: "Vomiting during the attack" },
        { id: "none", text: "None of these" }
      ]
    },
    {
      id: "rs_vascular_risk",
      categoryId: "recurrent_spontaneous",
      type: "multi",
      required: true,
      text: "Does the patient have vertebro-basilar TIA risk factors?",
      help: "Select all that apply.",
      doctorNote: "Possible vertebro-basilar TIA context: age over 60 and vascular risk factors.",
      showIf: null,
      options: [
        { id: "age_over_60", text: "Age over 60" },
        { id: "diabetes", text: "Diabetes" },
        { id: "hypertension", text: "Hypertension" },
        { id: "smoking", text: "Smoking" },
        { id: "heart_disease", text: "Heart disease" },
        { id: "none", text: "None of these" }
      ]
    },
    {
      id: "rs_vascular_warning",
      categoryId: "recurrent_spontaneous",
      type: "multi",
      required: true,
      text: "During the vertigo attack, are there any neurologic warning symptoms?",
      help: "Select symptoms that happen during the attack, even if they go away.",
      doctorNote: "Possible vertebro-basilar TIA screen: diplopia, dysarthria, unilateral sensory/motor symptoms, and inability to walk during attacks.",
      showIf: null,
      options: [
        { id: "double_vision", text: "Double vision" },
        { id: "slurred_speech", text: "Slurring of speech or difficulty speaking" },
        { id: "one_sided_tingling_weakness", text: "Tingling, numbness, or weakness on one side of the body" },
        { id: "cannot_walk", text: "Inability to walk during the attack" },
        { id: "none", text: "None of these" }
      ]
    },
    {
      id: "rs_meniere_features",
      categoryId: "recurrent_spontaneous",
      type: "multi",
      required: true,
      text: "Do any one-ear ringing, fullness, or hearing symptoms occur with the attacks?",
      help: "Select symptoms that happen during or before attacks.",
      doctorNote: "Possible Meniere's disease screen: unilateral low-pitched tinnitus, ear fullness, tinnitus before vertigo, and fluctuating/progressive hearing loss. Duration over 20 minutes is required but is not sufficient by itself.",
      showIf: null,
      options: [
        { id: "loud_one_ear_tinnitus", text: "Loud ringing sound in one ear" },
        { id: "low_pitched_tinnitus", text: "The ringing is preferably low pitched" },
        { id: "ear_fullness", text: "Fullness or heaviness in the ear during or before the attack" },
        { id: "tinnitus_before_vertigo", text: "Ringing may precede the attack of vertigo" },
        { id: "hearing_loss_during_attack", text: "Hearing loss during the attack" },
        { id: "progressive_one_ear_hearing_loss", text: "Gradually progressive hearing loss in one ear" },
        { id: "none", text: "None of these" }
      ]
    },
    {
      id: "pu_duration",
      categoryId: "persistent_unsteady",
      type: "single",
      required: true,
      text: "How long have you felt dizzy or unsteady most days?",
      help: "Choose the closest answer.",
      doctorNote: "Draft persistent-unsteady step for duration pattern.",
      showIf: null,
      options: [
        { id: "under_one_week", text: "Less than 1 week" },
        { id: "one_to_four_weeks", text: "1 to 4 weeks" },
        { id: "one_to_three_months", text: "1 to 3 months" },
        { id: "more_than_three_months", text: "More than 3 months" },
        { id: "not_sure", text: "I am not sure" }
      ]
    },
    {
      id: "pu_worse_context",
      categoryId: "persistent_unsteady",
      type: "multi",
      required: true,
      text: "What tends to make the persistent dizziness or unsteadiness worse?",
      help: "Select all that apply.",
      doctorNote: "Draft persistent-unsteady step for motion, visual, upright, and walking sensitivity.",
      showIf: null,
      options: [
        { id: "standing_walking", text: "Standing or walking" },
        { id: "busy_visual_places", text: "Busy visual places like markets or traffic" },
        { id: "screens_reading", text: "Screens or reading" },
        { id: "head_movement", text: "Head movement" },
        { id: "dark_uneven_ground", text: "Darkness or uneven ground" },
        { id: "none_clear", text: "No clear pattern" }
      ]
    },
    {
      id: "pu_onset_context",
      categoryId: "persistent_unsteady",
      type: "multi",
      required: true,
      text: "What was happening around the time this persistent problem started?",
      help: "Select all that apply.",
      doctorNote: "Draft persistent-unsteady step for trigger context.",
      showIf: null,
      options: [
        { id: "after_vertigo_attack", text: "After a vertigo attack" },
        { id: "after_illness", text: "After an illness or infection" },
        { id: "after_fall_injury", text: "After a fall, head injury, or surgery" },
        { id: "new_medicine", text: "After a new medicine or dose change" },
        { id: "stress_anxiety", text: "During high stress or anxiety" },
        { id: "no_clear_start", text: "No clear start" }
      ]
    },
    {
      id: "pu_falls_walking",
      categoryId: "persistent_unsteady",
      type: "single",
      required: true,
      text: "How has this affected walking or falls?",
      help: "Choose the safest answer.",
      doctorNote: "Draft persistent-unsteady step for fall risk and functional impact.",
      showIf: null,
      options: [
        { id: "walks_normally", text: "I walk normally" },
        { id: "cautious_no_falls", text: "I am cautious but have not fallen" },
        { id: "near_falls", text: "I have had near-falls" },
        { id: "fallen", text: "I have fallen" },
        { id: "needs_support", text: "I need support to walk safely" }
      ]
    },
    {
      id: "pu_associated_symptoms",
      categoryId: "persistent_unsteady",
      type: "multi",
      required: true,
      text: "Which symptoms are present with the persistent dizziness or unsteadiness?",
      help: "Select all that apply.",
      doctorNote: "Draft persistent-unsteady step for associated symptom review.",
      showIf: null,
      options: [
        { id: "hearing_loss", text: "Hearing loss" },
        { id: "tinnitus", text: "Tinnitus" },
        { id: "numb_feet", text: "Numbness or reduced feeling in the feet" },
        { id: "neck_pain", text: "Neck pain" },
        { id: "faint_lightheaded", text: "Lightheaded or faint feeling" },
        { id: "none", text: "None of these" }
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
      },
      {
        id: "recurrent_unclear",
        label: "Recurrent vertigo, positional clarity uncertain",
        patientLabel: "I have recurrent vertigo, but I am not sure whether it is positional",
        doctorSummary: "Recurrent vertigo requiring clarification of positional versus non-positional pattern."
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
    branchQuestions: SEEDED_FIRST_TIME_QUESTIONS.concat(SEEDED_DRAFT_BRANCH_QUESTIONS),
    diagnoses: [],
    rules: []
  };

  const INITIAL_CLASSIFICATION_OPTIONS = [
    { id: "attack", label: "This is an attack of dizziness or vertigo.", title: "An attack", description: "A sudden spell of dizziness or vertigo that comes on and may go away", categoryId: "", icon: "spark" },
    { id: "constant", label: "I don't have any attack, but there is constant dizziness or constant imbalance whenever I try to walk.", title: "Constant dizziness or imbalance", description: "Dizziness or imbalance that is present most of the time, not in separate spells", categoryId: "persistent_unsteady", icon: "balance" }
  ];

  const ATTACK_PATTERN_OPTIONS = [
    { id: "first_attack", label: "This is the first time I am feeling dizzy or unsteady in life.", title: "First attack ever", description: "I have never had dizziness or vertigo like this before in my life", categoryId: "first_time", icon: "spark" },
    { id: "recurrent", label: "I keep getting spells of dizziness or vertigo or imbalance off and on.", title: "Recurrent attacks", description: "I have had similar spells of dizziness or vertigo before", categoryId: "", icon: "rotate" }
  ];

  const RECURRENT_POSITION_OPTIONS = [
    { id: "positional", label: "Positional vertigo", categoryId: "recurrent_triggered" },
    { id: "non_positional", label: "Non-positional recurrent vertigo", categoryId: "recurrent_spontaneous" },
    { id: "unclear", label: "Unclear", categoryId: "recurrent_unclear" }
  ];

  const NEXT_LEVEL_OPTIONS = {
    first_time: [
      "Acute vestibular syndrome",
      "Posterior circulation stroke/TIA",
      "Vestibular neuritis",
      "Labyrinthitis",
      "First episode vestibular migraine",
      "Medical/systemic cause"
    ],
    recurrent_triggered: [
      "Posterior canal BPPV",
      "Horizontal canal BPPV",
      "Anterior canal BPPV",
      "Cupulolithiasis",
      "Positional central vertigo",
      "Vestibular migraine mimicking BPPV"
    ],
    recurrent_spontaneous: [
      "Vestibular migraine",
      "Meniere's disease",
      "Vestibular paroxysmia",
      "TIA",
      "Panic/anxiety-related episodes",
      "Epileptic vertigo"
    ],
    recurrent_unclear: [
      "Posterior canal BPPV",
      "Horizontal canal BPPV",
      "Positional central vertigo",
      "Vestibular migraine",
      "Meniere's disease",
      "TIA"
    ],
    persistent_unsteady: [
      "PPPD",
      "Bilateral vestibulopathy",
      "Cerebellar ataxia",
      "Sensory ataxia/peripheral neuropathy",
      "Parkinsonism",
      "Functional dizziness",
      "Drug-induced dizziness"
    ]
  };

  const SIMPLE_POSITIONAL_QUESTIONS = [
    {
      id: "pos_trigger",
      text: "Which movement usually brings on the dizziness?",
      help: "Select all that apply.",
      type: "multi",
      options: [
        { id: "turning_in_bed", text: "Only on turning over in bed" },
        { id: "lying_down_sitting_up", text: "Only on lying down or sitting up" },
        { id: "looking_up", text: "Only on looking up" },
        { id: "looking_down", text: "Only on looking down or bending forward" },
        { id: "any_all", text: "Any or all of these movements" }
      ]
    },
    {
      id: "pos_side",
      text: "Is one side worse than the other?",
      type: "single",
      options: [
        { id: "right", text: "Right side — worse when turning right or lying on the right", desc: "" },
        { id: "left", text: "Left side — worse when turning left or lying on the left", desc: "" },
        { id: "both", text: "Both sides seem equally bad" },
        { id: "not_sure", text: "Not sure" }
      ]
    },
    {
      id: "pos_duration",
      text: "How long does each dizzy spell last once it starts?",
      type: "single",
      options: [
        { id: "under_five_min", text: "Less than 5 minutes", desc: "The spinning lasts a few seconds to a minute, though a mild unsteadiness may linger for up to 3–4 minutes — but under 5 minutes in total" },
        { id: "over_five_min", text: "More than 5 minutes each time" }
      ]
    }
  ];

  const SIMPLE_PATIENT_QUESTIONS = [
    {
      id: "feeling",
      text: "Are you getting an attack of dizziness, or is it a constant feeling of dizziness?",
      type: "single",
      options: [
        { id: "brief_resolved", text: "A brief attack that has now gone", desc: "It lasted only a few seconds or minutes and has gone away completely now" },
        { id: "single_attack", text: "A single attack", desc: "This is the first time I am feeling dizzy or having vertigo" },
        { id: "repeated_attacks", text: "Repeated attacks", desc: "I keep getting episodes that come and go away on their own" },
        { id: "constant", text: "Constant dizziness or giddiness", desc: "I have been feeling dizzy or unsteady all or most of the time — there are no attacks as such" }
      ]
    },
    {
      id: "pattern",
      text: "Has this happened before?",
      type: "single",
      options: [
        { id: "first_time", text: "This is the first time", desc: "I have never felt this before" },
        { id: "repeated", text: "I keep getting attacks", desc: "Episodes that come and go" },
        { id: "constant", text: "It has been there constantly", desc: "Present most of the time for days" }
      ]
    },
    {
      id: "recurrent_head_trigger",
      text: "What triggers your attacks?",
      help: "Choose the closest answer.",
      type: "single",
      options: [
        { id: "yes", text: "Sudden head movement, for example looking up, looking down, lying down, getting up from bed, or rolling over in bed" },
        { id: "no", text: "They happen without any head movement, for example when I am watching television, working on a computer, or working in a kitchen without moving my head. I suddenly get an attack of dizziness" },
        { id: "not_sure", text: "I don't know. I am not sure if they happen with head movement. Sometimes they happen with head movement, and sometimes they happen without any head movement." }
      ]
    },
    {
      id: "recurrent_trigger_clarify",
      text: "Please try once more: when do the attacks happen?",
      help: "Choose the closest answer. This helps separate positional vertigo from spontaneous non-positional vertigo.",
      type: "single",
      options: [
        { id: "sitting_still", text: "It can happen while I am sitting and watching television, working on a computer, or doing something without moving my head" },
        { id: "only_head_position", text: "It happens only when I turn in bed, look up, look down, bend forward, lie down, or get up" },
        { id: "still_not_sure", text: "I still cannot tell whether it is related to head movement" }
      ]
    },
    {
      id: "spontaneous_confirm",
      text: "Do your attacks happen when you are sitting still, working on a computer, or watching television without any head movement?",
      help: "Choose yes if you suddenly get spinning or dizziness even though you have not moved your head.",
      type: "single",
      options: [
        { id: "yes", text: "Yes, I get an attack of spinning or dizziness without head movement" },
        { id: "no", text: "No, they are usually related to head movement" },
        { id: "not_sure", text: "I am not sure" }
      ]
    },
    {
      id: "recurrent_spontaneous_duration",
      text: "How long does each spontaneous vertigo attack usually last?",
      help: "This helps separate short attacks from attacks where Meniere's disease can be considered.",
      type: "single",
      options: [
        { id: "under_twenty_minutes", text: "Less than 20 minutes" },
        { id: "over_twenty_minutes", text: "More than 20 minutes" },
        { id: "not_sure", text: "I am not sure" }
      ]
    },
    {
      id: "recurrent_migraine_features",
      text: "Do any migraine features fit these attacks?",
      help: "Select all that apply.",
      type: "multi",
      options: [
        { id: "young_patient", text: "I am young" },
        { id: "migraine_history", text: "I have had migraine headaches in the past" },
        { id: "headache_with_vertigo", text: "Headache happens before, during, or after the vertigo attack" },
        { id: "late_night_travel_stress_missed_meal", text: "Late night, travel, missing a meal, or stress can trigger the attack" },
        { id: "nausea_or_vomiting", text: "Nausea or vomiting during the attack" },
        { id: "light_or_sound_sensitivity", text: "Light sensitivity or sound sensitivity during the attack" },
        { id: "none", text: "None of these" }
      ]
    },
    {
      id: "recurrent_tia_risk",
      text: "Do any stroke risk factors apply?",
      help: "Select all that apply.",
      type: "multi",
      options: [
        { id: "age_over_60", text: "Age over 60" },
        { id: "diabetes", text: "Diabetes" },
        { id: "hypertension", text: "Hypertension or high blood pressure" },
        { id: "smoking", text: "Smoking" },
        { id: "heart_disease", text: "Heart disease or irregular heart rhythm" },
        { id: "none", text: "None of these" }
      ]
    },
    {
      id: "recurrent_tia_warnings",
      text: "During the vertigo attacks, do any warning symptoms happen?",
      help: "Select all that apply, even if they go away after the attack.",
      type: "multi",
      options: [
        { id: "double_vision", text: "Double vision" },
        { id: "slurred_speech", text: "Slurring of speech or difficulty speaking" },
        { id: "one_sided_tingling_weakness", text: "Tingling, numbness, or weakness on one side of the body" },
        { id: "cannot_walk", text: "Unable to walk during the attack" },
        { id: "none", text: "No red flags" }
      ]
    },
    {
      id: "recurrent_meniere_features",
      text: "Do any one-ear ringing, fullness, or hearing symptoms happen before or during attacks?",
      help: "Select all that apply. These features support Meniere's disease only when the vertigo attacks last more than 20 minutes.",
      type: "multi",
      options: [
        { id: "loud_one_ear_ringing", text: "Loud ringing sound in one ear" },
        { id: "low_pitched_machine_sound", text: "The ringing is low pitched, like a machine" },
        { id: "ear_fullness", text: "Fullness or heaviness in one ear" },
        { id: "fluctuating_hearing_loss", text: "Hearing worsens before or during the attack, then fluctuates" },
        { id: "progressive_one_year_hearing_loss", text: "Hearing loss has gradually progressed over about one year" },
        { id: "none", text: "None of these" }
      ]
    },
    {
      id: "recurrent_orthostatic_features",
      text: "Could these attacks be related to standing up suddenly?",
      help: "Select all that apply.",
      type: "multi",
      options: [
        { id: "standing_from_lying", text: "I feel dizzy only when I stand up suddenly from lying down" },
        { id: "getting_up_washroom", text: "I feel dizzy when I get up to go to the washroom" },
        { id: "bp_medicines", text: "I am on blood pressure medicines" },
        { id: "prostate_medicines", text: "I am on medicines for prostate enlargement" },
        { id: "none", text: "No" }
      ]
    },
    {
      id: "recurrent_panic_features",
      text: "Do you suddenly feel fear, palpitations, breathlessness, or chest discomfort with these attacks?",
      help: "Select all that apply. These symptoms can point toward panic attacks or anxiety-related episodes.",
      type: "multi",
      options: [
        { id: "fear", text: "Sudden fear during the attack" },
        { id: "palpitations", text: "Palpitations or racing heartbeat" },
        { id: "breathlessness", text: "Breathlessness" },
        { id: "chest_discomfort", text: "Chest discomfort" },
        { id: "impending_doom", text: "A sense of impending doom" },
        { id: "none", text: "No" }
      ]
    },
    {
      id: "stops_still",
      text: "Does the dizziness stop on holding your head still or lying in one particular position?",
      type: "single",
      options: [
        { id: "yes_returns", text: "Yes — it stops in one position, but comes back when I move" },
        { id: "no", text: "No — it continues, or gets a little less, but it does not stop" }
      ]
    },
    {
      id: "duration",
      text: "How long does each episode last?",
      type: "single",
      options: [
        { id: "seconds", text: "Seconds" },
        { id: "minutes", text: "Minutes (under 20)" },
        { id: "hours", text: "Hours" },
        { id: "nonstop", text: "It has not stopped" }
      ]
    },
    {
      id: "urgent",
      text: "Do you have any of these right now?",
      type: "single",
      urgent: true,
      list: [
        "Double vision",
        "Tingling or numbness on one side of the body",
        "Slurred speech or trouble speaking",
        "Weakness on one side of the body",
        "Unable to walk or stand without support",
        "Sudden severe headache or neck pain"
      ],
      options: [
        { id: "yes", text: "Yes — I have one or more of these" },
        { id: "none", text: "None of these" }
      ]
    },
    {
      id: "brief_risk_factors",
      text: "Do you have any of these?",
      help: "Select all that apply.",
      type: "multi",
      options: [
        { id: "age_over_60", text: "Age over 60" },
        { id: "hypertension", text: "High blood pressure (hypertension)" },
        { id: "diabetes", text: "Diabetes" },
        { id: "heart_disease", text: "Heart disease or irregular heart rhythm" },
        { id: "none", text: "None of these" }
      ]
    },
    {
      id: "brief_circumstances",
      text: "Which of these best describes what happened?",
      type: "single",
      options: [
        { id: "night_urination", text: "It happened at night when getting up to pass urine", desc: "Woke up during the night, stood up to go to the toilet, and felt dizzy" },
        { id: "stood_up_bp_med", text: "I stood up suddenly and felt dizzy — and I take blood pressure or prostate medicine", desc: "Felt dizzy on standing up, and I am on BP or prostate tablets" },
        { id: "migraine_preceded", text: "I have a history of migraine and this was preceded by a typical migraine-like headache", desc: "I get migraines, and this episode came on just like one" },
        { id: "none", text: "None of these — I am not sure what caused it", desc: "Cannot identify a clear cause from the above" }
      ]
    },
    {
      id: "single_red_flags",
      text: "Does your current attack involve any of the following?",
      type: "single",
      list: [
        "Any dizziness or unsteadiness in the days or weeks before this attack",
        "Double vision, tingling on one side, slurred speech, or weakness",
        "Age over 60, high blood pressure, diabetes, or heart disease",
        "New ringing in the ears (tinnitus) or reduced hearing in one ear"
      ],
      options: [
        { id: "yes", text: "Yes — one or more of these apply" },
        { id: "none", text: "None of these" }
      ]
    },
    {
      id: "single_red_flag_detail",
      text: "Which of these apply to you?",
      help: "Select all that apply.",
      type: "multi",
      options: [
        { id: "pre_attack_dizziness", text: "Dizziness or unsteadiness in the days or weeks before this attack" },
        { id: "double_vision", text: "Double vision" },
        { id: "tingling_one_side", text: "Tingling or numbness on one side of the body" },
        { id: "slurred_speech", text: "Slurred speech or difficulty speaking" },
        { id: "weakness_one_side", text: "Weakness on one side of the body" },
        { id: "new_ringing", text: "New ringing in the ears (tinnitus)" },
        { id: "reduced_hearing", text: "Reduced hearing in one ear" }
      ]
    },
    {
      id: "ear",
      text: "Any ear symptoms with the dizziness?",
      help: "Select all that apply.",
      type: "multi",
      options: [
        { id: "ringing", text: "Ringing or buzzing in one ear" },
        { id: "hearing_loss", text: "Reduced hearing in one ear" },
        { id: "fullness", text: "Fullness or pressure in one ear" },
        { id: "none", text: "None" }
      ]
    },
    {
      id: "headache",
      text: "Is there a headache along with the dizziness?",
      type: "single",
      options: [
        { id: "yes_severe", text: "Yes, a severe headache" },
        { id: "yes_mild", text: "Yes, a mild headache" },
        { id: "no", text: "No headache" }
      ]
    }
  ];

  const EXAMINATION_POINTERS = {
    first_time_continuous: [
      "HINTs exam — Head Impulse test, Nystagmus direction, Test of Skew",
      "Spontaneous nystagmus: direction-fixed suggests peripheral; direction-changing suggests central",
      "Romberg test and tandem gait",
      "Finger-nose coordination (cerebellar screen)"
    ],
    first_time_brief: [
      "Orthostatic blood pressure (lying, sitting, standing)",
      "Audiometry or tuning fork — Rinne and Weber",
      "Migraine history and current headache screen",
      "Basic cranial nerve and cerebellar exam"
    ],
    recurrent_triggered: [
      "Dix-Hallpike test — right side first, then left",
      "Supine roll test (for horizontal canal BPPV)",
      "Note nystagmus direction, latency, and fatigability",
      "Romberg with eyes closed"
    ],
    recurrent_spontaneous: [
      "Audiometry — pure tone and speech discrimination",
      "Orthostatic blood pressure",
      "Migraine feature screen and headache diary review",
      "Basic neurological exam — cranial nerves, cerebellar signs"
    ],
    recurrent_unclear: [
      "Dix-Hallpike test (right and left)",
      "Supine roll test",
      "Audiometry",
      "Orthostatic blood pressure"
    ],
    persistent_unsteady: [
      "Romberg test — eyes open versus eyes closed",
      "Tandem gait",
      "Orthostatic blood pressure",
      "Peripheral neuropathy screen — vibration sense, ankle reflexes"
    ]
  };

  const state = {
    tab: "",
    role: "",
    cloud: false,
    status: "",
    config: normalizeConfig(loadLocalConfig()),
    patient: freshPatientState(),
    submitted: null,
    simplePatient: freshSimplePatientState(),
    doctorUnlocked: false,
    adminUnlocked: false,
    clinicianPin: localStorage.getItem(STORAGE.pin) || "",
    submissions: loadLocalSubmissions(),
    selectedSubmissionId: null,
    editingQuestionId: null,
    pendingFinalDiagnosis: null
  };

  const app = document.getElementById("app");
  const syncStatus = document.getElementById("syncStatus");
  const roleTabs = document.querySelector(".role-tabs");
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
    attachHeaderTapGate();
    render();
  }

  function attachHeaderTapGate() {
    const header = document.querySelector(".app-header");
    if (!header) return;
    let taps = 0;
    let timer = null;
    header.addEventListener("click", function () {
      taps++;
      clearTimeout(timer);
      if (taps >= 7) {
        taps = 0;
        setTab("admin");
      } else {
        timer = setTimeout(function () { taps = 0; }, 3000);
      }
    });
  }

  function setTab(tab) {
    if (tab !== "patient" && tab !== "doctor" && tab !== "admin") return;
    state.tab = tab;
    render();
    app.focus();
  }

  function render() {
    document.title = "Vertigo Guide";
    if (syncStatus) {
      syncStatus.textContent = state.status || "";
      syncStatus.style.display = state.status ? "" : "none";
    }
    if (roleTabs) {
      roleTabs.classList.toggle("hidden", state.tab !== "doctor" && state.tab !== "admin");
      tabs.forEach(function (button) {
        button.classList.toggle("active", button.dataset.tab === state.tab);
      });
    }

    if (!state.role) {
      renderLanding();
      return;
    }

    if (state.role === "patient_simple") {
      renderSimplePatient();
      return;
    }

    if (state.role === "doctor_guidance") {
      renderDoctorGuidance();
      return;
    }

    if (state.tab === "patient") {
      renderPatient();
      return;
    }

    if (state.tab === "doctor") {
      renderDoctor();
      return;
    }

    if (state.tab === "admin") {
      renderAdmin();
      return;
    }

    renderLanding();
  }

  function renderLanding() {
    app.innerHTML = [
      '<div class="landing-wrapper">',
      '<div class="landing-hero">',
      dizzyPersonSvg(),
      '<h1 class="landing-title">Vertigo Guide</h1>',
      '<p class="landing-subtitle">Understanding and assessing dizziness and vertigo</p>',
      '</div>',
      '<div class="landing-roles">',
      '<button class="landing-role-card" type="button" data-action="choose-role" data-role="patient_simple">',
      '<div class="landing-role-icon patient-icon">' + iconSvg("head") + '</div>',
      '<div class="landing-role-body">',
      '<div class="landing-role-title">I am a patient</div>',
      '<div class="landing-role-desc">Help me describe my dizziness to my doctor</div>',
      '</div>',
      '</button>',
      '<button class="landing-role-card landing-role-card--soon" type="button" tabindex="-1">',
      '<div class="landing-role-icon doctor-icon">' + iconSvg("clipboard") + '</div>',
      '<div class="landing-role-body">',
      '<div class="landing-role-title">I am a doctor</div>',
      '<div class="landing-role-desc">Clinical intake questionnaire, diagnostic support, and decision guidance</div>',
      '</div>',
      '</button>',
      '</div>',
      '</div>'
    ].join("");
  }

  function renderPatient() {
    if (state.submitted) {
      renderPatientResult();
      return;
    }

    const answers = state.patient.answers;

    if (!hasInitialClassification(answers)) {
      renderPatientStep(answers);
      return;
    }

    if (!state.patient.safetyDone) {
      if (state.patient.safetyWarningShown) {
        renderSafetyWarning();
      } else {
        renderSafetyScreen();
      }
      return;
    }

    const config = state.config;
    const categoryId = getCurrentCategoryId(answers, config);

    if (categoryId === "recurrent_triggered" && answers.ft_current_pattern && answers.ft_current_pattern.value === "positional_stops" && !state.patient.positionalRedirectAcknowledged) {
      renderPositionalRedirectNotice();
      return;
    }

    const visibleQuestions = getVisibleBranchQuestions(categoryId, answers, config);
    const step = Math.min(state.patient.questionStep, visibleQuestions.length);

    if (step < visibleQuestions.length) {
      renderBranchQuestionStep(visibleQuestions[step], step, visibleQuestions.length);
      return;
    }
    renderSubmitScreen(categoryId, config);
  }

  function renderPatientStep(answers) {
    const initialValue = answers.initial_pathway && answers.initial_pathway.value ? answers.initial_pathway.value : "";
    const attackValue = answers.attack_pattern && answers.attack_pattern.value ? answers.attack_pattern.value : "";

    let question, options, gridClass, backAction;

    if (!initialValue) {
      question = "Is it an attack, or is there constant dizziness or a constant feeling of imbalance?";
      options = INITIAL_CLASSIFICATION_OPTIONS.map(function (option) {
        return [
          '<label class="classification-card">',
          '<input class="sr-only" type="radio" name="initial_pathway" data-initial-pathway="' + escapeHtml(option.id) + '">',
          '<span class="pattern-art ' + escapeHtml(option.categoryId || option.id) + '">' + iconSvg(option.icon) + '</span>',
          '<div class="classification-card-body">',
          '<div class="classification-card-title">' + escapeHtml(option.title || option.label) + '</div>',
          '<div class="classification-card-desc">' + escapeHtml(option.description || "") + '</div>',
          '</div>',
          '</label>'
        ].join("");
      });
      gridClass = "two-col";
      backAction = "go-home";
    } else if (initialValue === "attack") {
      question = "Is this the first time you have had dizziness, or do you keep getting attacks?";
      options = ATTACK_PATTERN_OPTIONS.map(function (option) {
        return [
          '<label class="classification-card">',
          '<input class="sr-only" type="radio" name="attack_pattern" data-attack-pattern="' + escapeHtml(option.id) + '">',
          '<div class="classification-card-body">',
          '<div class="classification-card-title">' + escapeHtml(option.title || option.label) + '</div>',
          '<div class="classification-card-desc">' + escapeHtml(option.description || "") + '</div>',
          '</div>',
          '</label>'
        ].join("");
      });
      gridClass = "two-col";
      backAction = "back-step";
    } else {
      question = "Are the attacks clearly positional?";
      options = RECURRENT_POSITION_OPTIONS.map(function (option) {
        return [
          '<label class="classification-card">',
          '<input class="sr-only" type="radio" name="recurrent_position" data-recurrent-position="' + escapeHtml(option.id) + '">',
          '<span class="pattern-label">' + escapeHtml(option.label) + '</span>',
          '</label>'
        ].join("");
      });
      gridClass = "compact";
      backAction = "back-step";
    }

    app.innerHTML = [
      '<div class="role-selection-wrapper">',
      '<section class="panel patient-classification-panel">',
      '<button class="back-button" type="button" data-action="' + backAction + '">' + iconSvg("back") + ' Back</button>',
      '<div class="classification-panel">',
      '<p class="classification-question-heading">' + escapeHtml(question) + '</p>',
      '<div class="classification-grid ' + gridClass + '">',
      options.join(""),
      '</div>',
      '</div>',
      '</section>',
      '</div>'
    ].join("");
  }

  function renderSafetyScreen() {
    const config = state.config;
    const noneChecked = state.patient.safetyNoneSelected;
    app.innerHTML = [
      '<div class="role-selection-wrapper">',
      '<section class="panel patient-classification-panel">',
      '<button class="back-button" type="button" data-action="back-step">' + iconSvg("back") + ' Back</button>',
      safetyPicture(),
      '<h2 class="safety-title">Safety Check</h2>',
      '<p class="safety-subtitle">Do you have any of these warning symptoms right now? Select all that apply.</p>',
      '<div class="safety-two-col">',
      '<div class="safety-flags-col">',
      '<div class="safety-col-label safety-col-label-red">' + iconSvg("alert") + ' Red flag symptoms</div>',
      '<div class="safety-flag-list">',
      config.redFlags.map(function (flag) {
        const checked = state.patient.redFlags.includes(flag.id) ? " checked" : "";
        return [
          '<label class="safety-flag-item">',
          '<input type="checkbox" data-red-flag="' + escapeHtml(flag.id) + '"' + checked + '>',
          '<span class="safety-flag-icon">' + iconSvg(iconForRedFlag(flag.id)) + '</span>',
          '<span>' + escapeHtml(flag.text) + '</span>',
          '</label>'
        ].join("");
      }).join(""),
      '</div>',
      '</div>',
      '<div class="safety-none-col">',
      '<div class="safety-col-label safety-col-label-green">' + iconSvg("ok") + ' All clear</div>',
      '<label class="safety-none-item">',
      '<div class="safety-none-big-icon">' + iconSvg("ok") + '</div>',
      '<input type="checkbox" data-safety-none' + (noneChecked ? " checked" : "") + '>',
      '<span>None of these apply to me</span>',
      '</label>',
      '</div>',
      '</div>',
      state.patient.redFlags.length > 0 ? '<div class="actions"><button class="button" type="button" data-action="safety-continue">Done — symptoms noted</button></div>' : "",
      '</section>',
      '</div>'
    ].join("");
  }

  function renderSafetyWarning() {
    const flagTexts = state.patient.redFlags.map(function (id) {
      const flag = state.config.redFlags.find(function (f) { return f.id === id; });
      return flag ? flag.text : id;
    });
    app.innerHTML = [
      '<div class="role-selection-wrapper">',
      '<section class="panel patient-classification-panel safety-warning-panel">',
      '<button class="back-button" type="button" data-action="safety-back">' + iconSvg("back") + ' Back</button>',
      '<div class="safety-warning-icon">' + iconSvg("alert") + '</div>',
      '<h2 class="safety-warning-title">Seek urgent medical attention</h2>',
      '<p class="safety-warning-text">You have reported one or more urgent warning symptoms. Please <strong>contact your doctor immediately</strong> or go to the nearest <strong>hospital emergency department</strong> now.</p>',
      '<div class="safety-warning-flags">',
      flagTexts.map(function (text) {
        return '<div class="safety-warning-flag-item">' + iconSvg("alert") + '<span>' + escapeHtml(text) + '</span></div>';
      }).join(""),
      '</div>',
      '<p class="safety-warning-note">You may still complete the intake form so your doctor has your full history.</p>',
      '<div class="actions">',
      '<button class="button danger" type="button" data-action="safety-acknowledge">I understand — continue to form</button>',
      '</div>',
      '</section>',
      '</div>'
    ].join("");
  }

  function renderPatientResult() {
    const submission = state.submitted;
    const category = findCategory(submission.categoryId, state.config);
    const hasRedFlags = submission.redFlags.length > 0;

    app.innerHTML = [
      '<section class="panel">',
      '<button class="back-button" type="button" data-action="go-home">' + iconSvg("back") + ' Back</button>',
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

  function renderPositionalRedirectNotice() {
    app.innerHTML = [
      '<div class="role-selection-wrapper">',
      '<section class="panel patient-classification-panel">',
      '<button class="back-button" type="button" data-action="back-positional-redirect">' + iconSvg("back") + ' Back</button>',
      '<div class="classification-panel">',
      '<div class="submit-check-icon">' + iconSvg("rotate") + '</div>',
      '<p class="classification-question-heading">Your dizziness sounds positional</p>',
      '<p class="q-help">Because the dizziness stops in certain head positions, this most commonly points to a condition called BPPV — displaced crystals in the inner ear. The next questions are designed for positional vertigo and will give your doctor the most useful information.</p>',
      '<p class="q-help">Please answer as accurately as you can. Your doctor will confirm the pattern during the examination.</p>',
      '<div class="actions">',
      '<button class="button" type="button" data-action="accept-positional-redirect">Continue</button>',
      '</div>',
      '</div>',
      '</section>',
      '</div>'
    ].join("");
  }

  function shouldSkipSimpleQuestion(question, answers, isBackward) {
    var feeling = answers.feeling;
    var existingAnswer = answers[question.id];
    if (!isBackward && shouldAutoAdvanceSimpleNone(question.id) && Array.isArray(existingAnswer) && existingAnswer.includes("none")) return true;
    if (question.id === "pattern" && (feeling === "single_attack" || feeling === "brief_resolved" || feeling === "repeated_attacks")) return true;
    if (question.id === "recurrent_head_trigger" && feeling !== "repeated_attacks") return true;
    if (question.id === "recurrent_trigger_clarify" && !(feeling === "repeated_attacks" && answers.recurrent_head_trigger === "not_sure")) return true;
    if (question.id === "spontaneous_confirm") return true;
    if (question.id === "recurrent_spontaneous_duration") {
      return !(feeling === "repeated_attacks" && (answers.recurrent_head_trigger === "no" || answers.recurrent_trigger_clarify === "sitting_still"));
    }
    if (["recurrent_migraine_features", "recurrent_tia_risk", "recurrent_tia_warnings"].includes(question.id)) {
      return !(feeling === "repeated_attacks" && (answers.recurrent_head_trigger === "no" || answers.recurrent_trigger_clarify === "sitting_still"));
    }
    if (question.id === "recurrent_meniere_features") {
      return !(feeling === "repeated_attacks" && (answers.recurrent_head_trigger === "no" || answers.recurrent_trigger_clarify === "sitting_still") && answers.recurrent_spontaneous_duration === "over_twenty_minutes");
    }
    if (question.id === "recurrent_orthostatic_features") {
      return !(feeling === "repeated_attacks" && (answers.recurrent_head_trigger === "no" || answers.recurrent_trigger_clarify === "sitting_still"));
    }
    if (question.id === "recurrent_panic_features") {
      return !(feeling === "repeated_attacks" && (answers.recurrent_head_trigger === "no" || answers.recurrent_trigger_clarify === "sitting_still"));
    }
    if (question.id === "stops_still" && feeling === "repeated_attacks") return true;
    if (question.id === "stops_still" && feeling === "brief_resolved") return true;
    if (question.id === "duration" && feeling === "repeated_attacks") return true;
    if (question.id === "duration" && (feeling === "brief_resolved" || feeling === "single_attack")) return true;
    if (question.id === "urgent" && (feeling === "single_attack" || feeling === "repeated_attacks")) return true;
    if (question.id === "brief_risk_factors" && feeling !== "brief_resolved") return true;
    if (question.id === "brief_circumstances") {
      if (feeling !== "brief_resolved") return true;
      var rfs = Array.isArray(answers.brief_risk_factors) ? answers.brief_risk_factors : [];
      if (rfs.some(function (v) { return v !== "none"; })) return true;
    }
    if (question.id === "single_red_flags" && feeling !== "single_attack") return true;
    if (question.id === "single_red_flag_detail" && !(feeling === "single_attack" && answers.single_red_flags === "yes")) return true;
    if (feeling === "brief_resolved" && (question.id === "ear" || question.id === "headache")) return true;
    if (feeling === "single_attack" && (question.id === "ear" || question.id === "headache")) return true;
    if (feeling === "repeated_attacks" && (question.id === "ear" || question.id === "headache")) return true;
    return false;
  }

  function renderSimplePatient() {
    if (state.simplePatient.done) {
      renderSimpleSummary();
      return;
    }
    if (state.simplePatient.urgentWarning) {
      renderSimpleUrgentWarning();
      return;
    }
    if (state.simplePatient.positionalRedirect) {
      renderSimplePositionalRedirect();
      return;
    }
    if (state.simplePatient.positionalFlow) {
      if (state.simplePatient.positionalDone) {
        renderSimplePositionalSummary();
      } else {
        renderSimplePositionalQuestion(SIMPLE_POSITIONAL_QUESTIONS[state.simplePatient.positionalStep], state.simplePatient.positionalStep);
      }
      return;
    }
    var isGoingBack = state.simplePatient._goingBack;
    state.simplePatient._goingBack = false;
    while (state.simplePatient.step < SIMPLE_PATIENT_QUESTIONS.length &&
           shouldSkipSimpleQuestion(SIMPLE_PATIENT_QUESTIONS[state.simplePatient.step], state.simplePatient.answers, isGoingBack)) {
      state.simplePatient.step++;
    }
    const step = state.simplePatient.step;
    const question = SIMPLE_PATIENT_QUESTIONS[step];
    if (!question) {
      state.simplePatient.done = true;
      renderSimpleSummary();
      return;
    }
    renderSimpleQuestion(question, step);
  }

  function renderSimpleQuestion(question, stepIndex) {
    const total = SIMPLE_PATIENT_QUESTIONS.length;
    const answer = state.simplePatient.answers[question.id];
    const currentValues = Array.isArray(answer) ? answer : (answer ? [answer] : []);
    const isMulti = question.type === "multi";
    const hasAnswer = currentValues.length > 0;

    function renderSimpleOption(opt) {
      const selected = currentValues.includes(opt.id);
      if (isMulti) {
        if (isSplitNoneQuestion && opt.id === "none") {
          return [
            '<button class="simple-option' + (selected ? " selected" : "") + '" type="button"',
            ' data-action="simple-none-answer" data-qid="' + escapeHtml(question.id) + '">',
            '<span class="sp-ind sp-ind-check' + (selected ? " sp-ind-selected" : "") + '"></span>',
            '<span class="simple-option-text">' + escapeHtml(opt.text) + '</span>',
            '</button>'
          ].join("");
        }
        return [
          '<label class="simple-option' + (selected ? " selected" : "") + '">',
          '<input class="sr-only" type="checkbox" data-simple-qid="' + escapeHtml(question.id) + '" data-simple-oid="' + escapeHtml(opt.id) + '"' + (selected ? " checked" : "") + '>',
          '<span class="sp-ind sp-ind-check' + (selected ? " sp-ind-selected" : "") + '"></span>',
          '<span class="simple-option-text">' + escapeHtml(opt.text) + '</span>',
          '</label>'
        ].join("");
      }
      return [
        '<button class="simple-option' + (selected ? " selected" : "") + '" type="button"',
        ' data-action="simple-answer" data-qid="' + escapeHtml(question.id) + '" data-oid="' + escapeHtml(opt.id) + '">',
        '<span class="sp-ind sp-ind-radio' + (selected ? " sp-ind-selected" : "") + '"></span>',
        '<span class="sp-body">',
        '<span class="simple-option-text">' + escapeHtml(opt.text) + '</span>',
        opt.desc ? '<span class="simple-option-desc">' + escapeHtml(opt.desc) + '</span>' : "",
        '</span>',
        '</button>'
      ].join("");
    }

    const isSplitNoneQuestion = question.id === "recurrent_migraine_features" || question.id === "recurrent_tia_risk" || question.id === "recurrent_tia_warnings" || question.id === "recurrent_meniere_features" || question.id === "recurrent_orthostatic_features" || question.id === "recurrent_panic_features" || question.id === "brief_risk_factors";
    const options = isSplitNoneQuestion
      ? [
          '<div class="simple-options split-none">',
          '<div class="simple-options-main">',
          (question.options || []).filter(function (opt) { return opt.id !== "none"; }).map(renderSimpleOption).join(""),
          '</div>',
          '<div class="simple-none-separator" aria-hidden="true"></div>',
          '<div class="simple-options-none">',
          (question.options || []).filter(function (opt) { return opt.id === "none"; }).map(renderSimpleOption).join(""),
          '</div>',
          '</div>'
        ].join("")
      : '<div class="simple-options' + (isMulti ? " multi" : "") + '">' + (question.options || []).map(renderSimpleOption).join("") + '</div>';

    app.innerHTML = [
      '<div class="simple-wrapper">',
      stepIndex > 0 ? '<button class="back-button" type="button" data-action="simple-back">' + iconSvg("back") + ' Back</button>' : "",
      '<div class="simple-dots">',
      SIMPLE_PATIENT_QUESTIONS.map(function (_, i) {
        return '<span class="sdot' + (i === stepIndex ? " active" : i < stepIndex ? " done" : "") + '"></span>';
      }).join(""),
      '</div>',
      '<div class="simple-card' + (isSplitNoneQuestion ? ' split-none-card' : '') + '">',
      isSplitNoneQuestion ? '<div class="simple-question-header">' : '',
      '<p class="simple-q">' + escapeHtml(question.text) + '</p>',
      question.help ? '<p class="simple-help">' + escapeHtml(question.help) + '</p>' : "",
      isSplitNoneQuestion ? '</div>' : '',
      question.list ? (function () {
        var yesOpt = question.options[0];
        var noneOpt = question.options[1];
        var yesSelected = currentValues.includes(yesOpt.id);
        var noneSelected = currentValues.includes(noneOpt.id);
        return [
          '<button class="flag-card flag-card-red' + (yesSelected ? " selected" : "") + '" type="button"',
          ' data-action="simple-answer" data-qid="' + escapeHtml(question.id) + '" data-oid="' + escapeHtml(yesOpt.id) + '">',
          '<div class="flag-card-header"><span class="flag-dot red"></span>Red flags present</div>',
          '<ul class="flag-card-list">',
          question.list.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join(""),
          '</ul>',
          '</button>',
          '<button class="flag-card flag-card-green' + (noneSelected ? " selected" : "") + '" type="button"',
          ' data-action="simple-answer" data-qid="' + escapeHtml(question.id) + '" data-oid="' + escapeHtml(noneOpt.id) + '">',
          '<div class="flag-card-header"><span class="flag-dot green"></span>Red flags absent — none of these apply</div>',
          '</button>'
        ].join("");
      })() : options,
      !question.list && isMulti ? '<div class="actions"><button class="button" type="button" data-action="simple-next"' + (!hasAnswer ? " disabled" : "") + '>Done</button></div>' : "",
      '</div>',
      '</div>'
    ].join("");
  }

  function shouldAutoAdvanceSimpleNone(questionId) {
    return [
      "recurrent_migraine_features",
      "recurrent_tia_risk",
      "recurrent_tia_warnings",
      "recurrent_meniere_features",
      "recurrent_orthostatic_features",
      "recurrent_panic_features",
      "brief_risk_factors"
    ].includes(questionId);
  }

  function advanceSimpleQuestion() {
    state.simplePatient.step++;
    if (state.simplePatient.step >= SIMPLE_PATIENT_QUESTIONS.length) state.simplePatient.done = true;
    renderSimplePatient();
  }

  function renderSimpleUrgentWarning() {
    var VASCULAR_IDS = ["double_vision", "tingling_one_side", "slurred_speech", "weakness_one_side", "new_ringing", "reduced_hearing"];
    var VASCULAR_LABELS = {
      double_vision: "Double vision",
      tingling_one_side: "Tingling or numbness on one side of the body",
      slurred_speech: "Slurred speech or difficulty speaking",
      weakness_one_side: "Weakness on one side of the body",
      new_ringing: "New ringing in the ears (tinnitus)",
      reduced_hearing: "Reduced hearing in one ear"
    };
    var detailFlags = Array.isArray(state.simplePatient.answers.single_red_flag_detail)
      ? state.simplePatient.answers.single_red_flag_detail : [];
    var vascularPresent = detailFlags.filter(function (v) { return VASCULAR_IDS.indexOf(v) !== -1; });
    var isVascular = vascularPresent.length > 0;

    var flagListHtml = isVascular
      ? '<ul class="urgent-flag-list">' + vascularPresent.map(function (v) {
          return '<li>' + VASCULAR_LABELS[v] + '</li>';
        }).join("") + '</ul>'
      : "";

    var title = isVascular
      ? "Emergency — possible stroke or TIA"
      : "Please seek urgent medical attention";

    var bodyText = isVascular
      ? 'You have reported warning signs that can be caused by a stroke or TIA (mini-stroke) affecting the brain\'s balance area. The symptoms you selected are:'
      : 'You have reported one or more urgent warning signs. Please <strong>tell the clinic staff immediately</strong> or go to the <strong>nearest emergency department</strong> now.';

    var noteText = isVascular
      ? 'Please <strong>call emergency services or go to the nearest emergency department immediately</strong>. Do not drive yourself.'
      : 'You may still continue to build a summary for your doctor.';

    app.innerHTML = [
      '<div class="simple-wrapper">',
      '<section class="panel patient-classification-panel safety-warning-panel">',
      '<div class="safety-warning-icon">' + iconSvg("alert") + '</div>',
      '<h2 class="safety-warning-title">' + title + '</h2>',
      '<p class="safety-warning-text">' + bodyText + '</p>',
      flagListHtml,
      '<p class="safety-warning-note">' + noteText + '</p>',
      '<div class="actions">',
      '<button class="button danger" type="button" data-action="simple-urgent-continue">I understand — continue anyway</button>',
      '</div>',
      '</section>',
      '</div>'
    ].join("");
  }

  function renderSimplePositionalQuestion(question, stepIndex) {
    const answer = state.simplePatient.positionalAnswers[question.id];
    const currentValues = Array.isArray(answer) ? answer : (answer ? [answer] : []);
    const isMulti = question.type === "multi";
    const isSplitAny = question.id === "pos_trigger";
    const specificOpts = isSplitAny ? (question.options || []).filter(function (o) { return o.id !== "any_all"; }) : (question.options || []);
    const anyAllOpt = isSplitAny ? (question.options || []).find(function (o) { return o.id === "any_all"; }) : null;
    const isAnyAllSelected = isSplitAny && currentValues.includes("any_all");
    const specificSelected = currentValues.filter(function (v) { return v !== "any_all"; }).length > 0;
    const hasAnswer = currentValues.length > 0;

    function renderCheckbox(opt) {
      const selected = currentValues.includes(opt.id);
      return [
        '<label class="simple-option' + (selected ? " selected" : "") + '">',
        '<input class="sr-only" type="checkbox" data-pos-qid="' + escapeHtml(question.id) + '" data-pos-oid="' + escapeHtml(opt.id) + '"' + (selected ? " checked" : "") + '>',
        '<span class="sp-ind sp-ind-check' + (selected ? " sp-ind-selected" : "") + '"></span>',
        '<span class="simple-option-text">' + escapeHtml(opt.text) + '</span>',
        '</label>'
      ].join("");
    }

    const options = isSplitAny ? [
      '<div class="simple-options split-none multi">',
      '<div class="simple-options-main">',
      specificOpts.map(renderCheckbox).join(""),
      '<div class="actions" style="margin-top:0.75rem"><button class="button" type="button" data-action="simple-positional-next"' + (!specificSelected ? " disabled" : "") + '>Done</button></div>',
      '</div>',
      '<div class="simple-none-separator" aria-hidden="true"></div>',
      '<div class="simple-options-none">',
      anyAllOpt ? [
        '<button class="simple-option' + (isAnyAllSelected ? " selected" : "") + '" type="button"',
        ' data-action="simple-positional-any-all">',
        '<span class="sp-ind sp-ind-check' + (isAnyAllSelected ? " sp-ind-selected" : "") + '"></span>',
        '<span class="simple-option-text">' + escapeHtml(anyAllOpt.text) + '</span>',
        '</button>'
      ].join("") : "",
      '</div>',
      '</div>'
    ].join("") : (function () {
      const opts = specificOpts.map(function (opt) {
        const selected = currentValues.includes(opt.id);
        if (isMulti) return renderCheckbox(opt);
        return [
          '<button class="simple-option' + (selected ? " selected" : "") + '" type="button"',
          ' data-action="simple-positional-answer" data-qid="' + escapeHtml(question.id) + '" data-oid="' + escapeHtml(opt.id) + '">',
          '<span class="sp-ind sp-ind-radio' + (selected ? " sp-ind-selected" : "") + '"></span>',
          '<span class="sp-body">',
          '<span class="simple-option-text">' + escapeHtml(opt.text) + '</span>',
          opt.desc ? '<span class="simple-option-desc">' + escapeHtml(opt.desc) + '</span>' : "",
          '</span>',
          '</button>'
        ].join("");
      }).join("");
      return '<div class="simple-options' + (isMulti ? " multi" : "") + '">' + opts + '</div>';
    })();

    app.innerHTML = [
      '<div class="simple-wrapper">',
      '<button class="back-button" type="button" data-action="simple-positional-back">' + iconSvg("back") + ' Back</button>',
      '<div class="simple-dots">',
      SIMPLE_POSITIONAL_QUESTIONS.map(function (_, i) {
        return '<span class="sdot' + (i === stepIndex ? " active" : i < stepIndex ? " done" : "") + '"></span>';
      }).join(""),
      '</div>',
      '<div class="simple-card' + (isSplitAny ? ' split-none-card' : '') + '">',
      isSplitAny ? '<div class="simple-question-header">' : '',
      '<p class="simple-q">' + escapeHtml(question.text) + '</p>',
      question.help ? '<p class="simple-help">' + escapeHtml(question.help) + '</p>' : "",
      isSplitAny ? '</div>' : '',
      options,
      !isSplitAny && isMulti ? '<div class="actions"><button class="button" type="button" data-action="simple-positional-next"' + (!hasAnswer ? " disabled" : "") + '>Done</button></div>' : "",
      '</div>',
      '</div>'
    ].join("");
  }

  function renderSimplePositionalSummary() {
    const pa = state.simplePatient.positionalAnswers;
    const triggerAnyAll = Array.isArray(pa.pos_trigger) && pa.pos_trigger.includes("any_all");
    const triggerItems = Array.isArray(pa.pos_trigger) ? pa.pos_trigger.filter(function (v) { return v !== "any_all" && v !== "not_sure"; }) : [];
    const durationQ = SIMPLE_POSITIONAL_QUESTIONS.find(function (q) { return q.id === "pos_duration"; });
    const sideQ = SIMPLE_POSITIONAL_QUESTIONS.find(function (q) { return q.id === "pos_side"; });
    const triggerQ = SIMPLE_POSITIONAL_QUESTIONS.find(function (q) { return q.id === "pos_trigger"; });
    const durationLabel = pa.pos_duration ? (durationQ && durationQ.options.find(function (o) { return o.id === pa.pos_duration; }) || {}).text || pa.pos_duration : "";
    const sideLabel = pa.pos_side ? (sideQ && sideQ.options.find(function (o) { return o.id === pa.pos_side; }) || {}).text || pa.pos_side : "";
    const triggerLabels = triggerItems.map(function (id) {
      var opt = triggerQ ? triggerQ.options.find(function (o) { return o.id === id; }) : null;
      return opt ? opt.text : id;
    });
    const isClassicBPPV = pa.pos_duration === "under_five_min";

    const rows = [
      ["Type", "Positional vertigo"],
      ["Triggers", triggerAnyAll ? "Any or all of these movements" : (triggerLabels.length ? triggerLabels.join(", ") : "Not specified")],
      ["Duration of each spell", durationLabel],
      ["Worse side", sideLabel]
    ].filter(function (r) { return r[1]; });

    app.innerHTML = [
      '<div class="simple-summary-outer">',
      '<div class="simple-summary-card" id="printArea">',
      '<div class="summary-brand">',
      dizzyPersonSmallSvg(),
      '<div>',
      '<h2 class="summary-brand-title">Your dizziness — for your doctor</h2>',
      '<p class="muted" style="margin:0">Date: ' + escapeHtml(new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })) + '</p>',
      '</div>',
      '</div>',
      '<table class="summary-table"><tbody>',
      rows.map(function (row) {
        return '<tr><td class="summary-lbl">' + escapeHtml(row[0]) + '</td><td>' + escapeHtml(row[1]) + '</td></tr>';
      }).join(""),
      '</tbody></table>',
      '<div class="poss-section">',
      '<div class="diagnosis-disclaimer">This is not a diagnosis.</div>',
      '<p class="poss-section-subtitle">On the basis of your history these are the possibilities we feel are likely, but it is your doctor who will take the history, examine you, and determine the actual cause. This does not substitute for your doctor\'s assessment.</p>',
      '<p class="poss-section-intro">The possibilities your doctor may need to consider based on your history are:</p>',
      '<div class="poss-list">',
      '<div class="poss-item"><strong>BPPV (Benign Paroxysmal Positional Vertigo)</strong><p>The most likely cause of positional vertigo. Crystals in the inner ear shift to the wrong canal, causing brief spinning with certain head positions. ' + (isClassicBPPV ? 'The very brief duration of your spells strongly fits this pattern. ' : '') + 'Your doctor will do a Dix-Hallpike test to confirm and may treat it with a simple head repositioning manoeuvre (Epley).</p></div>',
      '<div class="poss-item"><strong>Other positional vertigo</strong><p>Less commonly, positional vertigo can have other causes. Your doctor\'s examination will help distinguish these.</p></div>',
      '</div>',
      '</div>',
      '</div>',
      '<div class="summary-actions no-print">',
      '<button class="button" type="button" onclick="window.print()">Print / Save as PDF</button>',
      '<button class="button secondary" type="button" data-action="go-home">Start again</button>',
      '</div>',
      '</div>'
    ].join("");
  }

  function renderSimplePositionalRedirect() {
    var isSingleAttack = state.simplePatient.answers.feeling === "single_attack";
    var heading = isSingleAttack
      ? "This is probably your first attack of positional vertigo"
      : "You have positional vertigo";
    var helpText = isSingleAttack
      ? "Your dizziness stops in one position and comes back when you move — this is positional vertigo. Let us analyze it a little further so your doctor has more detail."
      : "Your attacks are triggered by head position or movement. Let us ask a few more questions to narrow down the possibilities further so your doctor has more detail.";
    app.innerHTML = [
      '<div class="simple-wrapper">',
      '<button class="back-button" type="button" data-action="simple-back">' + iconSvg("back") + ' Back</button>',
      '<div class="simple-card">',
      '<div class="submit-check-icon">' + iconSvg("rotate") + '</div>',
      '<p class="simple-q">' + escapeHtml(heading) + '</p>',
      '<p class="simple-help">' + escapeHtml(helpText) + '</p>',
      '<div class="actions">',
      '<button class="button" type="button" data-action="simple-positional-start">Continue ›</button>',
      '<button class="button secondary" type="button" data-action="go-home">Start again</button>',
      '</div>',
      '</div>',
      '</div>'
    ].join("");
  }

  function renderSimpleSummary() {
    const sp = state.simplePatient;
    const a = sp.answers;
    const hasUrgent = a.urgent === "yes";
    const earItems = Array.isArray(a.ear) ? a.ear.filter(function (v) { return v !== "none"; }) : [];
    const riskFactorItems = Array.isArray(a.brief_risk_factors) ? a.brief_risk_factors.filter(function (v) { return v !== "none"; }) : [];
    const recurrentMigraineItems = Array.isArray(a.recurrent_migraine_features) ? a.recurrent_migraine_features.filter(function (v) { return v !== "none"; }) : [];
    const recurrentTiaRiskItems = Array.isArray(a.recurrent_tia_risk) ? a.recurrent_tia_risk.filter(function (v) { return v !== "none"; }) : [];
    const recurrentTiaWarningItems = Array.isArray(a.recurrent_tia_warnings) ? a.recurrent_tia_warnings.filter(function (v) { return v !== "none"; }) : [];
    const recurrentMeniereItems = Array.isArray(a.recurrent_meniere_features) ? a.recurrent_meniere_features.filter(function (v) { return v !== "none"; }) : [];
    const recurrentOrthostaticItems = Array.isArray(a.recurrent_orthostatic_features) ? a.recurrent_orthostatic_features.filter(function (v) { return v !== "none"; }) : [];
    const recurrentPanicItems = Array.isArray(a.recurrent_panic_features) ? a.recurrent_panic_features.filter(function (v) { return v !== "none"; }) : [];
    const hasRiskFactors = riskFactorItems.length > 0;
    const showRiskNotice = a.feeling === "brief_resolved" && hasRiskFactors;
    const showSingleUrgentNotice = a.feeling === "single_attack";
    const showRecurrentTiaNotice = recurrentTiaWarningItems.length > 0 || recurrentTiaRiskItems.length > 0;
    const possibilities = computeSimplePossibilities(a);

    const noneFeatureLabels = [];
    if (!recurrentMigraineItems.length && a.recurrent_migraine_features) noneFeatureLabels.push("Migraine features");
    if (!recurrentTiaRiskItems.length && a.recurrent_tia_risk) noneFeatureLabels.push("TIA risk factors");
    if (!recurrentTiaWarningItems.length && a.recurrent_tia_warnings) noneFeatureLabels.push("TIA warning symptoms");
    if (!recurrentMeniereItems.length && a.recurrent_meniere_features) noneFeatureLabels.push("Meniere-type ear features");
    if (!recurrentOrthostaticItems.length && a.recurrent_orthostatic_features) noneFeatureLabels.push("Standing / BP-related features");
    if (!recurrentPanicItems.length && a.recurrent_panic_features) noneFeatureLabels.push("Panic / anxiety features");

    const rows = [
      ["Attack or constant", getSimpleLabel("feeling", a.feeling)],
      ["Pattern", getSimpleLabel("pattern", a.pattern)],
      ["Head-movement trigger", getSimpleLabel("recurrent_head_trigger", a.recurrent_head_trigger)],
      ["Trigger clarification", getSimpleLabel("recurrent_trigger_clarify", a.recurrent_trigger_clarify)],
      ["Spontaneous/non-positional", getSimpleLabel("spontaneous_confirm", a.spontaneous_confirm)],
      ["Spontaneous attack duration", getSimpleLabel("recurrent_spontaneous_duration", a.recurrent_spontaneous_duration)],
      ["Migraine features", recurrentMigraineItems.length ? recurrentMigraineItems.map(function (id) { return getSimpleOptionText("recurrent_migraine_features", id); }).join(", ") : ""],
      ["TIA risk factors", recurrentTiaRiskItems.length ? recurrentTiaRiskItems.map(function (id) { return getSimpleOptionText("recurrent_tia_risk", id); }).join(", ") : ""],
      ["TIA warning symptoms", recurrentTiaWarningItems.length ? recurrentTiaWarningItems.map(function (id) { return getSimpleOptionText("recurrent_tia_warnings", id); }).join(", ") : ""],
      ["Meniere-type ear features", recurrentMeniereItems.length ? recurrentMeniereItems.map(function (id) { return getSimpleOptionText("recurrent_meniere_features", id); }).join(", ") : ""],
      ["Standing/BP-related features", recurrentOrthostaticItems.length ? recurrentOrthostaticItems.map(function (id) { return getSimpleOptionText("recurrent_orthostatic_features", id); }).join(", ") : ""],
      ["Panic/anxiety features", recurrentPanicItems.length ? recurrentPanicItems.map(function (id) { return getSimpleOptionText("recurrent_panic_features", id); }).join(", ") : ""],
      ["Stops when still", getSimpleLabel("stops_still", a.stops_still)],
      ["Duration", getSimpleLabel("duration", a.duration)],
      ["Warning signs", a.urgent ? (hasUrgent ? "Yes — urgent warning signs reported" : "None") : ""],
      ["Risk factors", a.brief_risk_factors ? (hasRiskFactors ? riskFactorItems.map(function (id) { return getSimpleOptionText("brief_risk_factors", id); }).join(", ") : "None") : ""],
      ["Circumstances", getSimpleLabel("brief_circumstances", a.brief_circumstances)],
      ["Red flags", a.single_red_flags ? (a.single_red_flags === "yes"
        ? (Array.isArray(a.single_red_flag_detail) && a.single_red_flag_detail.length
          ? a.single_red_flag_detail.map(function (id) { return getSimpleOptionText("single_red_flag_detail", id); }).join(", ")
          : "Yes — red flags present")
        : "None") : ""],
      ["Ear symptoms", earItems.length ? earItems.map(function (id) { return getSimpleOptionText("ear", id); }).join(", ") : (a.ear ? "None" : "")],
      ["Headache", getSimpleLabel("headache", a.headache)]
    ].filter(function (row) { return row[1]; });

    app.innerHTML = [
      '<div class="simple-summary-outer">',
      '<div class="simple-summary-card" id="printArea">',
      '<div class="summary-brand">',
      dizzyPersonSmallSvg(),
      '<div>',
      '<h2 class="summary-brand-title">Your dizziness — for your doctor</h2>',
      '<p class="muted" style="margin:0">Date: ' + escapeHtml(new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })) + '</p>',
      '</div>',
      '</div>',
      (hasUrgent && a.feeling === "brief_resolved") ? '<div class="notice danger" style="font-size:1.05rem"><strong>Vertebrobasilar TIA — urgent assessment needed.</strong> A brief attack can be a TIA (mini-stroke). Do not wait — see a doctor today.</div>' : (hasUrgent ? '<div class="notice danger"><strong>Urgent warning signs reported.</strong> Please tell the doctor immediately.</div>' : ""),
      showRiskNotice ? '<div class="notice danger"><strong>Vascular risk factors noted.</strong> A brief dizzy episode with these risk factors needs to be reviewed by a doctor today.</div>' : "",
      showSingleUrgentNotice ? '<div class="notice danger"><strong>See your doctor urgently today.</strong></div>' : "",
      showRecurrentTiaNotice ? '<div class="notice danger"><strong>Possible vascular warning pattern.</strong> Recurrent non-positional vertigo with stroke risk factors or neurologic symptoms should be reviewed by a doctor urgently.</div>' : "",
      '<table class="summary-table"><tbody>',
      rows.map(function (row) {
        return '<tr><td class="summary-lbl">' + escapeHtml(row[0]) + '</td><td>' + escapeHtml(row[1]) + '</td></tr>';
      }).join(""),
      '</tbody></table>',
      noneFeatureLabels.length > 0 ? '<div class="negatives-box"><strong>None of the following were reported:</strong> ' + escapeHtml(noneFeatureLabels.join(", ")) + '.</div>' : "",
      '<div class="poss-section">',
      (function () {
        var greenPoss = possibilities.filter(function (p) { return p.color === "green"; });
        var redPoss = possibilities.filter(function (p) { return p.color === "red"; });
        var regularPoss = possibilities.filter(function (p) { return p.color !== "red" && p.color !== "green"; });
        var abovePoss = greenPoss.concat(redPoss);
        function renderCard(p) {
          var cls = p.color ? ' poss-item--' + p.color : '';
          var body = p.bullets
            ? '<ul class="poss-bullets">' + p.bullets.map(function (item) { return '<li>' + escapeHtml(item) + '</li>'; }).join("") + '</ul>'
            : '<p>' + escapeHtml(p.plain) + '</p>';
          return '<div class="poss-item' + cls + '"><strong>' + escapeHtml(p.name) + '</strong>' + body + '</div>';
        }
        return [
          abovePoss.length ? '<div style="margin-bottom:1rem">' + abovePoss.map(renderCard).join("") + '</div>' : '',
          '<div class="diagnosis-disclaimer">This is not a diagnosis.</div>',
          '<p class="poss-section-subtitle">On the basis of your history these are the possibilities we feel are likely, but it is your doctor who will take the history, examine you, and determine the actual cause. This does not substitute for your doctor\'s assessment.</p>',
          '<div class="poss-list">',
          regularPoss.map(renderCard).join(""),
        ].join("");
      })(),
      '</div>',
      '</div>',
      '</div>',
      '<div class="summary-actions no-print">',
      '<button class="button" type="button" onclick="window.print()">Print / Save as PDF</button>',
      '<button class="button secondary" type="button" data-action="go-home">Start again</button>',
      '</div>',
      '</div>'
    ].join("");
  }

  function renderDoctorGuidance() {
    app.innerHTML = [
      '<div class="role-selection-wrapper">',
      '<section class="panel">',
      '<button class="back-button" type="button" data-action="go-home">' + iconSvg("back") + ' Back</button>',
      '<h2>Doctor guidance — decision tree</h2>',
      '<p class="muted">This section will contain a step-by-step clinical decision tree for vertigo assessment. Coming soon.</p>',
      '<div class="notice">',
      '<strong>Categories covered:</strong> Continuous first-time vertigo, Positional (BPPV), Recurrent spontaneous, Persistent unsteadiness.',
      '</div>',
      '</section>',
      '</div>'
    ].join("");
  }

  function renderExaminationPointers(pointers) {
    if (!pointers || !pointers.length) return "";
    return [
      '<div class="exam-pointers">',
      '<ul class="exam-pointer-list">',
      pointers.map(function (p) { return '<li>' + escapeHtml(p) + '</li>'; }).join(""),
      '</ul>',
      '</div>'
    ].join("");
  }

  function renderBranchQuestionStep(question, stepIndex, totalSteps) {
    const answer = state.patient.answers[question.id];
    const isRadio = question.type !== "multi" && question.type !== "text";
    const isText = question.type === "text";
    const inputType = question.type === "multi" ? "checkbox" : "radio";
    const name = "q-" + question.id;
    const values = answer ? normalizeAnswerValues(answer) : [];
    const textValue = answer && typeof answer.value === "string" ? answer.value : "";

    let body;
    if (isText) {
      body = [
        '<div class="field">',
        '<label class="sr-only" for="bq-answer">' + escapeHtml(question.text) + '</label>',
        '<textarea id="bq-answer" data-text-answer="' + escapeHtml(question.id) + '" rows="4">' + escapeHtml(textValue) + '</textarea>',
        '</div>'
      ].join("");
    } else {
      body = [
        '<div class="bq-option-list">',
        (function () {
          var lastGroup = null;
          return (question.options || []).map(function (option) {
            var header = "";
            var g = option.group || null;
            if (g && g !== lastGroup) {
              header = '<div class="bq-option-group-label">' + escapeHtml(g) + '</div>';
            }
            lastGroup = g;
            const checked = values.includes(option.id) ? " checked" : "";
            return header + [
              '<label class="bq-option' + (g ? " bq-option-grouped" : "") + (values.includes(option.id) ? " selected" : "") + '">',
              '<input class="sr-only" type="' + inputType + '" name="' + escapeHtml(name) + '" data-question-id="' + escapeHtml(question.id) + '" data-option-id="' + escapeHtml(option.id) + '"' + checked + '>',
              '<span class="bq-ind ' + (question.type === "multi" ? "bq-ind-check" : "bq-ind-radio") + '"></span>',
              '<span>' + escapeHtml(option.text) + '</span>',
              '</label>'
            ].join("");
          }).join("");
        })(),
        '</div>'
      ].join("");
    }

    const showNext = isText || question.type === "multi";
    const answered = hasAnswer(answer);
    const canContinue = !question.required || answered;
    const progress = totalSteps > 1
      ? '<div class="q-progress">Question ' + (stepIndex + 1) + ' of ' + totalSteps + '</div>'
      : "";

    app.innerHTML = [
      '<div class="role-selection-wrapper">',
      '<section class="panel patient-classification-panel">',
      '<button class="back-button" type="button" data-action="back-question">' + iconSvg("back") + ' Back</button>',
      progress,
      '<div class="classification-panel">',
      question.header ? '<p class="bq-context-header">' + escapeHtml(question.header) + '</p>' : "",
      '<p class="classification-question-heading">' + escapeHtml(question.text) + '</p>',
      question.help ? '<p class="q-help">' + escapeHtml(question.help) + '</p>' : "",
      body,
      (!canContinue ? '<p class="q-help q-help-warning">Please answer this question before continuing.</p>' : ""),
      showNext ? '<div class="actions"><button class="button" type="button" data-action="next-question"' + (canContinue ? "" : " disabled") + '>Done</button></div>' : "",
      '</div>',
      '</section>',
      '</div>'
    ].join("");
  }

  function renderSubmitScreen(categoryId, config) {
    const category = findCategory(categoryId, config);
    app.innerHTML = [
      '<div class="role-selection-wrapper">',
      '<section class="panel patient-classification-panel">',
      '<button class="back-button" type="button" data-action="back-question">' + iconSvg("back") + ' Back</button>',
      '<div class="classification-panel">',
      '<div class="submit-check-icon">' + iconSvg("ok") + '</div>',
      '<p class="classification-question-heading">Ready to submit</p>',
      '<p class="q-help">All questions answered. Please enter your clinic ID and submit your answers for doctor review.</p>',
      '<div class="field" style="margin-bottom:16px">',
      '<label for="clinicId">Clinic ID</label>',
      '<input id="clinicId" autocomplete="off" value="' + escapeHtml(state.patient.clinicId) + '" placeholder="Enter clinic ID (optional)">',
      '</div>',
      category ? '<div class="category-banner" style="margin-bottom:16px"><strong>Your pattern:</strong> ' + escapeHtml(category.label) + '</div>' : "",
      '<div class="actions">',
      '<button class="button" type="button" data-action="submit-patient">Submit answers</button>',
      '</div>',
      '</div>',
      '</section>',
      '</div>'
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
      '<button class="back-button" type="button" data-action="go-home">' + iconSvg("back") + ' Back</button>',
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
      '<button class="back-button" type="button" data-action="go-home">' + iconSvg("back") + ' Back</button>',
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
    return [
      '<label class="choice red-flag">',
      '<input type="checkbox" data-red-flag="' + escapeHtml(flag.id) + '"' + checked + '>',
      '<span class="choice-content"><span class="choice-icon danger">' + iconSvg(iconForRedFlag(flag.id)) + '</span><span>' + escapeHtml(flag.text) + '</span></span>',
      '</label>'
    ].join("");
  }

  function renderInitialClassification(answers, categoryId) {
    const initialValue = answers.initial_pathway && answers.initial_pathway.value ? answers.initial_pathway.value : "";
    const attackValue = answers.attack_pattern && answers.attack_pattern.value ? answers.attack_pattern.value : "";
    const recurrentValue = answers.recurrent_position && answers.recurrent_position.value ? answers.recurrent_position.value : "";

    return [
      '<div class="classification-panel">',
      '<p class="classification-question-heading">Is it an attack, or is there constant dizziness or a constant feeling of imbalance?</p>',
      '<div class="classification-grid two-col">',
      INITIAL_CLASSIFICATION_OPTIONS.map(function (option) {
        const checked = initialValue === option.id ? " checked" : "";
        return [
          '<label class="classification-card">',
          '<input class="sr-only" type="radio" name="initial_pathway" data-initial-pathway="' + escapeHtml(option.id) + '"' + checked + '>',
          '<span class="pattern-art ' + escapeHtml(option.categoryId || option.id) + '">' + iconSvg(option.icon) + '</span>',
          '<div class="classification-card-body">',
          '<div class="classification-card-title">' + escapeHtml(option.title || option.label) + '</div>',
          '<div class="classification-card-desc">' + escapeHtml(option.description || "") + '</div>',
          '</div>',
          '</label>'
        ].join("");
      }).join(""),
      '</div>',
      initialValue === "attack" ? renderAttackPatternQuestion(attackValue) : "",
      attackValue === "recurrent" ? renderRecurrentPositionQuestion(recurrentValue) : "",
      '</div>'
    ].join("");
  }

  function renderAttackPatternQuestion(value) {
    return [
      '<div class="recurrent-step">',
      '<p class="classification-question-heading">Is this the first time you have had dizziness, or do you keep getting attacks?</p>',
      '<div class="classification-grid two-col">',
      ATTACK_PATTERN_OPTIONS.map(function (option) {
        const checked = value === option.id ? " checked" : "";
        return [
          '<label class="classification-card small">',
          '<input class="sr-only" type="radio" name="attack_pattern" data-attack-pattern="' + escapeHtml(option.id) + '"' + checked + '>',
          '<div class="classification-card-body">',
          '<div class="classification-card-title">' + escapeHtml(option.title || option.label) + '</div>',
          '<div class="classification-card-desc">' + escapeHtml(option.description || "") + '</div>',
          '</div>',
          '</label>'
        ].join("");
      }).join(""),
      '</div>',
      '</div>'
    ].join("");
  }

  function renderRecurrentPositionQuestion(value) {
    return [
      '<div class="recurrent-step">',
      '<h3>Are the attacks clearly positional?</h3>',
      '<div class="classification-grid compact">',
      RECURRENT_POSITION_OPTIONS.map(function (option) {
        const checked = value === option.id ? " checked" : "";
        return [
          '<label class="classification-card small">',
          '<input class="sr-only" type="radio" name="recurrent_position" data-recurrent-position="' + escapeHtml(option.id) + '"' + checked + '>',
          '<span class="pattern-label">' + escapeHtml(option.label) + '</span>',
          '</label>'
        ].join("");
      }).join(""),
      '</div>',
      '</div>'
    ].join("");
  }

  function renderNextLevelOptions(categoryId, answers) {
    const options = NEXT_LEVEL_OPTIONS[categoryId] || [];
    const selected = answers.detailed_option && answers.detailed_option.value ? answers.detailed_option.value : "";
    if (!options.length) return "";

    return [
      '<div class="next-level-block">',
      '<div class="question-title"><span class="question-icon">' + iconSvg("pathway") + '</span><div><h2>Detailed diagnostic options</h2><p class="muted">Tap the closest option if one fits. The doctor will make the final diagnosis.</p></div></div>',
      '<div class="link-option-list">',
      options.map(function (label) {
        const id = slug("detail", label);
        const active = selected === id ? " active" : "";
        return '<button class="link-option' + active + '" type="button" data-action="choose-detail-option" data-id="' + escapeHtml(id) + '" data-label="' + escapeHtml(label) + '">' + escapeHtml(label) + '</button>';
      }).join(""),
      '</div>',
      '</div>'
    ].join("");
  }

  function renderPatternQuestion(question, answer) {
    const value = answer && answer.value ? answer.value : "";
    const cards = (question.options || []).map(function (option) {
      const checked = value === option.id ? " checked" : "";
      const categoryId = option.categoryId || option.id;
      return [
        '<label class="pattern-card">',
        '<input class="sr-only" type="radio" name="' + escapeHtml(question.id) + '" data-question-id="' + escapeHtml(question.id) + '" data-option-id="' + escapeHtml(option.id) + '"' + checked + '>',
        '<span class="pattern-art ' + escapeHtml(categoryId) + '">' + iconSvg(iconForCategory(categoryId)) + '</span>',
        '<span class="pattern-label">' + escapeHtml(option.text) + '</span>',
        '</label>'
      ].join("");
    }).join("");

    return [
      '<div class="question-block pattern-question">',
      '<div class="question-title"><span class="question-icon">' + iconSvg("pathway") + '</span><div><h2>' + escapeHtml(question.text) + ' <span class="badge">Required</span></h2><p class="muted">' + escapeHtml(question.help || "") + '</p></div></div>',
      '<div class="pattern-grid">',
      cards,
      '</div>',
      '</div>'
    ].join("");
  }

  function renderQuestion(question, answer) {
    const note = question.help ? '<p class="muted">' + escapeHtml(question.help) + '</p>' : "";
    const required = question.required ? ' <span class="badge">Required</span>' : "";
    const title = '<div class="question-title"><span class="question-icon">' + iconSvg(iconForQuestion(question)) + '</span><div><h2>' + escapeHtml(question.text) + required + '</h2>' + note + '</div></div>';

    if (question.type === "text") {
      const value = answer && typeof answer.value === "string" ? answer.value : "";
      return [
        '<div class="question-block">',
        title,
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
      title,
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
      '<div class="chart-grid">',
      renderCategoryBars(analytics.categoryCounts),
      renderRedFlagBars(analytics.redFlagCounts),
      '</div>',
      analytics.perDiagnosis.length ? renderDiagnosisBars(analytics.perDiagnosis) : "",
      analytics.perDiagnosis.length ? '<div class="table-wrap" style="margin-top:12px">' + renderDiagnosisMetricsTable(analytics.perDiagnosis) + '</div>' : ""
    ].join("");
  }

  function renderCategoryBars(rows) {
    if (!rows.length) return '<div class="chart-panel"><h3>Intake patterns</h3><div class="empty-state">No patient pattern data yet.</div></div>';
    const max = Math.max.apply(null, rows.map(function (row) { return row.count; }));
    return [
      '<div class="chart-panel">',
      '<h3>Intake patterns</h3>',
      '<div class="bar-list">',
      rows.map(function (row) {
        return renderBar(row.label, row.count, max, iconForCategory(row.id));
      }).join(""),
      '</div>',
      '</div>'
    ].join("");
  }

  function renderRedFlagBars(rows) {
    if (!rows.length) return '<div class="chart-panel"><h3>Red flags</h3><div class="empty-state">No red flags selected yet.</div></div>';
    const max = Math.max.apply(null, rows.map(function (row) { return row.count; }));
    return [
      '<div class="chart-panel">',
      '<h3>Red flags</h3>',
      '<div class="bar-list">',
      rows.map(function (row) {
        return renderBar(row.label, row.count, max, iconForRedFlag(row.id));
      }).join(""),
      '</div>',
      '</div>'
    ].join("");
  }

  function renderDiagnosisBars(rows) {
    const max = Math.max.apply(null, rows.map(function (row) {
      return Math.max(row.finalCount, row.predictedCount);
    }));
    return [
      '<div class="chart-panel wide">',
      '<h3>Diagnosis review</h3>',
      '<div class="dual-bar-list">',
      rows.map(function (row) {
        const finalWidth = barWidth(row.finalCount, max);
        const predictedWidth = barWidth(row.predictedCount, max);
        return [
          '<div class="dual-bar-row">',
          '<div class="bar-label">' + escapeHtml(row.name) + '</div>',
          '<div class="dual-bars">',
          '<div class="dual-bar-line"><span class="bar-key final"></span><span class="bar-track"><span class="bar-fill final" style="width:' + finalWidth + '%"></span></span><strong>' + row.finalCount + '</strong></div>',
          '<div class="dual-bar-line"><span class="bar-key predicted"></span><span class="bar-track"><span class="bar-fill predicted" style="width:' + predictedWidth + '%"></span></span><strong>' + row.predictedCount + '</strong></div>',
          '</div>',
          '</div>'
        ].join("");
      }).join(""),
      '<div class="chart-legend"><span><span class="bar-key final"></span>Final</span><span><span class="bar-key predicted"></span>Predicted</span></div>',
      '</div>',
      '</div>'
    ].join("");
  }

  function renderBar(label, count, max, icon) {
    return [
      '<div class="bar-row">',
      '<div class="bar-label"><span class="bar-icon">' + iconSvg(icon) + '</span><span>' + escapeHtml(label) + '</span></div>',
      '<div class="bar-track"><span class="bar-fill" style="width:' + barWidth(count, max) + '%"></span></div>',
      '<strong>' + count + '</strong>',
      '</div>'
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
      '<h3>Examination focus</h3>',
      renderExaminationPointers(getExaminationPointers(submission)),
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
    const activeDiagnosisId = state.pendingFinalDiagnosis !== null ? state.pendingFinalDiagnosis : (submission.finalDiagnosisId || "");
    const categoryOptions = state.config.categories.map(function (category) {
      const selected = category.id === submission.finalCategoryId ? " selected" : "";
      return '<option value="' + escapeHtml(category.id) + '"' + selected + '>' + escapeHtml(category.label) + '</option>';
    }).join("");

    const diagButtons = state.config.diagnoses.length
      ? '<div class="diag-quick-list">' + state.config.diagnoses.map(function (diagnosis) {
          const active = diagnosis.id === activeDiagnosisId ? " active" : "";
          return '<button class="diag-quick-btn' + active + '" type="button" data-action="quick-final-diagnosis" data-diagnosis-id="' + escapeHtml(diagnosis.id) + '">' + escapeHtml(diagnosis.name) + '</button>';
        }).join("") + '</div>'
      : '<p class="muted" style="margin:4px 0 8px">No diagnoses configured yet. Add them in Admin, or use the free-text field below.</p>';

    return [
      '<div class="field-grid">',
      '<div class="field">',
      '<label for="finalCategory">Final category</label>',
      '<select id="finalCategory"><option value="">Not selected</option>' + categoryOptions + '</select>',
      '</div>',
      '</div>',
      '<div class="field" style="margin-bottom:12px">',
      '<label>Final diagnosis</label>',
      diagButtons,
      '</div>',
      '<div class="field" style="margin-bottom:16px">',
      '<label for="finalDiagnosisText">Free-text diagnosis</label>',
      '<input id="finalDiagnosisText" value="' + escapeHtml(submission.finalDiagnosisText || "") + '" placeholder="Type if not in the list above">',
      '</div>',
      '<div class="actions">',
      '<button class="button" type="button" data-action="save-final" data-id="' + escapeHtml(submission.id) + '">Save</button>',
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
      '<div class="field"><label for="newQuestionShowIf">Visible after answer</label><select id="newQuestionShowIf"><option value="">Always show in selected category</option>' + renderRuleTargetOptions("") + '</select></div>',
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
        if (state.editingQuestionId === question.id) return renderQuestionEditForm(question);
        return [
          '<div class="list-item">',
          '<div class="row"><strong>' + escapeHtml(question.text) + '</strong><div class="actions compact">',
          '<button class="button secondary small" type="button" data-action="edit-question" data-id="' + escapeHtml(question.id) + '">Edit</button>',
          '<button class="button secondary small" type="button" data-action="delete-question" data-id="' + escapeHtml(question.id) + '">Delete</button>',
          '</div></div>',
          '<div class="muted">' + escapeHtml(category ? category.label : question.categoryId) + ' | ' + escapeHtml(question.type) + ' | ID: ' + escapeHtml(question.id) + '</div>',
          '</div>'
        ].join("");
      }).join(""),
      '</div>',
      '</div>'
    ].join("");
  }

  function renderQuestionEditForm(question) {
    const showIfValue = question.showIf ? question.showIf.questionId + "|" + question.showIf.optionId : "";
    return [
      '<div class="list-item edit-item">',
      '<div class="row"><strong>Edit question</strong><span class="badge">' + escapeHtml(question.id) + '</span></div>',
      '<div class="field-grid">',
      '<div class="field"><label for="editQuestionCategory">Category</label><select id="editQuestionCategory">' + state.config.categories.map(function (category) {
        return '<option value="' + escapeHtml(category.id) + '"' + selectedAttr(category.id, question.categoryId) + '>' + escapeHtml(category.label) + '</option>';
      }).join("") + '</select></div>',
      '<div class="field"><label for="editQuestionType">Type</label><select id="editQuestionType"><option value="single"' + selectedAttr("single", question.type) + '>Single choice</option><option value="multi"' + selectedAttr("multi", question.type) + '>Multiple choice</option><option value="text"' + selectedAttr("text", question.type) + '>Free text</option></select></div>',
      '<div class="field"><label for="editQuestionText">Question text</label><input id="editQuestionText" value="' + escapeHtml(question.text || "") + '"></div>',
      '<div class="field"><label for="editQuestionHelp">Help text</label><input id="editQuestionHelp" value="' + escapeHtml(question.help || "") + '"></div>',
      '<div class="field"><label for="editQuestionOptions">Options</label><textarea id="editQuestionOptions" placeholder="One option per line">' + escapeHtml(questionOptionsText(question)) + '</textarea></div>',
      '<div class="field"><label for="editQuestionShowIf">Visible after answer</label><select id="editQuestionShowIf"><option value="">Always show in selected category</option>' + renderRuleTargetOptions(showIfValue) + '</select></div>',
      '<div class="field"><label for="editQuestionNote">Doctor-only note</label><textarea id="editQuestionNote">' + escapeHtml(question.doctorNote || "") + '</textarea></div>',
      '<label class="choice"><input type="checkbox" id="editQuestionRequired"' + checkedAttr(question.required) + '><span>Required question</span></label>',
      '</div>',
      '<div class="actions">',
      '<button class="button" type="button" data-action="update-question" data-id="' + escapeHtml(question.id) + '">Save question</button>',
      '<button class="button secondary" type="button" data-action="cancel-edit-question">Cancel</button>',
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
      '<div class="field"><label for="newRuleTarget">Answer that triggers score</label><select id="newRuleTarget">' + renderRuleTargetOptions("") + '</select></div>',
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

  function renderRuleTargetOptions(selectedValue) {
    return getChoiceTargets(state.config).map(function (target) {
      const value = target.questionId + "|" + target.optionId;
      return '<option value="' + escapeHtml(value) + '"' + selectedAttr(value, selectedValue) + '>' + escapeHtml(target.label) + '</option>';
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
      if (target.checked) {
        state.patient.safetyNoneSelected = false;
      }
      renderSafetyScreen();
      return;
    }
    if ("safetyNone" in target.dataset) {
      if (target.checked) {
        state.patient.redFlags = [];
        state.patient.safetyNoneSelected = true;
        state.patient.safetyDone = true;
        renderPatient();
      } else {
        state.patient.safetyNoneSelected = false;
        renderSafetyScreen();
      }
      return;
    }

    if (target.dataset.simpleQid) {
      var sqId = target.dataset.simpleQid;
      var soId = target.dataset.simpleOid;
      var existing = Array.isArray(state.simplePatient.answers[sqId]) ? state.simplePatient.answers[sqId].slice() : [];
      if (soId === "none" && target.checked) {
        existing = ["none"];
      } else {
        existing = existing.filter(function (v) { return v !== "none"; });
        toggleArrayValue(existing, soId, target.checked);
      }
      state.simplePatient.answers[sqId] = existing;
      var nextBtn = app.querySelector('[data-action="simple-next"]');
      if (nextBtn) nextBtn.disabled = existing.length === 0;
      var noneBtn = app.querySelector('[data-action="simple-none-answer"]');
      if (noneBtn) noneBtn.disabled = existing.some(function (v) { return v !== "none"; });
      document.querySelectorAll('[data-simple-qid="' + sqId + '"]').forEach(function (cb) {
        var lbl = cb.closest(".simple-option");
        if (lbl) lbl.classList.toggle("selected", existing.includes(cb.dataset.simpleOid));
        if (soId === "none" && target.checked && cb.dataset.simpleOid !== "none") cb.checked = false;
        if (soId !== "none" && target.checked && cb.dataset.simpleOid === "none") cb.checked = false;
      });
      if (soId === "none" && target.checked && shouldAutoAdvanceSimpleNone(sqId)) advanceSimpleQuestion();
      return;
    }

    if (target.dataset.posQid) {
      var pqId = target.dataset.posQid;
      var poId = target.dataset.posOid;
      var posExisting = Array.isArray(state.simplePatient.positionalAnswers[pqId]) ? state.simplePatient.positionalAnswers[pqId].slice() : [];
      // clear "any_all" if a specific option is being selected
      var anyAllIdx = posExisting.indexOf("any_all");
      if (anyAllIdx !== -1 && target.checked) posExisting.splice(anyAllIdx, 1);
      toggleArrayValue(posExisting, poId, target.checked);
      state.simplePatient.positionalAnswers[pqId] = posExisting;
      var posNextBtn = app.querySelector('[data-action="simple-positional-next"]');
      if (posNextBtn) posNextBtn.disabled = posExisting.filter(function (v) { return v !== "any_all"; }).length === 0;
      document.querySelectorAll('[data-pos-qid="' + pqId + '"]').forEach(function (cb) {
        var lbl = cb.closest(".simple-option");
        if (lbl) lbl.classList.toggle("selected", posExisting.includes(cb.dataset.posOid));
      });
      return;
    }

    if (target.dataset.initialPathway) {
      setInitialPathway(target.dataset.initialPathway);
      renderPatient();
      return;
    }

    if (target.dataset.attackPattern) {
      setAttackPattern(target.dataset.attackPattern);
      renderPatient();
      return;
    }

    if (target.dataset.recurrentPosition) {
      setRecurrentPosition(target.dataset.recurrentPosition);
      renderPatient();
      return;
    }

    if (target.dataset.questionId && target.dataset.optionId) {
      const qId = target.dataset.questionId;
      const optId = target.dataset.optionId;
      setChoiceAnswer(qId, optId, target.checked, target.type);

      if (state.patient.safetyDone && target.type === "radio") {
        removeHiddenAnswers();
        state.patient.questionStep++;
        renderPatient();
        return;
      }

      if (target.type === "checkbox" && target.checked && state.patient.safetyDone) {
        const isTerminal = optId === "none" || optId === "not_sure";
        if (isTerminal) {
          const question = findQuestion(qId, state.config);
          const option = question && question.options ? question.options.find(function (o) { return o.id === optId; }) : null;
          state.patient.answers[qId] = { type: "multi", values: [optId], labels: [option ? option.text : optId] };
          removeHiddenAnswers();
          state.patient.questionStep++;
          renderPatient();
          return;
        }
        const answer = state.patient.answers[qId];
        if (answer && Array.isArray(answer.values)) {
          const hadTerminal = answer.values.some(function (v) { return v === "none" || v === "not_sure"; });
          if (hadTerminal) {
            const question = findQuestion(qId, state.config);
            answer.values = answer.values.filter(function (v) { return v !== "none" && v !== "not_sure"; });
            if (question) {
              answer.labels = answer.values.map(function (v) {
                const opt = question.options.find(function (o) { return o.id === v; });
                return opt ? opt.text : v;
              });
            }
            if (qId === "top_pattern" || hasDependentQuestions(qId)) removeHiddenAnswers();
            renderPatient();
            return;
          }
        }
      }

      if (qId === "top_pattern" || hasDependentQuestions(qId)) {
        removeHiddenAnswers();
        renderPatient();
      }
    }
  }

  async function handleClick(event) {
    const actionTarget = event.target.closest("[data-action]");
    if (!actionTarget) return;

    const action = actionTarget.dataset.action;
    if (action === "go-home") { state.role = ""; state.tab = ""; state.patient = freshPatientState(); state.simplePatient = freshSimplePatientState(); state.submitted = null; render(); }
    if (action === "back-step") {
      const a = state.patient.answers;
      if (a.recurrent_position) delete a.recurrent_position;
      else if (a.attack_pattern) delete a.attack_pattern;
      else delete a.initial_pathway;
      state.patient.safetyDone = false;
      state.patient.safetyWarningShown = false;
      state.patient.safetyNoneSelected = false;
      state.patient.questionStep = 0;
      removeHiddenAnswers();
      renderPatient();
    }
    if (action === "next-question") {
      const clinicInput = document.getElementById("clinicId");
      if (clinicInput) state.patient.clinicId = clinicInput.value;
      const config = state.config;
      const answers = state.patient.answers;
      const categoryId = getCurrentCategoryId(answers, config);
      const visibleQuestions = getVisibleBranchQuestions(categoryId, answers, config);
      const question = visibleQuestions[state.patient.questionStep];
      if (question && question.required && !hasAnswer(answers[question.id])) {
        return;
      }
      if (state.patient.questionStep < visibleQuestions.length) {
        state.patient.questionStep++;
      }
      renderPatient();
    }
    if (action === "back-question") {
      if (state.patient.questionStep > 0) {
        state.patient.questionStep--;
      } else {
        state.patient.safetyDone = false;
        state.patient.safetyWarningShown = false;
      }
      renderPatient();
    }
    if (action === "safety-continue") {
      if (state.patient.redFlags.length > 0) {
        state.patient.safetyWarningShown = true;
      } else if (state.patient.safetyNoneSelected) {
        state.patient.safetyDone = true;
      } else {
        alert("Please select any warning symptoms, or choose None of these apply to me.");
      }
      renderPatient();
    }
    if (action === "safety-acknowledge") {
      state.patient.safetyDone = true;
      state.patient.safetyWarningShown = false;
      renderPatient();
    }
    if (action === "safety-back") {
      state.patient.safetyWarningShown = false;
      renderPatient();
    }
    if (action === "simple-answer") {
      var sqid = actionTarget.dataset.qid;
      var soid = actionTarget.dataset.oid;
      if (soid === "restart") {
        state.simplePatient = freshSimplePatientState();
        renderSimplePatient();
        return;
      }
      state.simplePatient.answers[sqid] = soid;
      if (sqid === "recurrent_head_trigger" && soid === "not_sure") {
        state.simplePatient.done = true;
        renderSimplePatient();
        return;
      }
      if ((sqid === "recurrent_head_trigger" && soid === "yes") || (sqid === "recurrent_trigger_clarify" && soid === "only_head_position") || (sqid === "stops_still" && soid === "yes_returns")) {
        state.simplePatient.positionalFlow = true;
        state.simplePatient.positionalRedirect = false;
        state.simplePatient.positionalStep = 0;
        renderSimplePatient();
        return;
      }
      var sq = SIMPLE_PATIENT_QUESTIONS[state.simplePatient.step];
      if (sq && sq.urgent && soid !== "none") {
        state.simplePatient.urgentWarning = true;
        renderSimplePatient();
        return;
      }
      state.simplePatient.step++;
      if (state.simplePatient.step >= SIMPLE_PATIENT_QUESTIONS.length) state.simplePatient.done = true;
      renderSimplePatient();
    }
    if (action === "simple-none-answer") {
      var noneQid = actionTarget.dataset.qid;
      state.simplePatient.answers[noneQid] = ["none"];
      advanceSimpleQuestion();
    }
    if (action === "simple-next") {
      var sqid2 = SIMPLE_PATIENT_QUESTIONS[state.simplePatient.step] && SIMPLE_PATIENT_QUESTIONS[state.simplePatient.step].id;
      var sqVal = sqid2 ? state.simplePatient.answers[sqid2] : null;
      var isUrgentQ = SIMPLE_PATIENT_QUESTIONS[state.simplePatient.step] && SIMPLE_PATIENT_QUESTIONS[state.simplePatient.step].urgent;
      var urgentSelected = isUrgentQ && Array.isArray(sqVal) && sqVal.some(function (v) { return v !== "none"; });
      if (urgentSelected) {
        state.simplePatient.urgentWarning = true;
        renderSimplePatient();
        return;
      }
      if (sqid2 === "single_red_flag_detail" && Array.isArray(sqVal)) {
        var VASCULAR_IDS = ["double_vision", "tingling_one_side", "slurred_speech", "weakness_one_side", "new_ringing", "reduced_hearing"];
        if (sqVal.some(function (v) { return VASCULAR_IDS.indexOf(v) !== -1; })) {
          state.simplePatient.urgentWarning = true;
          renderSimplePatient();
          return;
        }
      }
      advanceSimpleQuestion();
    }
    if (action === "simple-back") {
      if (state.simplePatient.positionalRedirect) {
        state.simplePatient.positionalRedirect = false;
        delete state.simplePatient.answers.stops_still;
        renderSimplePatient();
        return;
      }
      if (state.simplePatient.step > 0) {
        state.simplePatient.step--;
        while (state.simplePatient.step > 0 &&
               shouldSkipSimpleQuestion(SIMPLE_PATIENT_QUESTIONS[state.simplePatient.step], state.simplePatient.answers, true)) {
          state.simplePatient.step--;
        }
      }
      state.simplePatient._goingBack = true;
      renderSimplePatient();
    }
    if (action === "simple-urgent-continue") {
      state.simplePatient.urgentWarning = false;
      state.simplePatient.step++;
      if (state.simplePatient.step >= SIMPLE_PATIENT_QUESTIONS.length) state.simplePatient.done = true;
      renderSimplePatient();
    }
    if (action === "simple-positional-start") {
      state.simplePatient.positionalRedirect = false;
      state.simplePatient.positionalFlow = true;
      state.simplePatient.positionalStep = 0;
      renderSimplePatient();
    }
    if (action === "simple-positional-answer") {
      var pqid = actionTarget.dataset.qid;
      var poid = actionTarget.dataset.oid;
      state.simplePatient.positionalAnswers[pqid] = poid;
      state.simplePatient.positionalStep++;
      if (state.simplePatient.positionalStep >= SIMPLE_POSITIONAL_QUESTIONS.length) state.simplePatient.positionalDone = true;
      renderSimplePatient();
    }
    if (action === "simple-positional-any-all") {
      state.simplePatient.positionalAnswers["pos_trigger"] = ["any_all"];
      state.simplePatient.positionalStep++;
      if (state.simplePatient.positionalStep >= SIMPLE_POSITIONAL_QUESTIONS.length) state.simplePatient.positionalDone = true;
      renderSimplePatient();
    }
    if (action === "simple-positional-next") {
      state.simplePatient.positionalStep++;
      if (state.simplePatient.positionalStep >= SIMPLE_POSITIONAL_QUESTIONS.length) state.simplePatient.positionalDone = true;
      renderSimplePatient();
    }
    if (action === "simple-positional-back") {
      if (state.simplePatient.positionalDone) {
        state.simplePatient.positionalDone = false;
        state.simplePatient.positionalStep = SIMPLE_POSITIONAL_QUESTIONS.length - 1;
      } else if (state.simplePatient.positionalStep > 0) {
        state.simplePatient.positionalStep--;
      } else {
        state.simplePatient.positionalFlow = false;
        state.simplePatient.positionalRedirect = false;
      }
      renderSimplePatient();
    }
    if (action === "accept-positional-redirect") {
      state.patient.positionalRedirectAcknowledged = true;
      state.patient.questionStep = 0;
      renderPatient();
    }
    if (action === "back-positional-redirect") {
      delete state.patient.answers.ft_current_pattern;
      state.patient.positionalRedirectAcknowledged = false;
      removeHiddenAnswers();
      renderPatient();
    }
    if (action === "choose-role") {
      var chosenRole = actionTarget.dataset.role;
      if (chosenRole === "patient_simple") {
        state.role = "patient_simple";
        state.simplePatient = freshSimplePatientState();
      } else if (chosenRole === "doctor_examining") {
        state.role = "doctor_examining";
        state.tab = "patient";
        state.patient = freshPatientState();
        state.submitted = null;
      } else if (chosenRole === "doctor_guidance") {
        state.role = "doctor_guidance";
      } else {
        state.role = "doctor_examining";
        state.tab = chosenRole;
      }
      render();
      app.focus();
    }
    if (action === "submit-patient") await submitPatient();
    if (action === "choose-detail-option") chooseDetailOption(actionTarget.dataset.id, actionTarget.dataset.label);
    if (action === "reset-patient") resetPatientForm();
    if (action === "new-patient") startNewPatient();
    if (action === "unlock-doctor") await unlockClinician("doctor");
    if (action === "unlock-admin") await unlockClinician("admin");
    if (action === "refresh-doctor") await refreshDoctorData();
    if (action === "select-submission") {
      state.selectedSubmissionId = actionTarget.dataset.id;
      state.pendingFinalDiagnosis = null;
      renderDoctor();
    }
    if (action === "quick-final-diagnosis") {
      const newId = actionTarget.dataset.diagnosisId;
      const submission = state.submissions.find(function (s) { return s.id === state.selectedSubmissionId; });
      const currentId = state.pendingFinalDiagnosis !== null ? state.pendingFinalDiagnosis : (submission ? submission.finalDiagnosisId : "");
      state.pendingFinalDiagnosis = newId === currentId ? "" : newId;
      renderDoctor();
    }
    if (action === "save-final") await saveFinalDiagnosis(actionTarget.dataset.id);
    if (action === "add-question") await addQuestion();
    if (action === "edit-question") {
      state.editingQuestionId = actionTarget.dataset.id;
      renderAdmin();
    }
    if (action === "cancel-edit-question") {
      state.editingQuestionId = null;
      renderAdmin();
    }
    if (action === "update-question") await updateQuestion(actionTarget.dataset.id);
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
    const clinicInput = document.getElementById("clinicId");
    if (clinicInput) state.patient.clinicId = clinicInput.value;
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
    if (!hasInitialClassification(state.patient.answers)) {
      return { ok: false, message: "Please complete the Initial Classification first." };
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
    const finalDiagnosisId = state.pendingFinalDiagnosis !== null ? state.pendingFinalDiagnosis : (submission.finalDiagnosisId || "");
    const finalDiagnosisText = valueOf("finalDiagnosisText").trim();
    const reviewedAt = new Date().toISOString();

    submission.finalCategoryId = finalCategoryId;
    submission.finalDiagnosisId = finalDiagnosisId;
    submission.finalDiagnosisText = finalDiagnosisText;
    submission.reviewedAt = reviewedAt;
    state.pendingFinalDiagnosis = null;

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

  async function updateQuestion(id) {
    const question = state.config.branchQuestions.find(function (item) {
      return item.id === id;
    });
    if (!question) return;

    const text = valueOf("editQuestionText").trim();
    const type = valueOf("editQuestionType");
    const options = parseEditedQuestionOptions(question, "editQuestionOptions");

    if (!text) {
      alert("Enter the question text.");
      return;
    }
    if (type !== "text" && !options.length) {
      alert("Choice questions need at least one option.");
      return;
    }

    const showIfValue = valueOf("editQuestionShowIf");
    const showIfParts = showIfValue ? showIfValue.split("|") : [];
    question.categoryId = valueOf("editQuestionCategory");
    question.type = type;
    question.required = document.getElementById("editQuestionRequired").checked;
    question.text = text;
    question.help = valueOf("editQuestionHelp").trim();
    question.doctorNote = valueOf("editQuestionNote").trim();
    question.showIf = showIfParts.length === 2 ? { questionId: showIfParts[0], optionId: showIfParts[1] } : null;
    question.options = type === "text" ? [] : options;

    state.editingQuestionId = null;
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
    const initial = answers.initial_pathway && answers.initial_pathway.value ? answers.initial_pathway.value : "";
    if (initial === "constant") return "persistent_unsteady";
    if (initial === "attack") {
      const attack = answers.attack_pattern && answers.attack_pattern.value ? answers.attack_pattern.value : "";
      if (attack === "first_attack") {
        const pattern = answers.ft_current_pattern && answers.ft_current_pattern.value ? answers.ft_current_pattern.value : "";
        if (pattern === "positional_stops") return "recurrent_triggered";
        return "first_time";
      }
      if (attack !== "recurrent") return "";
      const recurrent = answers.recurrent_position && answers.recurrent_position.value ? answers.recurrent_position.value : "";
      if (recurrent === "positional") return "recurrent_triggered";
      if (recurrent === "non_positional") return "recurrent_spontaneous";
      if (recurrent === "unclear") return "recurrent_unclear";
      return "";
    }

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
      if (!question.showIf || !question.showIf.questionId) return true;
      const answer = answers[question.showIf.questionId];
      const vals = normalizeAnswerValues(answer);
      if (question.showIf.noneOf) return !vals.some(function (v) { return question.showIf.noneOf.includes(v); });
      return vals.includes(question.showIf.optionId);
    });
  }

  function removeHiddenAnswers() {
    const categoryId = getCurrentCategoryId(state.patient.answers, state.config);
    const visibleIds = new Set(["initial_pathway", "attack_pattern", "recurrent_position", "detailed_option", "top_pattern", "ft_current_pattern"].concat(getVisibleBranchQuestions(categoryId, state.patient.answers, state.config).map(function (question) {
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

  function setInitialPathway(optionId) {
    const option = INITIAL_CLASSIFICATION_OPTIONS.find(function (item) { return item.id === optionId; });
    if (!option) return;

    state.patient.answers.initial_pathway = {
      type: "single",
      value: option.id,
      label: option.label
    };
    delete state.patient.answers.recurrent_position;
    delete state.patient.answers.attack_pattern;
    delete state.patient.answers.detailed_option;
    syncTopPatternAnswer();
    removeHiddenAnswers();
  }

  function setAttackPattern(optionId) {
    const option = ATTACK_PATTERN_OPTIONS.find(function (item) { return item.id === optionId; });
    if (!option) return;

    state.patient.answers.attack_pattern = {
      type: "single",
      value: option.id,
      label: option.label
    };
    delete state.patient.answers.recurrent_position;
    delete state.patient.answers.detailed_option;
    syncTopPatternAnswer();
    removeHiddenAnswers();
  }

  function setRecurrentPosition(optionId) {
    const option = RECURRENT_POSITION_OPTIONS.find(function (item) { return item.id === optionId; });
    if (!option) return;

    state.patient.answers.recurrent_position = {
      type: "single",
      value: option.id,
      label: option.label
    };
    delete state.patient.answers.detailed_option;
    syncTopPatternAnswer();
    removeHiddenAnswers();
  }

  function chooseDetailOption(id, label) {
    state.patient.answers.detailed_option = {
      type: "single",
      value: id,
      label: label || id
    };
    renderPatient();
  }

  function hasInitialClassification(answers) {
    const initial = answers.initial_pathway && answers.initial_pathway.value;
    if (!initial) return false;
    if (initial === "attack") {
      const attack = answers.attack_pattern && answers.attack_pattern.value;
      if (!attack) return false;
      if (attack === "recurrent") return Boolean(answers.recurrent_position && answers.recurrent_position.value);
    }
    return true;
  }

  function syncTopPatternAnswer() {
    const categoryId = getCurrentCategoryId(state.patient.answers, state.config);
    const category = findCategory(categoryId, state.config);
    if (!category || !["first_time", "recurrent_triggered", "recurrent_spontaneous", "persistent_unsteady"].includes(categoryId)) {
      delete state.patient.answers.top_pattern;
      return;
    }

    state.patient.answers.top_pattern = {
      type: "single",
      value: categoryId,
      label: category.patientLabel || category.label
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

    const categoryCounts = config.categories.map(function (category) {
      return {
        id: category.id,
        label: category.label,
        count: submissions.filter(function (item) { return item.categoryId === category.id; }).length
      };
    }).filter(function (row) {
      return row.count > 0;
    });

    const redFlagCounts = config.redFlags.map(function (flag) {
      return {
        id: flag.id,
        label: flag.text,
        count: submissions.filter(function (item) {
          return item.redFlags.includes(flag.id);
        }).length
      };
    }).filter(function (row) {
      return row.count > 0;
    }).sort(function (a, b) {
      return b.count - a.count || a.label.localeCompare(b.label);
    });

    return {
      total: submissions.length,
      reviewed: reviewed.length,
      categoryRate: categoryReviewed.length ? Math.round((categoryMatches / categoryReviewed.length) * 100) + "%" : "n/a",
      top1Rate: diagnosisReviewed.length ? Math.round((top1 / diagnosisReviewed.length) * 100) + "%" : "n/a",
      top3Rate: diagnosisReviewed.length ? Math.round((top3 / diagnosisReviewed.length) * 100) + "%" : "n/a",
      perDiagnosis,
      categoryMatrix,
      categoryCounts,
      redFlagCounts
    };
  }

  function hasDependentQuestions(questionId) {
    return state.config.branchQuestions.some(function (question) {
      return question.showIf && question.showIf.questionId === questionId;
    });
  }

  function mergeSeededBranchQuestions(branchQuestions) {
    const recurrentSeedIds = new Set([
      "rt_attack_trigger",
      "rt_attack_duration",
      "rt_between_attacks",
      "rt_side_pattern",
      "rt_ear_neuro_symptoms",
      "rt_central_features",
      "rs_attack_frequency",
      "rs_attack_duration",
      "rs_migraine_features",
      "rs_ear_features",
      "rs_vascular_context",
      "rs_spontaneous_pattern",
      "rs_migraine_profile",
      "rs_vascular_risk",
      "rs_vascular_warning",
      "rs_meniere_features"
    ]);
    const existing = branchQuestions.filter(function (question) {
      if (question.categoryId === "recurrent_triggered" || question.categoryId === "recurrent_spontaneous") {
        return !recurrentSeedIds.has(question.id);
      }
      return true;
    });
    const existingIds = new Set(existing.map(function (question) {
      return question.id;
    }));

    DEFAULT_CONFIG.branchQuestions.forEach(function (question) {
      if (!existingIds.has(question.id)) existing.push(clone(question));
    });

    return existing;
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
    if (source.seededContentVersion !== SEEDED_CONTENT_VERSION) {
      source.branchQuestions = mergeSeededBranchQuestions(source.branchQuestions);
    }
    source.seededContentVersion = SEEDED_CONTENT_VERSION;
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
    const category = (config.categories || []).find(function (category) {
      return category.id === categoryId;
    });
    if (category) return category;
    if (categoryId === "recurrent_unclear") {
      return {
        id: "recurrent_unclear",
        label: "Recurrent vertigo, positional clarity uncertain",
        doctorSummary: "Recurrent vertigo requiring clarification of positional versus non-positional pattern."
      };
    }
    return null;
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
      answers: {},
      safetyNoneSelected: false,
      safetyDone: false,
      safetyWarningShown: false,
      questionStep: 0,
      positionalRedirectAcknowledged: false
    };
  }

  function freshSimplePatientState() {
    return {
      step: 0,
      answers: {},
      done: false,
      urgentWarning: false,
      positionalRedirect: false,
      positionalFlow: false,
      positionalStep: 0,
      positionalAnswers: {},
      positionalDone: false
    };
  }

  function computeSimplePossibilities(a) {
    const feelingBriefResolved = a.feeling === "brief_resolved";
    const isSingleAttack = a.feeling === "single_attack";
    const isRepeated = a.feeling === "repeated_attacks";
    const isConstant = a.feeling === "constant";
    const isAttack = isSingleAttack || isRepeated || feelingBriefResolved;
    const stopsStill = a.stops_still === "yes_returns" || a.stops_still === "yes_stays";
    const isBrief = a.duration === "seconds" || a.duration === "minutes";

    const isRecurrentPositional = a.stops_still === "yes_returns" || (isRepeated && (a.recurrent_head_trigger === "yes" || a.recurrent_trigger_clarify === "only_head_position"));
    const isRecurrentSpontaneous = isRepeated && (a.recurrent_head_trigger === "no" || a.recurrent_trigger_clarify === "sitting_still");
    const isRecurrentStillUnclear = isRepeated && (a.recurrent_head_trigger === "not_sure" && a.recurrent_trigger_clarify === "still_not_sure");
    const recurrentMigraineItems = Array.isArray(a.recurrent_migraine_features) ? a.recurrent_migraine_features.filter(function (v) { return v !== "none"; }) : [];
    const recurrentTiaRiskItems = Array.isArray(a.recurrent_tia_risk) ? a.recurrent_tia_risk.filter(function (v) { return v !== "none"; }) : [];
    const recurrentTiaWarningItems = Array.isArray(a.recurrent_tia_warnings) ? a.recurrent_tia_warnings.filter(function (v) { return v !== "none"; }) : [];
    const recurrentMeniereItems = Array.isArray(a.recurrent_meniere_features) ? a.recurrent_meniere_features.filter(function (v) { return v !== "none"; }) : [];
    const isSpontaneousUnderTwenty = a.recurrent_spontaneous_duration === "under_twenty_minutes";
    const isSpontaneousOverTwenty = a.recurrent_spontaneous_duration === "over_twenty_minutes";
    const hasRecurrentMigraineFeatures = recurrentMigraineItems.length > 0;
    const hasRecurrentTiaPattern = recurrentTiaRiskItems.length > 0 || recurrentTiaWarningItems.length > 0;
    const hasRecurrentMenierePattern = isSpontaneousOverTwenty && recurrentMeniereItems.length > 0;
    const recurrentOrthostaticItems = Array.isArray(a.recurrent_orthostatic_features) ? a.recurrent_orthostatic_features.filter(function (v) { return v !== "none"; }) : [];
    const recurrentPanicItems = Array.isArray(a.recurrent_panic_features) ? a.recurrent_panic_features.filter(function (v) { return v !== "none"; }) : [];
    const hasRecurrentOrthostaticPattern = recurrentOrthostaticItems.length > 0;
    const hasRecurrentPanicPattern = recurrentPanicItems.length > 0;

    const hasUrgentFlags = a.urgent === "yes";
    const singleHasRedFlags = a.single_red_flags === "yes";
    const VASCULAR_IDS_P = ["double_vision", "tingling_one_side", "slurred_speech", "weakness_one_side", "new_ringing", "reduced_hearing"];
    const detailFlagsP = Array.isArray(a.single_red_flag_detail) ? a.single_red_flag_detail : [];
    const singleHasVascularFlags = detailFlagsP.some(function (v) { return VASCULAR_IDS_P.indexOf(v) !== -1; });
    const singlePreAttackOnly = singleHasRedFlags && detailFlagsP.includes("pre_attack_dizziness") && !singleHasVascularFlags;
    const riskFactors = Array.isArray(a.brief_risk_factors) ? a.brief_risk_factors.filter(function (v) { return v !== "none"; }) : [];
    const hasRiskFactors = riskFactors.length > 0;
    const circ = a.brief_circumstances;

    var all = [
      {
        name: "Vertebrobasilar TIA possible — urgent assessment needed",
        plain: "A brief episode of dizziness with warning signs can be a TIA. Urgent assessment today.",
        match: feelingBriefResolved && hasUrgentFlags,
        color: "red"
      },
      {
        name: "Vertebro-basilar TIA — see doctor urgently (risk factors present)",
        plain: "A brief episode of dizziness combined with vascular risk factors such as high blood pressure, diabetes, or heart disease needs urgent review. A TIA affecting the brain's balance area can present exactly this way. Please see a doctor today.",
        match: feelingBriefResolved && !hasUrgentFlags && hasRiskFactors
      },
      {
        name: "Your history suggests micturition syncope",
        plain: "Getting up at night to pass urine can briefly cut blood flow to the brain — this fits your description. Everything else is possible too: BPPV, vestibular migraine, postural hypotension, or a TIA.",
        match: feelingBriefResolved && !hasRiskFactors && circ === "night_urination",
        color: "green"
      },
      {
        name: "Your history suggests postural hypotension",
        plain: "A sudden drop in blood pressure on standing, especially with BP or prostate medicines, fits your description. Everything else is possible too: BPPV, vestibular migraine, or a TIA.",
        match: feelingBriefResolved && !hasRiskFactors && circ === "stood_up_bp_med",
        color: "green"
      },
      {
        name: "Your history suggests vestibular migraine",
        plain: "A brief dizzy episode in someone with a migraine history could be vestibular migraine — this fits your description. Everything else is possible too: BPPV, postural hypotension, or a TIA.",
        match: feelingBriefResolved && !hasRiskFactors && circ === "migraine_preceded",
        color: "green"
      },
      {
        name: "Please show your doctor",
        plain: "A single brief attack that has already gone is difficult to diagnose — even after a full examination there may be no clues. It could be something minor like BPPV, or something dangerous like a TIA. Since this is your first attack, please show your doctor and let him decide.",
        match: feelingBriefResolved && !hasUrgentFlags && !hasRiskFactors
      },
      {
        name: "Possible stroke or TIA — seek emergency care now",
        plain: "An ongoing first attack with neurological warning signs (double vision, tingling, slurred speech, weakness, new tinnitus, or hearing change) may indicate a stroke or TIA affecting the brain's balance area. Please seek emergency care immediately.",
        match: isSingleAttack && singleHasVascularFlags,
        color: "red"
      },
      {
        name: "Stroke must be excluded",
        plain: "Dizziness in the days or weeks before a sudden vertigo attack can be an early warning sign of a stroke or TIA (mini-stroke). This needs urgent same-day assessment. Your doctor will examine you and do appropriate tests to rule this out.",
        match: isSingleAttack && singlePreAttackOnly,
        color: "red"
      },
      {
        name: "The other likely cause is vestibular neuritis",
        plain: "Vestibular neuritis is inflammation of the balance nerve, often triggered by a viral illness. It commonly causes a sudden prolonged attack of vertigo and can be preceded by milder dizziness in the days before. It is treatable with steroids and vestibular rehabilitation exercises.",
        match: isSingleAttack && singlePreAttackOnly,
        color: "yellow"
      },
      {
        name: "Vestibular neuritis — needs treatment",
        plain: "The most likely cause of a prolonged first attack of vertigo without red flags is vestibular neuritis — inflammation of the balance nerve, often triggered by a virus. This is treatable with steroids and vestibular rehabilitation.",
        match: isSingleAttack && !singleHasRedFlags
      },
      {
        name: "Stroke still possible — do not delay",
        plain: "Even without clear warning signs, an ongoing first attack of severe vertigo must be seen by a doctor urgently to exclude a stroke affecting the balance area of the brain. Please do not wait.",
        match: isSingleAttack && !singleHasRedFlags
      },
      {
        name: "Could also be BPPV, migraine, Menière's disease, or a panic attack",
        plain: "Many first attacks of vertigo turn out to be benign — including a first episode of BPPV (inner ear crystals), vestibular migraine, Menière's disease, or a panic attack. Your doctor will examine you and decide which is most likely.",
        match: isSingleAttack && !singleHasVascularFlags,
        color: "green"
      },
      {
        name: "Positional vertigo — BPPV or central positional vertigo",
        plain: "Because the attacks are triggered by head position or sudden head movement, this is positional vertigo. The common possibility is BPPV, but the doctor should also consider central positional vertigo when the pattern is atypical or warning signs are present.",
        match: isRecurrentPositional
      },
      {
        name: "Recurrent vertigo pattern needs clarification",
        plain: "You have recurrent attacks of vertigo, but you are not sure if they are positional or non-positional. Let your doctor decide and then give the report accordingly.",
        match: isRecurrentStillUnclear || (isRepeated && !isRecurrentPositional && !isRecurrentSpontaneous)
      },
      {
        name: "Vestibular migraine",
        plain: "This is the most common cause of recurrent spontaneous, non-positional vertigo. Migraine history, headache around attacks, late nights, travel, missed meals, stress, nausea, vomiting, light sensitivity, or sound sensitivity all support this possibility.",
        match: isRecurrentSpontaneous && hasRecurrentMigraineFeatures
      },
      {
        name: "Vertebrobasilar TIA — discuss urgently with your doctor",
        plain: "Recurrent non-positional vertigo with age over 60, diabetes, hypertension, smoking, heart disease, or attack-time symptoms like double vision, slurred speech, one-sided tingling or weakness, or inability to walk can be a vertebrobasilar TIA. This is the dangerous possibility to highlight for urgent medical review.",
        match: isRecurrentSpontaneous && hasRecurrentTiaPattern,
        color: "red"
      },
      {
        name: "Meniere's disease is possible",
        plain: "Meniere's disease is considered only when vertigo attacks last more than 20 minutes and there are one-ear symptoms such as loud low-pitched ringing, fullness or heaviness, fluctuating hearing loss during attacks, or gradually progressive hearing loss. Duration over 20 minutes by itself is not enough.",
        match: isRecurrentSpontaneous && hasRecurrentMenierePattern
      },
      {
        name: "Orthostatic hypotension",
        plain: "One more possibility is low blood pressure on standing, called orthostatic hypotension. Your doctor will probably check your standing blood pressure also. Sometimes the blood pressure falls when you stand up, and that can cause dizziness.",
        match: isRecurrentSpontaneous && hasRecurrentOrthostaticPattern
      },
      {
        name: "Panic attacks or anxiety-related episodes",
        plain: "Sudden fear, palpitations, breathlessness, chest discomfort, or a sense of impending doom with dizziness can point toward panic attacks or anxiety-related episodes. Your doctor will consider this along with the other non-positional causes.",
        match: isRecurrentSpontaneous && hasRecurrentPanicPattern
      },
      {
        name: "Possibilities in this situation",
        bullets: [
          "Vestibular migraine",
          "Vertebral basilar TIA",
          "Meniere's disease",
          hasRecurrentOrthostaticPattern ? "Orthostatic hypotension, because dizziness can happen when blood pressure falls after standing" : "",
          hasRecurrentPanicPattern ? "Panic attacks or anxiety-related episodes" : "",
          "Other less common causes that your doctor may consider after seeing you"
        ].filter(Boolean),
        match: isRecurrentSpontaneous && !isSpontaneousUnderTwenty
      },
      {
        name: "Possibilities your doctor will need to consider",
        bullets: [
          "Vestibular migraine",
          "Vertebral basilar TIA, depending on the migraine features, risk factors, and warning symptoms",
          hasRecurrentOrthostaticPattern ? "Orthostatic hypotension, because dizziness can happen when blood pressure falls after standing" : "",
          hasRecurrentPanicPattern ? "Panic attacks or anxiety-related episodes" : "",
          "Meniere's disease is unlikely because of the duration"
        ].filter(Boolean),
        match: isRecurrentSpontaneous && isSpontaneousUnderTwenty
      },
      {
        name: "Balance nerve problem (vestibular neuritis)",
        plain: "Inflammation of the balance nerve, often triggered by a viral illness. Causes continuous dizziness that is always present.",
        match: isConstant && !stopsStill
      },
      {
        name: "Migraine-related dizziness",
        plain: "Dizziness that comes in attacks and may or may not come with a headache. A common and often unrecognised cause of recurrent vertigo.",
        match: isRepeated && !stopsStill && !a.recurrent_head_trigger
      },
      {
        name: "Low blood pressure on standing",
        plain: "A sudden drop in blood pressure when standing or sitting up. Causes brief lightheadedness or faintness.",
        match: isAttack && isBrief && !stopsStill && !feelingBriefResolved
      }
    ];

    var matched = all.filter(function (p) { return p.match; });
    return matched.length ? matched : all;
  }

  function getSimpleLabel(questionId, value) {
    if (!value) return "";
    var q = SIMPLE_PATIENT_QUESTIONS.find(function (item) { return item.id === questionId; });
    if (!q) return value;
    var opt = q.options.find(function (item) { return item.id === value; });
    return opt ? opt.text : value;
  }

  function getSimpleOptionText(questionId, optionId) {
    var q = SIMPLE_PATIENT_QUESTIONS.find(function (item) { return item.id === questionId; });
    if (!q) return optionId;
    var opt = q.options.find(function (item) { return item.id === optionId; });
    return opt ? opt.text : optionId;
  }

  function getExaminationPointers(submission) {
    var categoryId = submission.categoryId;
    var answers = submission.answers || {};
    var pattern = answers.ft_current_pattern && answers.ft_current_pattern.value ? answers.ft_current_pattern.value : "";
    var hasRedFlags = submission.redFlags && submission.redFlags.length > 0;

    var pointers = [];
    if (hasRedFlags) pointers = ["Full neurological examination", "Urgent imaging — consider CT or MRI", "Neurology or ENT referral"];
    else if (categoryId === "first_time") pointers = pattern === "brief_spells" ? EXAMINATION_POINTERS.first_time_brief : EXAMINATION_POINTERS.first_time_continuous;
    else if (categoryId === "recurrent_triggered") pointers = EXAMINATION_POINTERS.recurrent_triggered;
    else if (categoryId === "recurrent_spontaneous") pointers = EXAMINATION_POINTERS.recurrent_spontaneous;
    else if (categoryId === "recurrent_unclear") pointers = EXAMINATION_POINTERS.recurrent_unclear;
    else if (categoryId === "persistent_unsteady") pointers = EXAMINATION_POINTERS.persistent_unsteady;
    return pointers;
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

  function questionOptionsText(question) {
    return (question.options || []).map(function (option) {
      return option.text || "";
    }).join("\n");
  }

  function parseEditedQuestionOptions(question, fieldId) {
    return linesOf(fieldId).map(function (line, index) {
      const existing = question.options && question.options[index];
      return {
        id: existing && existing.id ? existing.id : slug("opt", line),
        text: line
      };
    });
  }

  function selectedAttr(value, selectedValue) {
    return value === selectedValue ? " selected" : "";
  }

  function checkedAttr(value) {
    return value ? " checked" : "";
  }

  function barWidth(count, max) {
    if (!max) return 0;
    return Math.max(6, Math.round((count / max) * 100));
  }

  function iconForCategory(categoryId) {
    if (categoryId === "first_time") return "spark";
    if (categoryId === "recurrent_triggered") return "rotate";
    if (categoryId === "recurrent_spontaneous") return "wave";
    if (categoryId === "persistent_unsteady") return "balance";
    return "pathway";
  }

  function iconForRedFlag(flagId) {
    if (flagId.includes("vision")) return "eye";
    if (flagId.includes("walk")) return "balance";
    if (flagId.includes("headache")) return "head";
    if (flagId.includes("speech")) return "speech";
    if (flagId.includes("chest") || flagId.includes("faint")) return "pulse";
    return "alert";
  }

  function iconForQuestion(question) {
    const text = (question.id + " " + question.text).toLowerCase();
    if (text.includes("hearing") || text.includes("ear") || text.includes("tinnitus")) return "ear";
    if (text.includes("headache") || text.includes("migraine")) return "head";
    if (text.includes("walking") || text.includes("fall") || text.includes("unsteady")) return "balance";
    if (text.includes("duration") || text.includes("long") || text.includes("when")) return "clock";
    if (text.includes("trigger") || text.includes("movement") || text.includes("position")) return "rotate";
    if (text.includes("medicine") || text.includes("injury") || text.includes("context")) return "clipboard";
    return "question";
  }

  function iconSvg(name) {
    const paths = {
      alert: '<path d="M12 3l9 16H3L12 3z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>',
      back: '<path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path>',
      ok: '<path d="M20 6L9 17l-5-5"></path>',
      balance: '<path d="M12 4v16"></path><path d="M7 8h10"></path><path d="M8 8l-4 7h8L8 8z"></path><path d="M16 8l-4 7h8l-4-7z"></path>',
      clipboard: '<path d="M8 5h8"></path><path d="M9 3h6v4H9z"></path><path d="M6 5H5v16h14V5h-1"></path><path d="M8 12h8"></path><path d="M8 16h6"></path>',
      clock: '<circle cx="12" cy="12" r="8"></circle><path d="M12 8v5l3 2"></path>',
      ear: '<path d="M8 11a4 4 0 1 1 7 3c-1 1-2 2-2 4"></path><path d="M6 11a6 6 0 1 1 10 5"></path><path d="M12 20c-2 0-3-1-3-3"></path>',
      eye: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"></path><circle cx="12" cy="12" r="3"></circle>',
      head: '<path d="M8 18v-2H6v-4a6 6 0 1 1 10 4v2"></path><path d="M10 22h6"></path><path d="M10 10h.01"></path><path d="M14 10h.01"></path>',
      pathway: '<path d="M5 19c2-5 12-1 14-8"></path><circle cx="5" cy="19" r="2"></circle><circle cx="19" cy="11" r="2"></circle><path d="M7 5h10"></path>',
      pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"></path>',
      question: '<circle cx="12" cy="12" r="8"></circle><path d="M10 10a2 2 0 1 1 3 2c-1 1-1 1-1 3"></path><path d="M12 18h.01"></path>',
      rotate: '<path d="M7 7h7a5 5 0 1 1-4 8"></path><path d="M7 7v5"></path><path d="M7 7h5"></path>',
      spark: '<path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z"></path><path d="M19 15l.6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15z"></path>',
      speech: '<path d="M5 6h14v10H9l-4 4V6z"></path><path d="M8 10h8"></path><path d="M8 13h5"></path>',
      wave: '<path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"></path><path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0"></path>'
    };
    return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + (paths[name] || paths.question) + '</svg>';
  }

  function dizzyPersonSvg() {
    return [
      '<svg class="dizzy-hero-svg" viewBox="0 0 220 220" aria-hidden="true">',
      '<defs><radialGradient id="bggrad" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#d4eef8"/><stop offset="100%" stop-color="#eaf5fb"/></radialGradient></defs>',
      '<circle cx="110" cy="110" r="106" fill="url(#bggrad)"/>',
      '<circle cx="110" cy="110" r="88" fill="none" stroke="#b0d8ee" stroke-width="1.5" stroke-dasharray="6 4"/>',
      '<circle cx="110" cy="110" r="68" fill="none" stroke="#c0e2f2" stroke-width="1.5" stroke-dasharray="5 5"/>',
      '<circle cx="110" cy="110" r="48" fill="none" stroke="#cceaf6" stroke-width="1.5" stroke-dasharray="4 6"/>',
      '<ellipse cx="110" cy="170" rx="32" ry="34" fill="#4a90a4"/>',
      '<circle cx="110" cy="104" r="26" fill="#f5c8a0"/>',
      '<path d="M84 99 Q86 76 110 74 Q134 76 136 99" fill="#3d2b1f"/>',
      '<path d="M98 107 Q101 104 104 107" stroke="#5a3a1a" stroke-width="2" fill="none" stroke-linecap="round"/>',
      '<path d="M116 107 Q119 104 122 107" stroke="#5a3a1a" stroke-width="2" fill="none" stroke-linecap="round"/>',
      '<path d="M103 118 Q110 114 117 118" stroke="#5a3a1a" stroke-width="2" fill="none" stroke-linecap="round"/>',
      '<path d="M84 99 Q68 88 75 104 Q80 114 88 108" stroke="#f5c8a0" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
      '<path d="M136 99 Q152 88 145 104 Q140 114 132 108" stroke="#f5c8a0" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
      '<text x="58" y="78" font-size="18" fill="#f0c030">★</text>',
      '<text x="146" y="74" font-size="15" fill="#f0c030">★</text>',
      '<text x="105" y="62" font-size="13" fill="#f0c030">★</text>',
      '<text x="154" y="100" font-size="13" fill="#e8a020">★</text>',
      '<text x="50" y="104" font-size="12" fill="#e8a020">★</text>',
      '<path d="M62 130 Q70 126 78 130 Q86 134 94 130" stroke="#6ab4d4" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round"/>',
      '<path d="M126 130 Q134 126 142 130 Q150 134 158 130" stroke="#6ab4d4" stroke-width="2" fill="none" opacity="0.7" stroke-linecap="round"/>',
      '</svg>'
    ].join("");
  }

  function dizzyPersonSmallSvg() {
    return [
      '<svg class="summary-dizzy-icon" viewBox="0 0 56 56" aria-hidden="true">',
      '<circle cx="28" cy="28" r="26" fill="#eaf5fb"/>',
      '<circle cx="28" cy="26" r="10" fill="#f5c8a0"/>',
      '<path d="M18 24 Q19 16 28 15 Q37 16 38 24" fill="#3d2b1f"/>',
      '<text x="10" y="18" font-size="8" fill="#f0c030">★</text>',
      '<text x="38" y="16" font-size="7" fill="#f0c030">★</text>',
      '<text x="24" y="11" font-size="6" fill="#f0c030">★</text>',
      '<ellipse cx="28" cy="44" rx="10" ry="10" fill="#4a90a4"/>',
      '</svg>'
    ].join("");
  }

  function safetyPicture() {
    return [
      '<svg class="safety-picture" viewBox="0 0 160 120" aria-hidden="true">',
      '<rect x="20" y="16" width="120" height="88" rx="14" fill="#fff0f0"/>',
      '<rect x="63" y="22" width="6" height="76" rx="3" fill="#8b2020"/>',
      '<path d="M69 24 L124 36 L69 56 Z" fill="#b63a3a"/>',
      '<rect x="85" y="29" width="4" height="11" rx="2" fill="white"/>',
      '<circle cx="87" cy="47" r="2.5" fill="white"/>',
      '</svg>'
    ].join("");
  }

  function rolePicture(kind) {
    if (kind === "doctor") {
      return [
        '<svg class="role-picture" viewBox="0 0 160 120" aria-hidden="true">',
        '<rect x="20" y="16" width="120" height="88" rx="14" fill="#eef6f5"></rect>',
        '<circle cx="80" cy="42" r="20" fill="#f4c7a1"></circle>',
        '<path d="M54 96V78c0-16 52-16 52 0v18" fill="#ffffff" stroke="#0c7c7c" stroke-width="5"></path>',
        '<path d="M62 73l18 18 18-18" fill="none" stroke="#0c7c7c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>',
        '<path d="M66 34c7-18 36-18 44 0" fill="none" stroke="#1d2528" stroke-width="8" stroke-linecap="round"></path>',
        '<circle cx="58" cy="90" r="5" fill="#6f4a8e"></circle>',
        '<path d="M102 82v10a12 12 0 0 1-24 0" fill="none" stroke="#6f4a8e" stroke-width="4" stroke-linecap="round"></path>',
        '</svg>'
      ].join("");
    }

    return [
      '<svg class="role-picture" viewBox="0 0 160 120" aria-hidden="true">',
      '<rect x="20" y="16" width="120" height="88" rx="14" fill="#eef6f5"></rect>',
      '<circle cx="80" cy="42" r="20" fill="#d7a77d"></circle>',
      '<path d="M50 100V82c0-18 60-18 60 0v18" fill="#0c7c7c"></path>',
      '<path d="M62 31c9-16 35-15 43 2" fill="none" stroke="#1d2528" stroke-width="8" stroke-linecap="round"></path>',
      '<path d="M58 64c10 10 34 10 44 0" fill="none" stroke="#1d2528" stroke-width="4" stroke-linecap="round"></path>',
      '<path d="M104 30c12 8 18 20 14 36" fill="none" stroke="#337a4d" stroke-width="5" stroke-linecap="round"></path>',
      '</svg>'
    ].join("");
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
    if (location.hostname === "127.0.0.1" || location.hostname === "localhost") {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        registrations.forEach(function (registration) {
          registration.unregister();
        });
      });
      return;
    }
    navigator.serviceWorker.register("service-worker.js").catch(function () {
      return null;
    });
  }
})();
