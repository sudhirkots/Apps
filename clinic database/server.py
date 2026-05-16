from __future__ import annotations

import cgi
import json
import shutil
import sqlite3
import uuid
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


ROOT = Path(__file__).resolve().parent
DB_PATH = ROOT / "clinic.db"
UPLOAD_DIR = ROOT / "uploads"
HOST = "127.0.0.1"
PORT = 8765


DEMO_PATIENTS = [
    ("Aarav Menon", 34, "Male", "HPX-2026-001", "9876500101", "2026-05-01", "Epilepsy", "Focal epilepsy", "MRI reviewed. Continue current antiseizure plan."),
    ("Meera Krishnan", 42, "Female", "HPX-2026-002", "9876500102", "2026-05-01", "Headache disorder", "Migraine without aura", "Frequent morning attacks."),
    ("Rohan Sharma", 67, "Male", "HPX-2026-003", "9876500103", "2026-05-02", "Stroke", "Ischemic stroke", "Left MCA territory infarct follow-up."),
    ("Nisha Rao", 29, "Female", "HPX-2026-004", "9876500104", "2026-05-02", "Movement disorder", "Essential tremor", "Family history positive."),
    ("Kabir Sethi", 51, "Male", "HPX-2026-005", "9876500105", "2026-05-03", "Vertigo", "BPPV", "Right posterior canal suspected."),
    ("Ananya Iyer", 16, "Female", "HPX-2026-006", "9876500106", "2026-05-03", "Epilepsy", "Juvenile myoclonic epilepsy", "Myoclonic jerks on awakening."),
    ("Dev Patel", 58, "Male", "HPX-2026-007", "9876500107", "2026-05-04", "Neuropathy", "Diabetic peripheral neuropathy", "Burning feet at night."),
    ("Farah Khan", 46, "Female", "HPX-2026-008", "9876500108", "2026-05-04", "Demyelinating disease", "Multiple sclerosis", "Relapsing sensory symptoms."),
    ("Ishaan Gupta", 73, "Male", "HPX-2026-009", "9876500109", "2026-05-05", "Cognitive disorder", "Alzheimer disease", "Progressive short-term memory impairment."),
    ("Lakshmi Nair", 39, "Female", "HPX-2026-010", "9876500110", "2026-05-05", "Headache disorder", "Tension-type headache", "Neck strain prominent."),
    ("Vikram Joshi", 62, "Male", "HPX-2026-011", "9876500111", "2026-05-06", "Movement disorder", "Parkinson disease", "Rest tremor and bradykinesia."),
    ("Priya Reddy", 27, "Female", "HPX-2026-012", "9876500112", "2026-05-06", "Vertigo", "Vestibular migraine", "Photophobia with dizziness."),
    ("Sanjay Das", 55, "Male", "HPX-2026-013", "9876500113", "2026-05-07", "Stroke", "TIA", "Transient right-sided weakness."),
    ("Tara Bose", 31, "Female", "HPX-2026-014", "9876500114", "2026-05-07", "Epilepsy", "Generalized tonic-clonic seizure", "First unprovoked seizure."),
    ("Harish Kumar", 48, "Male", "HPX-2026-015", "9876500115", "2026-05-08", "Spine disorder", "Cervical radiculopathy", "C6 distribution pain."),
    ("Neha Agarwal", 64, "Female", "HPX-2026-016", "9876500116", "2026-05-08", "Neuropathy", "Carpal tunnel syndrome", "Bilateral nocturnal numbness."),
    ("Manav Chawla", 22, "Male", "HPX-2026-017", "9876500117", "2026-05-09", "Headache disorder", "Cluster headache", "Autonomic features present."),
    ("Sneha Kulkarni", 36, "Female", "HPX-2026-018", "9876500118", "2026-05-09", "Movement disorder", "Dystonia", "Cervical dystonia."),
    ("Omar Ali", 44, "Male", "HPX-2026-019", "9876500119", "2026-05-10", "Neuromuscular disorder", "Myasthenia gravis", "Fatigable ptosis."),
    ("Lina Mathew", 69, "Female", "HPX-2026-020", "9876500120", "2026-05-10", "Cognitive disorder", "Mild cognitive impairment", "Independent ADLs maintained."),
]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def connect() -> sqlite3.Connection:
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    con.execute("PRAGMA foreign_keys = ON")
    return con


