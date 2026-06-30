// Zoho CRM Deal -> Zoho Projects creation widget configuration.
window.PROJECT_WIDGET_CONFIG = {
  moduleApiName: "Deals",

  installTypeField: "Deal_Type",
  installAllowedValues: ["Install Deal"],

  quotesRelatedListApiName: "Quotes",
  quoteModuleApiName: "Quotes",
  quoteSoNumberField: "Sales_Order_Number",
  quoteDisplayFields: ["Sales_Order_Number", "CRM_Quote_Number", "Quote_Number", "Subject", "Grand_Total", "Quote_Stage"],

  createProjectFunctionName: "create_project",

  // Missing means null/blank. Numeric 0 is allowed.
  requiredFields: [
    { apiName: "Deal_Name", label: "Deal Name", type: "text", editable: false },
    { apiName: "Deal_Type", label: "Deal Type", type: "picklist", editable: false },
    { apiName: "Contact_Name", label: "Primary Contact", type: "lookup", editable: false },
    { apiName: "Description_of_Work", label: "Description of Work", type: "textarea", editable: true },
    { apiName: "Description_of_Work_2", label: "Description of Work (INTERNAL)", type: "textarea", editable: true },
    { apiName: "SLA_Level", label: "SLA Level", type: "picklist", editable: true },
    { apiName: "Amount", label: "Project $ Amount", type: "currency", editable: false },
    { apiName: "Payment_Schedule", label: "Billing Terms", type: "picklist", editable: true },
    { apiName: "Building_Name", label: "Building Name", type: "text", editable: true },
    { apiName: "Room_Name", label: "Room Name", type: "text", editable: true },
    { apiName: "Work_Site_Address", label: "Work Site Address", type: "text", editable: true },
    { apiName: "Work_Site_City", label: "Work Site City", type: "text", editable: true },
    { apiName: "D_State_Selection", label: "Work Site State", type: "picklist", editable: true },
    { apiName: "Work_Zip_Code", label: "Work Site Zip", type: "text", editable: true },
    { apiName: "Installation_Hours", label: "Installation Hours", type: "decimal", editable: true },
    { apiName: "Programming_Hours", label: "Programming Hours", type: "decimal", editable: true },
    { apiName: "Schedule_Expectation", label: "Schedule Expectation", type: "picklist", editable: true }
  ],

  showDebug: false
};
