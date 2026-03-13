# Changelog
---
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## [Template]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

--- -->

## [0.9.2] - 2026-03-12

### Added

- Add resetThrottle function to clear request timestamps for testing
- Add mock responses for Airtable API tests
- Add tests for Airtable API functions including fetch, create, patch, and delete
- Add fetch state, error handling, and data mapping tests
- Add create item success, failure, and form persistence tests
- Add update tests for success, failure revert, and PATCH body verification
- Add delete tests for success, failure preservation, and 404 handling
- Add loading/error UI tests for spinner, error message, and retry behavior
- Add distinct error-type tests: 404, 422, 429 for fetch; 429 for create; network error and 429 for patch and delete

### Changed

- Enhance Airtable API tests with mocked Date.now for accurate timing in throttledFetch
- Refactor handleAddItem to clear previous save errors and return success status for item addition
- Refactor form submission in AddInventoryItemForm and QuickAddForm to handle async operations and improve item creation logic
- Clear previous error state before saving in createInventoryItem
- Update changedFields to include TargetQty in MainContainer
- Refactor fetchInventoryItems to support server-side filtering and remove unused client-side filter logic
- Refactor initial load effect and add server-side filtering for inventory items

### Fixed

- Fix condition for loading sample data in MainContainer
- Fix formatting in comments for clarity in FilterBarForm tests
- Fix cleanup function in useEffect for MainContainer and ensure VITE_SAMPLE_DATA is checked as a string
- Reset error state before fetching inventory items to prevent stale errors
- Encode Airtable table name in BASE_URL for proper URL formatting

### Removed

- Remove active filter count calculation from FilterBarForm, causing linting error.
- Add useEffect to MemoChild for accurate render count tracking
- Remove unused import of getActiveFilterCount from FilterBarForm component

---

## [0.9.1] - 2026-03-10

### Added

- Styled Components for all forms, dialogs, cards, navigation, and utility pages
- Global CSS variables and theme support (light/dark mode) in GlobalStyles.js
- Responsive layouts for all components (320px-480px mobile, landscape, tablet, desktop)
- Mobile hamburger navigation and improved desktop nav
- Advanced grid readability for ItemDetailPage details
- Animated ComingSoonPage and modernized AboutPage

### Changed

- Refactored all forms (Add, Edit, QuickAdd, FilterBar) to use styled components and mobile-friendly layouts
- Refactored all dialogs (EditDialog, ConfirmDialog) for theme, accessibility, and mobile usability
- Refactored ShoppingListControl, PaginationControls, QuickStatsBar, Footer, ErrorState, EmptyState, LoadingState, NotFoundPage, and InventorySection for theme and mobile
- Improved ItemCard button alignment and grid layouts for landscape/mobile
- Improved accessibility and touch targets throughout

### Removed

- All test references from AboutPage

### Fixed

- Dialog/modal background and text color for dark mode
- Dialog/modal scrollability and usability on mobile
- ItemDetailPage details grid readability and stacking
- Miscellaneous layout, overflow, and color issues in mobile/landscape

---

## [0.9.0] - 2026-03-10

### Added

- Add comprehensive CSS styles including design tokens, theming, and accessibility utilities
- Add Dark Mode Toggle component to SettingsPage for theme selection
- Add styled-components dependency to package.json and package-lock.jsonnpm ver

### Changed

- Enhance accessibility by adding ARIA attributes and changing main elements to articles across multiple components
- Enhance accessibility and keyboard navigation across components

---

## [0.8.4] - 2026-03-10

### Added

- Add AboutPage component with project overview and features

### Changed

- Refactor NotFoundPage layout for improved readability

---

## [0.8.3] - 2026-03-10

### Added

- Add generatePageTitle utility for dynamic page title generation
- Add dynamic document title updates for ComingSoonPage
- Add static document title for IndexPage and SettingsPage

### Changed

- Update NavMenu to rename 'Home' link to 'Dashboard'

---

## [0.8.2] - 2026-03-10

### Added

- Add link to ItemDetailPage in ItemCard component for navigation to the item's page
- Add ItemDetailPage component for displaying item details and actions

### Fixed

- Fix toggle behavior in InventorySection to respect archived state

---

## [0.8.1] - 2026-03-10

### Added

- Add ComingSoonPage component with dynamic title generation
- Add NotFoundPage component with random error messages and navigation link
- Add routing in App component to use IndexPage and ComingSoonPage for various paths
- Add SettingsPage component with field selector functionality

### Changed

- Move contents of MainContainer component into a new file IndexPage
- Refactor NavMenu component to use React Router Links for navigation
- Refactor InventorySection to remove archived state handling

---

## [0.8.0] - 2026-03-10

### Added

- Add react-router-dom dependency for routing functionality
- Implement routing with react-router-dom in App component
- Add initial test for App component to check for console errors

---

## [0.7.2] - 2026-03-10

### Added

- Added checks for Airtable environment variable configuration and warnings in airtableUtils.js.
- Implemented new tests for environment fallback behavior in useInventory, ensuring sample data loads when Airtable vars are missing and errors are surfaced correctly when they are present.
- Implement pagination in InventorySection and enhance PaginationControls with unique IDs
- Implement local storage fallback for inventory management and enhance sample data handling

### Changed

- Pull in more data from larger sample file already in repo
- Refactored useInventory hook to determine when to use sample data based on Airtable config.
- Updated ErrorState component to display a message when Airtable config is missing and provide a button to load sample data if applicable.
- Enhanced MainContainer tests to verify the loading of sample data and error handling.
- Updated QuickStatsBar tests to reflect changes in data handling and ensure accurate statistics display.

---

## [0.7.1] - 2026-03-10

### Added

- Add PaginationControls component and corresponding tests

---

## [0.7.0] - 2026-03-09

### Added

- Add Airtable pagination support via `offset` handling in `fetchInventoryItems`, accumulating records across multiple pages (up to 50-page safety cap)
- Add `loadingProgress` state to show cumulative item count during multi-page fetches ("Loading… 200 items")
- Add `partialLoadWarning` state to alert users when later pages fail but page 1 data is still usable
- Add 6 pagination tests covering multi-page accumulation, progress callbacks, partial-load degradation, network errors on later pages, MAX_PAGES safety cap, and single-page backward compatibility

