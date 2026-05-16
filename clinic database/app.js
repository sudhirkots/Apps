let state = { patients: [], diagnosisTypes: [] };

const els = {
  views: {
    patients: document.getElementById("patientsView"),
    taxonomy: document.getElementById("taxonomyView"),
    data: document.getElementById("dataView")
  },
  navTabs: document.querySelectorAll(".nav-tab"),
  patientForm: document.getElementById("patientForm"),
  patientId: document.getElementById("patientId"),
  formTitle: document.getElementById("formTitle"),
  name: document.getElementById("nameInput"),
  age: document.getElementById("ageInput"),
  sex: document.getElementById("sexInput"),
  reference: document.getElementById("referenceInput"),
  phone: document.getElementById("phoneInput"),
  visitDate: document.getElementById("visitDateInput"),
  category: document.getElementById("categoryInput"),
  subcategory: document.getElementById("subcategoryInput"),
  notes: document.getElementById("notesInput"),
  historyNotes: document.getElementById("historyNotesInput"),
  dictate: document.getElementById("dictateButton"),
  uploadMedia: document.getElementById("uploadMediaButton"),
  mediaInput: document.getElementById("mediaInput"),
  attachmentHelp: document.getElementById("attachmentHelp"),
  attachmentList: document.getElementById("attachmentList"),
  clearForm: document.getElementById("clearFormButton"),
  newPatient: document.getElementById("newPatientButton"),
  deletePatient: document.getElementById("deletePatientButton"),
  patientsTable: document.getElementById("patientsTable"),
  search: document.getElementById("searchInput"),
  clearSearch: document.getElementById("clearSearchButton"),
  categoryFilter: document.getElementById("categoryFilter"),
  subcategoryFilter: document.getElementById("subcategoryFilter"),
  activeFilterLabel: document.getElementById("activeFilterLabel"),
  categoryOptions: document.getElementById("categoryOptions"),
  subcategoryOptions: document.getElementById("subcategoryOptions"),
  taxonomyForm: document.getElementById("taxonomyForm"),
  taxonomyCategory: document.getElementById("taxonomyCategoryInput"),
  taxonomySubcategory: document.getElementById("taxonomySubcategoryInput"),
  taxonomyList: document.getElementById("taxonomyList"),
  statPatients: document.getElementById("statPatients"),
  statCategories: document.getElementById("statCategories"),
  statSubcategories: document.getElementById("statSubcategories"),
  resetDemo: document.getElementById("resetDemoButton"),
  exportJson: document.getElementById("exportJsonButton"),
  exportCsv: document.getElementById("exportCsvButton"),
  importForm: document.getElementById("importForm"),
  importFile: document.getElementById("importFileInput"),
  toast: document.getElementById("toast")
};

let toastTimer = null;
let recognition = null;
let isDictating = false;

bindEvents();
loadBootstrap();

async function loadBootstrap() {
  try {
    state = await api("/api/bootstrap");
    render();
  } catch (error) {
    renderLoadError();
  }
}

function bindEvents() {
  els.navTabs.forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.dataset.view));
  });

  els.patientForm.addEventListener("submit", savePatient);
  els.clearForm.addEventListener("click", clearPatientForm);
  els.newPatient.addEventListener("click", () => {
    setView("patients");
    clearPatientForm();
    els.name.focus();
  });
  els.deletePatient.addEventListener("click", deleteSelectedPatient);

  els.search.addEventListener("input", renderPatients);
  els.clearSearch.addEventListener("click", clearSearch);
  els.categoryFilter.addEventListener("change", () => {
    fillSubtypeFilter();
    renderPatients();
  });
  els.subcategoryFilter.addEventListener("change", renderPatients);
  els.category.addEventListener("input", fillSubtypeOptions);
  els.dictate.addEventListener("click", toggleDictation);
  els.uploadMedia.addEventListener("click", () => els.mediaInput.click());
  els.mediaInput.addEventListener("change", uploadMediaFiles);

  els.taxonomyForm.addEventListener("submit", addDiagnosisType);
  els.resetDemo.addEventListener("click", resetDemoData);
  els.exportJson.addEventListener("click", exportJson);
  els.exportCsv.addEventListener("click", exportCsv);
  els.importForm.addEventListener("submit", importJson);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload;
}

