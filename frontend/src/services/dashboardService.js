import { AlertTriangle, ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, Package } from 'lucide-react'

/* Replace this development source with an API adapter when the backend is ready.
   No values here represent live inventory or production metrics. */
const previewDashboard = {
  metrics: [
    { label: 'Total products in stock', value: '2,840', detail: 'Across 4 categories', trend: '+4.2%', Icon: Package },
    { label: 'Low / out of stock', value: '18', detail: 'Needs your attention', trend: '6 critical', Icon: AlertTriangle },
    { label: 'Pending receipts', value: '12', detail: '5 expected today', trend: 'In progress', Icon: ArrowDownToLine },
    { label: 'Pending deliveries', value: '8', detail: '3 ready to dispatch', trend: 'In progress', Icon: ArrowUpFromLine },
    { label: 'Transfers scheduled', value: '4', detail: 'Next one in 2 hours', trend: 'On schedule', Icon: ArrowLeftRight },
  ],
  stock: { total: 2840, healthyPct: 76, lowPct: 18, outPct: 6, healthy: 2160 },
  alerts: [
    { product: 'Wireless Keyboard K2', sku: 'ACC-2048', stock: 4, reorder: 12 },
    { product: 'USB-C Hub 7-in-1', sku: 'ACC-1182', stock: 0, reorder: 8 },
    { product: 'Ergonomic Mouse M4', sku: 'ACC-3015', stock: 6, reorder: 15 },
  ],
  options: { locations: ['Main Warehouse', 'East Hub', 'Retail Floor'], categories: ['Accessories', 'Electronics', 'Office', 'Packaging'] },
  operations: [
    { reference: 'RCV-2025-0842', type: 'Receipts', product: 'Wireless Keyboard K2', quantity: '+48 units', location: 'Main Warehouse', status: 'Done', date: 'Today, 10:42 AM', category: 'Accessories' },
    { reference: 'DLV-2025-0316', type: 'Delivery', product: 'Monitor Stand Pro', quantity: '−12 units', location: 'East Hub', status: 'Ready', date: 'Today, 09:18 AM', category: 'Office' },
    { reference: 'TRF-2025-0158', type: 'Internal', product: 'USB-C Hub 7-in-1', quantity: '24 units', location: 'Main Warehouse', status: 'Waiting', date: 'Yesterday, 04:36 PM', category: 'Accessories' },
    { reference: 'ADJ-2025-0091', type: 'Adjustments', product: 'Ergonomic Mouse M4', quantity: '−2 units', location: 'Retail Floor', status: 'Draft', date: 'Yesterday, 02:11 PM', category: 'Accessories' },
    { reference: 'RCV-2025-0841', type: 'Receipts', product: 'Desk Lamp Luma', quantity: '+30 units', location: 'East Hub', status: 'Done', date: 'Sep 23, 11:05 AM', category: 'Electronics' },
    { reference: 'DLV-2025-0315', type: 'Delivery', product: 'Notebook Set A5', quantity: '−16 units', location: 'Retail Floor', status: 'Canceled', date: 'Sep 22, 03:24 PM', category: 'Office' },
  ],
}

export async function getDashboard() {
  // Keep the same async contract an API implementation will use.
  return Promise.resolve(previewDashboard)
}
