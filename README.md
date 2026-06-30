# Zoho Project Widget

GitHub Pages hosted widget for creating Zoho Projects from CRM Deals.

## v11 behavior

- Clean UI: only missing required fields and Sales Order Number dropdown are shown.
- Required field labels show a red star.
- Editable missing Deal fields save back to CRM before project creation.
- Calls the `create_project` CRM function.
- Shows a success message when the function returns `success: true`, then closes/reloads the popup.
- Shows the function's returned error message when project creation or CRM association fails.

Upload these files to the GitHub Pages repo root:

- `index.html`
- `app.js`
- `config.js`
- `style.css`
- `README.md`
