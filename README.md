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
