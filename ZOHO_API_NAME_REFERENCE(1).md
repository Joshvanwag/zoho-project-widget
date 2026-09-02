# Zoho API Name Reference

This repository reference consolidates the Zoho module names, related-list names, field API names, custom-field API names, function names, connection names, and fixed IDs that have been provided or used in the ClearVista / TVS PRO Zoho work discussed with ChatGPT.

> **Important:** Zoho labels and API names are not interchangeable. Code should use the API name exactly as shown here, including capitalization and known misspellings such as `Tentative_Install_Dat`.
>
> Entries marked **legacy**, **historical**, or **verify** were used in earlier code or metadata and may no longer be the production choice.

---

## 1. Zoho CRM modules and related lists

| Purpose | API name |
|---|---|
| Deals module | `Deals` |
| Quotes / Sales Quotes module | `Quotes` |
| Accounts module | `Accounts` |
| Contacts module | `Contacts` |
| Products module | `Products` |
| Install Price Sheets custom module | `Install_Price_Sheets` |
| Projects CRM integration related list | `Zoho_Projects` |
| Quotes related list on Deals | `Quotes` |
| Quoted Items subform | `Quoted_Items` |

### Common CRM record identifiers

| Meaning | API name |
|---|---|
| Record ID | `id` |
| Deal lookup from Quote | `Deal_Name` |
| Deal name | `Deal_Name` |
| Account lookup/name | `Account_Name` |
| Contact lookup | `Contact_Name` |
| Record owner | `Owner` |
| Owner email inside lookup object | `email` |

---

## 2. CRM Deal field API names

### Core deal and project-creation fields

| Label / use | API name | Notes |
|---|---|---|
| Deal Name | `Deal_Name` | Required for project naming |
| Deal Type | `Deal_Type` | Production value used: `Install Deal` |
| Primary Contact | `Contact_Name` | Lookup to Contacts |
| Description of Work | `Description` | Also sent to Projects `description` and `projects_cf_0005` |
| Description of Work (Internal) / Technical Scope | `Description_of_Work_2` | Maps to Projects `description_of_work` |
| SLA Level | `SLA_Level` | Maps to Projects `sla_level` |
| Project Amount | `Amount` | Maps to Projects `project_amount` |
| Billing Terms / Payment Schedule | `Payment_Schedule` | Maps to Projects `billing_terms` |
| Billing Exception | `Billing_Exception` | Maps to Projects `billing_exception` |
| Programming Required | `Programming_Required` | Auto-true when programming hours > 0 |
| Programming Information | `Programming` | Conditionally required when programming hours > 0 |
| Building Name | `Building_Name` | Required |
| Room Name | `Room_Name` | Required |
| Work Site Address | `Work_Site_Address` | Required |
| Work Site Address 2 | `Work_Site_Address_2` | Optional |
| Work Site City | `Work_Site_City` | Required |
| Work Site State Selection | `D_State_Selection` | Required; preferred state field |
| Work Site State, old text field | `Work_City_State` | **Legacy / removed from current widget** |
| Work Site ZIP | `Work_City_Zip_Code` | Required |
| Installation Hours | `Installation_Hours` | Maps to Projects `projects_cf_0003` |
| Programming Hours | `Programming_Hours` | Maps to Projects `projects_cf_0004` |
| Schedule Expectation | `Schedule_Expectation` | Current widget options: Next Available / By Deadline |
| Power & Electrical | `Power_Electrical` | Maps to Projects `power_electrical` |
| Pre-Wire Required | `Pre_Wire_Needed` | Values: `Yes`, `No`; maps to Projects `pre_wire_needed` |
| Tentative Install Date | `Tentative_Install_Dat` | Known API misspelling; removed from current widget |
| Project Completion Date | `Project_Completion_Date` | Removed from current widget |
| Work City/State combined field | `Work_City_State` | Historical; do not use in current project widget |

### Additional Deal fields used in other workflows

