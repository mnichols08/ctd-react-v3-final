# Changelog

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

## [0.6.2] - 2026-03-08

### Added

- Add refetch functionality to useInventory hook and enhance tests for data fetching
- Add tests for persistUpdate functionality in useShoppingList hook

### Changed

- Refactor useInventory hook to replace useState with useReducer for lastFetchedAt management 
- Refactor MainContainer to utilize custom hooks for inventory and filters, replacing local state management with useInventory and useFilters
- Update LastUpdated field handling in inventoryReducer to use action payload if available
- Update persistUpdate function to dispatch updated item after patching inventory
- Refactor useInventory hook to improve state reference handling and avoid stale closures
- Refactor inventory state management to use useReducer for UI state and add new actions for toggling quick add and archived item visibility

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
