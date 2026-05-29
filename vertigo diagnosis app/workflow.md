# Workflow

## Status: Stopped

**2026-05-28** — Session ended.

### Where we left off
`brief_resolved` flow fully implemented per mind map.

### Changes made this session
All changes in `SIMPLE_PATIENT_QUESTIONS`, `shouldSkipSimpleQuestion`, `computeSimplePossibilities`, and `renderSimpleSummary` in `app.js`.

#### brief_resolved decision tree (implemented)
After Q1 = `brief_resolved`, the flow is:
1. **urgent** — 6 red flags (double vision, tingling, slurred speech, weakness, can't walk, headache/neck pain). Any non-none → urgent warning screen → TIA possibility in summary.
2. **brief_risk_factors** — age >60, hypertension, diabetes, heart disease. Any non-none → TIA-risk notice in summary. `brief_circumstances` is skipped when any risk factor is present.
3. **brief_circumstances** (shown only if no risk factors) — night/urination → micturition syncope; stood up + BP/prostate med → postural hypotension; migraine preceded → vestibular migraine; none → cause to confirm.
4. `ear` and `headache` are skipped for `brief_resolved`.

#### urgent question updated
Added two new options: `tingling_one_side` and `cannot_walk` (per mind map red flags). `severe_headache` updated to include neck pain.

#### Skip logic
- `pattern` skipped when feeling = `single_attack` or `brief_resolved`
- `stops_still`, `duration` skipped when feeling = `brief_resolved`
- `brief_risk_factors` skipped when feeling ≠ `brief_resolved`
- `brief_circumstances` skipped when feeling ≠ `brief_resolved` OR any risk factor selected
- `ear`, `headache` skipped when feeling = `brief_resolved`

#### Summary (renderSimpleSummary)
- Added "Risk factors" and "Circumstances" rows
- Added risk-factor danger notice when brief_resolved + risk factors present

### Up next
- `single_attack` branch — attack still ongoing (per mind map)
- `repeated_attacks` branch
- `constant` branch
- `renderDoctorGuidance()` clinical decision tree still a placeholder
