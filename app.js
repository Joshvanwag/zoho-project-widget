const cfg = window.PROJECT_WIDGET_CONFIG;

const state = {
  dealId: null,
  deal: null,
  fieldMeta: {},
  draftValues: {},
  quotes: [],
  eligibleQuotes: [],
  selectedQuoteId: "",
  actualMissingFields: [],
  currentMissingFields: [],
  readOnlyMissingFields: [],
  isInstall: false,
  isBusy: false
};

const els = {
  subtitle: document.getElementById("subtitle"),
  statusBadge: document.getElementById("statusBadge"),
  message: document.getElementById("message"),
  fieldsForm: document.getElementById("fieldsForm"),
  fieldContainer: document.getElementById("fieldContainer"),
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

function getDealFieldValue(apiName) {
  return state.deal ? state.deal[apiName] : null;
}

function getCurrentFieldValue(apiName) {
  if (Object.prototype.hasOwnProperty.call(state.draftValues, apiName)) {
    return state.draftValues[apiName];
  }
  return getDealFieldValue(apiName);
}

function displayValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return value.name || value.id || JSON.stringify(value);
  return String(value);
}

function normalize(value) {
  return displayValue(value).trim();
}

function fieldIsEditable(field) {
  return field.editable !== false && field.type !== "lookup";
}

async function loadFieldMetadata() {
  if (Object.keys(state.fieldMeta).length > 0) return;

  try {
    const response = await ZOHO.CRM.META.getFields({ Entity: cfg.moduleApiName });
    const fields = response?.fields || response?.data || [];

    fields.forEach(field => {
      if (!field.api_name) return;
      state.fieldMeta[field.api_name] = field;
    });

    debug({ fieldMetaLoaded: Object.keys(state.fieldMeta).length });
  } catch (error) {
    // If metadata fails, normal text fields still work. Picklists can fall back to config options.
    debug({ fieldMetaError: error });
  }
}

function getPicklistOptions(field) {
  const options = [];

  // Use the explicit choices in config.js first. This keeps the widget locked to
  // the exact choices we want instead of falling back to a free-text input.
  if (Array.isArray(field.options)) {
    field.options.forEach(option => {
      if (typeof option === "string") {
        options.push({ value: option, label: option });
      } else if (option && option.value) {
        options.push({ value: String(option.value), label: String(option.label || option.value) });
      }
    });
  }

  if (options.length > 0) return options;

  const meta = state.fieldMeta[field.apiName];
  if (Array.isArray(meta?.pick_list_values)) {
    meta.pick_list_values.forEach(option => {
      const value = option.actual_value || option.display_value || option.sequence_number;
      const label = option.display_value || option.actual_value || value;
      if (value !== undefined && value !== null && value !== "") {
        options.push({ value: String(value), label: String(label) });
      }
    });
  }

  return options;
}

function validateDeal() {
  const installValue = getCurrentFieldValue(cfg.installTypeField);
  state.isInstall = cfg.installAllowedValues.includes(normalize(installValue));

  state.actualMissingFields = cfg.requiredFields.filter(field => valueIsEmpty(getDealFieldValue(field.apiName)));
  state.currentMissingFields = cfg.requiredFields.filter(field => valueIsEmpty(getCurrentFieldValue(field.apiName)));
  state.readOnlyMissingFields = state.actualMissingFields.filter(field => !fieldIsEditable(field) && valueIsEmpty(getDealFieldValue(field.apiName)));
}