### Fixed

- Fix edit dialog closing before save completes: `handleSubmit` in `EditInventoryItemForm` now awaits `updateItem` and only calls `onClose()` on success; if the PATCH fails, the dialog stays open so the user sees the error
- Propagate success/failure from `usePersistUpdate` (`return true`/`false`) through `useInventoryActions.updateItem` so callers can react to save outcomes
- Fix out-of-order async writes: add per-item version counter in `usePersistUpdate` so a stale PATCH response (success or error) is silently dropped when a newer request for the same item is already in flight
- Fix stale `saveError` persisting after subsequent successful mutations: `usePersistUpdate` now clears `saveError` before each PATCH so the error banner is dismissed when the user retries
- Fix MAX_PAGES pagination cap not surfacing a warning to UI: `fetchInventoryItems` now calls `setPartialLoadWarning` when the 50-page limit truncates results
- Fix overlapping auto-refresh triggers permanently disabling refresh after a failed silent fetch: replace boolean `refreshingRef` guard with a timestamp-based dedup window (5 s) in `useAutoRefresh` that naturally expires, preventing a failed background fetch from blocking all future auto-refreshes
- Fix 422 fallback leaving stale filter params for subsequent pages: after a successful unfiltered fallback on page 1, `baseParams` is now cleared so page 2+ fetches also use unfiltered params instead of re-triggering the 422
- Fix shopping-list NaN from unnormalized Airtable records: add `normalizeRecord` helper in `inventoryUtils` that coerces `QtyOnHand`, `TargetQty`, `PurchasePrice`, and `UnitCost` to proper numbers (defaulting null/undefined to 0); applied at all three record-mapping points in `airtableUtils` (`fetchInventoryItems`, `createInventoryItem`, `patchInventoryItem`)
- Fix "Clear All Filters" unexpectedly also clearing the search term: the `clearFilters` reducer case no longer resets `searchTerm`, matching the UI label; the separate "Reset" button still clears everything
- Fix filtered-results summary counting hidden archived items: `useFilteredInventory` now excludes archived records from the returned `filterAppliedItems`, so the "Showing X of Y" text in `MainContainer` only counts items visible in active sections
- Fix archiving items incorrectly clearing NeedRestock: archive/unarchive now only toggles Status, preserving shopping-list state while archived items remain excluded from shopping-list views

### Tests

- Add test: edit dialog stays open when `updateItem` rejects (mocked `InventoryActionsContext`)
- Update 4 existing edit-form tests to use `await act(async …)` for the now-async submit handler
- Add 3 race-condition tests: stale success is dropped, stale error skips rollback, concurrent patches on different items remain independent
- Add error-lifecycle test: verify `saveError` is cleared on retry after a failed PATCH
- Add 3 overlapping-trigger tests: dedup within window, guard auto-expires after dedup window, and refresh still works after a failed silent fetch (lastFetchedAt unchanged)
- Add 422-fallback pagination test: verify `baseParams` are cleared after fallback so page 2 fetches without the problematic filter params
- Add 6 `normalizeRecord` unit tests: null/undefined → 0, valid numbers preserved, string coercion, NaN/Infinity → 0, absent fields untouched, no mutation
- Add test: "Clear All Filters" preserves the active search term while clearing category/expiring/low-stock filters
- Update 5 filter-count assertions to reflect archived items excluded from `filterAppliedItems`

---

## [0.6.7] - 2026-03-09

### Added

- Add origin validation to Airtable proxy function
- Add useInventoryData() hook for reactive inventory state (items, filters, derived lists)
- Add useInventoryUI() hook for UI-only state (showQuickAdd, showArchived, isSaving, saveError, visibleFields)

### Changed

- Refactor tests to remove unused context imports and update mock components for InventorySection
- Split single InventoryContext into three separate contexts (InventoryDataContext, InventoryUIContext, - InventoryActionsContext) to reduce unnecessary re-renders
- Add useInventoryActions() hook for stable callbacks (addItem, deleteItem, refetch, setSearch, etc.)
- Migrate all 11 consumer components to use the most specific hook for their needs
- Action-only consumers (forms) no longer re-render on data or UI state changes
- Data-only consumers (QuickStatsBar, NavMenu) no longer re-render on UI toggle changes
- Remove backward-compatible useInventoryContext hook; all consumers now use specific hooks
- Extract `checkedFetch` helper in airtableUtils to deduplicate network-error, 429, and error-body handling across all mutation functions
- Extract `prepareItemForSave` utility in inventoryUtils to deduplicate numeric coercion, date nullification, Location formatting, and SubLocation removal shared by AddInventoryItemForm and EditInventoryItemForm
- Move `isDeleting` (client-only UI state) stripping from `patchInventoryItem` to `usePersistUpdate`, decoupling the API layer from UI concerns
- Refactor `MainContainer` to render `LoadingState` and `ErrorState` unconditionally (both self-guard internally)
- Refactor `LoadingState` to read `isLoading` from context instead of receiving it as a prop, matching `ErrorState` pattern
- Simplify `MainContainer` rendering: replace nested ternary with flat conditional guard (`!isLoading && !error`)
- Update HTML metadata for improved SEO and user experience

### Fixed

- Harden `formatRelativeTime` to accept both Date objects and numeric timestamps via `instanceof Date` normalization
- Remove unreachable sort-direction toggle branch in `FilterBarForm.handleSortChange` (a `<select>` never fires `onChange` for the already-selected value); update misleading comment

---

## [0.6.6] - 2026-03-09

### Changed

- Replace prop drilling with `useInventoryContext()` in all components
- Add `variant` prop (`inventory` | `shopping` | `archived`) to `InventorySection`, `ItemCard`, and `ShoppingListControl` to control rendering behavior instead of handler truthiness checks
- `MainContainer` no longer accepts `inventory` prop; reads all state from context
- `InventorySection` accepts only structural props (`id`, `title`, `items`, `variant`)
- `ItemCard` accepts only per-instance props (`item`, `onEdit`, `variant`)
- `ShoppingListControl` uses `variant` to decide stepper vs. add/remove button
- `EditInventoryItemForm` calls `updateItem` from context; accepts `item` and `onClose`
- `EditDialog` simplified to pass-through for `item` and `onClose`
- `AddInventoryItemForm` and `QuickAddForm` get `addItem` from context; accept no props
- `FilterBarForm` gets all state and handlers from context; accepts no props
- `QuickStatsBar` gets all data from context; accepts no props
- `Header` and `NavMenu` get all data from context; accept no props
- `FieldSelector` gets field visibility state from context; only accepts `onClose`
- `App.jsx` renders `<Header />`, `<MainContainer />`, `<Footer />` with zero props

