# Project Tasks

This file contains a centralized list of pending tasks.

## From docs/google/ADSENSE_TODO.md

### Phase 2: Frontend Implementation & UI Restoration (In Progress)

- [ ] **Performance Chart**: Implement a chart to visualize revenue trends over time.
  - [ ] Choose a charting library (e.g., Chart.js, Recharts).
  - [ ] Fetch historical report data for the chart.
  - [ ] Create a chart component to display the data.

### Phase 3: Ad Unit Management (CRUD Operations)

- [ ] **Create Ad Unit**: Implement the functionality to create a new ad unit.
  - [ ] Create a new API endpoint (`/api/adsense/adunits/create`).
  - [ ] Implement the `accounts.adclients.adunits.create` API call.
  - [ ] Create a form/modal in the frontend to capture new ad unit details.
  - [ ] Enable the "Add New Slot" button and connect it to the creation form.
- [ ] **Edit Ad Unit**: Implement the functionality to edit an existing ad unit.
  - [ ] Create a new API endpoint (`/api/adsense/adunits/update`).
  - [ ] Implement the `accounts.adclients.adunits.patch` API call.
  - [ ] Create a form/modal in the frontend to edit ad unit details.
  - [ ] Enable the "Edit" button for each ad unit.
- [ ] **View Ad Unit Code**: Implement a way for the user to view the ad code for a specific ad unit.
  - [ ] The `adUnitCode` is already available in the `AdUnit` object.
  - [ ] Create a modal or a separate view to display the code snippet.

### Phase 4: Settings & Finalization

- [ ] **Restore Settings UI**: Re-implement the "AdSense Settings" section from the original design.
- [ ] **API for Settings**: Investigate the AdSense API for options to manage settings programmatically.
- [ ] **Implement Settings**: Connect the UI to the API to allow users to modify their AdSense settings.
- [ ] **Error Handling**: Enhance error handling throughout the application to provide clear feedback to the user.
- [ ] **Testing**: Write tests for the API routes and frontend components.
