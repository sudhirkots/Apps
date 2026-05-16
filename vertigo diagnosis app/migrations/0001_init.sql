CREATE TABLE IF NOT EXISTS questionnaire_versions (
  id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  rule_version TEXT NOT NULL,
  data TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questionnaire_versions_active
  ON questionnaire_versions (active, created_at);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  clinic_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  red_flags_json TEXT NOT NULL,
  answers_json TEXT NOT NULL,
  predictions_json TEXT NOT NULL,
  questionnaire_version TEXT NOT NULL,
  rule_version TEXT NOT NULL,
  final_category_id TEXT,
  final_diagnosis_id TEXT,
  final_diagnosis_text TEXT,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at
  ON submissions (created_at);

CREATE INDEX IF NOT EXISTS idx_submissions_clinic_id
  ON submissions (clinic_id);
