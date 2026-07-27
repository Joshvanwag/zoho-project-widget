# Zoho Project Widget

This version keeps all previously completed project-creation changes and adds:

- Existing populated Deal fields become editable inputs inside the collapsed **View details** section.
- Changes to existing Deal values are saved back to CRM before project creation.
- Date inputs open the calendar when any part of the field is clicked.
- Input selection, caret, focus, and date accents use light blue.
- All single-value picklists, including the Sales Order selector, use the same chip-and-dropdown UI as CAD Needed.
- CAD remains a true multipicklist with Signal Flow Diagrams locked in place.

Deploy `create_project.deluge` as the CRM standalone function named `create_project`.
