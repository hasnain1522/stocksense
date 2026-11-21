# StockSense — Inventory Management System

> **Built in response to the Odoo × GCET Hyderabad Hackathon 2026 inventory-management problem statement.**

StockSense is an inventory-management application designed around the challenge of managing products, warehouses, storage locations and stock operations through one connected workflow.

## Hackathon Challenge

The Odoo × GCET Hyderabad Hackathon 2026 gave teams an inventory-management problem to solve: **build an Inventory Management System**.

Our team took on that challenge and built **StockSense** as our solution.

- **Problem statement:** Build an Inventory Management System
- **Event:** Odoo × GCET Hyderabad Hackathon 2026
- **Selection stage:** Online team-selection round
- **Online round completed:** 26 September 2026
- **Outcome:** Our team was not selected for the offline final

StockSense is documented as the project we built for the stated challenge, not as an offline finalist or winning entry.

## Our Solution — StockSense

We designed StockSense to make core inventory operations easier to track and validate. Its workflow connects products and locations with operational records and resulting stock movements.

**Product → Location → Operation → Validation → Stock Movement → Dashboard**

## Core Features

- Product and category management
- Warehouse and location handling
- Stock receipts
- Customer deliveries
- Internal transfers
- Inventory adjustments
- Operation validation and cancellation flows
- Stock movement ledger
- Dashboard metrics
- Search and filtering
- Persistent SQLite storage

## Architecture

The project was developed as a **standalone inventory-management application** using React, Express and SQLite. The hackathon challenge was set by Odoo, but the current application is not an Odoo module and does not require an installed Odoo runtime.

```text
React + Vite Frontend
        |
        v
    Express API
        |
        v
      SQLite
        |
  +-----+--------+
  |              |
Inventory     Movement
Operations     Ledger
  |              |
  +-------+------+
          |
          v
      Dashboard
```

## Inventory Workflows

- **Receipt:** Supplier → Receipt → Destination Location → Validation → Stock Increase
- **Delivery:** Source Location → Delivery → Customer → Validation → Stock Decrease
- **Transfer:** Source Location → Transfer → Destination Location → Validation → Stock Movement
- **Adjustment:** Counted Quantity → Adjustment → Validation → Stock Reconciliation

## Technology Stack

- React
- Vite
- Node.js
- Express
- SQLite
- Git and GitHub

## Run Locally

### Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Validation Commands

```bash
cd backend
npm test

cd ../frontend
npm run lint
npm run build
```

## Hackathon Participation Record

Our team completed the online selection round on **26 September 2026**. We were **not selected for the offline final**. This repository records the StockSense solution developed for the inventory-management challenge and the engineering experience gained during the event.

## What I Learned

- Translating an inventory-management problem into application workflows
- Modelling products, warehouses, locations and stock movements
- Designing REST APIs with Express
- Building dashboard interfaces with React
- Persisting operational data with SQLite
- Implementing validation and movement-history flows
- Debugging and coordinating development under hackathon time constraints

## Team

**Mohammed Hasnain & Team**  
CSE AI/ML Student