### Removed

- Remove all inventory-related prop drilling from `MainContainer` → children
- Remove redundant `visibleFields`, `onToggleField`, `onResetFields` props from `NavMenu` → `FieldSelector`
- Remove `useFilteredInventory` call from `MainContainer` (now in `InventoryProvider`)
- Remove `archivedItemsExist` derivation from `App`; moved into `NavMenu`

### Fixed

- Fix ShoppingListControl showing stepper on all sections after context migration by using `variant` prop instead of handler truthiness
- Update tests to pass `variant="shopping"` where stepper behavior is expected

### Deprecated

- Remove unused status field from filters in inventoryReducer

---

## [0.6.5] - 2026-03-08

### Added

- Add InventoryContext and provider for managing inventory state

### Changed

- Refactor App component to use InventoryContext and wrap with InventoryProvider
- Wrap App component in InventoryProvider for context access in tests

---

## [0.6.4] - 2026-03-08

### Fixed

- Fix airtableUtils test failing in CI due to proxy envelope

---

## [0.6.3] - 2026-03-08

### Added

- Added test covering `EditInventoryItemForm` submit coercion logic: numeric fields parsed to floats (or null when empty), cleared date fields set to null, and original item fields preserved through the update.
- Added focus trap, Escape key dismissal, and auto-focus to the `FieldSelector` modal dialog. Screen reader and keyboard users can no longer tab into background content, and pressing Escape closes the modal. Added 4 tests covering the new behavior.
- Add two useInventory hook tests exercising the loadSampleData simulated-failure branch: verifies error state is set when Math.random triggers the 33% failure, and verifies recovery after refetch
- `ConfirmDialog` component using native `<dialog>` for delete confirmation
- Added dedicated unit tests for `inventoryUtils.js` (48 tests), `usePersistUpdate` (4 tests), and `useAutoRefresh` (13 tests), bringing total test count from 199 to 264.
- Add Netlify serverless proxy (`netlify/functions/airtable.mjs`) that forwards Airtable API calls using a server-side PAT, keeping the token out of the client bundle. When `VITE_AIRTABLE_PAT` is absent at build time, `airtableUtils.js` automatically routes through the proxy instead of calling Airtable directly.

### Changed

- Replace Date.now() with crypto.randomUUID() for unique ID generation in AddInventoryItemForm and QuickAddForm
- Extract shared `usePersistUpdate` hook from duplicate `persistUpdate` logic in useInventory and useShoppingList, fixing action-type drift where useShoppingList incorrectly dispatched `setError` instead of `setSaveError` on save failure
- Rewrite `useFilters` to delegate to the central `inventoryReducer` dispatch (same pattern as `useShoppingList`), moving filter/sort/search callbacks out of `useInventory` to reduce its size
- Split `useInventory` god hook into focused composable hooks (`useInventoryActions`, `useFieldVisibility`, `useUIToggles`), reducing it to a slim orchestrator while preserving the same return API
- Silenced expected `console.error` output in `airtableUtils.test.js` error-scenario tests (404, 422, 429, network error) using a scoped `vi.spyOn` mock to keep test output clean.
- Replaced `<a href="">` collapse toggle in `InventorySection` and `<a href="#field-selector">` in `NavMenu` with semantic `<button>` elements. Anchors with empty or hash-only hrefs are incorrect for non-navigation actions and cause page scroll. Updated related test selectors in `InventorySection.test.jsx` and `App.test.jsx`.
- Extracted hardcoded Category and Location option lists into shared `CATEGORIES` and `LOCATIONS` constants in `fieldConfig.js`. Updated `QuickAddForm` and `AddInventoryItemForm` to use the shared arrays. Added missing categories ("Cooking Essentials", "Fresh") that exist in sample data.
- Simplify useFilters hook to accept only { dispatch } instead of passing through searchTerm, sortConfig, and filters state it never read internally — those values are already available directly from the reducer in useInventory
- Simplify updateItem in useInventoryActions to accept a single full item object { id, ...fields } instead of a dual-signature (idOrItem, maybeFields) with an IIFE destructure — all callers (ItemCard, EditInventoryItemForm) already pass a full item
- Add "Need Restock" checkbox to AddInventoryItemForm after Target Qty, allowing users to place a new item directly on the shopping list at creation time (defaults to unchecked)
- Wire orphaned `clearFilters` action through `MainContainer` into `FilterBarForm`. The reset button now dispatches the reducer's `clearFilters` action via a new `onClearFilters` prop instead of manually calling `onSearch("")` and `onFilter(DEFAULT_FILTERS)` separately.
- Diff form fields against the previous item in `updateItem` before sending to Airtable, so PATCH requests only include changed fields instead of all 25+ form fields. Skips the network call entirely when nothing changed.
- Gate `loadSampleData` random failure behind `VITE_SIMULATE_ERRORS` env flag so developers using `VITE_SAMPLE_DATA=true` no longer hit unexplained 33% load failures by default
- Extract shared `InventoryFormFields` component from duplicate field markup in `AddInventoryItemForm` and `EditInventoryItemForm`, reducing each form to ~80 lines of unique logic (state init, submit handling, buttons) while the shared component renders all 7 fieldsets
- Sort `inventoryItems` once into `allSortedItems` in `useFilteredInventory` and derive `archivedItems` via `.filter()` instead of re-running `sortItems` independently on the full array
- Consolidate four separate `useMemo` partition filters (fridge, freezer, pantry, shoppingList) in `useFilteredInventory` into a single-pass loop over `sortedItems`
- Replace `useReducer` with `useState` in `useStaleFetchDisplay` so the 30-second interval tick skips re-renders when the display string and stale flag haven't changed
- Centralized `DEFAULT_VISIBLE_FIELDS_SET` in fieldConfig; ItemCard and reducer now share the single source of truth
- `handleClearFilters` in FilterBarForm now delegates to `onClearFilters` instead of using a local default constant
- Replaced FieldSelector's manual modal implementation with native `<dialog>` element, removing custom focus trap, Escape handler, and backdrop logic
- Delete flow now uses `ConfirmDialog` in `ItemCard` instead of `window.confirm` in `useInventoryActions`, making the hook testable without mocking globals
- `ItemCard` now uses `useToggle` for delete confirmation state, consistent with the editing toggle
- Split Location field into a select dropdown (from LOCATIONS) and a free-text sub-location input across all forms
- Moved new Date().toISOString() calls out of the reducer into action dispatchers for deterministic, testable state updates
- Renamed shadowed `id` variable to `intervalId` in useAutoRefresh for clarity
- Filter archived items before sorting instead of sorting the entire unfiltered list in useFilteredInventory
- FieldSelector close button now renders × (times symbol) instead of plain "x" for better screen reader clarity
- Shopping List section now shows only relevant fields (name, quantity, unit, target, location) instead of the full default field set
- Wrapped EmptyState, LoadingState, and ToolSection in memo() for consistency with other components
- deleteItem now clears saveError before starting, matching addItem behavior
- Edit Items now open in a native `<dialog>` modal (via new `EditDialog` component) instead of rendering inline within the card. Editing state is lifted to `InventorySection` so only one item can be edited at a time per section. `ItemCard` no longer manages its own editing toggle