function setView(name) {
  Object.entries(els.views).forEach(([viewName, node]) => {
    node.classList.toggle("active", viewName === name);
  });
  els.navTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === name));
}

async function savePatient(event) {
  event.preventDefault();
  const record = {
    name: els.name.value.trim(),
    age: Number(els.age.value),
    sex: els.sex.value,
    healthplixRef: els.reference.value.trim(),
    phone: els.phone.value.trim(),
    visitDate: els.visitDate.value,
    category: els.category.value.trim(),
    subcategory: els.subcategory.value.trim(),
    notes: els.notes.value.trim(),
    historyNotes: els.historyNotes.value.trim()
  };

  try {
    const id = els.patientId.value;
    const result = id
      ? await api(`/api/patients/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(record) })
      : await api("/api/patients", { method: "POST", body: JSON.stringify(record) });
    state = result;
    render();
    selectPatient(result.selectedPatientId);
    showToast(id ? "Patient updated" : "Patient added");
  } catch (error) {
    window.alert(error.message);
  }
}

async function addDiagnosisType(event) {
  event.preventDefault();
  const payload = {
    category: els.taxonomyCategory.value.trim(),
    subcategory: els.taxonomySubcategory.value.trim()
  };

  try {
    state = await api("/api/diagnosis-types", { method: "POST", body: JSON.stringify(payload) });
    els.taxonomyForm.reset();
    render();
    showToast("Diagnosis type added");
  } catch (error) {
    window.alert(error.message);
  }
}

async function deleteSelectedPatient() {
  const id = els.patientId.value;
  if (!id) return;
  const patient = state.patients.find((item) => item.id === id);
  if (!patient) return;
  const confirmed = window.confirm(`Delete ${patient.name}?`);
  if (!confirmed) return;

  try {
    state = await api(`/api/patients/${encodeURIComponent(id)}`, { method: "DELETE" });
    clearPatientForm();
    render();
    showToast("Patient deleted");
  } catch (error) {
    window.alert(error.message);
  }
}

async function uploadMediaFiles() {
  const id = els.patientId.value;
  const files = Array.from(els.mediaInput.files || []);
  els.mediaInput.value = "";
  if (!id) {
    window.alert("Save or select a patient before uploading files.");
    return;
  }
  if (!files.length) return;

  try {
    let result = null;
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "scan_or_history");
      const response = await fetch(`/api/patients/${encodeURIComponent(id)}/files`, {
        method: "POST",
        body: form
      });
      result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || `Could not upload ${file.name}`);
      }
    }
    state = result;
    render();
    selectPatient(id);
    showToast(files.length === 1 ? "File uploaded" : "Files uploaded");
  } catch (error) {
    window.alert(error.message);
  }
}

function toggleDictation() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    window.alert("Dictation is not available in this browser. Chrome or Edge usually supports it.");
    return;
  }

  if (isDictating && recognition) {
    recognition.stop();
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.onstart = () => {
    isDictating = true;
    els.dictate.textContent = "Stop";
  };
  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      if (event.results[i].isFinal) {
        const phrase = event.results[i][0].transcript.trim();
        if (phrase) {
          els.historyNotes.value = `${els.historyNotes.value}${els.historyNotes.value ? " " : ""}${phrase}`;
        }
      }
    }
  };
  recognition.onerror = (event) => {
    showToast(event.error === "not-allowed" ? "Microphone permission was blocked" : "Dictation stopped");
  };
  recognition.onend = () => {
    isDictating = false;
    els.dictate.textContent = "Dictate";
  };
  recognition.start();
}

function clearPatientForm() {
  els.patientForm.reset();
  els.patientId.value = "";
  els.formTitle.textContent = "New patient";
  els.deletePatient.hidden = true;
  renderAttachments(null);
  fillSubtypeOptions();
  renderPatients();
}

function selectPatient(id) {
  const record = state.patients.find((item) => item.id === id);
  if (!record) return;
  els.patientId.value = record.id;
  els.formTitle.textContent = "Edit patient";
  els.name.value = record.name;
  els.age.value = record.age;
  els.sex.value = record.sex;
  els.reference.value = record.healthplixRef;
  els.phone.value = record.phone;
  els.visitDate.value = record.visitDate;
  els.category.value = record.category;
  fillSubtypeOptions();
  els.subcategory.value = record.subcategory;
  els.notes.value = record.notes;
  els.historyNotes.value = record.historyNotes || "";
  els.deletePatient.hidden = false;
  renderAttachments(record);
  renderPatients();
}

function render() {
  fillCategoryOptions();
  fillSubtypeOptions();
  fillCategoryFilter();
  fillSubtypeFilter();
  renderPatients();
  renderTaxonomy();
  renderStats();
  renderAttachments(state.patients.find((item) => item.id === els.patientId.value) || null);
}

function renderLoadError() {
  els.patientsTable.innerHTML = `<tr><td class="empty-state" colspan="6">Start the SQLite server with run-clinic.bat, then refresh this page.</td></tr>`;
}

function renderPatients() {
  const rows = filteredPatients();
  els.patientsTable.innerHTML = "";

  if (!rows.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="empty-state" colspan="6">No matching patients</td>`;
    els.patientsTable.append(tr);
    return;
  }

  rows.forEach((record) => {
    const tr = document.createElement("tr");
    tr.classList.toggle("selected", record.id === els.patientId.value);
    tr.addEventListener("click", () => selectPatient(record.id));
    tr.innerHTML = `
      <td><div class="patient-name">${escapeHtml(record.name)}</div><div class="muted">${escapeHtml(record.sex)}${record.phone ? `, ${escapeHtml(record.phone)}` : ""}</div></td>
      <td>${record.age}</td>
      <td>${escapeHtml(record.healthplixRef)}</td>
      <td><span class="pill">${escapeHtml(record.category)}</span></td>
      <td>${escapeHtml(record.subcategory)}</td>
      <td>${formatDate(record.visitDate)}</td>
    `;
    els.patientsTable.append(tr);
  });
}

function clearSearch() {
  els.search.value = "";
  renderPatients();
  els.search.focus();
}

function filteredPatients() {
  const query = els.search.value.trim().toLowerCase();
  const category = els.categoryFilter.value;
  const subcategory = els.subcategoryFilter.value;

  const rows = state.patients.filter((record) => {
    const searchable = [
      record.name,
      record.age,
      record.sex,
      record.healthplixRef,
      record.phone,
      record.category,
      record.subcategory,
      record.notes,
      record.historyNotes
    ].join(" ").toLowerCase();

    return (!query || searchable.includes(query))
      && (!category || record.category === category)
      && (!subcategory || record.subcategory === subcategory);
  });

  const labelParts = [];
  if (category) labelParts.push(category);
  if (subcategory) labelParts.push(subcategory);
  els.activeFilterLabel.textContent = labelParts.length ? labelParts.join(" / ") : "All diagnoses";

  return rows.sort((a, b) => (b.visitDate || "").localeCompare(a.visitDate || "") || a.name.localeCompare(b.name));
}

function renderTaxonomy() {
  const grouped = groupTypes();
  els.taxonomyList.innerHTML = "";

  Object.entries(grouped).forEach(([category, subtypes]) => {
    const section = document.createElement("section");
    section.className = "taxonomy-group";
    section.innerHTML = `
      <h3>${escapeHtml(category)}</h3>
      <div class="subtype-grid">
        ${subtypes.map((name) => `<span class="pill">${escapeHtml(name)}</span>`).join("")}
      </div>
    `;
    els.taxonomyList.append(section);
  });
}

function renderAttachments(record) {
  els.attachmentList.innerHTML = "";
  if (!record) {
    els.attachmentHelp.textContent = "Save or select a patient before uploading files.";
    return;
  }

  const attachments = record.attachments || [];
  els.attachmentHelp.textContent = attachments.length
    ? `${attachments.length} file${attachments.length === 1 ? "" : "s"} saved for this patient.`
    : "No files uploaded for this patient yet.";

  attachments.forEach((file) => {
    const item = document.createElement("div");
    item.className = "attachment-item";
    item.innerHTML = `
      <a href="/${encodeURI(file.storedPath)}" target="_blank" rel="noopener">${escapeHtml(file.originalName)}</a>
      <span class="muted">${escapeHtml(file.mimeType || "file")} - ${formatBytes(file.sizeBytes)} - ${formatDateTime(file.createdAt)}</span>
    `;
    els.attachmentList.append(item);
  });
}

function renderStats() {
  const grouped = groupTypes();
  els.statPatients.textContent = state.patients.length;
  els.statCategories.textContent = Object.keys(grouped).length;
  els.statSubcategories.textContent = state.diagnosisTypes.length;
}

function fillCategoryOptions() {
  const categories = unique(state.diagnosisTypes.map((type) => type.category));
  fillOptions(els.categoryOptions, categories, false);
}

function fillSubtypeOptions() {
  const selectedCategory = els.category.value.trim();
  const subtypes = unique(state.diagnosisTypes
    .filter((type) => !selectedCategory || type.category === selectedCategory)
    .map((type) => type.subcategory));
  fillOptions(els.subcategoryOptions, subtypes, false);
}

function fillCategoryFilter() {
  const current = els.categoryFilter.value;
  const categories = unique(state.diagnosisTypes.map((type) => type.category));
  fillOptions(els.categoryFilter, categories, true, "All");
  els.categoryFilter.value = categories.includes(current) ? current : "";
}

function fillSubtypeFilter() {
  const current = els.subcategoryFilter.value;
  const category = els.categoryFilter.value;
  const subtypes = unique(state.diagnosisTypes
    .filter((type) => !category || type.category === category)
    .map((type) => type.subcategory));
  fillOptions(els.subcategoryFilter, subtypes, true, "All");
  els.subcategoryFilter.value = subtypes.includes(current) ? current : "";
}

function fillOptions(node, values, includeEmpty, emptyText = "") {
  node.innerHTML = "";
  if (includeEmpty) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = emptyText;
    node.append(option);
  }
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    node.append(option);
  });
}