function renderFields() {
  els.fieldContainer.innerHTML = "";

  state.actualMissingFields.forEach(field => {
    const row = document.createElement("div");
    row.className = "field-row";

    const label = document.createElement("label");
    label.textContent = field.label;
    label.setAttribute("for", field.apiName);

    let input;
    const isDisabled = !fieldIsEditable(field);

    if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 4;
    } else if (field.type === "picklist") {
      input = document.createElement("select");
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = `Select ${field.label}...`;
      input.appendChild(placeholder);

      getPicklistOptions(field).forEach(optionData => {
        const option = document.createElement("option");
        option.value = optionData.value;
        option.textContent = optionData.label;
        input.appendChild(option);
      });
    } else {
      input = document.createElement("input");
      if (field.type === "date") input.type = "date";
      else if (["currency", "decimal", "number"].includes(field.type)) input.type = "number";
      else input.type = "text";
    }

    input.id = field.apiName;
    input.name = field.apiName;
    input.value = displayValue(getCurrentFieldValue(field.apiName));
    input.disabled = isDisabled || state.isBusy;
    input.placeholder = input.disabled ? "Edit this field on the Deal record" : `Enter ${field.label}`;

    if (!isDisabled) {
      input.addEventListener("input", event => {
        // Keep the draft value current while the user types, but do not rerender
        // the form or update validation messages on every keystroke. This keeps
        // focus/cursor stable and still lets the Create button become enabled
        // as soon as the last required value is present.
        state.draftValues[field.apiName] = event.target.value;
        validateDeal();
        updateCreateButtonStateOnly();
      });

      input.addEventListener("blur", () => {
        // Show/update validation messaging only when the user leaves the field.
        validateDeal();
        renderStatus();
      });

      input.addEventListener("change", event => {
        state.draftValues[field.apiName] = event.target.value;
        validateDeal();
        if (field.type === "picklist") {
          // Picklists are a deliberate selection, so updating the visible status
          // immediately is helpful and does not cause typing/focus issues.
          renderStatus();
        } else {
          updateCreateButtonStateOnly();
        }
      });
    }

    row.appendChild(label);
    row.appendChild(input);

    if (isDisabled) {
      const note = document.createElement("small");
      note.textContent = "This field must be edited on the Deal record.";
      row.appendChild(note);
    } else if (field.type === "picklist" && getPicklistOptions(field).length === 0) {
      const note = document.createElement("small");
      note.textContent = "Picklist options could not be loaded from CRM metadata. Recheck the widget connection/settings.";
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

  if (!state.isInstall) {
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
  return Boolean(
    state.deal &&
    state.isInstall &&
    state.currentMissingFields.length === 0 &&
    state.readOnlyMissingFields.length === 0 &&
    state.eligibleQuotes.length > 0 &&
    state.selectedQuoteId &&
    !state.isBusy
  );
}

function updateCreateButtonStateOnly() {
  if (!state.deal) {
    els.createButton.disabled = true;
    return;
  }

  els.createButton.disabled = !canCreateProject();
  els.createButton.textContent = state.actualMissingFields.length > 0 ? "Save & Create Project" : "Create Project";
}

function renderStatus() {
  if (!state.deal) {
    els.statusBadge.textContent = "Loading";
    els.statusBadge.className = "badge";
    els.createButton.disabled = true;
    return;
  }

  if (state.actualMissingFields.length > 0) {
    els.fieldsForm.classList.remove("hidden");
  } else {
    els.fieldsForm.classList.add("hidden");
  }

  if (!state.isInstall) {
    els.subtitle.textContent = "This Deal is not eligible for project creation.";
    els.statusBadge.textContent = "Blocked";
    els.statusBadge.className = "badge bad";
    els.createButton.disabled = true;
    els.createButton.textContent = "Create Project";
    setMessage("error", `This is not an install Deal. Project creation is disabled. Check the ${cfg.installTypeField} field on the Deal.`);
    return;
  }

  if (state.readOnlyMissingFields.length > 0) {
    els.subtitle.textContent = "Some required fields must be edited on the Deal.";
    els.statusBadge.textContent = "Missing Fields";
    els.statusBadge.className = "badge warn";
    els.createButton.disabled = true;
    els.createButton.textContent = "Create Project";
    setMessage("warning", `These fields must be updated on the Deal first: ${state.readOnlyMissingFields.map(f => f.label).join(", ")}.`);
    return;
  }

  if (state.currentMissingFields.length > 0) {
    els.subtitle.textContent = "Fill the missing required fields.";
    els.statusBadge.textContent = "Missing Fields";
    els.statusBadge.className = "badge warn";
    els.createButton.disabled = true;
    els.createButton.textContent = "Create Project";
    setMessage("warning", "Fill the missing required fields above. Picklist fields must be selected from the dropdown.");
    return;
  }

  if (state.eligibleQuotes.length === 0) {
    els.subtitle.textContent = "The Deal is ready, but no SO Number was found.";
    els.statusBadge.textContent = "No SO";
    els.statusBadge.className = "badge warn";
    els.createButton.disabled = true;
    els.createButton.textContent = "Create Project";
    setMessage("warning", "Everything required is filled, but no related Sales Quote has a Sales Order Number. Create the Sales Order first, then recheck the Deal.");
    return;
  }

  if (!state.selectedQuoteId) {
    els.subtitle.textContent = "Everything required is here. Select an SO Number.";
    els.statusBadge.textContent = "Select SO";
    els.statusBadge.className = "badge warn";
    els.createButton.disabled = true;
    els.createButton.textContent = state.actualMissingFields.length > 0 ? "Save & Create Project" : "Create Project";
    setMessage("info", "Select the Sales Order Number to use for the project name, then create the project.");
    return;
  }

  const selectedQuote = state.eligibleQuotes.find(q => q.id === state.selectedQuoteId);
  els.subtitle.textContent = state.actualMissingFields.length > 0 ? "Ready to save missing fields and create the project." : "Everything required is here.";
  els.statusBadge.textContent = "Ready";
  els.statusBadge.className = "badge good";
  els.createButton.disabled = !canCreateProject();
  els.createButton.textContent = state.actualMissingFields.length > 0 ? "Save & Create Project" : "Create Project";
  setMessage("success", `Ready to create project from ${normalize(selectedQuote?.[cfg.quoteSoNumberField])}.`);
}

function render() {
  if (!state.deal) {
    renderStatus();
    return;
  }

  renderFields();
  renderSalesOrders();
  renderStatus();
}

async function loadDeal() {
  if (!state.dealId) throw new Error("No Deal ID was passed to the widget.");
  setBusy(true);
  try {
    await loadFieldMetadata();

    const response = await ZOHO.CRM.API.getRecord({
      Entity: cfg.moduleApiName,
      RecordID: state.dealId
    });

    state.deal = response?.data?.[0];
    if (!state.deal) throw new Error("The Deal could not be loaded.");

    validateDeal();
    await loadRelatedQuotes();
    debug({ deal: state.deal, quotes: state.quotes, eligibleQuotes: state.eligibleQuotes, actualMissingFields: state.actualMissingFields, currentMissingFields: state.currentMissingFields, isInstall: state.isInstall });
  } catch (error) {
    setMessage("error", error.message || "Error loading Deal.");
  } finally {
    setBusy(false);
  }
}

async function loadRelatedQuotes() {
  const previousSelectedQuoteId = state.selectedQuoteId;
  state.quotes = [];
  state.eligibleQuotes = [];

  const response = await ZOHO.CRM.API.getRelatedRecords({
    Entity: cfg.moduleApiName,
    RecordID: state.dealId,
    RelatedList: cfg.quotesRelatedListApiName,
    page: 1,
    per_page: 200
  });

  state.quotes = response?.data || [];
  state.eligibleQuotes = state.quotes.filter(q => !valueIsEmpty(q[cfg.quoteSoNumberField]));

  if (previousSelectedQuoteId && state.eligibleQuotes.some(q => q.id === previousSelectedQuoteId)) {
    state.selectedQuoteId = previousSelectedQuoteId;
  } else {
    state.selectedQuoteId = "";
  }
}

function collectEditableDealFieldUpdates() {
  const payload = {};

  state.actualMissingFields.forEach(field => {
    if (!fieldIsEditable(field)) return;

    const value = getCurrentFieldValue(field.apiName);
    if (!valueIsEmpty(value)) {
      payload[field.apiName] = typeof value === "string" ? value.trim() : value;
    }
  });

  return payload;
}

async function saveEditableDealFieldsIfNeeded() {
  const payload = collectEditableDealFieldUpdates();

  if (Object.keys(payload).length === 0) {
    return true;
  }

  setMessage("info", "Saving missing fields back to the Deal...");

  const response = await ZOHO.CRM.API.updateRecord({
    Entity: cfg.moduleApiName,
    APIData: {
      id: state.dealId,
      ...payload
    },
    Trigger: ["workflow"]
  });

  debug({ updateResponse: response });

  const updateStatus = response?.data?.[0]?.status;
  if (updateStatus && updateStatus !== "success") {
    throw new Error(response?.data?.[0]?.message || "Could not update the Deal.");
  }

  // Do not immediately reload the Deal here. Zoho CRM can sometimes return a stale
  // record for a moment right after updateRecord, which made fields such as Zip
  // appear empty again even though the user had just typed them. Merge the saved
  // payload into the local Deal state and let the create function continue.
  Object.keys(payload).forEach(key => {
    state.deal[key] = payload[key];
    delete state.draftValues[key];
  });
  validateDeal();
  return true;
}

async function createProject() {
  validateDeal();

  if (!canCreateProject()) {
    render();
    return;
  }

  setBusy(true);
  els.createButton.disabled = true;

  try {
    if (state.actualMissingFields.length > 0) {
      await saveEditableDealFieldsIfNeeded();
      validateDeal();

      if (!canCreateProject()) {
        render();
        throw new Error("The Deal was saved, but it still is not ready to create a Project. Recheck the required fields and SO Number.");
      }
    }

    const selectedQuote = state.eligibleQuotes.find(q => q.id === state.selectedQuoteId);
    const salesOrderNumber = normalize(selectedQuote?.[cfg.quoteSoNumberField]);

    setMessage("info", "Creating the Project...");

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