### Fixed

- Update dependencies in form components to include resetForm in useCallback dependencies
- Fix comments in test files to replace special characters with hyphens
- `addItem` and `persistUpdate` now dispatch `setSaveError` instead of `setError`, preventing create/update failures from triggering the full-page error state. Save errors are shown inline and are dismissible. `addItem` also clears any prior `saveError` before starting.
- Fix error handling in deleteItem action to use setSaveError
- Prevent debounced search callback from firing after FilterBarForm unmount by adding useEffect cleanup to clear pending timer
- Prevent potentialy null/undefined location by adding optional chaining for Location checks in useFilteredInventory
- Return no-op cleanup function from `loadSampleData` error path so the return type is consistent with the success path
- Fix item edits silently failing: `updateItem` now accepts both `(id, fields)` and `(fullItem)` signatures, and `patchInventoryItem` strips client-only properties (`isCompleted`, `isDeleting`) that caused Airtable 422 errors
- Coerce empty date strings to `null` in `AddInventoryItemForm` and `patchInventoryItem` to prevent Airtable 422 errors on blank `ExpiresOn`, `DatePurchased`, and `DateFrozen` fields
- Tighten date coercion in `AddInventoryItemForm` from `!value` (all falsy) to `=== ""` (empty string only) for precision
- Remove redundant `sortConfig.field` and `sortConfig.direction` from `useAutoRefresh` effect dependency array, keeping only the `sortConfig` object reference
- Removed misleading `useCallback` wrapper from `handleChange` and `handleSubmit` in `AddInventoryItemForm`, `QuickAddForm` and `EditInventoryItemForm`. The `formData` dependency changed on every keystroke, so the memoization had no effect. Replaced with a plain function for clarity.
- Fix stale comment in test-setup.js (was < 0.55 / 1750 ms, now matches actual < 0.33 / 500 ms)
- Fix misleading destructure alias in patchInventoryItem: renamed \_id to \_isDeleting to correctly reflect that the discarded property is the UI-only isDeleting flag, not an id field
- Make `FilterBarForm` search input controlled via local state synced to the parent `searchTerm` prop, replacing the uncontrolled ref-based approach. The input now stays in sync when `searchTerm` is cleared externally (e.g. via `clearFilters`) while preserving the 300ms debounce on `onSearch`.
- Replace free-text `<input>` for Location in `EditInventoryItemForm` with a `<select>` dropdown using the shared `LOCATIONS` constant, matching the add forms and preventing case-sensitive mismatches that caused edited items to vanish from location sections
- Return `sortedItems` as `filterAppliedItems` from `useFilteredInventory` so consumers receive filtered-and-sorted data instead of filtered-only; existing consumers only used `.length` so behavior was correct but the unsorted return was misleading
- Simplify redundant `itemCount > 0 && items && items.length > 0` condition in `InventorySection` to just `itemCount > 0`, since `itemCount` is already derived from `items.length`
- Use `useRef` instead of a closure dependency for `initialState` in `useFormData`, making `resetForm` referentially stable even when callers pass a new object literal on every render (e.g. the edit form)
- Delete flow now uses `ConfirmDialog` in `ItemCard` instead of `window.confirm` in `useInventoryActions`, making the hook testable without mocking globals
- `ConfirmDialog` now uses `useId()` for its `aria-labelledby` target, preventing duplicate DOM IDs
- `ConfirmDialog` now calls `.close()` on the native `<dialog>` before unmounting, preventing a stale open state during future exit animations
- Shopping list partition now excludes archived items, preventing stale Airtable data with `NeedRestock: true` from leaking through
- Fixed loadSampleData setting items before loading timer resolved, causing a flash of stale data
- Fixed formatRelativeTime guard to handle both null and undefined timestamps
- Fixed ConfirmDialog not closing the dialog element before calling onConfirm
- Fixed useFilteredInventory partitioning to derive main location via parseLocation instead of hardcoded includes
- LoadingState now returns null when not loading instead of leaving an empty live region in the DOM
- QuickAddForm QtyOnHand coercion now handles empty string explicitly instead of relying on Number() alone

### Removed

- Remove inline styles and click handler from heading in InventorySection component
- Removed unused `isCompleted` field that was being defaulted to `false` in `fetchInventoryItems` and `createInventoryItem`, and stripped in `patchInventoryItem`. The field was never read by any component or hook. `isDeleting` (which is actively used) is still stripped before patching.
- Removed `NeedRestock` checkbox from `AddInventoryItemForm` and `EditInventoryItemForm`. This field is managed programmatically by the shopping list actions and should not be manually toggled by users. New items default to `false`; edits preserve the existing value.
- Remove unused needRestock filter flag from reducer initial state, clearFilters, buildAirtableParams, and fetchParamsEqual — it had no UI toggle and was only a leftover from early prototyping. The NeedRestock field on inventory items (used by shopping list logic) is unchanged.
- Remove redundant handleClick wrapper in InventorySection — pass toggleCollapsed directly to onClick handlers
- Remove stale `needRestock` key from `DEFAULT_FILTERS` in `FilterBarForm` to match the reducer's `initialState.filters` and `clearFilters` case, which no longer include it
- Remove dead `shoppingListCount` value from `useShoppingList` and `useInventory` return objects — no component consumed it; callers can use `shoppingListItems.length` directly
- Unused `location` field from reducer `initialState.filters` and `clearFilters` action
- Removed duplicate useEffect for aborting fetches on unmount in useInventory
- Removed Status from Add, Edit, and shared form fields — status is controlled by the archive/unarchive button
- Removed duplicate shoppingListItems computation from useShoppingList — MainContainer uses the filtered version from useFilteredInventory

