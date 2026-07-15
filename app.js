const cfg = window.PROJECT_WIDGET_CONFIG;

const state = {
  dealId: null,
  deal: null,
  fieldMeta: {},
  draftValues: {},
  quotes: [],
  eligibleQuotes: [],
  selectedQuoteId: "",
  visibleFields: [],
  actualMissingFields: [],
  currentMissingRequiredFields: [],
  readOnlyMissingFields: [],
  isInstall: false,
  isBusy: false,
  projectCreated: false
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
  <div class="field-row">
    <label for="soSelect">Sales Order Number <span class="required-star">*</span></label>
    <select id="soSelect">
      <option value="">Loading related Sales Quotes...</option>
    </select>
    <small id="soHelp" class="hidden"></small>
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
  els.message.textContent = text || "";

  if (!text || type === "info" || type === "warning") {
    els.message.classList.add("hidden");
  } else {
    els.message.classList.remove("hidden");
  }
}

function debug(data) {
  if (!cfg.showDebug) return;
  els.debug.classList.remove("hidden");
  els.debug.textContent = JSON.stringify(data, null, 2);
}

function parseFunctionResult(response) {
  let details = response;

  if (response?.details?.output !== undefined) {
    details = response.details.output;
  } else if (response?.output !== undefined) {
    details = response.output;
  }

  if (typeof details === "string") {
    const trimmed = details.trim();
    if (!trimmed) return {};

    try {
      return JSON.parse(trimmed);
    } catch (error) {
      // Deluge Map.toString() is usually JSON-like, but this fallback keeps the
      // widget from crashing if Zoho returns a plain string instead.
      return { success: false, message: trimmed };
    }
  }

  return details || {};
}

function closeWidgetAfterSuccess() {
  window.setTimeout(() => {
    try {
      if (ZOHO?.CRM?.UI?.Popup?.closeReload) {
        ZOHO.CRM.UI.Popup.closeReload();
        return;
      }
    } catch (error) {}

    try {
      if (ZOHO?.CRM?.UI?.Popup?.close) {
        ZOHO.CRM.UI.Popup.close();
        return;
      }
    } catch (error) {}

    try {
      window.close();
    } catch (error) {}
  }, cfg.successCloseDelayMs || 1400);
}