| Label / use | API name |
|---|---|
| Opportunity ID | `Opportunity_ID` |
| Proposal Generated | `Proposal_Generated` |
| Quote active indicator on related quotes | `Quote_Active` |
| Quote version | `Quote_Version` |
| Order priority | `Order_Priority` |
| Customer PO Number | `Customer_PO_No` |
| Customer PO Number alternate label/API seen | `Customer_PO_Number` |
| Proposed Start Date / tentative date historical | `Tentative_Install_Dat` |
| Completion Date | `Project_Completion_Date` |
| Work City / State | `Work_City_State` |
| CAD / line drawing information source | `CAD` | **Verify exact CRM field if used; current CAD field is Projects-side** |
| Room Type | `Room_Type` | Provided in prior project mapping discussions; verify production metadata |
| Primary Room Use | `Primary_Room_Use` | Provided in prior project mapping discussions; verify production metadata |
| Line Drawing Information | `Line_Drawing_Information` | Historical discussion name; current Projects field is `sow_and_ld_information` |
| Commissioning Time | `Commissioning_Time` | Historical project handoff field; verify exact metadata |
| Install Drive Time | `Install_Drive_Time` | Historical project handoff field; verify exact metadata |
| Programming Drive Time | `Programming_Drive_Time` | Historical project handoff field; verify exact metadata |
| Cabling Time | `Cabling_Time` | Historical project handoff field; verify exact metadata |
| Video Time | `Video_Time` | Historical project handoff field; verify exact metadata |
| Audio Time | `Audio_Time` | Historical project handoff field; verify exact metadata |
| Component Management Time | `Component_Management_Time` | Historical project handoff field; verify exact metadata |

---

## 3. CRM Quote / Sales Quote field API names

| Label / use | API name | Notes |
|---|---|---|
| Sales Order Number | `Sales_Order_Number` | Used to select eligible related Quotes |
| CRM Quote Number | `CRM_Quote_Number` | Used in labels, references, and filenames |
| Quote Number | `Quote_Number` | Used for Books reference/custom field |
| Quote Subject | `Subject` | Display / fallback naming |
| Grand Total | `Grand_Total` | Displayed in widget quote selector |
| Quote Stage | `Quote_Stage` | Examples: Draft, On Hold, Committed, Closed Won |
| Quote Active | `Quote_Active` | Determines active quote PDFs |
| Quote Version | `Quote_Version` | Used in PDF filename/versioning |
| Valid Until | `Valid_Till` | Quote validity |
| Carrier | `Carrier` | Maps to Books delivery method |
| Internal Notes | `Internal_Notes` | Maps to Books `cf_internal_notes` |
| Order Priority | `Order_Priority` | Maps to Books `cf_order_priority` |
| Ship Method | `Ship_Method` | Maps to Books `cf_ship_method` |
| Customer PO Number | `Customer_PO_No` | Maps to Books `cf_newpo` |
| Shipping Attention | `Shipping_Attention` | Books shipping address update |
| Shipping Street | `Shipping_Street` | Books shipping address update |
| Shipping Street 2 | `Shipping_Street_2` | Books shipping address update |
| Shipping City | `Shipping_City` | Books shipping address update |
| Shipping State | `Shipping_State` | Books shipping address update |
| Shipping ZIP | `Shipping_Code` | Books shipping address update |
| Shipping Country | `Shipping_Country` | Books shipping address update |
| Quoted Items subform | `Quoted_Items` | Quote line-item subform |
| Product lookup in quoted items | `Product_Name` | Subform field identifier seen in metadata |
| Product Type in quoted items | `Product_Type` | Subform field identifier seen in metadata |
| Manufacturer lookup | `LINKINGCF111` | Metadata identifier observed; verify before production use |

---

## 4. CRM Account field API names

| Label / use | API name |
|---|---|
| Account Name | `Account_Name` |
| Account Type | `Account_Type` |
| Billing Street | `Billing_Street` |
| Billing City | `Billing_City` |
| Billing State | `Billing_State` |
| Billing ZIP | `Billing_Code` |
| Billing Country | `Billing_Country` |
| Shipping Street | `Shipping_Street` |
| Shipping Street 2 | `Shipping_Street_2` |
| Shipping City | `Shipping_City` |
| Shipping State | `Shipping_State` |
| Shipping ZIP | `Shipping_Code` |
| Shipping Country | `Shipping_Country` |

> Historical code error note: Account address properties are map values, not callable functions. Use `accountRecord.get("Shipping_Street")`, not `accountRecord.Shipping_Street()`.

---

## 5. CRM Contact field API names

| Label / use | API name |
|---|---|
| Full Name | `Full_Name` |
| Email | `Email` |
| Phone | `Phone` |
| Mobile | `Mobile` |
| Contact ID | `id` |

---

## 6. CRM Project association payload names

Used when linking a newly created Zoho Project back to the Deal through the `Zoho_Projects` related list.

