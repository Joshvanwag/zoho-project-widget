# Zoho Project Widget Update

Upload these files to the GitHub Pages repository root:

- index.html
- app.js
- config.js
- style.css

Deploy `create_project.deluge` as the CRM standalone function named `create_project`.

## Scheduling and pre-wire behavior

- Schedule Expectation only offers Next Available and By Deadline (date needed).
- By Deadline requires Customer Install Deadline Date and maps it to `proposed_start_date`.
- Next Available sends no deadline date.
- Pre-Wire Required is a required Yes/No Deal field using `Pre_Wire_Needed`.
- Yes requires Pre-Wire Needed By Date and maps it to `pre_wire_date`.
- The Projects Yes/No field maps to `pre_wire_needed`.
- Tentative Install Date and Completion Date are no longer shown or sent.
