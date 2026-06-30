# Zoho Project Widget v14

Clean UI, success close, improved Deal-save timing, and required CRM fields:
- Description (`Description`)
- Technical Scope (INTERNAL) (`Description_of_Work_2`)

Upload these files to the GitHub Pages repo root:
- index.html
- app.js
- config.js
- style.css
- README.md


## v14
Fixes Save & Create readiness check after saving the last missing field. The internal ready check now ignores the busy state after a successful save, so the user should not have to click Recheck before creating the project.