| Meaning | API/payload name |
|---|---|
| Related-list API name | `Zoho_Projects` |
| Project display name | `name` |
| Project ID | `project_id` |
| Project key | `project_key` |
| CRM wrapper | `data` |

Endpoint pattern:

```text
POST /crm/v2/Deals/{dealId}/Zoho_Projects/{projectId}
```

---

## 7. Zoho Projects project payload fields

### Native project fields

| Purpose | API/payload name | Notes |
|---|---|---|
| Project name | `name` |
| Copy from template | `copy_from` | Current V3 production approach |
| Template ID, older approach | `template_id` | **Legacy** |
| Description | `description` |
| Start date | `start_date` |
| Public/private | `is_public_project` | Current requirement: `false` |
| Status object | `status` | Object containing `id` |
| Project group object | `project_group` | Object containing `id` |
| Layout object | `layout` | Object containing `id` |
| Deal integration field | `deal_id` |
| Owner object | `owner` | May include `zpuid`, `zuid`, `email` |
| Users collection | `users` | Existing-user assignment is portal/API-version sensitive |

### Projects custom field API names

| Label / use | Projects API name | Legacy field ID if known |
|---|---|---|
| Project Amount | `project_amount` | `UDF_DOUBLE1` |
| Description of Work | `projects_cf_0005` | `UDF_TEXT10` |
| Description of Work (Internal) | `description_of_work` | `UDF_TEXT2` |
| SLA Level | `sla_level` | `UDF_CHAR1` |
| Billing Terms | `billing_terms` | `UDF_CHAR6` |
| Billing Exception | `billing_exception` | `UDF_CHAR40` |
| Building Name | `building_name` | `UDF_CHAR7` |
| Room Name | `room_name` | `UDF_CHAR8` |
| Work Site Address | `work_site_address` | `UDF_CHAR13` |
| Work Site Address 2 | `work_site_address_2` | `UDF_CHAR42` |
| Work Site City | `work_site_city` | `UDF_CHAR17` |
| Work Site State Selection | `work_site_state_selection` | `UDF_CHAR46` |
| Work Site State old text field | `work_site_state` | **Legacy / removed** |
| Work Site ZIP | `work_site_zip` | `UDF_CHAR20` |
| Primary Contact Name | `primary_contact_name` | `UDF_CHAR22` |
| Primary Contact Email | `primary_contact_email` | `UDF_CHAR23` |
| Primary Contact Phone | `primary_contact_phone` | `UDF_CHAR24` |
| Schedule Expectation | `schedule_expectation` | `UDF_CHAR5` |
| Programming Information | `programming_information` | `UDF_TEXT13` |
| Power & Electrical | `power_electrical` | `UDF_TEXT9` |
| Installation Hours | `projects_cf_0003` | `UDF_DOUBLE2` |
| Programming Hours | `projects_cf_0004` | `UDF_DOUBLE3` |
| Programming Required | `programming` | `UDF_BOOLEAN1` |
| Pre-Wire Required | `pre_wire_needed` | Verify field ID from current metadata |
| Pre-Wire Needed By Date | `pre_wire_date` | Verify field ID from current metadata |
| Customer Install Deadline Date | `proposed_start_date` | `UDF_DATE5` observed |
| Tentative Install Date | `tentative_install_date` | Historical / removed from current widget |
| Completion Date | `completion_date` | Historical / removed from current widget |
| Line Drawing Information | `sow_and_ld_information` | `UDF_TEXT12` |
| CAD | `cad` | `UDF_MULTI2`; field ID `1684307000008587001` |
| CAD Drawing Request | `cad_drawing_request` | `UDF_TEXT14` |
| Can We Text Primary Contact? | `can_we_text_the_primary_contact` | `UDF_CHAR39` |
| Estimated Programming Hours Needed for Complete | `estimated_programming_hours_needed_for_complete` | `UDF_CHAR41` |
| Deal ID integration, legacy raw field | `UDF_TEXT1` | Legacy field-ID payload form |

### CAD picklist values supplied

The current CAD multipicklist uses these values:

- `Cover Sheet`
- `Key Plan`
- `Equipment and Electrical - Floor Plans`
- `Equipment and Electrical - Reflected Ceiling Plans (RCP)`
- `Equipment and Electrical - Elevations`
- `Signal Flow Diagrams` — always selected and locked
- `Product Details`
- `Standards of Practice - Sign Off`

A metadata screenshot also showed `NONE`; the current widget intentionally omits it because it conflicts with mandatory `Signal Flow Diagrams`.

---

## 8. Zoho Projects fixed IDs

