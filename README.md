# StockSense

StockSense is a React/Vite inventory dashboard with a standalone Express API and persistent SQLite stock engine. The active standalone API is in `backend/`; the legacy Odoo add-on has been removed.

## Run locally

Use Node.js 22.5+ (Node 24 recommended for built-in `node:sqlite`).

```sh
cd backend
npm install
npm run seed       # optional, creates development demo records once
npm run dev        # API at http://localhost:3001
```

The SQLite file is created at `backend/data/stocksense.sqlite` and survives restarts. Set `PORT`, `DB_PATH`, and/or `CORS_ORIGIN` (comma-separated origins) to override defaults. Start the frontend separately:

```sh
cd frontend
npm install
npm run dev
```

## API

All responses use `{ success, data }`; failures use `{ success: false, error: { message } }`. Health: `GET /api/health`. Master data: products, categories, warehouses, and locations. Inventory operations have list/create/detail/validate/cancel endpoints under `/api/receipts`, `/api/deliveries`, `/api/transfers`, and `/api/adjustments`. `GET /api/ledger` returns immutable validated movement records; `GET /api/moves` returns operations; `GET /api/dashboard` provides database-derived counts and location stock. Operation lists accept `status`, `type`, `warehouseId`, `locationId`, `productId`, and `search` filters.

Create operation bodies with `lines: [{ product_id, quantity }]`; use top-level `destination_location_id` for receipts, `source_location_id` for deliveries, both for transfers, and a location plus `counted_quantity` per adjustment line. Receipts require `supplier`; deliveries require `customer`.

## Development checks

```sh
cd backend && npm test
cd frontend && npm run lint && npm run build
```
