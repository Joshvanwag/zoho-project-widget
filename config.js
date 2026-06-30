// Change these to match your CRM field API names and function name.
window.PROJECT_WIDGET_CONFIG = {
  moduleApiName: "Deals",

  // Field that determines whether project creation is allowed.
  installTypeField: "Install_Type",
  installAllowedValues: ["Install", "Installation", "Install Deal"],

  // Required fields on the Deal before project creation.
  // apiName must be the CRM field API name.
  requiredFields: [
    { apiName: "Deal_Name", label: "Deal Name", type: "text", editable: false },
    { apiName: "Account_Name", label: "Account", type: "lookup", editable: false },
    { apiName: "Contact_Name", label: "Contact", type: "lookup", editable: false },
    { apiName: "Closing_Date", label: "Closing Date", type: "date", editable: true },
    { apiName: "Scope_Internal", label: "Scope Internal", type: "textarea", editable: true },
    { apiName: "Project_Deliverables", label: "Project Deliverables", type: "textarea", editable: true }
  ],

  // CRM custom function that creates the Zoho Project.
  // The function should accept deal_id and return success/error JSON.
  createProjectFunctionName: "create_project_from_deal",

  showDebug: false
};