---

## [0.6.2] - 2026-03-08

### Added

- Add refetch functionality to useInventory hook and enhance tests for data fetching
- Add tests for persistUpdate functionality in useShoppingList hook
- Extract `useFilteredInventory` hook for search, filter, sort, and location partitioning logic
- Extract `useAutoRefresh` hook for server-side refetch, visibility-change refresh, and periodic stale-check logic

### Changed

- Consolidate all local useState and useFilters state (visibleFields, archivedItemsExist, search, sort, filters) into the central inventoryReducer, lifting useInventory to App and passing it as a prop to MainContainer
- Migrate remaining useReducer-managed values (lastFetchedAt, showQuickAdd, showArchived) and add toggleField, resetFields, and clearFilters actions to inventoryReducer
- Replace FilterBarForm useState with useRef and implement debounced search handler
- Rename shopping list handler props (updateItemQuantity → updateTargetQty) across InventorySection, ItemCard, and ShoppingListControl for consistency
- Extract shared constants and utilities (SEARCHABLE_FIELDS, staleness helpers, comparison helpers) into fieldConfig.js and inventoryUtils.js
- Update MainContainer and component tests to reflect new prop-driven architecture and renamed handlers
- Refactor MainContainer to simplify state management and remove unused handlers
- Refactored `useToggle`, `useFormData`, and `useStaleFetchDisplay` hooks from `useState` to `useReducer` for consistent state management across the codebase.
- Simplify MainContainer to mostly JSX and hook calls by moving filtering/sorting/partitioning into `useFilteredInventory` and auto-refresh effects into `useAutoRefresh`
- Encapsulate dispatch in useInventory: add `toggleQuickAdd`, `toggleShowArchived`, and `dismissSaveError` wrapper functions so all state changes go through named action functions
- Compose `useShoppingList` inside `useInventory` to keep `dispatch` private; shopping list functions are now returned directly from `useInventory`
- Remove raw `dispatch` from `useInventory` return value; MainContainer no longer imports `useShoppingList` or calls `dispatch` directly

### Removed

- Remove useFilters hook usage and separate visibleFields/archivedItemsExist useState instances from App and MainContainer in favor of the unified reducer

### Fixed

- Restored missing `useCallback` declaration for `handleSubmit` in `EditInventoryItemForm`, which caused a parse error breaking five test suites.
- Added `window.confirm` mock in `useInventory` delete test to support jsdom environment.
- Update useInventory test to verify new wrapper functions instead of raw dispatch exposure
- Add setIsSaving action to inventory reducer for state management

---

## [0.6.1] - 2026-03-08

### Added

- Implement custom hook for inventory management with CRUD operations
- Add custom hook for managing filters with search and sort functionality
- Implement custom hook for managing shopping list with add, remove, and update functionalities
- Add unit tests for custom hooks: useFilters, useInventory, and useShoppingList
- Add refetch functionality to useInventory hook and update inventoryReducer for LastUpdated tracking

---

## [0.6.0] - 2026-03-08

### Added

- Add inventory reducer with actions and initial state
- Implement inventory reducer to handle actions and state changes

---

## [0.5.4] - 2026-03-07

### Fixed

- Remove active filter count calculation from FilterBarForm, causing linting error.
- Add useEffect to MemoChild for accurate render count tracking
- Remove unused import of getActiveFilterCount from FilterBarForm component

---

## [0.5.3] - 2026-03-07

### Added

- Add `useCallback` behavior tests to MainContainer verifying:
  - Handler functions maintain same reference across renders when deps unchanged
  - Handler functions get new reference when deps change
  - Memoized child components skip re-render when parent re-renders with stable callbacks
- Add tests for useCallback behavior in MainContainer
- Add re-fetch prevention tests to MainContainer verifying:
  - No API call when sort/filter changes but server-side params are inactive
  - API call triggers when server-side params change
  - Refresh button triggers API call regardless of server-side filter setting
  - Previous in-flight fetch is aborted when a new fetch starts

### Changed

- Extend InventorySection mock to capture all props in render log for callback reference assertions
- Enhance MainContainer tests with useMemo and useCallback behavior checks
- Add partial mock for `fetchInventoryItems` in MainContainer tests to enable API-mode testing alongside sample-data tests

---

## [0.5.2] - 2026-03-07

### Added

- Add tests for Refresh functionality in FilterBarForm and MainContainer
- Add refresh button and handler to re-fetch inventory items in FilterBarForm
- Implement auto-refresh and stale-check for MainContainer and QuickStatsBar
- Add tests for setLastFetchedAt in fetchInventoryItems to verify date handling on success and failure

### Changed

- Refactor MainContainer to prevent unnecessary Airtable refetches by tracking last-fetched parameters
- Refactor MainContainer to improve parameter comparison logic and prevent unnecessary Airtable refetches
- Refactor MainContainer and QuickStatsBar to track last fetch time and improve display of data freshness
- Refactor MainContainer to prevent overlapping fetch requests and improve data fetching logic

---

## [0.5.1] - 2026-03-07

### Changed

- Wrap handlers and callbacks in useCallback for performance optimization
- Wrap handleChange and handleSubmit in useCallback for performance optimization
- Wrap handleAdd, handleDecrement, and handleIncrement in useCallback for performance optimization
- Wrap all components in memo for performance optimization
- Wrap toggleField and resetFields in useCallback for performance optimization
- Refactor MainContainer to use useRef for inventoryItems in callbacks for improved performance

---

## [0.5.0] - 2026-03-07

### Changed

- Optimize inventory filtering and sorting using useMemo for improved performance

---

