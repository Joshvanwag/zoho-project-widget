# Zoho CRM Project Creation Widget

Static Zoho CRM widget for Deals. It validates whether the Deal is an install Deal, checks required fields, optionally updates editable missing Deal fields, then calls a CRM custom function to create a Zoho Projects project.

## Files

- `index.html` - widget shell
- `config.js` - change field API names and custom function name here
- `app.js` - widget logic
- `style.css` - UI styling

## Setup

1. Create a GitHub repo.
2. Upload these files to the root of the repo.
3. Enable GitHub Pages: Settings > Pages > Deploy from branch > main > root.
4. In Zoho CRM, create a widget using External Hosting and use the GitHub Pages URL.
5. Add a Deal button that opens the widget.
6. Create a CRM custom function named in `config.js`, default `create_project_from_deal`.

## Important

Update `config.js` before using this in production. The field API names are placeholders.
