# Clinic Diagnosis Registry

A local SQLite app for tracking clinic patients by Healthplix reference number and two-level diagnosis taxonomy.

## Run

Double-click `run-clinic.bat`, then open:

```text
http://127.0.0.1:8765
```

The demo starts with 20 patients. Data is stored in `clinic.db`, a real SQLite database in this folder.

## Current Features

- Patient demographics: name, age, sex, phone, visit date, Healthplix reference number
- Two-level diagnosis: category and subtype
- Add categories and subtypes while entering patients
- Upload scan/history photos, videos, or PDFs for a selected patient
- Dictate or type essential patient-history points
- Save essential history into SQLite for posterity and search
- Search and filter patient records
- Edit and delete patient records
- Export JSON or CSV
- Import previously exported JSON

## Stored Files

- `clinic.db` stores the patient registry, diagnosis taxonomy, file index, and essential-history text.
- `uploads/` stores uploaded photos, videos, and PDFs.

## Database Direction

For production or multi-device use, Cloudflare D1 is a good next step. D1 is SQLite-compatible and would fit this schema:

```sql
CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  sex TEXT,
  healthplix_ref TEXT NOT NULL UNIQUE,
  phone TEXT,
  visit_date TEXT,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  notes TEXT,
  history_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE diagnosis_types (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(category, subcategory)
);

CREATE TABLE patient_files (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  stored_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER NOT NULL,
  kind TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```
