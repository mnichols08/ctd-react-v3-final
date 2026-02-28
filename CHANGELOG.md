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

## [Unreleased]

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
- Refactor MainContainer, InventorySection, and ItemCard components to pass in a shoppingCard value to the shoppingList section 
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
