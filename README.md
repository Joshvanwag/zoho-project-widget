# Zoho Project Widget

GitHub Pages hosted widget for creating Zoho Projects from CRM Deals.

## v6 behavior

- Picklist fields render as real dropdowns from `config.js` options.
- Text fields update draft values while typing without rerendering the form.
- The Create button enables as soon as the current draft values are complete.
- Validation messages refresh on field blur and again on final submit.
- Clicking Save & Create Project validates current values, saves editable missing fields back to CRM, then calls the `create_project` function.

Upload these files to the GitHub Pages repo root:

- `index.html`
- `app.js`
- `config.js`
- `style.css`
- `README.md`


## v7 note
Changed save behavior so the widget does not immediately reload the Deal after saving missing fields. This avoids Zoho returning a stale record and showing newly entered values, especially Work Site Zip, as blank right after submit.
