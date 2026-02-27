# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

--- -->

## [0.0.2] - 2026-02-27

### Added

- Add forms for inventory and shopping list management
- Add static components: ItemCard, InventorySection, Footer, Header, and NavMenu

### Changed

- Refactor ItemCard and InventorySection to render forms.
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
- Adds additional rules to eslint config
- Initialize React project using Vite setup
- Initialize repository

### Changed

- Refactor App component to implement a mock Kitchen Inventory layout and navigation
