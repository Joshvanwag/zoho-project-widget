# Zoho Project Widget - Schedule and Pre-Wire Update

Built from the supplied existing widget files.

Changes:
- Schedule Expectation options are only `Next available` and `By Deadline (date needed)`.
- Removed Tentative Install Date and Completion Date from the widget and Deluge payload.
- Proposed Start Date is no longer always visible.
- Added required Deal field `Pre_Wire_Needed` with Yes/No options.
- If Pre-Wire Required is Yes, `Pre-Wire Needed By Date` appears and is required; it maps to Projects `pre_wire_date`.
- `Pre_Wire_Needed` maps to Projects `pre_wire_needed`.
- If Schedule Expectation is By Deadline, `Customer Install Deadline Date` appears and is required; it maps to Projects `proposed_start_date`.
- Next Available sends no customer deadline date.
- Existing CAD multipicklist behavior and all prior project-creation changes are retained.

- Programming Required is automatically checked when Programming Hours is greater than 0.
- Programming Information is required only when Programming Hours is greater than 0.

- After project creation, `create_project` uploads the selected Sales Order PDF and the matching Install Price Sheet PDF to Zoho Projects documents. PDF failures never block project creation.
- The matching price sheet is the `Install_Price_Sheets` related-list record named like `Install Price Sheet - SQ #`, using the selected quote's SQ number. The most recent PDF attachment on that record is uploaded.
- Price sheet hours are written 1:1 onto sister tasks (`Cabling - T1` / `Cabling - T2`, same for Video, Audio, Component Management) and all programming hours go on the **Programming** parent. Sold labor lines are written to the Install Lines module at create time only.
