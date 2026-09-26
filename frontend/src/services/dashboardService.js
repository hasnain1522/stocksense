import { AlertTriangle, ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, Package } from 'lucide-react'
import { api } from './api'

export async function getDashboard() {
  const data = await api('/dashboard')
  const fmt = value => new Intl.NumberFormat().format(value)
  const metrics = [
    { label: 'Total products in stock', value: fmt(data.totalProductsInStock), detail: 'Active products with available stock', trend: 'Live', Icon: Package },
    { label: 'Low / out of stock', value: fmt(data.lowStockCount), detail: 'Needs your attention', trend: `${data.outOfStockCount} out`, Icon: AlertTriangle },
    { label: 'Pending receipts', value: fmt(data.pendingReceipts), detail: 'Awaiting validation', trend: 'Open', Icon: ArrowDownToLine },
    { label: 'Pending deliveries', value: fmt(data.pendingDeliveries), detail: 'Awaiting validation', trend: 'Open', Icon: ArrowUpFromLine },
    { label: 'Transfers scheduled', value: fmt(data.scheduledTransfers), detail: 'Awaiting validation', trend: 'Open', Icon: ArrowLeftRight },
  ]
  const tracked = Math.max(data.totalProductsInStock, 1)
  const healthy = Math.max(0, data.totalProductsInStock - data.lowStockCount)
  const healthyPct = Math.round(healthy / tracked * 100)
  const lowPct = Math.round((data.lowStockCount - data.outOfStockCount) / tracked * 100)
  const outPct = Math.max(0, 100 - healthyPct - lowPct)
  return {
    metrics,
    stock: { total: data.totalProductsInStock, healthyPct, lowPct, outPct, healthy },
    alerts: data.lowStockProducts.map(p => ({ product: p.name, sku: p.sku, stock: p.stock, reorder: p.reorder_level })),
    options: { locations: [...new Set(data.stockByLocation.map(x => x.warehouse))], categories: [] },
    operations: data.recentOperations.map(op => ({ reference: op.reference, type: ({ RECEIPT: 'Receipts', DELIVERY: 'Delivery', TRANSFER: 'Internal', ADJUSTMENT: 'Adjustments' })[op.type] || op.type, product: op.product_names || '—', quantity: op.total_quantity ?? '—', location: op.location_names || '—', status: op.status === 'DONE' ? 'Done' : op.status === 'CANCELED' ? 'Canceled' : op.status === 'READY' ? 'Ready' : 'Draft', date: new Date(`${op.created_at.replace(' ', 'T')}Z`).toLocaleString(), category: '—' })),
  }
}
