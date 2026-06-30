const cfg = window.PROJECT_WIDGET_CONFIG;

const state = {
  dealId: null,
  deal: null,
  missingFields: [],
  isInstall: false,
  isBusy: false
};

const els = {
  subtitle: document.getElementById("subtitle"),
  statusBadge: document.getElementById("statusBadge"),
  message: document.getElementById("message"),
  fieldsForm: document.getElementById("fieldsForm"),
  fieldContainer: document.getElementById("fieldContainer"),
  saveDealButton: document.getElementById("saveDealButton"),
  refreshButton: document.getElementById("refreshButton"),
  createButton: document.getElementById("createButton"),
  debug: document.getElementById("debug")
};

function setBusy(isBusy) {
  state.isBusy = isBusy;
  els.refreshButton.disabled = isBusy;
  els.saveDealButton.disabled = isBusy;
  render();
}

function setMessage(type, text) {
  els.message.className = `message ${type}`;
  els.message.textContent = text;
}

function debug(data) {
  if (!cfg.showDebug) return;
  els.debug.classList.remove("hidden");
  els.debug.textContent = JSON.stringify(data, null, 2);
}

function valueIsEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (typeof value === "object" && !value.id && !value.name) return true;
  return false;
}

function getFieldValue(apiName) {
  return state.deal ? state.deal[apiName] : null;
}

function displayValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return value.name || value.id || JSON.stringify(value);
  return String(value);
}

function validateDeal() {
  const installValue = getFieldValue(cfg.installTypeField);
  state.isInstall = cfg.installAllowedValues.includes(displayValue(installValue));

  state.missingFields = cfg.requiredFields.filter(field => valueIsEmpty(getFieldValue(field.apiName)));
}

function renderFields() {
  els.fieldContainer.innerHTML = "";

  state.missingFields.forEach(field => {
    const row = document.createElement("div");
    row.className = "field-row";

    const label = document.createElement("label");
    label.textContent = field.label;
    label.setAttribute("for", field.apiName);

    let input;
    if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 4;
    } else {
      input = document.createElement("input");
      input.type = field.type === "date" ? "date" : "text";
    }

    input.id = field.apiName;
    input.name = field.apiName;
    input.value = displayValue(getFieldValue(field.apiName));
    input.disabled = field.editable === false || field.type === "lookup";
    input.placeholder = input.disabled ? "Edit this field on the Deal record" : `Enter ${field.label}`;

    row.appendChild(label);
    row.appendChild(input);

    if (input.disabled) {
      const note = document.createElement("small");
      note.textContent = "This field should be edited on the Deal record.";
      row.appendChild(note);
    }

    els.fieldContainer.appendChild(row);
  });
}

function render() {
  if (!state.deal) {
    els.statusBadge.textContent = "Loading";
    els.statusBadge.className = "badge";
    els.createButton.disabled = true;
    return;
  }

  renderFields();

  if (!state.isInstall) {
    els.subtitle.textContent = "This Deal is not eligible for project creation.";
    els.statusBadge.textContent = "Blocked";
    els.statusBadge.className = "badge bad";
    els.fieldsForm.classList.add("hidden");
    els.createButton.disabled = true;
    setMessage("error", `This is not an install Deal. Project creation is disabled. Check the ${cfg.installTypeField} field on the Deal.`);
    return;
  }

  if (state.missingFields.length > 0) {
    els.subtitle.textContent = "Some required fields are missing.";
    els.statusBadge.textContent = "Missing Fields";
    els.statusBadge.className = "badge warn";
    els.fieldsForm.classList.remove("hidden");
    els.createButton.disabled = true;
    setMessage("warning", "Required fields are missing. Fill the editable fields here or go back to the Deal to update lookup/read-only fields.");
    return;
  }

  els.subtitle.textContent = "Everything required is here.";
  els.statusBadge.textContent = "Ready";
  els.statusBadge.className = "badge good";
  els.fieldsForm.classList.add("hidden");
  els.createButton.disabled = state.isBusy;
  setMessage("success", "Everything is here. Create project.");
}

async function loadDeal() {
  if (!state.dealId) throw new Error("No Deal ID was passed to the widget.");
  setBusy(true);
  try {
    const response = await ZOHO.CRM.API.getRecord({
      Entity: cfg.moduleApiName,
      RecordID: state.dealId
    });

    state.deal = response?.data?.[0];
    if (!state.deal) throw new Error("The Deal could not be loaded.");

    validateDeal();
    debug({ deal: state.deal, missingFields: state.missingFields, isInstall: state.isInstall });
  } catch (error) {
    setMessage("error", error.message || "Error loading Deal.");
  } finally {
    setBusy(false);
  }
}

async function saveEditableDealFields() {
  const payload = {};

  state.missingFields.forEach(field => {
    if (field.editable === false || field.type === "lookup") return;
    const input = document.getElementById(field.apiName);
    if (input && input.value.trim() !== "") payload[field.apiName] = input.value.trim();
  });

  if (Object.keys(payload).length === 0) {
    setMessage("warning", "No editable missing fields were filled in. Update the Deal record for lookup/read-only fields.");
    return;
  }

  setBusy(true);
  try {
    const response = await ZOHO.CRM.API.updateRecord({
      Entity: cfg.moduleApiName,
      APIData: {
        id: state.dealId,
        ...payload
      },
      Trigger: ["workflow"]
    });

    debug({ updateResponse: response });
    await loadDeal();
    setMessage("success", "Deal fields were saved. Rechecked the Deal.");
  } catch (error) {
    setMessage("error", error.message || "Could not update the Deal.");
  } finally {
    setBusy(false);
  }
}

async function createProject() {
  validateDeal();
  if (!state.isInstall || state.missingFields.length > 0) {
    render();
    return;
  }

  setBusy(true);
  els.createButton.disabled = true;
  setMessage("info", "Creating the Project...");

  try {
    const response = await ZOHO.CRM.FUNCTIONS.execute(cfg.createProjectFunctionName, {
      arguments: JSON.stringify({ deal_id: state.dealId })
    });

    debug({ functionResponse: response });

    const details = response?.details?.output ? JSON.parse(response.details.output) : response;
    if (details.success === false) {
      throw new Error(details.message || "The Project was not created.");
    }

    setMessage("success", details.message || "Project created successfully.");
    els.statusBadge.textContent = "Created";
    els.statusBadge.className = "badge good";
  } catch (error) {
    setMessage("error", error.message || "Error creating Project.");
    els.createButton.disabled = false;
  } finally {
    setBusy(false);
  }
}

function wireEvents() {
  els.refreshButton.addEventListener("click", loadDeal);
  els.saveDealButton.addEventListener("click", saveEditableDealFields);
  els.createButton.addEventListener("click", createProject);
}

ZOHO.embeddedApp.on("PageLoad", function(data) {
  const entityId = data?.EntityId || data?.entityId || data?.id;
  state.dealId = Array.isArray(entityId) ? entityId[0] : entityId;
  wireEvents();
  loadDeal();
});

ZOHO.embeddedApp.init();