def init_db() -> None:
    with connect() as con:
        con.executescript(
            """
            CREATE TABLE IF NOT EXISTS patients (
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

            CREATE TABLE IF NOT EXISTS diagnosis_types (
              id TEXT PRIMARY KEY,
              category TEXT NOT NULL,
              subcategory TEXT NOT NULL,
              created_at TEXT NOT NULL,
              UNIQUE(category, subcategory)
            );

            CREATE TABLE IF NOT EXISTS patient_files (
              id TEXT PRIMARY KEY,
              patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
              original_name TEXT NOT NULL,
              stored_path TEXT NOT NULL,
              mime_type TEXT,
              size_bytes INTEGER NOT NULL,
              kind TEXT NOT NULL,
              created_at TEXT NOT NULL
            );
            """
        )
        migrate_db(con)
        count = con.execute("SELECT COUNT(*) FROM patients").fetchone()[0]
        if count == 0:
            seed_demo(con)


def migrate_db(con: sqlite3.Connection) -> None:
    columns = {row["name"] for row in con.execute("PRAGMA table_info(patients)")}
    if "history_notes" not in columns:
        con.execute("ALTER TABLE patients ADD COLUMN history_notes TEXT")


def seed_demo(con: sqlite3.Connection) -> None:
    con.execute("DELETE FROM patient_files")
    con.execute("DELETE FROM patient_files")
    con.execute("DELETE FROM patients")
    con.execute("DELETE FROM diagnosis_types")
    for row in DEMO_PATIENTS:
        add_patient(con, patient_from_tuple(row), commit=False)
    con.commit()


def patient_from_tuple(row: tuple) -> dict:
    name, age, sex, ref, phone, visit_date, category, subcategory, notes = row
    return {
        "name": name,
        "age": age,
        "sex": sex,
        "healthplixRef": ref,
        "phone": phone,
        "visitDate": visit_date,
        "category": category,
        "subcategory": subcategory,
        "notes": notes,
        "historyNotes": "",
    }


def bootstrap(con: sqlite3.Connection) -> dict:
    attachments = {}
    for row in con.execute(
        """
        SELECT * FROM patient_files
        ORDER BY created_at DESC, original_name COLLATE NOCASE
        """
    ):
        attachments.setdefault(row["patient_id"], []).append(file_to_json(row))

    patients = []
    for row in con.execute(
        """
        SELECT * FROM patients
        ORDER BY visit_date DESC, name COLLATE NOCASE
        """
    ):
        patient = patient_to_json(row)
        patient["attachments"] = attachments.get(row["id"], [])
        patients.append(patient)

    diagnosis_types = [
        diagnosis_to_json(row)
        for row in con.execute(
            """
            SELECT * FROM diagnosis_types
            ORDER BY category COLLATE NOCASE, subcategory COLLATE NOCASE
            """
        )
    ]
    return {"patients": patients, "diagnosisTypes": diagnosis_types}


def validate_patient(data: dict) -> dict:
    required = ["name", "age", "healthplixRef", "category", "subcategory"]
    missing = [field for field in required if data.get(field) in ("", None)]
    if missing:
        raise ValueError(f"Missing required field: {', '.join(missing)}")

    try:
        age = int(data["age"])
    except (TypeError, ValueError):
        raise ValueError("Age must be a number")
    if age < 0 or age > 120:
        raise ValueError("Age must be between 0 and 120")

    return {
        "name": str(data["name"]).strip(),
        "age": age,
        "sex": str(data.get("sex") or "").strip(),
        "healthplixRef": str(data["healthplixRef"]).strip(),
        "phone": str(data.get("phone") or "").strip(),
        "visitDate": str(data.get("visitDate") or "").strip(),
        "category": str(data["category"]).strip(),
        "subcategory": str(data["subcategory"]).strip(),
        "notes": str(data.get("notes") or "").strip(),
        "historyNotes": str(data.get("historyNotes") or "").strip(),
    }