## [0.4.11] - 2026-03-07

### Added

- Add resetThrottle function to clear request timestamps for testing

### Changed

- Enhance Airtable API tests with mocked Date.now for accurate timing in throttledFetch
- Refactor handleAddItem to clear previous save errors and return success status for item addition
- Refactor form submission in AddInventoryItemForm and QuickAddForm to handle async operations and improve item creation logic
- Clear previous error state before saving in createInventoryItem
- Update changedFields to include TargetQty in MainContainer

### Fixed

- Fix Math.random spy usage in retry tests
- Fix condition for loading sample data in MainContainer
- Fix formatting in comments for clarity in FilterBarForm tests

---

## [0.4.10] - 2026-03-06

### Added

- Add mock responses for Airtable API tests
- Add tests for Airtable API functions including fetch, create, patch, and delete
- Add fetch state, error handling, and data mapping tests
- Add create item success, failure, and form persistence tests
- Add update tests for success, failure revert, and PATCH body verification
- Add delete tests for success, failure preservation, and 404 handling
- Add loading/error UI tests for spinner, error message, and retry behavior
- Add distinct error-type tests: 404, 422, 429 for fetch; 429 for create; network error and 429 for patch and delete

---

## [0.4.9] - 2026-03-06

### Added

- Add sorting and filtering parameters for Airtable queries
- Pass sorting configuration to fetchInventoryItems for improved data retrieval
- Refine search term handling and enhance filter options in buildAirtableParams
- Enhance client-side filtering and sorting in fetchInventoryItems; add fallback for Airtable query errors
- Keep client-side filtering as the primary approach; server-side is an optimization
- Add fallback for 422 errors in fetchInventoryItems to support client-side filtering
- Add comprehensive tests for buildAirtableParams to validate sorting and filtering logic

### Changed

- Refactor fetchInventoryItems to support server-side filtering and remove unused client-side filter logic
- Refactor initial load effect and add server-side filtering for inventory items

---

## [0.4.8] - 2026-03-06

### Added

- Implement deleteInventoryItem function to remove items from Airtable
- Implement deleteItem handler to remove inventory items with confirmation and error handling
- Handle 404 status in deleteInventoryItem function to treat missing records as successful deletions
- Enhance delete item functionality with confirmation and disable button during deletion

---

## [0.4.7] - 2026-03-06

### Added

- `updateInventoryItem(id, fields)` in `src/data/airtableUtils.js` — PATCHes only the changed fields to the Airtable API, and automatically includes `LastUpdated: new Date().toISOString()` in every patch

### Changed

- `addToShoppingList()` now PATCHes `{ NeedRestock: true, TargetQty: newQty }` to Airtable on add
- `removeFromShoppingList()` now PATCHes `{ NeedRestock: false }` to Airtable on remove
- Quantity stepper now PATCHes `{ TargetQty: newQty }` on change, and additionally `{ NeedRestock: false }` when stepping down removes the item from the shopping list
- `archiveItem()` now PATCHes `{ Status: "archived" }` to Airtable
- Unarchive now PATCHes `{ Status: null }` to Airtable
- `EditInventoryItemForm` save now PATCHes only the fields that changed rather than the full record
- All mutations optimistically update local state immediately, then reconcile with the API response on success

### Fixed

- Local state is reverted to its previous value and an error is shown if a PATCH request fails, preventing the UI and database from silently drifting out of sync

---

## [0.4.6] - 2026-03-06

### Added

- Add createInventoryItem function to handle item creation in Airtable
- Add saving state management to QuickAddForm and AddInventoryItemForm
- Implement throttled fetch for Airtable API to manage rate limits and handle errors
- Add saveError state management to handle inline error messages in forms
- Display saving status message in MainContainer when saving an item to Airtable
- Integrate createInventoryItem function to handle item submissions in MainContainer

### Changed

- Refactor AddInventoryItemForm and QuickAddForm to integrate createInventoryItem function for handling submissions
- Refactor AddInventoryItemForm and QuickAddForm to simplify item addition and remove unused state management

---

## [0.4.5] - 2026-03-06

### Fixed

- Fix cleanup function in useEffect for MainContainer and ensure VITE_SAMPLE_DATA is checked as a string
- Reset error state before fetching inventory items to prevent stale errors
- Encode Airtable table name in BASE_URL for proper URL formatting

---

## [0.4.4] - 2026-03-06

### Added

- Add sample data configuration to .env.example for development
- Implement fetchInventoryItems and loadSampleData functions for Airtable integration
- Implement inventory fetching from Airtable API and load sample data for development

### Fixed

- Fix typos throughout repository: corrected "ItemDescripton" to "ItemDescription" for consistency

---

## [0.4.3] - 2026-03-05

### Changed

- Refactor tests to use vi.runAllTimers for consistent timer handling
- Refactor effect that called simulateLoading to only trigger random error if in DEV_MODE
- Remove unnecessary aria-live attributes from loading and error state components

---

## [0.4.2] - 2026-03-05

### Added

- Add LoadingState component for handling loading states
- Add ErrorState component for handling error states
- Add loading and error handling states to MainContainer component
- Add global test setup for loading and error states
- Add simulated load and random error on initial mount
- Add timer duration in tests to handle simulated load and random error

---

## [0.4.1] - 2026-03-05

### Added

- Add security note regarding exposure of Airtable environment variables

### Changed

- Update example Airtable environment variables for clarity

---

## [0.4.0] - 2026-03-05

### Added

- Add example environment variables for Airtable integration
- Add environment variable checks for Airtable integration
- Add detailed environment variable setup instructions for Airtable integration

---

## [0.3.6] - 2026-03-05

### Changed

- Migrates sorting logic into inventoryUtils and refactor expiration date calculation and enhance sorting logic to better handle empty values
- Refactor sorting logic in MainContainer to utilize new sortItems utility function
- Enhance QuickStatsBar component with default props for better usability
- Refactor active filter count logic into a utility function for better code reuse

### Fixed

- Fix expiration check to include items expiring soon

---

## [0.3.5] - 2026-03-05

### Aded

- Add comprehensive tests for FilterBarForm functionality
- Add integration tests for QuickStatsBar functionality
- Add test for QuickStatsBar to display filtered stats when isFiltered is true

### Changed