| Purpose | ID | Status |
|---|---:|---|
| Portal ID | `724354547` | Current |
| Project template ID | `1684307000012655127` | Current confirmed |
| Older/wrong template ID | `1684307000013002547` | Do not use |
| Project layout ID | `1684307000004725041` | Current |
| Kickoff status ID | `1684307000007196436` | Current |
| Ungrouped Projects group ID | `1684307000000018001` | Current |
| CAD Projects field ID | `1684307000008587001` | Metadata-confirmed |

### Zoho Projects user IDs

| User | Projects ID / ZPUID |
|---|---:|
| Josh Van Wagenen | `1684307000015406166` |
| Ryan L. | `1684307000015967041` |
| Chris I. | `1684307000015310001` |
| Dalton P. | `1684307000000034619` |
| Bubba G. | `1684307000005450003` |
| Seth B. | `1684307000000083055` |
| Mindy B. | `1684307000005505007` |
| Spencer E. | `1684307000000091786` |

Josh's additional user identifiers:

| Identifier | Value |
|---|---:|
| ZPUID | `1684307000015406166` |
| ZUID | `903101142` |
| Email | `joshv@goclearvista.com` |

---

## 9. Zoho Books API and custom field names

### Sales order standard payload names

| Purpose | API/payload name |
|---|---|
| Customer ID | `customer_id` |
| Sales order number | `salesorder_number` |
| Reference number | `reference_number` |
| CRM Deal association | `zcrm_potential_id` |
| Line items | `line_items` |
| Delivery method | `delivery_method` |
| Salesperson ID | `salesperson_id` |
| Custom fields | `custom_fields` |
| Sales order object | `salesorder` |
| Sales order ID | `salesorder_id` |

### Books custom field API names

| Label / purpose | Books API name | CRM source |
|---|---|---|
| Internal Notes | `cf_internal_notes` | `Internal_Notes` |
| Order Priority | `cf_order_priority` | `Order_Priority` |
| Ship Method | `cf_ship_method` | `Ship_Method` |
| Customer PO | `cf_newpo` | `Customer_PO_No` |
| CRM SO Number | `cf_crm_so_number` | `Quote_Number` |
| CRM Deal ID | `cf_deal_id` | Deal ID |

### Books shipping address payload names

| Meaning | API name |
|---|---|
| Attention | `attention` |
| Address | `address` |
| Address line 2 | `street2` |
| City | `city` |
| State | `state` |
| ZIP | `zip` |
| Country | `country` |

---

## 10. Zoho Creator fields and app references

The following names were provided in Creator workflow discussions. Some are form-link names or lookup names rather than CRM module fields.

| Purpose | API/link name | Notes |
|---|---|---|
| Deal lookup in Price Sheet | `Deal_Name` | Exact capitalization confirmed |
| Price Sheet form/workflow context | `Price_Sheet` | Verify exact form link name if different |
| Line item subform / lookup collection | `Line_Item_Lookup` | Used in cost calculation loop |
| Install line item hours/cost lookup | `Install_Line_Items_Hours_Cost` | Used to retrieve `Install_Line_Items` record |
| Install line items form | `Install_Line_Items` | Record collection used in Deluge |
| Quantity | `Quantity` | Used in multiplication logic |
| Creator record ID | `ID` | Standard Creator record identifier |
| CRM Deal ID | `CRM_Deal_ID` | Discussed, later intentionally omitted from visible form; verify if retained hidden |
| Creator Record URL | `Creator_Record_URL` | Discussed, later intentionally omitted from visible form; verify if retained hidden |

### Project-creation widget argument names

| Meaning | Argument key |
|---|---|
| Deal ID | `deal_id` |
| Quote ID | `quote_id` |
| Sales Order Number | `sales_order_number` |
| CRM Quote Number | `crm_quote_number` |
| Quote Number | `quote_number` |
| Matched price sheet ID | `price_sheet_id` |
| Field values wrapper | `field_values` |

---

## 11. Zoho CRM standalone function names

| Function / automation | Name |
|---|---|
| Create Zoho Project from Deal | `create_project` |
| Create Books Sales Order automation | `automation.createBooksSalesOrder` |

Historical filenames used for project function development include:

- `create_project_updated.deluge`
- `create_project_final.deluge`
- `create_project_v8_zip_api_fix.deluge`

The deployed CRM standalone function name remains `create_project`.

---

## 12. Zoho connection names