def ensure_diagnosis_type(con: sqlite3.Connection, category: str, subcategory: str) -> None:
    con.execute(
        """
        INSERT OR IGNORE INTO diagnosis_types (id, category, subcategory, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (str(uuid.uuid4()), category, subcategory, now_iso()),
    )


def add_patient(con: sqlite3.Connection, data: dict, commit: bool = True) -> str:
    patient = validate_patient(data)
    patient_id = str(uuid.uuid4())
    current = now_iso()
    ensure_diagnosis_type(con, patient["category"], patient["subcategory"])
    con.execute(
        """
        INSERT INTO patients (
          id, name, age, sex, healthplix_ref, phone, visit_date,
          category, subcategory, notes, history_notes, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            patient_id,
            patient["name"],
            patient["age"],
            patient["sex"],
            patient["healthplixRef"],
            patient["phone"],
            patient["visitDate"],
            patient["category"],
            patient["subcategory"],
            patient["notes"],
            patient["historyNotes"],
            current,
            current,
        ),
    )
    if commit:
        con.commit()
    return patient_id


def update_patient(con: sqlite3.Connection, patient_id: str, data: dict) -> None:
    patient = validate_patient(data)
    ensure_diagnosis_type(con, patient["category"], patient["subcategory"])
    result = con.execute(
        """
        UPDATE patients
        SET name = ?, age = ?, sex = ?, healthplix_ref = ?, phone = ?,
            visit_date = ?, category = ?, subcategory = ?, notes = ?,
            history_notes = ?, updated_at = ?
        WHERE id = ?
        """,
        (
            patient["name"],
            patient["age"],
            patient["sex"],
            patient["healthplixRef"],
            patient["phone"],
            patient["visitDate"],
            patient["category"],
            patient["subcategory"],
            patient["notes"],
            patient["historyNotes"],
            now_iso(),
            patient_id,
        ),
    )
    if result.rowcount == 0:
        raise KeyError("Patient not found")
    con.commit()


def add_diagnosis(con: sqlite3.Connection, data: dict) -> None:
    category = str(data.get("category") or "").strip()
    subcategory = str(data.get("subcategory") or "").strip()
    if not category or not subcategory:
        raise ValueError("Category and subtype are required")
    ensure_diagnosis_type(con, category, subcategory)
    con.commit()


def import_data(con: sqlite3.Connection, data: dict) -> None:
    patients = data.get("patients")
    if not isinstance(patients, list):
        raise ValueError("Import JSON must include a patients array")

    con.execute("DELETE FROM patients")
    con.execute("DELETE FROM diagnosis_types")
    for diagnosis in data.get("diagnosisTypes", []):
        if diagnosis.get("category") and diagnosis.get("subcategory"):
            ensure_diagnosis_type(con, diagnosis["category"].strip(), diagnosis["subcategory"].strip())
    for patient in patients:
        add_patient(con, patient, commit=False)
    con.commit()


def patient_exists(con: sqlite3.Connection, patient_id: str) -> bool:
    return con.execute("SELECT 1 FROM patients WHERE id = ?", (patient_id,)).fetchone() is not None


