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

## July 2026 update

- Uses project source/template ID `1684307000013002547` through the V3 `copy_from` payload field.
- Starts projects in `Kickoff` and assigns them to `Ungrouped Projects`.
- Adds the configured internal users in the project creation payload.
- Uses only the approved project-layout field allowlist.
- Hides mapped fields that already contain Deal data.
- Shows blank mapped fields, enforcing only fields marked required in `config.js`.
- Shows Project-only optional fields without writing them back to CRM.
- Reads Programming Information from Deal API name `Programming`.

The updated Deluge function is included as `create_project_updated.deluge`. Deploy it as the CRM standalone function named `create_project`.

Because this environment cannot execute against the live TVS PRO Zoho portal, test one project before replacing the production widget. In particular, confirm that the V3 create-project endpoint accepts the `group` object and `users` email objects exactly as configured by your portal.
