const cfg = window.PROJECT_WIDGET_CONFIG;

const state = {
  dealId: null,
  deal: null,
  fieldMeta: {},
  draftValues: {},
  quotes: [],
  eligibleQuotes: [],
  selectedQuoteId: "",
  priceSheets: [],
  matchedPriceSheet: null,
  matchedPriceSheetPdfName: "",
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
  existingDealInfo: document.getElementById("existingDealInfo"),
  existingDealInfoGrid: document.getElementById("existingDealInfoGrid"),
  fieldsForm: document.getElementById("fieldsForm"),
  fieldContainer: document.getElementById("fieldContainer"),
  refreshButton: document.getElementById("refreshButton"),
  createButton: document.getElementById("createButton"),
  debug: document.getElementById("debug"),
  progressOverlay: document.getElementById("progressOverlay"),
  progressSpinner: document.getElementById("progressSpinner"),
  progressIcon: document.getElementById("progressIcon"),
  progressTitle: document.getElementById("progressTitle"),
  progressDetail: document.getElementById("progressDetail"),
  progressResult: document.getElementById("progressResult"),
  progressCloseButton: document.getElementById("progressCloseButton")
};

const soSection = document.createElement("section");
soSection.id = "soSection";
soSection.className = "so-section hidden";
document.querySelector(".actions").before(soSection);

els.soSection = soSection;

function setBusy(isBusy) {
  state.isBusy = isBusy;
  els.refreshButton.disabled = isBusy;
  render();
}

function setMessage(type, text) {
  els.message.className = `message ${type}`;
  els.message.textContent = text || "";

  if (!text || type === "info" || document.body.classList.contains("progress-open")) {
    els.message.classList.add("hidden");
  } else {
    els.message.classList.remove("hidden");
  }
}

function setProgressOverlay({ phase = "working", title, detail = "", result = "", showClose = false }) {
  els.progressOverlay.classList.remove("hidden");
  els.progressOverlay.dataset.phase = phase;
  document.body.classList.add("progress-open");
  els.message.classList.add("hidden");

  els.progressTitle.textContent = title || "";
  els.progressDetail.textContent = detail || "";
  els.progressDetail.classList.toggle("hidden", !detail);
  els.progressResult.textContent = result || "";
  els.progressResult.classList.toggle("hidden", !result);

  const done = phase !== "working";
  els.progressSpinner.classList.toggle("hidden", done);
  els.progressIcon.classList.toggle("hidden", !done);
  els.progressIcon.textContent = phase === "success" ? "✓" : done ? "!" : "";
  els.progressCloseButton.classList.toggle("hidden", !showClose);
}

function hideProgressOverlay() {
  els.progressOverlay.classList.add("hidden");
  els.progressOverlay.dataset.phase = "";
  document.body.classList.remove("progress-open");
  els.progressCloseButton.classList.add("hidden");
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

function closeWidgetAfterSuccess(immediate) {
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
  }, immediate ? 0 : (cfg.successCloseDelayMs || 1400));
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

function getLockedValues(field) {
  return Array.isArray(field.lockedValues) ? field.lockedValues : [];
}

function enforceLockedValues(field, value) {
  if (field.type !== "multipicklist") return value;

  const selectedValues = Array.isArray(value) ? [...value] : [];
  getLockedValues(field).forEach(lockedValue => {
    if (!selectedValues.includes(lockedValue)) selectedValues.push(lockedValue);
  });
  return selectedValues;
}

function getCurrentConfiguredValue(field) {
  let value;

  if (Object.prototype.hasOwnProperty.call(state.draftValues, field.apiName)) {
    value = state.draftValues[field.apiName];
  } else {
    value = fieldSource(field) === "deal" ? getDealFieldValue(field.apiName) : null;
  }

  return enforceLockedValues(field, value);
}

function conditionMatches(condition) {
  if (!condition || !condition.apiName) return true;
  const controllingField = (cfg.fields || []).find(field => field.apiName === condition.apiName);
  const controllingValue = controllingField
    ? getCurrentConfiguredValue(controllingField)
    : getCurrentFieldValue(condition.apiName);

  if (condition.greaterThan !== undefined) {
    const numericValue = Number(controllingValue);
    return Number.isFinite(numericValue) && numericValue > Number(condition.greaterThan);
  }

  return normalize(controllingValue) === normalize(condition.equals);
}

function programmingHoursAreGreaterThanZero() {
  const hoursField = (cfg.fields || []).find(field => field.apiName === "Programming_Hours");
  const value = hoursField ? getCurrentConfiguredValue(hoursField) : getCurrentFieldValue("Programming_Hours");
  const hours = Number(value);
  return Number.isFinite(hours) && hours > 0;
}