def save_patient_file(con: sqlite3.Connection, patient_id: str, headers, stream) -> None:
    if not patient_exists(con, patient_id):
        raise KeyError("Patient not found")

    form = cgi.FieldStorage(
        fp=stream,
        headers=headers,
        environ={
            "REQUEST_METHOD": "POST",
            "CONTENT_TYPE": headers.get("Content-Type", ""),
        },
    )
    file_item = form["file"] if "file" in form else None
    if file_item is None or not file_item.filename:
        raise ValueError("No file was uploaded")

    UPLOAD_DIR.mkdir(exist_ok=True)
    original_name = Path(file_item.filename).name
    suffix = Path(original_name).suffix
    stored_name = f"{uuid.uuid4()}{suffix}"
    relative_path = Path("uploads") / stored_name
    absolute_path = ROOT / relative_path

    with absolute_path.open("wb") as destination:
        shutil.copyfileobj(file_item.file, destination)

    con.execute(
        """
        INSERT INTO patient_files (
          id, patient_id, original_name, stored_path, mime_type, size_bytes, kind, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            str(uuid.uuid4()),
            patient_id,
            original_name,
            relative_path.as_posix(),
            file_item.type or "application/octet-stream",
            absolute_path.stat().st_size,
            form.getfirst("kind", "scan_or_history"),
            now_iso(),
        ),
    )
    con.commit()


def patient_to_json(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "age": row["age"],
        "sex": row["sex"],
        "healthplixRef": row["healthplix_ref"],
        "phone": row["phone"],
        "visitDate": row["visit_date"],
        "category": row["category"],
        "subcategory": row["subcategory"],
        "notes": row["notes"],
        "historyNotes": row["history_notes"] or "",
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


def diagnosis_to_json(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "category": row["category"],
        "subcategory": row["subcategory"],
        "createdAt": row["created_at"],
    }


def file_to_json(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "patientId": row["patient_id"],
        "originalName": row["original_name"],
        "storedPath": row["stored_path"],
        "mimeType": row["mime_type"],
        "sizeBytes": row["size_bytes"],
        "kind": row["kind"],
        "createdAt": row["created_at"],
    }


class ClinicHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/bootstrap":
            with connect() as con:
                self.send_json(bootstrap(con))
            return
        if path == "/":
            self.path = "/index.html"
        super().do_GET()

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path.startswith("/api/patients/") and path.endswith("/files"):
            patient_id = unquote(path.removeprefix("/api/patients/").removesuffix("/files"))
            try:
                with connect() as con:
                    save_patient_file(con, patient_id, self.headers, self.rfile)
                    payload = bootstrap(con)
                    payload["selectedPatientId"] = patient_id
                    self.send_json(payload, HTTPStatus.CREATED)
            except KeyError as error:
                self.send_error_json(str(error), HTTPStatus.NOT_FOUND)
            except ValueError as error:
                self.send_error_json(str(error), HTTPStatus.BAD_REQUEST)
            return

        try:
            data = self.read_json()
            with connect() as con:
                if path == "/api/patients":
                    selected_id = add_patient(con, data)
                    payload = bootstrap(con)
                    payload["selectedPatientId"] = selected_id
                    self.send_json(payload, HTTPStatus.CREATED)
                    return
                if path == "/api/diagnosis-types":
                    add_diagnosis(con, data)
                    self.send_json(bootstrap(con), HTTPStatus.CREATED)
                    return
                if path == "/api/reset":
                    seed_demo(con)
                    self.send_json(bootstrap(con))
                    return
                if path == "/api/import":
                    import_data(con, data)
                    self.send_json(bootstrap(con))
                    return
        except sqlite3.IntegrityError as error:
            self.send_error_json(f"Database constraint failed: {error}", HTTPStatus.CONFLICT)
            return
        except ValueError as error:
            self.send_error_json(str(error), HTTPStatus.BAD_REQUEST)
            return
        self.send_error_json("Not found", HTTPStatus.NOT_FOUND)

    def do_PUT(self) -> None:
        path = urlparse(self.path).path
        if not path.startswith("/api/patients/"):
            self.send_error_json("Not found", HTTPStatus.NOT_FOUND)
            return
        patient_id = unquote(path.removeprefix("/api/patients/"))
        try:
            data = self.read_json()
            with connect() as con:
                update_patient(con, patient_id, data)
                payload = bootstrap(con)
                payload["selectedPatientId"] = patient_id
                self.send_json(payload)
        except sqlite3.IntegrityError as error:
            self.send_error_json(f"Database constraint failed: {error}", HTTPStatus.CONFLICT)
        except KeyError as error:
            self.send_error_json(str(error), HTTPStatus.NOT_FOUND)
        except ValueError as error:
            self.send_error_json(str(error), HTTPStatus.BAD_REQUEST)

    def do_DELETE(self) -> None:
        path = urlparse(self.path).path
        if not path.startswith("/api/patients/"):
            self.send_error_json("Not found", HTTPStatus.NOT_FOUND)
            return
        patient_id = unquote(path.removeprefix("/api/patients/"))
        with connect() as con:
            files = list(con.execute("SELECT stored_path FROM patient_files WHERE patient_id = ?", (patient_id,)))
            con.execute("DELETE FROM patients WHERE id = ?", (patient_id,))
            con.commit()
            for row in files:
                target = ROOT / row["stored_path"]
                if target.is_file():
                    target.unlink()
            self.send_json(bootstrap(con))

    def read_json(self) -> dict:
        length = int(self.headers.get("Content-Length") or "0")
        if length == 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def send_json(self, payload: dict, status: HTTPStatus = HTTPStatus.OK) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, message: str, status: HTTPStatus) -> None:
        self.send_json({"error": message}, status)


def main() -> None:
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), ClinicHandler)
    print(f"Clinic registry running at http://{HOST}:{PORT}")
    print(f"SQLite database: {DB_PATH}")
    server.serve_forever()


if __name__ == "__main__":
    main()
