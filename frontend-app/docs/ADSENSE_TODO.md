# AdSense Management System Task Checklist

This document outlines the tasks required to fully implement the AdSense management system within the dashboard.

## Phase 1: Core Integration & Read-Only Data (Completed)

- [x] **Authentication**: Implement OAuth 2.0 flow to connect to a Google AdSense account.
- [x] **API Service**: Create an API route to handle AdSense data fetching.
- [x] **Account Information**: Fetch and display basic AdSense account information (Publisher ID, Time Zone, etc.).
- [x] **Ad Unit Listing**: Fetch and display a list of existing ad units from the user's account.
- [x] **Reporting API**: Fetch basic performance metrics (Estimated Earnings, Impressions, Page Views, CTR) for the overview cards.
  - [x] Implement API call to the `accounts.reports.generate` endpoint.
  - [x] Update the `/api/adsense/data` route to include reporting data.

## Phase 2: Frontend Implementation & UI Restoration (In Progress)

- [x] **Restore Dashboard UI**: Re-implement the original, more comprehensive dashboard layout.
- [x] **Display Ad Units**: Integrate the live ad unit data into the "Ad Slots Management" table.
- [x] **Display Report Data**: Connect the overview cards (Revenue, Impressions, CTR) to the live data from the reporting API.
- [ ] **Performance Chart**: Implement a chart to visualize revenue trends over time.
  - [ ] Choose a charting library (e.g., Chart.js, Recharts).
  - [ ] Fetch historical report data for the chart.
  - [ ] Create a chart component to display the data.

## Phase 3: Ad Unit Management (CRUD Operations)

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

## Phase 4: Settings & Finalization

- [ ] **Restore Settings UI**: Re-implement the "AdSense Settings" section from the original design.
- [ ] **API for Settings**: Investigate the AdSense API for options to manage settings programmatically.
- [ ] **Implement Settings**: Connect the UI to the API to allow users to modify their AdSense settings.
- [ ] **Error Handling**: Enhance error handling throughout the application to provide clear feedback to the user.
- [ ] **Testing**: Write tests for the API routes and frontend components.
