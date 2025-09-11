# Project Tasks

This file contains a centralized list of pending tasks.

## Atom Feed Integration

### Atom Feed Widget & Header Icon
- [x] **Create Atom Feed Endpoint**: Implement `/feed.atom` API route to generate Atom feed
  - [x] Create `/api/feed/atom/route.ts` endpoint
  - [x] Fetch latest posts from WordPress.com API (mock data for now)
  - [x] Generate proper Atom XML format
  - [x] Add proper caching and error handling
- [x] **Create Atom Feed Widget**: Implement a subscription prompt widget based on the design in `atom-note.md`
  - [x] Create `AtomFeedWidget.tsx` component with Tailwind styling
  - [x] Add sticky footer or pop-up implementation
  - [x] Include link to `/feed.atom` feed URL
  - [x] Add RSS Feed Reader extension link
- [x] **Add Atom Feed Icon to Header**: Add an atom/rss feed icon link in the site header
  - [x] Update `Header.tsx` component to include feed icon
  - [x] Link to `/feed.atom` endpoint
  - [x] Use appropriate icon (atom/rss symbol)
  - [x] Ensure responsive design and accessibility

## From docs/google/ADSENSE_TODO.md

### Phase 2: Frontend Implementation & UI Restoration (In Progress)

- [x] **Performance Chart**: Implement a chart to visualize revenue trends over time.
  - [x] Use D3.js library (already installed as dependency).
  - [x] Fetch historical report data for the chart.
  - [x] Create a chart component to display the data.

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

- [x] **Restore Settings UI**: Re-implement the "AdSense Settings" section from the original design.
- [ ] **API for Settings**: Investigate the AdSense API for options to manage settings programmatically.
- [ ] **Implement Settings**: Connect the UI to the API to allow users to modify their AdSense settings.
- [ ] **Error Handling**: Enhance error handling throughout the application to provide clear feedback to the user.
- [ ] **Testing**: Write tests for the API routes and frontend components.