function syncProgrammingRequiredFromHours() {
  if (!programmingHoursAreGreaterThanZero()) return;

  const currentValue = getCurrentFieldValue("Programming_Required");
  const isChecked = currentValue === true || ["true", "yes"].includes(String(currentValue).toLowerCase());
  if (!isChecked) state.draftValues.Programming_Required = true;
}

function fieldShouldShow(field) {
  return !field.showWhen || conditionMatches(field.showWhen);
}

function fieldIsRequired(field) {
  if (field.required === true) return true;
  return Boolean(field.requiredWhen && conditionMatches(field.requiredWhen));
}

function formatExistingDealValue(field, value) {
  if (value === null || value === undefined || value === "") return "";

  if (field.type === "checkbox") {
    return value === true || String(value).toLowerCase() === "true" || String(value).toLowerCase() === "yes"
      ? "Yes"
      : "No";
  }

  if (Array.isArray(value)) return value.join(", ");

  if (field.type === "currency") {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(numberValue);
    }
  }

  return displayValue(value);
}

function renderExistingDealInfo() {
  els.existingDealInfoGrid.innerHTML = "";

  if (!state.deal) {
    els.existingDealInfo.classList.add("hidden");
    return;
  }

  const populatedDealFields = (cfg.fields || []).filter(field =>
    fieldSource(field) === "deal" &&
    fieldShouldShow(field) &&
    !valueIsEmpty(getCurrentConfiguredValue(field))
  );

  if (populatedDealFields.length === 0) {
    els.existingDealInfo.classList.add("hidden");
    return;
  }

  populatedDealFields.forEach(field => {
    els.existingDealInfoGrid.appendChild(createFieldRow(field, "existing"));
  });

  els.existingDealInfo.classList.remove("hidden");
}

function validateDeal() {
  syncProgrammingRequiredFromHours();
  const installValue = getCurrentFieldValue(cfg.installTypeField);
  state.isInstall = cfg.installAllowedValues.includes(normalize(installValue));

  const fields = cfg.fields || [];
  const activeFields = fields.filter(fieldShouldShow);

  state.visibleFields = activeFields.filter(field => {
    if (field.showWhenBlank === false) return false;
    if (fieldSource(field) === "project") return true;
    return valueIsEmpty(getDealFieldValue(field.apiName));
  });

  state.actualMissingFields = activeFields.filter(field =>
    fieldSource(field) === "deal" && valueIsEmpty(getDealFieldValue(field.apiName))
  );

  state.currentMissingRequiredFields = activeFields.filter(field =>
    fieldIsRequired(field) && valueIsEmpty(getCurrentConfiguredValue(field))
  );

  state.readOnlyMissingFields = activeFields.filter(field =>
    fieldIsRequired(field) &&
    fieldSource(field) === "deal" &&
    !fieldIsEditable(field) &&
    valueIsEmpty(getDealFieldValue(field.apiName))
  );
}

// A multipicklist with exactly one option (e.g. "CAD NEEDED") is really just a
// yes/no flag. Rendering it as a native <select multiple> is confusing, so we
// treat it like a toggle switch instead, while still capturing/sending the
// value as an array so create_project_updated.deluge doesn't need to change.
function isSingleOptionToggle(field) {
  return field.type === "multipicklist" && getPicklistOptions(field).length === 1;
}

