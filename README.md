# Kitchen Inventory App

This project is the **final project for Code the Dream (Lark Cohort)**.

It is a React + Vite web app for organizing kitchen items by storage location and tracking useful details like quantity, notes, and expiration dates.

## Purpose

The goal of this project is to demonstrate core front-end development skills learned during the cohort, including:

- Building a React application with reusable UI structure
- Organizing content into clear sections and semantic HTML
- Managing project scripts and tooling with Vite, ESLint, and Vitest
- Writing and running basic component tests

## Features

- Kitchen sections for:
  - Fridge
  - Freezer
  - Pantry
  - Shopping List
- Item cards with details (quantity, expiration, notes, category)
- Basic page navigation using anchor links

## Tech Stack

- React
- Vite
- ESLint
- Vitest

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- npm

### Installation

```bash
npm install
```

### Environment Variables

This app connects to Airtable and requires a few environment variables.

1. Copy the example file:

   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your values:

   | Variable                   | Description                                      |
   | -------------------------- | ------------------------------------------------ |
   | `VITE_AIRTABLE_PAT`       | Your Airtable Personal Access Token               |
   | `VITE_AIRTABLE_BASE_ID`   | The Base ID from your Airtable base URL or API docs |
   | `VITE_AIRTABLE_TABLE_NAME`| The name of the table to read/write               |

> **Note:** `.env.local` is git-ignored and will not be committed. If any variable is missing at startup, a warning will be logged to the browser console.

### Run in Development

```bash
npm run dev
```

Starts the Vite development server (with hot reload).

## Available Scripts

- `npm run dev` — Start the local development server
- `npm run build` — Create a production build in `dist/`
- `npm run preview` — Preview the production build locally
- `npm run lint` — Run ESLint checks across the project
- `npm test` — Run Vitest test suite

## Testing

Tests are written with Vitest and React Testing Library.

Run tests:

```bash
npm test
```

## Author

Created by [mnichols08](https://github.com/mnichols08)

- GitHub profile: https://github.com/mnichols08
- Repository: https://github.com/mnichols08/ctd-react-v3-final
