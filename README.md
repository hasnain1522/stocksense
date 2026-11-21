# 📦 StockSense

> **Inventory Management System built for the Odoo × GCET Hyderabad Hackathon 2026.**

StockSense is an inventory-management application for products, warehouses, locations and stock operations.

## Hackathon Context

StockSense was developed for the **Odoo × GCET Hyderabad Hackathon 2026**. The first-stage selection round was conducted **online** to identify teams for the offline final. Our team completed the online round on **26 September 2026**, but **was not selected for the offline final**.

**Participation format:** Online selection round  
**Next stage:** Offline final at the event  
**Outcome:** Team not selected for the offline final  
**Project:** StockSense — Inventory Management System

## Why We Built It

Inventory work becomes difficult when products, warehouses, locations, receipts, deliveries, transfers and adjustments are spread across disconnected workflows.

The target flow was:

**Product → Location → Operation → Validation → Stock Movement → Dashboard**

The hackathon also provided a practical environment for rapid product development, team coordination, debugging and delivery under time constraints.

## Core Features

- products and categories
- warehouses and locations
- receipts
- deliveries
- transfers
- inventory adjustments
- validation/cancellation flows
- immutable movement ledger
- dashboard metrics
- search and filtering
- persistent SQLite storage

## Architecture Decision

The project initially originated around an Odoo-oriented inventory concept. During implementation, the active application evolved into a **standalone React + Express + SQLite system**.

The current repository therefore does not require an installed Odoo runtime.

## Architecture

```text
React / Vite Frontend
          │
          ▼
     Express API
          │
          ▼
       SQLite
          │
   ┌──────┼──────────┐
   ▼      ▼          ▼
Products Operations Ledger
          │
          ▼
       Dashboard
```

## Inventory Flows

**Receipt:** Supplier → Receipt → Destination Location → Validation → Stock Increase

**Delivery:** Source Location → Delivery → Customer → Validation → Stock Decrease

**Transfer:** Source Location → Transfer → Destination Location → Validation → Movement

**Adjustment:** Counted Quantity → Adjustment → Validation → Reconciliation

## Stack

- React + Vite
- Node.js + Express
- SQLite
- Git + GitHub

## Run Locally

Backend:

```bash
cd backend
npm install
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Validation

```bash
cd backend && npm test
cd frontend && npm run lint && npm run build
```

## Hackathon Submission / Result Note

The online selection round was completed on **26 September 2026**. Our team was **not selected for the offline final**. StockSense is documented as the team's hackathon project and engineering learning experience, not as an offline finalist or winning entry.

## What I Learned

Inventory-domain modeling, REST API design, React dashboards, SQLite persistence, validation flows, debugging under time pressure, Git/GitHub collaboration and hackathon execution.

## Author

**Mohammed Hasnain & Team**

CSE AI/ML Student / Developer