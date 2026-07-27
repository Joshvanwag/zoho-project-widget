# Zoho Project Widget - Updated Final

Changes included:
- Correct Project Template ID: 1684307000012655127
- Private projects
- Removed Work_City_State; only D_State_Selection is used
- Building, room, address, city, state selection, and ZIP are required; Address 2 remains optional
- CAD remains visible; Signal Flow Diagrams is always selected and cannot be removed
- Users can add other CAD selections
- Existing portal users are supplied in the project creation payload using their Projects IDs
- CRM Deal association runs immediately after project creation
- Zero immediate task count no longer causes failure

Deploy create_project.deluge as the CRM standalone function named create_project.