function createMultiPicklistControl(field, currentValue, isDisabled) {
  const options = getPicklistOptions(field);
  const lockedValues = getLockedValues(field);
  let selectedValues = enforceLockedValues(field, currentValue);

  const control = document.createElement("div");
  control.className = "multi-picklist";
  control.id = field.apiName;
  control.dataset.fieldName = field.apiName;
  control.tabIndex = isDisabled ? -1 : 0;
  if (isDisabled) control.classList.add("disabled");

  const valueLine = document.createElement("div");
  valueLine.className = "multi-picklist-value-line";

  const chips = document.createElement("div");
  chips.className = "multi-picklist-chips";

  const placeholder = document.createElement("span");
  placeholder.className = "multi-picklist-placeholder";
  placeholder.textContent = `Select ${field.label}...`;

  const caret = document.createElement("span");
  caret.className = "multi-picklist-caret";
  caret.setAttribute("aria-hidden", "true");

  const menu = document.createElement("div");
  menu.className = "multi-picklist-menu hidden";

  function saveSelection() {
    selectedValues = enforceLockedValues(field, selectedValues);
    state.draftValues[field.apiName] = [...selectedValues];
    validateDeal();
    updateCreateButtonStateOnly();
  }

  function renderControl() {
    chips.innerHTML = "";

    selectedValues.forEach(value => {
      const optionData = options.find(option => option.value === value);
      if (!optionData) return;

      const chip = document.createElement("span");
      chip.className = "multi-picklist-chip";
      if (lockedValues.includes(value)) chip.classList.add("locked");

      const chipText = document.createElement("span");
      chipText.textContent = optionData.label;
      chip.appendChild(chipText);

      if (!lockedValues.includes(value) && !isDisabled) {
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "multi-picklist-remove";
        removeButton.setAttribute("aria-label", `Remove ${optionData.label}`);
        removeButton.textContent = "×";
        removeButton.addEventListener("click", event => {
          event.stopPropagation();
          selectedValues = selectedValues.filter(selected => selected !== value);
          saveSelection();
          renderControl();
        });
        chip.appendChild(removeButton);
      }

      chips.appendChild(chip);
    });

    placeholder.classList.toggle("hidden", selectedValues.length > 0);
    menu.innerHTML = "";

    const availableOptions = options.filter(option => !selectedValues.includes(option.value));
    if (availableOptions.length === 0) {
      const empty = document.createElement("div");
      empty.className = "multi-picklist-empty";
      empty.textContent = "All options selected";
      menu.appendChild(empty);
    } else {
      availableOptions.forEach(optionData => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "multi-picklist-option";
        item.textContent = optionData.label;
        item.addEventListener("click", event => {
          event.stopPropagation();
          selectedValues.push(optionData.value);
          saveSelection();
          renderControl();
          menu.classList.remove("hidden");
          control.classList.add("open");
        });
        menu.appendChild(item);
      });
    }
  }

  function openMenu() {
    if (isDisabled) return;
    menu.classList.remove("hidden");
    control.classList.add("open");
  }

  function closeMenu() {
    menu.classList.add("hidden");
    control.classList.remove("open");
  }

  valueLine.appendChild(chips);
  valueLine.appendChild(placeholder);
  valueLine.appendChild(caret);
  control.appendChild(valueLine);
  control.appendChild(menu);

  if (!isDisabled) {
    valueLine.addEventListener("click", event => {
      event.stopPropagation();
      if (menu.classList.contains("hidden")) openMenu();
      else closeMenu();
    });

    control.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (menu.classList.contains("hidden")) openMenu();
        else closeMenu();
      } else if (event.key === "Escape") {
        closeMenu();
      }
    });

    document.addEventListener("click", event => {
      if (!control.contains(event.target)) closeMenu();
    });
  }

  renderControl();
  return control;
}

function createSinglePicklistControl(field, currentValue, isDisabled, optionsOverride = null, onChangeOverride = null) {
  const options = Array.isArray(optionsOverride) ? optionsOverride : getPicklistOptions(field);
  let selectedValue = valueIsEmpty(currentValue) ? "" : String(currentValue);

  const control = document.createElement("div");
  control.className = "single-picklist";
  control.tabIndex = isDisabled ? -1 : 0;
  if (isDisabled) control.classList.add("disabled");

  const valueLine = document.createElement("div");
  valueLine.className = "single-picklist-value-line";

  const display = document.createElement("span");
  display.className = "single-picklist-display";

  const caret = document.createElement("span");
  caret.className = "single-picklist-caret";
  caret.setAttribute("aria-hidden", "true");

  const menu = document.createElement("div");
  menu.className = "single-picklist-menu hidden";

  function commit(value) {
    selectedValue = value;
    if (onChangeOverride) onChangeOverride(value);
    else {
      state.draftValues[field.apiName] = value;
      validateDeal();
      const controlsConditionalField = (cfg.fields || []).some(candidate =>
        candidate.showWhen?.apiName === field.apiName || candidate.requiredWhen?.apiName === field.apiName
      );
      if (controlsConditionalField) render();
      else updateCreateButtonStateOnly();
    }
  }

  function renderControl() {
    const selectedOption = options.find(option => String(option.value) === selectedValue);
    display.textContent = selectedOption ? selectedOption.label : `Select ${field.label}...`;
    display.classList.toggle("placeholder", !selectedOption);

    menu.innerHTML = "";
    options.forEach(optionData => {
      const optionValue = String(optionData.value);
      const item = document.createElement("button");
      item.type = "button";
      item.className = "single-picklist-option";
      item.textContent = optionData.label;
      if (optionValue === selectedValue) {
        item.classList.add("selected");
        item.setAttribute("aria-selected", "true");
      }
      item.addEventListener("click", event => {
        event.stopPropagation();
        commit(optionValue);
        renderControl();
        closeMenu();
      });
      menu.appendChild(item);
    });
  }

  function openMenu() {
    if (isDisabled) return;
    document.querySelectorAll(".multi-picklist.open, .single-picklist.open").forEach(other => {
      if (other !== control) {
        other.classList.remove("open");
        other.querySelector(".multi-picklist-menu, .single-picklist-menu")?.classList.add("hidden");
      }
    });
    menu.classList.remove("hidden");
    control.classList.add("open");
  }

  function closeMenu() {
    menu.classList.add("hidden");
    control.classList.remove("open");
  }

  valueLine.appendChild(display);
  valueLine.appendChild(caret);
  control.appendChild(valueLine);
  control.appendChild(menu);

  if (!isDisabled) {
    valueLine.addEventListener("click", event => {
      event.stopPropagation();
      if (menu.classList.contains("hidden")) openMenu();
      else closeMenu();
    });

    control.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (menu.classList.contains("hidden")) openMenu();
        else closeMenu();
      } else if (event.key === "Escape") {
        closeMenu();
      }
    });

    document.addEventListener("click", event => {
      if (!control.contains(event.target)) closeMenu();
    });
  }

  renderControl();
  return control;
}