| Service | Connection name |
|---|---|
| Zoho CRM | `zcrm` |
| Zoho Projects | `projects` |
| Zoho Books | `books` |
| Zoho CRM connection used in Creator | `zohocrm_connection` |

---

## 13. Writer and inventory template IDs

These are not API names, but they are integration constants that have been supplied and used.

### Writer proposal templates

| Owner / format | Template ID |
|---|---|
| Dave — Standard | `jkh5mff3a6…` |
| Mike — Standard | `l7h12cfd7f…` |
| James — Standard | `l7h1216cba…` |
| Dan — Standard | `l7h1201330…` |
| Brent — Standard | `l7h12993bed…` |
| Dave — Detailed | `4rys89317e…` |
| Quote Only | `l7h123e2e93…` |

> These Writer IDs were retained in abbreviated form in prior notes. Replace the ellipses with full IDs from the production function before using this document as a deployment source.

### CRM inventory template IDs

| Quote format | Template ID |
|---|---:|
| Standard | `5439147000011817085` |
| No SKU | `5439147000102175556` |
| BOM | `5439147000102175573` |
| No List Price | `5439147000102175639` |
| No List Price + Images | `5439147000102175649` |

---

## 14. Project-widget config keys

These are JavaScript configuration properties, not Zoho field API names, but are useful when maintaining the GitHub widget.

| Purpose | Config key |
|---|---|
| CRM module | `moduleApiName` |
| Install Deal field | `installTypeField` |
| Allowed Deal values | `installAllowedValues` |
| Quotes related list | `quotesRelatedListApiName` |
| Quote module | `quoteModuleApiName` |
| SO number field | `quoteSoNumberField` |
| Quote display fields | `quoteDisplayFields` |
| Install Price Sheets module | `priceSheetModuleApiName` |
| Install Price Sheets related list on Deals | `priceSheetRelatedListApiName` |
| Price sheet quote lookup field | `priceSheetQuoteLookupField` |
| Price sheet name prefix | `priceSheetNamePrefix` |
| Sales Orders module | `salesOrderModuleApiName` |
| Function name | `createProjectFunctionName` |
| Field API name | `apiName` |
| Field source | `source` |
| Required setting | `required` |
| Editable setting | `editable` |
| Hide populated/nonblank setting | `showWhenBlank` |
| Picklist choices | `options` |
| Locked multipicklist values | `lockedValues` |

---

## 15. Current Deal-to-Projects mapping

| CRM Deal API name | Projects API name |
|---|---|
| `Description` | `description` |
| `Description` | `projects_cf_0005` |
| `Description_of_Work_2` | `description_of_work` |
| `SLA_Level` | `sla_level` |
| `Amount` | `project_amount` |
| `Payment_Schedule` | `billing_terms` |
| `Billing_Exception` | `billing_exception` |
| `Programming_Required` | `programming` |
| `Programming` | `programming_information` |
| `Building_Name` | `building_name` |
| `Room_Name` | `room_name` |
| `Work_Site_Address` | `work_site_address` |
| `Work_Site_Address_2` | `work_site_address_2` |
| `Work_Site_City` | `work_site_city` |
| `D_State_Selection` | `work_site_state_selection` |
| `Work_City_Zip_Code` | `work_site_zip` |
| `Installation_Hours` | `projects_cf_0003` |
| `Programming_Hours` | `projects_cf_0004` |
| `Schedule_Expectation` | `schedule_expectation` |
| `Power_Electrical` | `power_electrical` |
| `Pre_Wire_Needed` | `pre_wire_needed` |
| Conditional widget date | `pre_wire_date` |
| Conditional customer deadline | `proposed_start_date` |
| `Contact_Name` → Contact `Full_Name` | `primary_contact_name` |
| `Contact_Name` → Contact `Email` | `primary_contact_email` |
| `Contact_Name` → Contact `Phone` / `Mobile` | `primary_contact_phone` |
| Deal record ID | `deal_id` |

Project-only widget mappings:

| Widget API name | Projects API name |
|---|---|
| `pre_wire_date` | `pre_wire_date` |
| `proposed_start_date` | `proposed_start_date` |
| `sow_and_ld_information` | `sow_and_ld_information` |
| `cad` | `cad` |

---

## 16. Current conditional business rules

