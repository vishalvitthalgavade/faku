# EduPay Next React

This version is a clean React/Next.js implementation. The old `legacy-app.js` and giant HTML string are no longer loaded by the app.

## Run

```bash
npm install
npm run dev
```

## Main structure

- `app/page.jsx` — application state and screen routing
- `components/Home.jsx` — home dashboard
- `components/History.jsx` — transaction history
- `components/Scan.jsx` — camera/image QR scanning
- `components/Transaction.jsx` — transaction details
- `components/TransferFlow.jsx` — send/receive/confirm/PIN flow
- `components/BottomNavigation.jsx` — fixed navigation
- `components/Profile.jsx` — profile settings
- `components/SimpleTabs.jsx` — search and alerts
- `components/icons.jsx` — lightweight SVG icon set
- `lib/storage.js` — localStorage persistence and demo seed data

Transaction history stores up to 50 records locally and seeds 15 demo transactions on first run.
