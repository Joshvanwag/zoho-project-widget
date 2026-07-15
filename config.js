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

  // source: "deal" values may be saved back to CRM when entered in the widget.
  // source: "project" values exist only in Projects and are never written to CRM.
  // Required fields are enforced only when their mapped Deal value is blank.
  fields: [
    { apiName: "Deal_Name", label: "Deal Name", type: "text", source: "deal", required: true, editable: false, showWhenBlank: false },
    { apiName: "Deal_Type", label: "Deal Type", type: "picklist", source: "deal", required: true, editable: false, showWhenBlank: false },
    { apiName: "Contact_Name", label: "Primary Contact", type: "lookup", source: "deal", required: true, editable: false, showWhenBlank: false },

    { apiName: "Description", label: "Description of Work", type: "textarea", source: "deal", required: false, editable: true },
    { apiName: "Description_of_Work_2", label: "Description of Work (INTERNAL)", type: "textarea", source: "deal", required: true, editable: true },
    { apiName: "SLA_Level", label: "SLA Level", type: "picklist", source: "deal", required: true, editable: true, options: ["Gold", "Silver", "Extended Warranty", "None", "DECLINED", "Bronze", "Platinum"] },
    { apiName: "Amount", label: "Project $ Amount", type: "currency", source: "deal", required: true, editable: false, showWhenBlank: false },
    { apiName: "Payment_Schedule", label: "Billing Terms", type: "picklist", source: "deal", required: true, editable: true, options: ["Default NET Terms", "BILL:30-MO-MO", "BILL:50-25-25", "BILL:50-50", "BILL:90-10", "100% Pre-Pay", "BILL:50-50 (Project timeline less than 30 days)", "BILL:50-25-25 (Any project timeline)", "BILL:90-10 (Any project timeline and customers with no terms)", "BILL:30-MO-MO (Any project timeline)", "Exception", "Progressive: 50-50"] },
    { apiName: "Billing_Exception", label: "Billing Exception", type: "text", source: "deal", required: false, editable: true },

    { apiName: "Programming_Required", label: "Programming Required", type: "checkbox", source: "deal", required: false, editable: true },
    { apiName: "Programming", label: "Programming Information", type: "textarea", source: "deal", required: true, editable: true },

    { apiName: "Building_Name", label: "Building Name", type: "text", source: "deal", required: false, editable: true },
    { apiName: "Room_Name", label: "Room Name", type: "text", source: "deal", required: false, editable: true },
    { apiName: "Work_Site_Address", label: "Work Site Address", type: "text", source: "deal", required: true, editable: true },
    { apiName: "Work_Site_Address_2", label: "Work Site Address 2", type: "text", source: "deal", required: false, editable: true },
    { apiName: "Work_Site_City", label: "Work Site City", type: "text", source: "deal", required: true, editable: true },
    { apiName: "Work_City_State", label: "Work Site State", type: "text", source: "deal", required: false, editable: true },
    { apiName: "D_State_Selection", label: "Work Site State Selection", type: "picklist", source: "deal", required: false, editable: true, options: ["Alabama - AL", "Alaska - AK", "Arizona - AZ", "Arkansas - AR", "California - CA", "Colorado - CO", "Connecticut - CT", "Delaware - DE", "Florida - FL", "Georgia - GA", "Hawaii - HI", "Idaho - ID", "Illinois - IL", "Indiana - IN", "Iowa - IA", "Kansas - KS", "Kentucky - KY", "Louisiana - LA", "Maine - ME", "Maryland - MD", "Massachusetts - MA", "Michigan - MI", "Minnesota - MN", "Mississippi - MS", "Missouri - MO", "Montana - MT", "Nebraska - NE", "Nevada - NV", "New Hampshire - NH", "New Jersey - NJ", "New Mexico - NM", "New York - NY", "North Carolina - NC", "North Dakota - ND", "Ohio - OH", "Oklahoma - OK", "Oregon - OR", "Pennsylvania - PA", "Rhode Island - RI", "South Carolina - SC", "South Dakota - SD", "Tennessee - TN", "Texas - TX", "Utah - UT", "Vermont - VT", "Virginia - VA", "Washington - WA", "West Virginia - WV", "Wisconsin - WI", "Wyoming - WY"] },
    { apiName: "Work_City_Zip_Code", label: "Work Site Zip", type: "text", source: "deal", required: true, editable: true },

    { apiName: "Installation_Hours", label: "Installation Hours", type: "decimal", source: "deal", required: true, editable: true },
    { apiName: "Programming_Hours", label: "Programming Hours", type: "decimal", source: "deal", required: true, editable: true },
    { apiName: "Schedule_Expectation", label: "Schedule Expectation", type: "picklist", source: "deal", required: true, editable: true, options: ["Next available", "Target Date (date needed)", "By Deadline (date needed)", "ASAP"] },
    { apiName: "Tentative_Install_Dat", label: "Tentative Install Date", type: "date", source: "deal", required: false, editable: true },
    { apiName: "Project_Completion_Date", label: "Completion Date", type: "date", source: "deal", required: false, editable: true },
    { apiName: "Power_Electrical", label: "Power & Electrical", type: "textarea", source: "deal", required: false, editable: true },

    { apiName: "pre_wire_date", label: "Pre-Wire Date", type: "date", source: "project", required: false, editable: true },
    { apiName: "proposed_start_date", label: "Proposed Start Date", type: "date", source: "project", required: false, editable: true },
    { apiName: "sow_and_ld_information", label: "Line Drawing Information", type: "textarea", source: "project", required: false, editable: true },
    { apiName: "cad", label: "CAD Needed", type: "multipicklist", source: "project", required: false, editable: true, options: ["CAD NEEDED"] }
  ],

  showDebug: false,
  successCloseDelayMs: 1400
};