- Enhance QuickStatsBar to support filtered items and indicate filter status and filtering by adding filteredItems and isFiltered props

---

## [0.3.4] - 2026-03-04

### Added

- In inventoryUtils, adds countExpiringSoon function to filter items expiring within 14 days

### Changed

- Refactor QuickStatsBar tests to improve inventory handling and add zero state checks

---

## [0.3.3] - 2026-03-04

### Added

- Add archived items toggle functionality and refactor filters in MainContainer
- Add inventory utility functions for expiration and low stock checks

### Changed

- Update FilterBar tests to validate new expiring soon and low stock filters
- Enhance archive behavior tests to include Archived Items section toggle functionality
- Refactor FilterBarForm to remove unused filters and add expiring soon and low stock checkboxes
- Refactor QuickStatsBar to use utility functions for expiring soon and low stock calculations

---

## [0.3.2] - 2026-03-04

### Added

- Add filtering options to FilterBarForm for categories, location, restock needs, and status
- Add filtering functionality to MainContainer for inventory items

### Changed

- Update FilterBar test to include specific filter options for Location, Needs Restock, and Status

---

## [0.3.1] - 2026-03-04

### Added

- Add sorting functionality to FilterBarForm with sort field and direction options
- Implement sorting functionality for inventory items in MainContainer
- Implement a reset button within FilterBarForm that resets the search query

### Changed

- Modify FilterBar tests to add Sort Direction label and update sort options

---

## [0.3.0] - 2026-03-04

### Added

- Add default no-op function for onSearch prop in FilterBarForm
- Implement search functionality with filtering across multiple fields
- Add search functionality with debounced input in FilterBarForm

### Removed

- Remove "Apply Filter" button from FilterBar tests
- Removes "Apply Filter" button from FilterBarForm

### Fixed

- Update archived items check to use original inventoryItems array

---

## [0.2.7] - 2026-03-04

### Changed

- In EditInventoryItemForm, changed defaultValue to value and added type="text" so the Location input is fully controlled, consistent with every other text input in the form.
- Enhance QuickStatsBar tests with fake timers and improve expiration logic

### Removed

- Remove unnecessary visibleFields prop from ShoppingList component

---

## [0.2.6] - 2026-03-04

### Added

- Add tests for InventorySection collapsible behavior
- Add tests for controlled forms in QuickAddForm and AddInventoryItemForm
- Add tests for FieldSelector component field visibility and interactions
- Add archive and delete integration tests for App component

### Changed

- Update ShoppingListControl to conditionally render "Remove from Shopping List" button or static text
- Refactor delete behavior tests to use try-finally for confirm spy restoration
- Modifies Add to Shopping List functionality to provide a better user experience

---

## [0.2.5] - 2026-03-03

### Added

- Add delete functionality to permanently remove inventory

### Changed

- Update expiration threshold to 14 days for expiring items

### Fixed

- Fix expiring soon calculation to use active items in `QuickStatsBar` instead of `inventoryItems`
- Fixes expiring soon in `QuickStatsBar` by refactoring handleSubmit to parse numeric fields and handle null values for date fields

---

## [0.2.4] - 2026-03-03

### Added

- Add null check for handleArchiveItem before rendering Archive button
- Add archived item "Bacon & Velveeta Scrambler" to inventory sample
- Add inventoryItems prop to QuickStatsBar and display statistics
- Conditionally renders a link to Archived Items in NavMenu if they exist
- Add archive and unarchive functionality to MainContainer and update App state
- Add archivedItemsExist prop to Header and NavMenu components
- Add archive and unarchive functionality to ItemCard component

### Changed

- Refactor expiringSoon calculation for clarity and accuracy
- Refactor QuickStatsBar test to calculate stats based on active items
- Filter out archived items from inventory counts in MainContainer tests
- Refactor QuickStatsBar to display active items and conditionally render archived items count
- Enhance QuickStatsBar test to include archived items and other inventory statistics
- Refactor InventorySection to support archiving and unarchiving items in local state

---

## [0.2.3] - 2026-03-03

### Added

- Add handleUpdateItem prop to ItemCard component in tests
- Implement collapsible functionality in InventorySection component

### Changed

- Refactor ItemCard to conditionally render fields and Edit button together
- In ShoppingListControl conditionally renders the qtyOnHand only in the Shopping List category
- Update App tests to use regex for heading names

---

## [0.2.2] - 2026-03-03

### Added

- Add field visibility management and configuration
- Add FieldSelector component and integrate with Header and NavMenu for managing visible fields

### Changed

- Improves accessibility in FieldSelector component by properly declaring as a modal and labelling it by the heading
- Update ItemCard tests to use visibleFields and adjust field labels

---

## [0.2.1] - 2026-03-02

### Changed

- Refactor shopping list form tests to use ShoppingListControl component
- Refactor InventorySection mock to remove shoppingCart prop and update button logic
- Refactor updateItemQuantity handler to manage shopping list item quantities and remove items when necessary
- Refactor InventorySection to remove unused props and streamline item handling
- Refactor ItemCard to replace AddShoppingListItemForm with ShoppingListControl and streamline shopping list handling
- Renames AddShoppingListItemForm to ShoppingListControl component for enhanced item management in shopping list

### Fixed

- Refactor ShoppingListControl and ItemCard components to remove unused prop and adjust heading condition
- Refactor ShoppingListControl component to improve quantity handling and update button logic
- Prevents form errors by adding step attribute to TargetQty input to allow decimal values

---

## [0.2.0] - 2026-03-01

### Added

- Creates a `dev:server` script to allow running the development server on the local network
- Adds script `test:watch` for running Vitest tests in watch mode

### Changed

- Refactor EditInventoryItemForm to use controlled components and improve form handling
- Refactor QuickAddForm to use controlled components for form data management
- Refactor FilterBarForm to use controlled components for search input
- Refactor AddShoppingListItemForm to use controlled components for quantity input
- Refactor AddInventoryItemForm to use controlled components for form inputs

---

## [0.1.5] - 2026-03-01

### Changed

- Remove step attribute from QtyOnHand input in EditInventoryItemForm to maintain consistency with Add Item forms

### Fixed

- Fix add item test by identifying QuickAddForm using aria-label instead of ambiguous field label

---

## [0.1.4] - 2026-03-01

### Added

