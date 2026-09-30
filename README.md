# Wallet Tracker

A full-stack personal finance tracker built with React, TypeScript, Supabase, and Tailwind CSS.

Wallet allows users to manage multiple accounts, track income and expenses, transfer money between accounts with currency conversion, manage custom categories, and review their transaction history.

## Live Demo

[Live Website](https://wallet.yaryhin.com/)

## Preview

### Dashboard

<img width="280" alt="Wallet Dashboard" src="https://github.com/user-attachments/assets/ac33f586-60d0-4bb4-9b6d-af68588eb054" />

### Transactions

<img width="280" alt="Wallet Transaction History" src="https://github.com/user-attachments/assets/db10f6ea-42ff-4bb1-a1ce-d3e084d71dd1" />

### Transfer

<img width="280" alt="Wallet Transfer" src="https://github.com/user-attachments/assets/317bbde4-91c6-4126-a5bb-e66c5e6a9c90" />

## Features

- User authentication with Supabase
- Email confirmation on signup
- Create, edit, and delete accounts
- Multiple currencies across accounts
- Add, edit, and delete income and expense transactions
- Transfer money between accounts
- Currency conversion for transfers
- Automatic exchange rates with manual rate adjustment
- Default categories for new users
- Create, edit, and delete custom categories
- Recent transactions dashboard
- Full transaction history
- Sort transactions by date, amount, category, currency, and account
- Light and dark themes
- Multiple language support
- Responsive, mobile-first interface
- Persistent cloud data with Supabase

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- TanStack Query
- Supabase Auth
- Supabase Database
- Frankfurter API
- Netlify

## Main Functionality

### Authentication

Users can create an account, confirm their email, log in, and securely access their own wallet data.

Authentication is handled with Supabase Auth, while application data is associated with each authenticated user.

### Accounts

Users can create multiple financial accounts with custom:

- Names
- Starting balances
- Currencies
- Icons

Each account maintains its own balance and currency.

Account balances are automatically updated when income, expenses, or transfers are created.

### Transactions

Users can record income and expenses, assign categories, select an account, and choose the transaction date.

Existing transactions can also be edited or deleted while keeping the corresponding account balance in sync.

Recent transactions are displayed directly on the dashboard, while the full transaction history is available on a separate page.

### Transfers

Money can be transferred between accounts, including accounts using different currencies.

When currencies are different, the application fetches the current exchange rate automatically. The rate can also be adjusted manually before completing the transfer.

Both sides of the transfer are recorded in the transaction history and the corresponding account balances are updated.

### Categories

New users automatically receive a set of default income and expense categories.

Users can then create additional categories or edit and delete existing ones.

Initial category creation is protected against duplicate records using database constraints and upserts, allowing initialization to remain safe even if it is triggered multiple times.

### Transaction History

The complete transaction history provides an overview of activity across all accounts.

Transactions can be sorted by fields including:

- Date
- Amount
- Category
- Currency
- Account

### Preferences

Wallet supports:

- Light and dark themes
- Multiple interface languages
- Persistent user settings

## Architecture

Wallet was originally built in JavaScript and later rewritten in TypeScript with a cleaner application structure.

The rewrite focuses on separating responsibilities between pages, components, services, and types.

Pages handle data fetching and application-level logic, while reusable components primarily handle UI and user input.

Supabase operations are separated into service modules rather than being mixed directly into UI components.

TanStack Query is used where server-state caching and asynchronous data management are useful.

## What I Learned

While building and later rewriting this project, I practised:

- Migrating an existing React application from JavaScript to TypeScript
- Structuring types across a larger TypeScript application
- Separating UI components from page-level business logic
- Organizing Supabase operations into dedicated service modules
- Working with relational user-owned data
- Managing authentication and protected routes
- Handling asynchronous data after page reloads
- Designing safe initialization logic for default user data
- Preventing duplicate database records with unique constraints and upserts
- Managing account balances across income, expenses, and transfers
- Handling transfers between accounts using different currencies
- Integrating an external currency exchange API
- Building responsive interfaces with Tailwind CSS
- Using TanStack Query for server-state management
- Refactoring an existing application while preserving its functionality

## Challenges

Some of the main challenges while developing Wallet were:

- Keeping account balances consistent when transactions are created, edited, or deleted
- Managing transfers between two accounts correctly
- Handling transfers between accounts with different currencies
- Safely creating default categories without duplicate records
- Preventing race conditions during initial user setup
- Keeping authenticated user data available after page reloads
- Separating database logic from UI components
- Migrating the existing JavaScript codebase to TypeScript while preserving the original functionality

## Future Improvements

- Improve the mobile transaction history layout
- Add transaction search and advanced filters
- Add dashboard charts and spending analytics
- Add monthly budget goals
- Add CSV export
- Continue expanding TanStack Query usage where useful

## Getting Started

Clone the repository:

```bash
git clone https://github.com/yaryhiin/wallet.git
cd wallet
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:

```bash
npm run dev
```

Build the project for production:

```bash
npm run build
```

## Author

Built by Tim Yaryhin.