- `Programming_Required` is automatically set to true when `Programming_Hours` is greater than zero.
- `Programming` is required only when `Programming_Hours` is greater than zero.
- `Pre_Wire_Needed` is required and accepts `Yes` or `No`.
- When `Pre_Wire_Needed` is `Yes`, `pre_wire_date` is required.
- When `Schedule_Expectation` is `By Deadline (date needed)`, `proposed_start_date` is required and labeled Customer Install Deadline Date in the widget.
- When Schedule Expectation is Next Available, no customer deadline date is submitted.
- `Signal Flow Diagrams` must always be included in the Projects `cad` multipicklist.
- Projects are private: `is_public_project = false`.
- Current project template: `1684307000012655127`.
- After a project is created and linked, `create_project` uploads PDFs, applies price sheet hours, and writes sold install lines. Those steps are best-effort: failures add `warnings` and do not roll back the project.
- The selected widget SO identifies the Sales Quote (SQ), the Sales Order PDF, and the Install Price Sheet named like `Install Price Sheet - SQ #`.
- The most recent PDF attachment on the matched price sheet is uploaded to Zoho Projects documents.
- The Sales Order PDF is generated from the native CRM inventory template for `Sales_Orders`.

---

## 17. Known obsolete or incorrect names to avoid

| Name | Reason |
|---|---|
| `Work_City_State` in the current widget | Replaced by `D_State_Selection` |
| `work_site_state` in the current Projects payload | Replaced by `work_site_state_selection` |
| `Bench_date` | Confirmed not to exist |
| `1684307000013002547` | Incorrect/older template ID |
| `CAD NEEDED` | Old manually configured CAD value; current locked value is `Signal Flow Diagrams` |
| `template_id` for current V3 creation | Current code uses `copy_from` |
| Immediate zero-task verification as failure | Template tasks may copy asynchronously |

---

## 18. Maintenance checklist

Before adding or changing a field:

1. Confirm the exact CRM or Projects API name in metadata.
2. Record the visible label separately from the API name.
3. Record the module or form where it exists.
4. Record the field type and permitted picklist values.
5. Add the mapping to this document.
6. Do not rename known misspelled API names in code.
7. Mark removed fields as historical instead of silently deleting them from the reference.

---

## 19. Sales Quotes and Install Price Sheets — imported API reference

This section incorporates the supplied **Zoho CRM API Names — Sales Quotes and Install Price Sheets** reference. It is retained as a complete field inventory even where some names also appear earlier in this document.

### 19.1 Module API names

| Module | API name |
|---|---|
| Sales Quotes | `Quotes` |
| Install Price Sheets | `Install_Price_Sheets` |

### 19.2 Sales Quotes fields

| Field / purpose | API name |
|---|---|
| Quote subject | `Subject` |
| CRM quote number | `CRM_Quote_Number` |
| Deal lookup | `Deal_Name` |
| Account lookup | `Account_Name` |
| Primary contact lookup | `Contact_Name` |
| Record owner | `Owner` |
| Active quote flag | `Quote_Active` |
| Quote version | `Quote_Version` |
| Quote stage | `Quote_Stage` |
| Valid through date | `Valid_Till` |
| Grand total | `Grand_Total` |
| Subtotal | `Sub_Total` |
| Tax | `Tax` |
| Adjustment | `Adjustment` |
| Currency | `Currency` |
| Exchange rate | `Exchange_Rate` |
| Carrier | `Carrier` |
| Ship method | `Ship_Method` |
| Order priority | `Order_Priority` |
| Customer PO number | `Customer_PO_No` |
| Sales order number | `Sales_Order_Number` |
| Payment schedule | `Payment_Schedule` |
| Discount level | `Discount_Level` |
| Taxable | `Taxable` |
| Description | `Description` |
| Internal notes | `Internal_Notes` |
| Terms and conditions | `Terms_and_Conditions` |
| Shipping attention | `Shipping_Attention` |
| Shipping street | `Shipping_Street` |
| Shipping street 2 | `Shipping_Street_2` |
| Shipping city | `Shipping_City` |
| Shipping state | `Shipping_State` |
| Shipping ZIP/code | `Shipping_Code` |
| Shipping country | `Shipping_Country` |
| Shipping address | `Shipping_Address` |
| Zoho Books address ID | `ZB_Address_Id` |
| Sales order link | `Link_to_SO` |
| Analysis complete | `Analysis_Complete` |
| Auto quote | `Auto_Quote` |
| Locked status | `Locked__s` |

### 19.3 Sales Quotes — Quoted Items subform