function sleep(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

async function fetchDealRecord() {
  const response = await ZOHO.CRM.API.getRecord({
    Entity: cfg.moduleApiName,
    RecordID: state.dealId
  });

  const deal = response?.data?.[0];
  if (!deal) throw new Error("The Deal could not be loaded.");
  return deal;
}

function savedPayloadIsVisibleOnDeal(payload) {
  return Object.keys(payload).every(apiName => {
    return normalize(state.deal?.[apiName]) === normalize(payload[apiName]);
  });
}

async function waitForSavedFieldsToBeVisible(payload) {
  if (!payload || Object.keys(payload).length === 0) return;

  // CRM can report success on updateRecord before the standalone function sees
  // the updated values. Poll the Deal briefly so the first Create click does
  // not fail and require a manual Recheck.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await sleep(attempt === 0 ? 800 : 650);
    state.deal = await fetchDealRecord();
    validateDeal();

    if (savedPayloadIsVisibleOnDeal(payload) && state.currentMissingRequiredFields.length === 0) {
      return;
    }
  }

  // Keep the user's typed values merged locally even if CRM is slow to echo them
  // back. The function should normally see the values after the polling above.
  Object.keys(payload).forEach(key => {
    state.deal[key] = payload[key];
  });
  validateDeal();
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

function fieldSource(field) {
  return field.source || "deal";
}

function getCurrentConfiguredValue(field) {
  if (Object.prototype.hasOwnProperty.call(state.draftValues, field.apiName)) {
    return state.draftValues[field.apiName];
  }
  return fieldSource(field) === "deal" ? getDealFieldValue(field.apiName) : null;
}

function validateDeal() {
  const installValue = getCurrentFieldValue(cfg.installTypeField);
  state.isInstall = cfg.installAllowedValues.includes(normalize(installValue));

  const fields = cfg.fields || [];
  state.visibleFields = fields.filter(field => {
    if (field.showWhenBlank === false) return false;
    if (fieldSource(field) === "project") return true;
    return valueIsEmpty(getDealFieldValue(field.apiName));
  });

  state.actualMissingFields = fields.filter(field =>
    fieldSource(field) === "deal" && valueIsEmpty(getDealFieldValue(field.apiName))
  );

  state.currentMissingRequiredFields = fields.filter(field =>
    field.required === true && valueIsEmpty(getCurrentConfiguredValue(field))
  );

  state.readOnlyMissingFields = fields.filter(field =>
    field.required === true &&
    fieldSource(field) === "deal" &&
    !fieldIsEditable(field) &&
    valueIsEmpty(getDealFieldValue(field.apiName))
  );
}

function renderFields() {
  els.fieldContainer.innerHTML = "";

  state.visibleFields.forEach(field => {
    const row = document.createElement("div");
    row.className = "field-row";

    const label = document.createElement("label");
    label.setAttribute("for", field.apiName);
    label.appendChild(document.createTextNode(field.label + " "));
    if (field.required === true) {
      const star = document.createElement("span");
      star.className = "required-star";
      star.textContent = "*";
      label.appendChild(star);
    }

    let input;
    const isDisabled = !fieldIsEditable(field);

    if (field.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 4;
    } else if (field.type === "picklist" || field.type === "multipicklist") {
      input = document.createElement("select");
      if (field.type === "multipicklist") input.multiple = true;
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
    } else if (field.type === "checkbox") {
      input = document.createElement("input");
      input.type = "checkbox";
    } else {
      input = document.createElement("input");
      if (field.type === "date") input.type = "date";
      else if (["currency", "decimal", "number"].includes(field.type)) input.type = "number";
      else input.type = "text";
    }

    input.id = field.apiName;
    input.name = field.apiName;
    const currentValue = getCurrentConfiguredValue(field);
    if (field.type === "checkbox") {
      input.checked = currentValue === true || String(currentValue).toLowerCase() === "true" || String(currentValue).toLowerCase() === "yes";
    } else if (field.type === "multipicklist" && Array.isArray(currentValue)) {
      Array.from(input.options).forEach(option => { option.selected = currentValue.includes(option.value); });
    } else {
      input.value = displayValue(currentValue);
    }
    input.disabled = isDisabled || state.isBusy;
    input.placeholder = input.disabled ? "Edit this field on the Deal record" : `Enter ${field.label}`;

    if (!isDisabled) {
      const captureValue = event => {
        if (field.type === "checkbox") return event.target.checked;
        if (field.type === "multipicklist") return Array.from(event.target.selectedOptions).map(option => option.value).filter(Boolean);
        return event.target.value;
      };

      input.addEventListener("input", event => {
        state.draftValues[field.apiName] = captureValue(event);
        validateDeal();
        updateCreateButtonStateOnly();
      });

      input.addEventListener("blur", () => {
        validateDeal();
        renderStatus();
      });

      input.addEventListener("change", event => {
        state.draftValues[field.apiName] = captureValue(event);
        validateDeal();
        if (["picklist", "multipicklist", "checkbox"].includes(field.type)) renderStatus();
        else updateCreateButtonStateOnly();
      });
    }

    row.appendChild(label);
    row.appendChild(input);

    if (isDisabled) {
      const note = document.createElement("small");
      note.textContent = "This field must be edited on the Deal record.";
      row.appendChild(note);
    } else if (["picklist", "multipicklist"].includes(field.type) && getPicklistOptions(field).length === 0) {
      const note = document.createElement("small");
      note.textContent = "Picklist options could not be loaded.";
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

function canCreateProject(options = {}) {
  const ignoreBusy = options.ignoreBusy === true;

  return Boolean(
    state.deal &&
    state.isInstall &&
    state.currentMissingRequiredFields.length === 0 &&
    state.readOnlyMissingFields.length === 0 &&
    state.eligibleQuotes.length > 0 &&
    state.selectedQuoteId &&
    (ignoreBusy || !state.isBusy) &&
    !state.projectCreated
  );
}

function updateCreateButtonStateOnly() {
  if (!state.deal) {
    els.createButton.disabled = true;
    return;
  }

  els.createButton.disabled = !canCreateProject();
  els.createButton.textContent = state.actualMissingFields.some(field => fieldIsEditable(field) && !valueIsEmpty(getCurrentConfiguredValue(field))) ? "Save & Create Project" : "Create Project";
}

function renderStatus() {
  // Keep the top header clean. The widget only shows fields, SO dropdown,
  // and success/error messages.
  els.subtitle.classList.add("hidden");
  els.statusBadge.classList.add("hidden");

  if (!state.deal) {
    els.createButton.disabled = true;
    return;
  }

  if (state.visibleFields.length > 0) {
    els.fieldsForm.classList.remove("hidden");
  } else {
    els.fieldsForm.classList.add("hidden");
  }

  if (!state.isInstall) {
    els.createButton.disabled = true;
    els.createButton.textContent = "Create Project";
    setMessage("error", `This is not an install Deal. Project creation is disabled. Check the ${cfg.installTypeField} field on the Deal.`);
    return;
  }

  if (state.readOnlyMissingFields.length > 0) {
    els.createButton.disabled = true;
    els.createButton.textContent = "Create Project";
    setMessage("error", `These fields must be updated on the Deal first: ${state.readOnlyMissingFields.map(f => f.label).join(", ")}.`);
    return;
  }

  if (state.currentMissingRequiredFields.length > 0) {
    els.createButton.disabled = true;
    els.createButton.textContent = "Create Project";
    setMessage("", "");
    return;
  }

  if (state.eligibleQuotes.length === 0) {
    els.createButton.disabled = true;
    els.createButton.textContent = "Create Project";
    setMessage("error", "No related Sales Quote has a Sales Order Number. Create the Sales Order first, then recheck the Deal.");
    return;
  }

  if (!state.selectedQuoteId) {
    els.createButton.disabled = true;
    els.createButton.textContent = state.actualMissingFields.some(field => fieldIsEditable(field) && !valueIsEmpty(getCurrentConfiguredValue(field))) ? "Save & Create Project" : "Create Project";
    setMessage("", "");
    return;
  }

  els.createButton.disabled = !canCreateProject();
  els.createButton.textContent = state.actualMissingFields.some(field => fieldIsEditable(field) && !valueIsEmpty(getCurrentConfiguredValue(field))) ? "Save & Create Project" : "Create Project";
  setMessage("", "");
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

    state.deal = await fetchDealRecord();

    validateDeal();
    await loadRelatedQuotes();
    debug({ deal: state.deal, quotes: state.quotes, eligibleQuotes: state.eligibleQuotes, actualMissingFields: state.actualMissingFields, currentMissingFields: state.currentMissingRequiredFields, isInstall: state.isInstall });
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

function buildFieldValuesPayload() {
  const payload = {};

  (cfg.fields || []).forEach(field => {
    if (!fieldIsEditable(field)) return;
    const value = getCurrentConfiguredValue(field);
    if (fieldSource(field) === "project" || !valueIsEmpty(value)) {
      payload[field.apiName] = typeof value === "string" ? value.trim() : value;
    }
  });

  return payload;
}

function collectEditableDealFieldUpdates() {
  const payload = {};

  state.actualMissingFields.forEach(field => {
    if (fieldSource(field) !== "deal" || !fieldIsEditable(field)) return;

    const value = getCurrentConfiguredValue(field);
    if (!valueIsEmpty(value)) {
      payload[field.apiName] = typeof value === "string" ? value.trim() : value;
    }
  });

  return payload;
}

async function saveEditableDealFieldsIfNeeded() {
  const payload = collectEditableDealFieldUpdates();

  if (Object.keys(payload).length === 0) {
    return {};
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

  Object.keys(payload).forEach(key => {
    state.deal[key] = payload[key];
    delete state.draftValues[key];
  });
  validateDeal();

  setMessage("info", "Confirming saved fields...");
  await waitForSavedFieldsToBeVisible(payload);
  return payload;
}

async function createProject() {
  let createdProject = false;
  validateDeal();

  if (!canCreateProject()) {
    render();
    return;
  }

  setBusy(true);
  els.createButton.disabled = true;
  els.createButton.textContent = "Creating...";

  try {
    if (Object.keys(collectEditableDealFieldUpdates()).length > 0) {
      await saveEditableDealFieldsIfNeeded();
      validateDeal();

      if (!canCreateProject({ ignoreBusy: true })) {
        render();
        throw new Error("The Deal was saved, but it still is not ready to create a Project. Recheck the required fields and SO Number.");
      }
    }

    const selectedQuote = state.eligibleQuotes.find(q => q.id === state.selectedQuoteId);
    const salesOrderNumber = normalize(selectedQuote?.[cfg.quoteSoNumberField]);
    const fieldValues = buildFieldValuesPayload();

    setMessage("", "");

    const response = await ZOHO.CRM.FUNCTIONS.execute(cfg.createProjectFunctionName, {
      arguments: JSON.stringify({
        deal_id: state.dealId,
        quote_id: state.selectedQuoteId,
        sales_order_number: salesOrderNumber,
        field_values: fieldValues
      })
    });

    debug({ functionResponse: response });

    const details = parseFunctionResult(response);

    if (!details || details.success !== true) {
      throw new Error(details?.message || "The Project was not created.");
    }

    const projectName = details.project_name ? ` ${details.project_name}` : "";
    setMessage("success", details.message || `Project created successfully.${projectName}`);
    createdProject = true;
    state.projectCreated = true;
    els.createButton.textContent = "Project Created";
    els.createButton.disabled = true;
    els.refreshButton.disabled = true;

    closeWidgetAfterSuccess();
  } catch (error) {
    setMessage("error", error.message || "Error creating Project.");
    els.createButton.disabled = false;
    els.createButton.textContent = state.actualMissingFields.some(field => fieldIsEditable(field) && !valueIsEmpty(getCurrentConfiguredValue(field))) ? "Save & Create Project" : "Create Project";
  } finally {
    state.isBusy = false;
    if (!createdProject) {
      els.refreshButton.disabled = false;
      updateCreateButtonStateOnly();
    }
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
