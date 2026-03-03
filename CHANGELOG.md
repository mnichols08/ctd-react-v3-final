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

## [0.2.1] - 2026-03-02

## Changed

- Refactor InventorySection to remove unused props and streamline item handling
- Refactor ItemCard to replace AddShoppingListItemForm with ShoppingListControl and streamline shopping list handling
- Renames AddShoppingListItemForm to ShoppingListControl component for enhanced item management in shopping list

## Fixed

- Prevents form erros by adding step attribute to TargetQty input to allow decimal values

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
