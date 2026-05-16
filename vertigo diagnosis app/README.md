# Vertigo Diagnosis Intake

Mobile-first PWA for dizziness intake, clinician-only diagnostic suggestions, admin-managed questionnaire content, and Cloudflare D1/R2 storage.

## Try locally

Open `index.html` in a browser. It will use local browser storage when Cloudflare APIs are not available.

For a local HTTP preview with service worker support:

```powershell
python server.py
```

If `python` is not on PATH on this Windows machine:

```powershell
& "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe" server.py
```

Then open `http://127.0.0.1:8080`.

Local doctor/admin demo PIN: `1234`

## What V1 includes

- Patient intake with clinic ID only.
- Early red-flag safety screen.
- Four top-level dizziness categories:
  - First-time/new dizziness.
  - Recurrent head-movement-triggered attacks.
  - Recurrent attacks not linked to head movement.
  - Persistent dizziness or unsteadiness.
- Doctor review dashboard with red flags, answer summary, possible diagnoses, and final clinical diagnosis entry.
- Admin editor for branch questions, doctor-defined diagnoses, and weighted scoring rules.
- Analytics for reviewed cases, category match/confusion, top-1/top-3 diagnosis match, and diagnosis-wise performance.

The patient never sees possible diagnoses. Patient-facing output only confirms the saved intake, shows the dizziness pattern category, and warns them to inform staff if a red flag was selected.

## Cloudflare setup

Install or use Wrangler, then create the resources:

```powershell
npx wrangler d1 create vertigo_diagnosis
npx wrangler r2 bucket create vertigo-diagnosis-exports
```

Copy the D1 `database_id` into `wrangler.toml`, then apply the migration:

```powershell
npx wrangler d1 migrations apply vertigo_diagnosis
```

Deploy as Cloudflare Pages:

```powershell
npx wrangler pages deploy .
```

Set the clinician/admin PIN as a Pages secret:

```powershell
npx wrangler pages secret put CLINIC_PIN --project-name vertigo-diagnosis-intake
```

## Data model

D1 stores questionnaire versions and submissions. Each submission stores:

- Clinic ID.
- App category.
- Red flags.
- Full answer JSON.
- Rule-based predictions.
- Questionnaire and rule version.
- Doctor-entered final category and final clinical diagnosis.

R2 stores JSON snapshots of saved questionnaire versions and patient submissions for export/audit backup.

## Clinical workflow

1. Patient completes the intake before consultation.
2. Doctor reviews the category, red flags, answers, and app predictions.
3. Doctor enters the final clinical diagnosis after examination.
4. Analytics compare app output against final diagnosis to show where rules are useful or missing.

The app is clinical decision support and research/audit support. Final diagnosis remains with the clinician.