- Add test for toggling between QuickAddForm and AddInventoryItemForm

### Changed

- Refactor MainContainer to include toggle functionality between Quick Add and Full Form for adding inventory items

---

## [0.1.3] - 2026-03-01

### Added

- Add unit tests for QuickAddForm and EditInventoryItemForm components
- Add aria-label to form for accessibility improvements

### Changed

- Update quantity labels in AddInventoryItemForm and MainContainer tests for consistency
- Update quantity labels in AddInventoryItemForm and EditInventoryItemForm for clarity
- Refactor MainContainer tests to improve form handling and add conditional logic for form submission

---

## [0.1.2] - 2026-03-01

### Fixed

- Add required attribute to Location input in EditInventoryItemForm

---

## [0.1.1] - 2026-03-01

### Added

- Add editing functionality to ItemCard component with EditInventoryItemForm
- Add EditInventoryItemForm component for editing inventory items
- Add updateInventoryItem function and integrate into InventorySections

---

## [0.1.0] - 2026-02-29

### Added

- Add QuickAddForm component for streamlined item addition

---

## [0.0.8] - 2026-02-28

### Added

- Add tests for ItemCard component to handle shopping list interactions
- Add test for clearing form and focusing input after successful submit in AddInventoryItemForm

### Changed

- Refactor ItemCard component to enhance readability and improve conditional rendering of AddShoppingListItemForm
- Enhance AddInventoryItemForm to use refs for form reset and input focus
- Reduce number of inventory items by introducing a sample file instead of the full inventory data

### Fixed

- Refactor ItemCard component to improve shopping list logic and enhance readability
- In MainContainer, avoid setting state to undefined by returning prevItems when `!Number.isFinite(qty)`
- Update ItemCard test to reflect quantity label change and adjust MainContainer test data import

---

## [0.0.7] - 2026-02-28

### Added

- Add null check for handleAddToShoppingList and use optional chaining for form reset
- Implement useRef for form reset in AddShoppingListItemForm

### Changed

- Enhance AddShoppingListItemForm tests to validate payload submission, default prevention, and quantity after successful submit

### Fixed

- Fix AddShoppingListItemForm test to verify quantity retention on submit failure

---

## [0.0.6] - 2026-02-28

### Added

- Add test to preserve TargetQty when removing items from shopping list
- Add remove functionality for shopping list items in tests
- Add handleAddToShoppingList prop and implement form submission logic in AddShoppingListItemForm
- Add handlers for adding and removing items in ItemCard component
- Implement addToShoppingList and removeFromShoppingList functions in MainContainer
- Add shopping list handlers to InventorySection component

### Changed

- Fix quantity handling in addToShoppingList function
- Remove TargetQty assignment when updating item restock status
- Refactor addToShoppingList and removeFromShoppingList to update inventory state in MainContainer
- Enhance MainContainer tests to validate add-to-shopping-list functionality
- Enhance AddShoppingListItemForm tests with payload submission and mock add functionality

### Fixed

- Fix conditional rendering for remove button in ItemCard component

---

## [0.0.5] - 2026-02-28

### Added

- Add lastId prop to AddInventoryItemForm for inventory tracking

### Changed

- Coerce numeric fields in AddInventoryItemForm to numbers or null
- Refactor NeedRestock property to use boolean values for consistency
- Remove lastId prop from AddInventoryItemForm and use timestamp for unique ID
- Update AddInventoryItemForm tests to include props and enhance MainContainer test for item submission
- Enhance AddInventoryItemForm to handle form submission and include lastId for new items

---

## [0.0.4] - 2026-02-27

### Added

- Add tests for MainContainer to verify state initialization and section rendering

### Changed

- Refactor MainContainer to manage inventory state and pass addInventoryItem to AddInventoryItemForm

### Fixed

- Refactor MainContainer to remove useMemo and initialize inventory state directly
- Adds a numerical id to each item in inventoryData

---

## [0.0.3] - 2026-02-27

### Added

- Add form submission tests to prevent default actions in all forms
- Add tests for AddInventoryItemForm, AddShoppingListItemForm, and ItemCard components
- Implement UtilityComponents tests
- Add ToolSection and EmptyState components
- Add MainContainer to organize sections and integrate inventory data
- Add a json file containing sample data from Airtable
- Add forms for inventory and shopping list management
- Add static components: QuickStatsBar and FilterBar

### Changed

- Moves FilterBar component into forms/FilterBarForm and migrates test into FormsAndCard test file
- Memoizes inventory on first pass to avoid unnecessary bundle-size and render-time overhead as the data grows
- Refactor MainContainer, InventorySection, and ItemCard components to pass in a shoppingCart value to the shoppingList section
- Shopping list renders if NeedRestock is checked and QtyOnHand is less than TargetQty
- Refactor ItemCard component to destructure item properties passed from sample data
- Refactor InventorySection to accept props and streamline rendering
- Refactor ItemCard and InventorySection to render forms and additional components.

### Fixed

- Prevent the site from crashing if a form is from submitted
- In InventorySection, moves EmptyState component outside of the <ul> to keep the DOM semantic/accessible.
- Refactors inventoryData to be more consistent with how Airtable will return data
- Update AddShoppingListItemForm to use dynamic ID for quantity input
- Correctly maps ExpiresOn from destructured item within ItemCard and removes title, quantity, expirationDate in favor of their destructured values
- Fixes mock item in test to pass in ExpiresOn instead of ExpirationDate

---

## [0.0.2] - 2026-02-27

### Added

- Add static components: ItemCard, InventorySection, Footer, Header, and NavMenu

### Changed

- Updated App tests to validate componentized rendering (header, navigation, inventory sections, and footer) instead of only a basic smoke check.

---

## [0.0.1] - 2026-02-27

### Added

- Add GitHub Actions workflow for PR tests and linting
- Add initial test for App component to ensure it loads without console errors
- Added a description to package.json for better project context.
- Introduced vitest for testing with necessary dependencies.
- Created vitest.config.js to configure testing environment with jsdom.
- Remove unused CSS files and assets to clean up the project
- Update README.md to reflect project details and features for Kitchen Inventory App
- Add additional rules to eslint config
- Initialize React project using Vite setup
- Initialize repository

### Changed

- Refactor App component to implement a mock Kitchen Inventory layout and navigation
