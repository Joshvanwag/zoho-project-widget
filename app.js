const cfg = window.PROJECT_WIDGET_CONFIG;

const state = {
  dealId: null,
  deal: null,
  quotes: [],
  eligibleQuotes: [],
  selectedQuoteId: "",
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

const soSection = document.createElement("section");
soSection.id = "soSection";
soSection.className = "so-section hidden";
soSection.innerHTML = `
  <h2>Select Sales Order</h2>
  <p class="hint">Choose a related Sales Quote that already has a Sales Order Number.</p>
  <div class="field-row">
    <label for="soSelect">Sales Order Number</label>
    <select id="soSelect">
      <option value="">Loading related Sales Quotes...</option>
    </select>
    <small id="soHelp"></small>
  </div>
`;
document.querySelector(".actions").before(soSection);

els.soSection = soSection;
els.soSelect = document.getElementById("soSelect");
els.soHelp = document.getElementById("soHelp");

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
  if (typeof value === "object") {
    if (Array.isArray(value)) return value.length === 0;
    return !value.id && !value.name;
  }
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

function normalize(value) {
  return displayValue(value).trim();
}

function validateDeal() {
  const installValue = getFieldValue(cfg.installTypeField);
  state.isInstall = cfg.installAllowedValues.includes(normalize(installValue));
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

function quoteLabel(quote) {
  const so = normalize(quote[cfg.quoteSoNumberField]);
  const crmQuote = normalize(quote.CRM_Quote_Number || quote.Quote_Number || quote.Subject);
  const subject = normalize(quote.Subject);
  const total = normalize(quote.Grand_Total);
  const parts = [`SO: ${so}`];
  if (crmQuote) parts.push(`Quote: ${crmQuote}`);
  if (subject && subject !== crmQuote) parts.push(subject);
  if (total) parts.push(`$${total}`);
  return parts.join(" — ");
}

function renderSalesOrders() {
  els.soSelect.innerHTML = "";

  if (!state.isInstall || state.missingFields.length > 0) {
    els.soSection.classList.add("hidden");
    return;
  }

  els.soSection.classList.remove("hidden");

  if (state.eligibleQuotes.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No related Sales Quotes have a Sales Order Number";
    els.soSelect.appendChild(option);
    els.soSelect.disabled = true;
    els.soHelp.textContent = "Create the Sales Order first, then recheck the Deal.";
    return;
  }

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select an SO Number...";
  els.soSelect.appendChild(placeholder);

  state.eligibleQuotes.forEach(quote => {
    const option = document.createElement("option");
    option.value = quote.id;
    option.textContent = quoteLabel(quote);
    els.soSelect.appendChild(option);
  });

  els.soSelect.disabled = state.isBusy;
  els.soSelect.value = state.selectedQuoteId;
  els.soHelp.textContent = `${state.eligibleQuotes.length} related Sales Quote(s) with SO Number found.`;
}

function canCreateProject() {
  return state.deal && state.isInstall && state.missingFields.length === 0 && state.selectedQuoteId && !state.isBusy;
}

function render() {
  if (!state.deal) {
    els.statusBadge.textContent = "Loading";
    els.statusBadge.className = "badge";
    els.createButton.disabled = true;
    return;
  }

  renderFields();
  renderSalesOrders();

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

  if (state.eligibleQuotes.length === 0) {
    els.subtitle.textContent = "The Deal is ready, but no SO Number was found.";
    els.statusBadge.textContent = "No SO";
    els.statusBadge.className = "badge warn";
    els.fieldsForm.classList.add("hidden");
    els.createButton.disabled = true;
    setMessage("warning", "Everything required is filled, but no related Sales Quote has a Sales Order Number. Create the Sales Order first, then recheck the Deal.");
    return;
  }

  if (!state.selectedQuoteId) {
    els.subtitle.textContent = "Everything required is here. Select an SO Number.";
    els.statusBadge.textContent = "Select SO";
    els.statusBadge.className = "badge warn";
    els.fieldsForm.classList.add("hidden");
    els.createButton.disabled = true;
    setMessage("info", "Select the Sales Order Number to use for the project name, then create the project.");
    return;
  }

  const selectedQuote = state.eligibleQuotes.find(q => q.id === state.selectedQuoteId);
  els.subtitle.textContent = "Everything required is here.";
  els.statusBadge.textContent = "Ready";
  els.statusBadge.className = "badge good";
  els.fieldsForm.classList.add("hidden");
  els.createButton.disabled = !canCreateProject();
  setMessage("success", `Ready to create project from ${normalize(selectedQuote?.[cfg.quoteSoNumberField])}.`);
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
    await loadRelatedQuotes();
    debug({ deal: state.deal, quotes: state.quotes, eligibleQuotes: state.eligibleQuotes, missingFields: state.missingFields, isInstall: state.isInstall });
  } catch (error) {
    setMessage("error", error.message || "Error loading Deal.");
  } finally {
    setBusy(false);
  }
}

async function loadRelatedQuotes() {
  state.quotes = [];
  state.eligibleQuotes = [];
  state.selectedQuoteId = "";

  const response = await ZOHO.CRM.API.getRelatedRecords({
    Entity: cfg.moduleApiName,
    RecordID: state.dealId,
    RelatedList: cfg.quotesRelatedListApiName,
    page: 1,
    per_page: 200
  });

  state.quotes = response?.data || [];
  state.eligibleQuotes = state.quotes.filter(q => !valueIsEmpty(q[cfg.quoteSoNumberField]));
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
  if (!canCreateProject()) {
    render();
    return;
  }

  const selectedQuote = state.eligibleQuotes.find(q => q.id === state.selectedQuoteId);
  const salesOrderNumber = normalize(selectedQuote?.[cfg.quoteSoNumberField]);

  setBusy(true);
  els.createButton.disabled = true;
  setMessage("info", "Creating the Project...");

  try {
    const response = await ZOHO.CRM.FUNCTIONS.execute(cfg.createProjectFunctionName, {
      arguments: JSON.stringify({
        deal_id: state.dealId,
        quote_id: state.selectedQuoteId,
        sales_order_number: salesOrderNumber
      })
    });

    debug({ functionResponse: response });

    let details = response;
    if (response?.details?.output) {
      details = typeof response.details.output === "string" ? JSON.parse(response.details.output) : response.details.output;
    }

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
  els.soSelect.addEventListener("change", event => {
    state.selectedQuoteId = event.target.value;
    render();
  });
}

ZOHO.embeddedApp.on("PageLoad", function(data) {
  const entityId = data?.EntityId || data?.entityId || data?.id;
  state.dealId = Array.isArray(entityId) ? entityId[0] : entityId;
  wireEvents();
  loadDeal();
});

ZOHO.embeddedApp.init();