function activateDatePicker(input) {
  if (!input || input.type !== "date" || input.disabled) return;
  input.addEventListener("click", () => {
    try {
      if (typeof input.showPicker === "function") input.showPicker();
    } catch (error) {}
  });
}

function createFieldRow(field, context = "missing") {
  const row = document.createElement("div");
  row.className = "field-row";
  if (context === "existing") row.classList.add("existing-edit-row");
  if (fieldIsRequired(field)) row.classList.add("required-field");

  const isToggle = field.type === "checkbox" || isSingleOptionToggle(field);
  const isDisabled = !fieldIsEditable(field) || state.isBusy;
  const inputId = `${context}-${field.apiName}`;

  const label = document.createElement("label");
  label.setAttribute("for", inputId);
  label.appendChild(document.createTextNode(field.label + " "));
  if (fieldIsRequired(field)) {
    const star = document.createElement("span");
    star.className = "required-star";
    star.textContent = "*";
    label.appendChild(star);
  }

  let input;
  const currentValue = getCurrentConfiguredValue(field);

  if (field.type === "multipicklist") {
    input = createMultiPicklistControl(field, currentValue, isDisabled);
    input.id = inputId;
    row.classList.add("span-2");
  } else if (field.type === "picklist") {
    input = createSinglePicklistControl(field, currentValue, isDisabled);
    input.id = inputId;
  } else if (isToggle) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = inputId;
    checkbox.name = field.apiName;

    const toggleWrap = document.createElement("label");
    toggleWrap.className = "toggle-switch";
    toggleWrap.setAttribute("for", inputId);

    const slider = document.createElement("span");
    slider.className = "toggle-slider";
    toggleWrap.appendChild(checkbox);
    toggleWrap.appendChild(slider);

    row.classList.add("toggle-row");
    input = checkbox;
    input._toggleWrap = toggleWrap;
  } else if (field.type === "textarea") {
    input = document.createElement("textarea");
    input.rows = 4;
    input.id = inputId;
    input.name = field.apiName;
    row.classList.add("span-2");
  } else {
    input = document.createElement("input");
    input.id = inputId;
    input.name = field.apiName;
    if (field.type === "date") input.type = "date";
    else if (["currency", "decimal", "number"].includes(field.type)) input.type = "number";
    else input.type = "text";

    if (["Description", "Description_of_Work_2", "Work_Site_Address"].includes(field.apiName)) {
      row.classList.add("span-2");
    }
  }

  if (!["multipicklist", "picklist"].includes(field.type)) {
    if (field.type === "checkbox") {
      input.checked = currentValue === true || String(currentValue).toLowerCase() === "true" || String(currentValue).toLowerCase() === "yes";
    } else if (isSingleOptionToggle(field)) {
      const toggleOptionValue = getPicklistOptions(field)[0].value;
      input.checked = Array.isArray(currentValue) && currentValue.includes(toggleOptionValue);
    } else {
      input.value = displayValue(currentValue);
    }

    input.disabled = isDisabled;
    if (!isToggle) input.placeholder = input.disabled ? "Edit this field on the Deal record" : `Enter ${field.label}`;
    activateDatePicker(input);

    if (!isDisabled) {
      const captureValue = event => {
        if (field.type === "checkbox") return event.target.checked;
        if (isSingleOptionToggle(field)) {
          const toggleOptionValue = getPicklistOptions(field)[0].value;
          return event.target.checked ? [toggleOptionValue] : [];
        }
        return event.target.value;
      };

      input.addEventListener("input", event => {
        state.draftValues[field.apiName] = captureValue(event);
        validateDeal();

        if (field.apiName === "Programming_Hours" && programmingHoursAreGreaterThanZero()) {
          document.querySelectorAll('input[name="Programming_Required"]').forEach(checkbox => {
            checkbox.checked = true;
          });
        }

        updateCreateButtonStateOnly();
      });

      input.addEventListener("change", event => {
        state.draftValues[field.apiName] = captureValue(event);
        validateDeal();
        const controlsConditionalField = (cfg.fields || []).some(candidate =>
          candidate.showWhen?.apiName === field.apiName || candidate.requiredWhen?.apiName === field.apiName
        );
        if (controlsConditionalField) render();
        else renderStatus();
      });
    }
  }

  row.appendChild(label);
  row.appendChild(field.type === "multipicklist" || field.type === "picklist" ? input : (isToggle ? input._toggleWrap : input));

  if (isDisabled && !state.isBusy) {
    const note = document.createElement("small");
    note.textContent = "This field must be edited on the Deal record.";
    row.appendChild(note);
  }

  return row;
}

