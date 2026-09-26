import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const filename = resolve(process.env.DB_PATH || 'backend/data/stocksense.sqlite')
mkdirSync(dirname(filename), { recursive: true })
export const db = new DatabaseSync(filename)
db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;')
db.exec(`
CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS warehouses(id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE, code TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS locations(id INTEGER PRIMARY KEY, warehouse_id INTEGER NOT NULL REFERENCES warehouses(id), name TEXT NOT NULL, code TEXT NOT NULL UNIQUE, UNIQUE(warehouse_id,name));
CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY, name TEXT NOT NULL, sku TEXT NOT NULL UNIQUE, category_id INTEGER REFERENCES categories(id), uom TEXT NOT NULL DEFAULT 'units', reorder_level REAL NOT NULL DEFAULT 0 CHECK(reorder_level>=0), active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS stock_balances(product_id INTEGER NOT NULL REFERENCES products(id), location_id INTEGER NOT NULL REFERENCES locations(id), quantity REAL NOT NULL DEFAULT 0 CHECK(quantity>=0), PRIMARY KEY(product_id,location_id));
CREATE TABLE IF NOT EXISTS operations(id INTEGER PRIMARY KEY, reference TEXT NOT NULL UNIQUE, type TEXT NOT NULL CHECK(type IN ('RECEIPT','DELIVERY','TRANSFER','ADJUSTMENT')), status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','READY','DONE','CANCELED')), supplier_customer TEXT, source_location_id INTEGER REFERENCES locations(id), destination_location_id INTEGER REFERENCES locations(id), created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, validated_at TEXT);
CREATE TABLE IF NOT EXISTS operation_lines(id INTEGER PRIMARY KEY, operation_id INTEGER NOT NULL REFERENCES operations(id), product_id INTEGER NOT NULL REFERENCES products(id), quantity REAL NOT NULL CHECK(quantity>0), counted_quantity REAL, source_location_id INTEGER REFERENCES locations(id), destination_location_id INTEGER REFERENCES locations(id));
CREATE TABLE IF NOT EXISTS stock_ledger(id INTEGER PRIMARY KEY, operation_id INTEGER NOT NULL REFERENCES operations(id), operation_type TEXT NOT NULL, reference TEXT NOT NULL, product_id INTEGER NOT NULL REFERENCES products(id), quantity_delta REAL NOT NULL, source_location_id INTEGER REFERENCES locations(id), destination_location_id INTEGER REFERENCES locations(id), previous_quantity REAL, resulting_quantity REAL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS reorder_rules(id INTEGER PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES products(id), location_id INTEGER REFERENCES locations(id), minimum_quantity REAL NOT NULL CHECK(minimum_quantity>=0), preferred_quantity REAL NOT NULL CHECK(preferred_quantity>=minimum_quantity), UNIQUE(product_id,location_id));
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS password_resets(id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, otp_hash TEXT NOT NULL, expires_at TEXT NOT NULL, verified INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS ledger_product_idx ON stock_ledger(product_id,created_at);
`)

export function transaction(fn) {
  db.exec('BEGIN IMMEDIATE')
  try { const result = fn(); db.exec('COMMIT'); return result }
  catch (error) { db.exec('ROLLBACK'); throw error }
}
export function row(sql, ...params) { return db.prepare(sql).get(...params) }
export function rows(sql, ...params) { return db.prepare(sql).all(...params) }