function groupTypes() {
  return state.diagnosisTypes.reduce((groups, type) => {
    groups[type.category] ||= [];
    if (!groups[type.category].includes(type.subcategory)) {
      groups[type.category].push(type.subcategory);
    }
    groups[type.category].sort();
    return groups;
  }, {});
}

async function resetDemoData() {
  const confirmed = window.confirm("Replace current records with demo data?");
  if (!confirmed) return;
  try {
    state = await api("/api/reset", { method: "POST", body: "{}" });
    clearPatientForm();
    render();
    showToast("Demo data restored");
  } catch (error) {
    window.alert(error.message);
  }
}

function exportJson() {
  downloadFile("clinic-registry.json", JSON.stringify(state, null, 2), "application/json");
}

function exportCsv() {
  const headers = ["name", "age", "sex", "healthplix_ref", "phone", "visit_date", "category", "subcategory", "notes", "essential_history"];
  const rows = state.patients.map((record) => [
    record.name,
    record.age,
    record.sex,
    record.healthplixRef,
    record.phone,
    record.visitDate,
    record.category,
    record.subcategory,
    record.notes,
    record.historyNotes
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  downloadFile("clinic-patients.csv", csv, "text/csv");
}

function importJson(event) {
  event.preventDefault();
  const file = els.importFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const imported = JSON.parse(reader.result);
      state = await api("/api/import", { method: "POST", body: JSON.stringify(imported) });
      els.importForm.reset();
      clearPatientForm();
      render();
      showToast("Data imported");
    } catch (error) {
      window.alert("Could not import this JSON file.");
    }
  };
  reader.readAsText(file);
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatBytes(value) {
  const bytes = Number(value) || 0;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2200);
}