function renderFields() {
  els.fieldContainer.innerHTML = "";

  const orderedFields = [...state.visibleFields].sort((a, b) => {
    return (fieldIsRequired(a) ? 0 : 1) - (fieldIsRequired(b) ? 0 : 1);
  });

  let hasRenderedRequiredLabel = false;
  let hasRenderedOptionalLabel = false;

  orderedFields.forEach(field => {
    if (fieldIsRequired(field) && !hasRenderedRequiredLabel) {
      const groupLabel = document.createElement("div");
      groupLabel.className = "required-group-label";
      groupLabel.textContent = "Required";
      els.fieldContainer.appendChild(groupLabel);
      hasRenderedRequiredLabel = true;
    } else if (!fieldIsRequired(field) && !hasRenderedOptionalLabel && hasRenderedRequiredLabel) {
      const groupLabel = document.createElement("div");
      groupLabel.className = "optional-group-label";
      groupLabel.textContent = "Additional details";
      els.fieldContainer.appendChild(groupLabel);
      hasRenderedOptionalLabel = true;
    }

    els.fieldContainer.appendChild(createFieldRow(field, "missing"));
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
  els.soSection.innerHTML = "";

  if (!state.isInstall) {
    els.soSection.classList.add("hidden");
    return;
  }

  els.soSection.classList.remove("hidden");

  const row = document.createElement("div");
  row.className = "field-row";
  const label = document.createElement("label");
  label.textContent = "Sales Order Number ";
  const star = document.createElement("span");
  star.className = "required-star";
  star.textContent = "*";
  label.appendChild(star);
  row.appendChild(label);

  if (state.eligibleQuotes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-picklist";
    empty.textContent = "No related Sales Quotes have a Sales Order Number";
    row.appendChild(empty);
  } else {
    const options = state.eligibleQuotes.map(quote => ({ value: quote.id, label: quoteLabel(quote) }));
    const field = { apiName: "selected_so", label: "SO Number", type: "picklist" };
    const control = createSinglePicklistControl(field, state.selectedQuoteId, state.isBusy, options, value => {
      state.selectedQuoteId = value;
      matchPriceSheetForSelectedQuote();
      render();
    });
    row.appendChild(control);
  }

  els.soSection.appendChild(row);
  renderDocumentPreview();
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
  els.createButton.textContent = hasPendingDealUpdates() ? "Save & Create Project" : "Create Project";
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
    els.createButton.textContent = hasPendingDealUpdates() ? "Save & Create Project" : "Create Project";
    setMessage("", "");
    return;
  }

  els.createButton.disabled = !canCreateProject();
  els.createButton.textContent = hasPendingDealUpdates() ? "Save & Create Project" : "Create Project";
  setMessage("", "");
}

function render() {
  if (!state.deal) {
    renderExistingDealInfo();
    renderStatus();
    return;
  }

  renderExistingDealInfo();
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
    await loadRelatedPriceSheets();
    matchPriceSheetForSelectedQuote();
    debug({ deal: state.deal, quotes: state.quotes, eligibleQuotes: state.eligibleQuotes, priceSheets: state.priceSheets, matchedPriceSheet: state.matchedPriceSheet, actualMissingFields: state.actualMissingFields, currentMissingFields: state.currentMissingRequiredFields, isInstall: state.isInstall });
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

function quoteNumberTokens(quote) {
  if (!quote) return [];
  return [quote.CRM_Quote_Number, quote.Quote_Number]
    .map(value => normalize(value))
    .filter((value, index, list) => value && list.indexOf(value) === index);
}

function priceSheetMatchesQuote(sheet, quote) {
  if (!sheet || !quote) return false;

  const lookup = sheet[cfg.priceSheetQuoteLookupField];
  const lookupId = lookup && typeof lookup === "object" ? lookup.id : lookup;
  if (lookupId && String(lookupId) === String(quote.id)) return true;

  const sheetName = normalize(sheet.Name);
  const prefix = normalize(cfg.priceSheetNamePrefix || "Install Price Sheet").toLowerCase();
  if (!sheetName.toLowerCase().includes(prefix.toLowerCase())) return false;

  return quoteNumberTokens(quote).some(token => sheetName.includes(token));
}

function newerPriceSheet(current, candidate) {
  if (!current) return candidate;
  const currentTime = current.Modified_Time || current.Created_Time || "";
  const candidateTime = candidate.Modified_Time || candidate.Created_Time || "";
  return candidateTime > currentTime ? candidate : current;
}

async function loadRelatedPriceSheets() {
  state.priceSheets = [];
  state.matchedPriceSheet = null;
  state.matchedPriceSheetPdfName = "";

  try {
    const response = await ZOHO.CRM.API.getRelatedRecords({
      Entity: cfg.moduleApiName,
      RecordID: state.dealId,
      RelatedList: cfg.priceSheetRelatedListApiName || "Install_Price_Sheets",
      page: 1,
      per_page: 200
    });
    state.priceSheets = response?.data || [];
  } catch (error) {
    debug({ priceSheetRelatedListError: error });
    state.priceSheets = [];
  }

  if (state.priceSheets.length === 0) {
    try {
      const searchResponse = await ZOHO.CRM.API.searchRecord({
        Entity: cfg.priceSheetModuleApiName || "Install_Price_Sheets",
        Type: "criteria",
        Query: `(Deal_Name:equals:${state.dealId})`
      });
      state.priceSheets = searchResponse?.data || [];
    } catch (searchError) {
      debug({ priceSheetSearchError: searchError });
    }
  }
}

async function loadLatestPriceSheetPdfName(sheet) {
  state.matchedPriceSheetPdfName = "";
  if (!sheet?.id) return;

  try {
    const response = await ZOHO.CRM.API.getRelatedRecords({
      Entity: cfg.priceSheetModuleApiName || "Install_Price_Sheets",
      RecordID: sheet.id,
      RelatedList: "Attachments",
      page: 1,
      per_page: 200
    });

    const pdfs = (response?.data || []).filter(attachment => {
      const fileName = normalize(attachment.File_Name).toLowerCase();
      return fileName.includes(".pdf");
    });

    pdfs.sort((a, b) => {
      const aTime = a.Created_Time || a.Modified_Time || "";
      const bTime = b.Created_Time || b.Modified_Time || "";
      return aTime > bTime ? -1 : aTime < bTime ? 1 : 0;
    });

    state.matchedPriceSheetPdfName = pdfs[0] ? normalize(pdfs[0].File_Name) : "";
  } catch (error) {
    debug({ priceSheetAttachmentError: error });
  }
}

function matchPriceSheetForSelectedQuote() {
  const selectedQuote = state.eligibleQuotes.find(quote => quote.id === state.selectedQuoteId);
  let matched = null;

  if (selectedQuote) {
    state.priceSheets.forEach(sheet => {
      if (priceSheetMatchesQuote(sheet, selectedQuote)) {
        matched = newerPriceSheet(matched, sheet);
      }
    });
  }

  state.matchedPriceSheet = matched;
  state.matchedPriceSheetPdfName = "";
}

function renderDocumentPreview() {
  const existing = document.getElementById("documentPreview");
  if (existing) existing.remove();
}

function buildFieldValuesPayload() {
  const payload = {};

  (cfg.fields || []).filter(fieldShouldShow).forEach(field => {
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

  (cfg.fields || []).forEach(field => {
    if (fieldSource(field) !== "deal" || !fieldIsEditable(field)) return;
    if (!Object.prototype.hasOwnProperty.call(state.draftValues, field.apiName)) return;

    const value = getCurrentConfiguredValue(field);
    const originalValue = getDealFieldValue(field.apiName);
    if (normalize(value) !== normalize(originalValue)) {
      payload[field.apiName] = typeof value === "string" ? value.trim() : value;
    }
  });

  return payload;
}

function hasPendingDealUpdates() {
  return Object.keys(collectEditableDealFieldUpdates()).length > 0;
}

async function saveEditableDealFieldsIfNeeded() {
  const payload = collectEditableDealFieldUpdates();

  if (Object.keys(payload).length === 0) {
    return {};
  }

  setProgressOverlay({
    phase: "working",
    title: "Project is being created.",
    detail: "Saving deal fields. Please keep this window open."
  });

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

  setProgressOverlay({
    phase: "working",
    title: "Project is being created.",
    detail: "Confirming saved fields. Please keep this window open."
  });
  await waitForSavedFieldsToBeVisible(payload);
  return payload;
}

function isFlagTrue(value) {
  return value === true || value === "true" || value === 1 || value === "1";
}

function warningList(details) {
  if (!details) return [];
  if (Array.isArray(details.warnings)) {
    return details.warnings.filter(Boolean);
  }
  if (typeof details.warnings === "string" && details.warnings) {
    return [details.warnings];
  }
  return [];
}

async function executeCreateProject(payload) {
  const response = await ZOHO.CRM.FUNCTIONS.execute(cfg.createProjectFunctionName, {
    arguments: JSON.stringify(payload)
  });
  debug({ functionResponse: response, payloadKeys: Object.keys(payload) });
  return parseFunctionResult(response);
}

function buildCreateProjectArgs() {
  const selectedQuote = state.eligibleQuotes.find(q => q.id === state.selectedQuoteId);
  const salesOrderNumber = normalize(selectedQuote?.[cfg.quoteSoNumberField]);
  const crmQuoteNumber = normalize(selectedQuote?.CRM_Quote_Number || selectedQuote?.Quote_Number);
  const quoteNumber = normalize(selectedQuote?.Quote_Number);

  return {
    deal_id: state.dealId,
    quote_id: state.selectedQuoteId,
    sales_order_number: salesOrderNumber,
    crm_quote_number: crmQuoteNumber,
    quote_number: quoteNumber,
    price_sheet_id: state.matchedPriceSheet?.id || "",
    field_values: buildFieldValuesPayload()
  };
}

async function waitForTemplateTasks(projectId) {
  const maxAttempts = cfg.hoursPollMaxAttempts || 30;
  const intervalMs = cfg.hoursPollIntervalMs || 1000;
  const readyAt = cfg.templateTaskReadyCount || 20;
  let lastDetails = { hours_ready: false, task_count: 0, ready_count: readyAt };

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      lastDetails = await executeCreateProject({
        check_tasks_only: true,
        project_id: projectId
      });
    } catch (pollErr) {
      lastDetails = { hours_ready: false, task_count: lastDetails.task_count || 0, ready_count: readyAt };
    }

    const count = Number(lastDetails.task_count || 0);
    const needed = Number(lastDetails.ready_count || readyAt);
    setProgressOverlay({
      phase: "working",
      title: "Sending information to the project.",
      detail: `Waiting for template tasks (${count} of ${needed}). Please keep this window open.`
    });

    if (isFlagTrue(lastDetails.hours_ready) || count >= needed) {
      return lastDetails;
    }

    if (attempt < maxAttempts) {
      await sleep(intervalMs);
    }
  }

  return lastDetails;
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
  setProgressOverlay({
    phase: "working",
    title: "Project is being created.",
    detail: "Please keep this window open."
  });

  try {
    if (Object.keys(collectEditableDealFieldUpdates()).length > 0) {
      await saveEditableDealFieldsIfNeeded();
      validateDeal();

      if (!canCreateProject({ ignoreBusy: true })) {
        render();
        throw new Error("The Deal was saved, but it still is not ready to create a Project. Recheck the required fields and SO Number.");
      }
    }

    const createArgs = buildCreateProjectArgs();
    setProgressOverlay({
      phase: "working",
      title: "Project is being created.",
      detail: "Please keep this window open."
    });

    const details = await executeCreateProject(createArgs);

    if (!details || details.success !== true) {
      throw new Error(details?.message || "The Project was not created.");
    }

    const projectName = details.project_name ? ` ${details.project_name}` : "";
    let warnings = warningList(details);
    createdProject = true;
    state.projectCreated = true;
    els.createButton.textContent = "Project Created";
    els.createButton.disabled = true;
    els.refreshButton.disabled = true;

    let hoursDetails = null;
    if (isFlagTrue(details.hours_pending) && details.project_id) {
      try {
        setProgressOverlay({
          phase: "working",
          title: "Sending information to the project.",
          detail: "Waiting for template tasks. Please keep this window open."
        });
        const readyDetails = await waitForTemplateTasks(details.project_id);

        if (isFlagTrue(readyDetails.hours_ready) || Number(readyDetails.task_count || 0) >= Number(readyDetails.ready_count || cfg.templateTaskReadyCount || 20)) {
          setProgressOverlay({
            phase: "working",
            title: "Sending information to the project.",
            detail: "Applying hours, documents, and install lines. Please keep this window open."
          });
          hoursDetails = await executeCreateProject({
            ...createArgs,
            apply_hours_only: true,
            project_id: details.project_id,
            project_key: details.project_key || "",
            project_name: details.project_name || ""
          });

          if (!hoursDetails || hoursDetails.success !== true) {
            warnings.push(hoursDetails?.message || "Price sheet hours could not be applied after the project was created.");
          } else if (isFlagTrue(hoursDetails.hours_pending)) {
            warnings.push("Template tasks were not ready yet, so price sheet hours were not applied.");
          } else {
            warnings.push(...warningList(hoursDetails));
          }
        } else {
          warnings.push("Template tasks were not ready yet, so price sheet hours were not applied.");
        }
      } catch (hoursErr) {
        warnings.push(hoursErr.message || "Price sheet hours could not be applied after the project was created.");
      }
    }

    const uniqueWarnings = [...new Set(warnings.filter(Boolean))];
    const hoursApplied = isFlagTrue(hoursDetails?.hours_applied) || Number(hoursDetails?.tasks_updated || 0) > 0;
    const resultLines = [`Project created successfully.${projectName}`.trim()];
    const pdfCount = Number(hoursDetails?.pdf_uploads?.length || details.pdf_uploads?.length || 0);
    if (pdfCount > 0) {
      resultLines.push(`Uploaded ${pdfCount} PDF(s) to project documents.`);
    }
    if (hoursApplied) {
      const appliedCount = Number(hoursDetails.tasks_updated || 0);
      const lineCount = Number(hoursDetails.line_items_created || 0);
      if (appliedCount > 0) resultLines.push(`Applied price sheet hours to ${appliedCount} task(s).`);
      if (lineCount > 0) resultLines.push(`Created ${lineCount} install line(s).`);
    }
    if (uniqueWarnings.length > 0) {
      resultLines.push("", "Warnings:", ...uniqueWarnings);
    }

    const resultText = resultLines.join("\n");
    const resultPhase = uniqueWarnings.length > 0 ? "warning" : "success";
    setProgressOverlay({
      phase: resultPhase,
      title: resultPhase === "success" ? "Project created successfully." : "Project created with warnings.",
      result: resultText,
      showClose: true
    });

    if (uniqueWarnings.length === 0) {
      closeWidgetAfterSuccess();
    }
  } catch (error) {
    if (createdProject) {
      setProgressOverlay({
        phase: "warning",
        title: "Project created with warnings.",
        result: error.message || "Project created, but a follow-up step failed.",
        showClose: true
      });
      els.createButton.textContent = "Project Created";
      els.createButton.disabled = true;
      els.refreshButton.disabled = true;
    } else {
      setProgressOverlay({
        phase: "error",
        title: "Project could not be created.",
        result: error.message || "Error creating Project.",
        showClose: true
      });
      els.createButton.disabled = false;
      els.createButton.textContent = hasPendingDealUpdates() ? "Save & Create Project" : "Create Project";
    }
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
  els.progressCloseButton.addEventListener("click", () => {
    if (state.projectCreated) {
      closeWidgetAfterSuccess(true);
      return;
    }
    hideProgressOverlay();
  });
}

function requestWidgetSize() {
  const dimensions = {
    width: 1350,
    height: 700
  };

  try {
    if (!ZOHO?.CRM?.UI?.Resize) {
      console.warn("ZOHO.CRM.UI.Resize is unavailable.");
      return;
    }

    ZOHO.CRM.UI.Resize(dimensions)
      .then(response => console.log("Widget resize response:", response))
      .catch(error => console.error("Widget resize failed:", error));
  } catch (error) {
    console.error("Widget resize failed:", error);
  }
}

ZOHO.embeddedApp.on("PageLoad", function(data) {
  const entityId = data?.EntityId || data?.entityId || data?.id;
  state.dealId = Array.isArray(entityId) ? entityId[0] : entityId;

  requestWidgetSize();

  wireEvents();
  loadDeal();
});

ZOHO.embeddedApp.init();