| Purpose | API name / representation |
|---|---|
| Writable subform API name | `Quoted_Items` |
| Deluge read representation | `Product_Details` |
| Product lookup | `Product_Name` |
| Quantity | `Quantity` |
| List price | `List_Price` |
| Unit cost | `Unit_Cost_1` |
| Discount | `Discount` |
| Description | `Description` |
| Item notes | `Item_Notes` |
| Price each | `Price_EA` |
| Net total | `Net_Total` |
| Total after discount | `Total_After_Discount` |
| Line total | `Total` |
| Gross profit | `Gross_Profit` |
| Profitability / gross margin | `Profitability1` |
| Dealer margin | `Dealer_Margin` |
| Manufacturer lookup | `Manufacturer_Lookup` |
| Manufacturer | `Manufacturer` |
| Vendor lookup | `Vendor_Lookup` |
| Product type | `Product_Type` |
| Parent quote | `Parent_Id` |
| Quoted item row ID | `id` |

### 19.4 Install product reference

| Meaning | Value |
|---|---|
| Product CRM record ID | `5439147000006666817` |
| Product name | `Install` |
| Product code | `Install` |

### 19.5 Install Price Sheets fields

| Field / purpose | API name |
|---|---|
| Record name | `Name` |
| Record owner | `Owner` |
| Email | `Email` |
| Deal lookup | `Deal_Name` |
| Sales Quote lookup | `Sales_Quote_Lookup` |
| Creator record ID | `Creator_Record_ID` |
| Creator record URL | `Creator_Record_URL` |
| Date | `Date` |
| ZIP code | `Zip_Code` |
| Install line-item cost | `Install_Line_Item_Cost` |
| Job review / training cost | `Job_Review_Training_Cost` |
| Project management cost | `Project_Management_Cost` |
| Drive-time cost | `Drive_Time_Cost` |
| Design fee | `Design_Fee` |
| Admin expenses total | `Admin_Expenses_Total` |
| Out-of-town job cost | `Out_of_Town_Job_Cost` |
| Total MSRP | `Total_MSRP` |
| State contract MSRP | `State_Contract_MSRP` |
| Total install hours | `Total_Install_Hours` |
| Drive-time hours | `Drive_Time_Hours` |
| Project management hours | `Project_Management_Hours` |
| Job review / training hours | `Job_Review_Training_Hours` |
| Warranty hours | `Warranty_Hours` |
| Tier 1 hours | `Tier_1_Hours` |
| Tier 2 hours | `Tier_2_Hours` |
| Tier 1 video hours | `Tier_1_Video_Hours` |
| Tier 1 audio hours | `Tier_1_Audio_Hours` |
| Tier 1 cabling hours | `Tier_1_Cabling_Hours` |
| Tier 1 component hours | `Tier_1_Component_Hours` |
| Tier 2 video hours | `Tier_2_Video_Hours` |
| Tier 2 audio hours | `Tier_2_Audio_Hours` |
| Tier 2 cabling hours | `Tier_2_Cabling_Hours` |
| Tier 2 component hours | `Tier_2_Component_Hours` |
| Programming hours | `Programming_Hours` |
| Tier 2 programming hours | `T2_Programming_Hours` |
| Tier 3 programming hours | `Tier_3_Programming_Hours` |
| Install line-items subform | `Install_Line_Items` |
| Record status | `Record_Status__s` |
| Currency | `Currency` |
| Exchange rate | `Exchange_Rate` |
| Tags | `Tag` |
| Locked status | `Locked__s` |
| Record image | `Record_Image` |
| Created by | `Created_By` |
| Modified by | `Modified_By` |
| Created time | `Created_Time` |
| Modified time | `Modified_Time` |
| Last activity time | `Last_Activity_Time` |
| Unsubscribed mode | `Unsubscribed_Mode` |
| Unsubscribed time | `Unsubscribed_Time` |
| CRM record ID | `id` |

### 19.6 Install Price Sheets — Install Line Items subform

| Field / purpose | API name |
|---|---|
| Subform API name | `Install_Line_Items` |
| Install line-item name | `Install_Line_Item` |
| Quantity | `Quantity` |
| Line-item total cost | `Line_Item_Total_Cost` |
| Created by | `Created_By` |
| Subform row ID | `id` |

---

## 20. Price sheet PDFs, Sales Order PDFs, and task hour mapping

These names are used by `create_project` after the project exists.

### 20.1 Related lists and document sources

