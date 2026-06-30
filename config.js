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
    { apiName: "Deal_Type", label: "Deal Type", type: "picklist", editable: false, options: ["Install Deal", "Non-Install Deal", "Recurring Deal"] },
    { apiName: "Contact_Name", label: "Primary Contact", type: "lookup", editable: false },
    { apiName: "Description_of_Work", label: "Description of Work", type: "textarea", editable: true },
    { apiName: "Description_of_Work_2", label: "Description of Work (INTERNAL)", type: "textarea", editable: true },
    { apiName: "SLA_Level", label: "SLA Level", type: "picklist", editable: true, options: ["Gold", "Silver", "Extended Warranty", "None", "DECLINED", "Bronze", "Platinum"] },
    { apiName: "Amount", label: "Project $ Amount", type: "currency", editable: false },
    { apiName: "Payment_Schedule", label: "Billing Terms", type: "picklist", editable: true, options: ["100% Pre-Pay", "BILL:50-50 (Project timeline less than 30 days)", "BILL:50-25-25 (Any project timeline)", "BILL:90-10 (Any project timeline and customers with no terms)", "BILL:30-MO-MO (Any project timeline)", "Exception"] },
    { apiName: "Building_Name", label: "Building Name", type: "text", editable: true },
    { apiName: "Room_Name", label: "Room Name", type: "text", editable: true },
    { apiName: "Work_Site_Address", label: "Work Site Address", type: "text", editable: true },
    { apiName: "Work_Site_City", label: "Work Site City", type: "text", editable: true },
    { apiName: "D_State_Selection", label: "Work Site State", type: "picklist", editable: true, options: ["Alabama - AL", "Alaska - AK", "Arizona - AZ", "Arkansas - AR", "California - CA", "Colorado - CO", "Connecticut - CT", "Delaware - DE", "Florida - FL", "Georgia - GA", "Hawaii - HI", "Idaho - ID", "Illinois - IL", "Indiana - IN", "Iowa - IA", "Kansas - KS", "Kentucky - KY", "Louisiana - LA", "Maine - ME", "Maryland - MD", "Massachusetts - MA", "Michigan - MI", "Minnesota - MN", "Mississippi - MS", "Missouri - MO", "Montana - MT", "Nebraska - NE", "Nevada - NV", "New Hampshire - NH", "New Jersey - NJ", "New Mexico - NM", "New York - NY", "North Carolina - NC", "North Dakota - ND", "Ohio - OH", "Oklahoma - OK", "Oregon - OR", "Pennsylvania - PA", "Rhode Island - RI", "South Carolina - SC", "South Dakota - SD", "Tennessee - TN", "Texas - TX", "Utah - UT", "Vermont - VT", "Virginia - VA", "Washington - WA", "West Virginia - WV", "Wisconsin - WI", "Wyoming - WY"] },
    { apiName: "Work_City_Zip_Code", label: "Work Site Zip", type: "text", editable: true },
    { apiName: "Installation_Hours", label: "Installation Hours", type: "decimal", editable: true },
    { apiName: "Programming_Hours", label: "Programming Hours", type: "decimal", editable: true },
    { apiName: "Schedule_Expectation", label: "Schedule Expectation", type: "picklist", editable: true, options: ["Next available", "Target Date (date needed)", "By Deadline (date needed)", "ASAP"] }
  ],

  showDebug: false
};