| Purpose | API name / endpoint |
|---|---|
| Install Price Sheets related list on Deals | `Install_Price_Sheets` |
| Price sheet quote lookup | `Sales_Quote_Lookup` |
| Price sheet record name pattern | `Install Price Sheet - SQ {CRM_Quote_Number}` |
| Price sheet attachments related list | `Attachments` |
| Sales Orders module | `Sales_Orders` |
| Quote to Sales Order lookup | `Link_to_SO` |
| Sales Order search fields | `Subject`, `SO_Number`, `Sales_Order_Number` |
| CRM inventory PDF | `/crm/v2/settings/inventory_templates/{id}/actions/print_preview?record_id={soId}&print_type=pdf` |
| Projects documents upload | `POST /restapi/portal/{portalId}/projects/{projectId}/documents/` |

### 20.2 Template task hour mapping

Hours are applied as task `duration` (hours) and `budget_info.hourly_budget` on the Conference and Collaboration template tasks. Matching is `task list name` + `task name`. T1 and T2 are **not** added together. Programming subtasks get no budgeted hours; time logged there rolls up to the Programming parent.

| Price sheet field(s) | Template task list | Template task |
|---|---|---|
| `Job_Review_Training_Hours` | Installation | Job Review |
| `Drive_Time_Hours` | Installation | Drive Time |
| `Tier_1_Cabling_Hours` | Installation | Cabling - T1 |
| `Tier_2_Cabling_Hours` | Installation | Cabling - T2 |
| `Tier_1_Video_Hours` | Installation | Video - T1 |
| `Tier_2_Video_Hours` | Installation | Video - T2 |
| `Tier_1_Audio_Hours` | Installation | Audio - T1 |
| `Tier_2_Audio_Hours` | Installation | Audio - T2 |
| `Tier_1_Component_Hours` | Installation | Component Management - T1 |
| `Tier_2_Component_Hours` | Installation | Component Management - T2 |
| `Project_Management_Hours` | Administrative | Scheduling |
| `Programming_Hours` + `T2_Programming_Hours` + `Tier_3_Programming_Hours` | Assembly | Programming |

`hours_logged_at_last_progress` is set to `0` on those hour-stamped tasks.

### 20.3 Install Lines (sold labor)

Module `install_line` (`1684307000018866196`). Written at project create only; no backfill.

| Field | Purpose |
|---|---|
| `name` | Catalog line name |
| `qty_done` | Tech progress (type 3 of 10) |
| `sold_qty` | Quantity sold on the Creator price sheet |
| `hours_each` | Catalog hours per unit |
| `allocated_hours` | `hours_each * sold_qty` |
| `related_task_id` | Copied sister task or Programming parent |
| `catalog_line_id` | Creator `Install_Line_Items` ID |

Creator source: workspace `tvspro`, app `application-by-chris`. Join CRM `Install_Price_Sheets.Creator_Record_ID` or Creator `CRM_Install_Price_Sheet_ID`. Sold rows come from the Price Sheet `Line_Item_Lookup` subform. The `All_Line_Item_Lookups` report has no parent Price Sheet field, so `All_Price_Sheets` must include the Line Item Lookup column or `getRecordById` returns no sold lines.

Mapping: catalog `Task_Category` + `Tier` → sister task. `Component` → Component Management. All Programming-category lines → Programming parent. Deduplicate by line name + task and sum qty. Skip 0-hour lines.

### 20.4 Exception flags (Analytics)

Workspace **Zoho Analytics All** (`2604071000000006002`). Add the Install Lines module to the Projects connector and join on Task ID.

- Labor % = actual / planned task hours
- Completion % = sum(`hours_each * qty_done`) / sum(`hours_each * sold_qty`)
- Variance = Labor % − Completion %
- Hours since last progress = current logged − `hours_logged_at_last_progress`
- Largest unfinished = max(`hours_each * (sold_qty - qty_done)`) among unfinished rows
- Grace: no color until hours since last progress > largest unfinished × 1.10
- After grace: ≤10 pts normal, 10–20 warning, >20 red
- Always red: actual > 100% planned; Labor≥50% and Completion<25%; Labor≥75% and Completion<60%
- Skip if no sold lines or all qty done. Programming uses rolled-up actuals vs parent planned hours.
- Reset `hours_logged_at_last_progress` only when `qty_done` increases. Evaluate nightly or on timesheet submit.

The `zcrm` connection needs attachment download and inventory-template print access. The `projects` connection needs document create access (`ZohoProjects.documents.CREATE`) and custom-module create. CRM `create_project` also needs Zoho Creator read (`zoho.creator.getRecordById` / `getRecords`) for sold lines.


