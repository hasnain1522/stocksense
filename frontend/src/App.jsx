import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, Bell, Boxes, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardList, LayoutDashboard, MapPin, Menu, Package, Plus, Search, SlidersHorizontal, UserRound, Warehouse, X } from 'lucide-react'
import { getDashboard } from './services/dashboardService'
import './App.css'

const nav = [
  { label: 'Dashboard', path: '/dashboard', Icon: LayoutDashboard },
  { label: 'Products', path: '/products', Icon: Package },
]
const operations = [
  ['Receipts', '/operations/receipts', ArrowDownToLine], ['Delivery Orders', '/operations/deliveries', ArrowUpFromLine],
  ['Internal Transfers', '/operations/transfers', ArrowLeftRight], ['Inventory Adjustments', '/operations/adjustments', SlidersHorizontal], ['Move History', '/operations/history', Activity],
]
const routeNames = Object.fromEntries([...nav.map(x => [x.path, x.label]), ...operations.map(x => [x[1], x[0]]), ['/settings/warehouse', 'Warehouse'], ['/profile', 'My Profile']])

function usePath() {
  const [path, setPath] = useState(window.location.pathname || '/dashboard')
  useEffect(() => { const onPop = () => setPath(window.location.pathname); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, [])
  const go = (to) => { window.history.pushState({}, '', to); setPath(to); window.scrollTo(0, 0) }
  return [path, go]
}

function App() {
  const [path, go] = usePath()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ type: '', status: '', location: '', category: '' })
  const [data, setData] = useState(null)
  useEffect(() => { getDashboard().then(setData) }, [])
  const title = routeNames[path] || 'Dashboard'
  const visibleOps = useMemo(() => (data?.operations || []).filter(row => {
    const matchQuery = !query || Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase())
    return matchQuery && (!filters.type || row.type === filters.type) && (!filters.status || row.status === filters.status) && (!filters.location || row.location === filters.location) && (!filters.category || row.category === filters.category)
  }), [data, filters, query])
  const navigate = (to) => { go(to); setMobileOpen(false) }
  const isDashboard = path === '/' || path === '/dashboard'

  return <div className="app-shell">
    {mobileOpen && <button className="scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Boxes size={19} /></span><span className="brand-name">Stock<span>Sense</span></span><button className="icon-button collapse-button" aria-label={mobileOpen ? 'Close navigation' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => { if (mobileOpen) setMobileOpen(false); else setCollapsed(!collapsed) }}>{mobileOpen ? <X size={17}/> : collapsed ? <Menu size={17}/> : <ChevronLeft size={17}/>}</button></div>
      <div className="workspace"><div className="workspace-icon"><Warehouse size={16}/></div><div className="workspace-copy"><strong>Northstar Supply</strong><small>Workspace</small></div><ChevronDown size={15}/></div>
      <nav aria-label="Main navigation">
        <div className="nav-caption">WORKSPACE</div>
        {nav.map(({label,path:to,Icon}) => <NavLink key={to} {...{label,to,Icon,path, navigate}} />)}
        <div className="nav-caption operations-caption">OPERATIONS</div>
        {operations.map(([label,to,Icon]) => <NavLink key={to} {...{label,to,Icon,path,navigate}} />)}
        <div className="nav-caption settings-caption">PREFERENCES</div>
        <NavLink label="Warehouse" to="/settings/warehouse" Icon={Warehouse} {...{path,navigate}} />
        <NavLink label="My Profile" to="/profile" Icon={UserRound} {...{path,navigate}} />
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-icon"><CircleHelp size={16}/></span><div><strong>Need a hand?</strong><small>Visit our help center</small></div><ChevronRight size={14}/></div><div className="user-mini"><div className="avatar">JD</div><div className="user-copy"><strong>Jordan Davis</strong><small>Inventory manager</small></div><button className="icon-button" aria-label="Profile menu" onClick={() => navigate('/profile')}><ChevronDown size={16}/></button></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20}/></button><div className="breadcrumbs"><span>StockSense</span><ChevronRight size={14}/><strong>{title}</strong></div></div><div className="topbar-actions"><button className="global-search" onClick={() => document.getElementById('dashboard-search')?.focus()}><Search size={16}/><span>Search anything...</span><kbd>⌘ K</kbd></button><button className="icon-button notification" aria-label="Notifications"><Bell size={18}/><i/></button><div className="top-avatar">JD</div></div></header>
      {isDashboard ? <Dashboard data={data} operations={visibleOps} query={query} setQuery={setQuery} filters={filters} setFilters={setFilters} filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen}/> : <Placeholder title={title} path={path} />}
      <footer className="footer"><span>© 2025 StockSense</span><span><span className="online-dot"/> All systems operational</span><span>Help center <ChevronRight size={12}/></span></footer>
    </main>
  </div>
}

function NavLink({ label, to, Icon, path, navigate }) { return <a href={to} className={`nav-link ${(path === to || (to === '/dashboard' && path === '/')) ? 'active' : ''}`} onClick={e => { e.preventDefault(); navigate(to) }}><Icon size={17}/><span>{label}</span></a> }

function Dashboard({ data, operations, query, setQuery, filters, setFilters, filtersOpen, setFiltersOpen }) {
  const [period, setPeriod] = useState('Last 30 days')
  const clear = () => { setFilters({type:'',status:'',location:'',category:''}); setQuery('') }
  const update = (key, value) => setFilters(old => ({...old, [key]: value}))
  const selects = [
    ['type', 'All document types', ['Receipts','Delivery','Internal','Adjustments']], ['status','All statuses',['Draft','Waiting','Ready','Done','Canceled']],
    ['location','All locations',data?.options.locations || []], ['category','All categories',data?.options.categories || []],
  ]
  return <div className="content dashboard-content">
    <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> INVENTORY MANAGEMENT</div><h1>Inventory overview</h1><p className="page-subtitle">A clear view of your stock and operations.</p></div><div className="heading-actions"><button className="button button-secondary" onClick={() => setPeriod(period === 'Last 30 days' ? 'Last 7 days' : period === 'Last 7 days' ? 'Today' : 'Last 30 days')}><ChevronDown size={15}/>{period}</button><button className="button button-primary"><Plus size={16}/> New operation</button></div></div>
    <div className="demo-note"><span className="demo-pulse"/> Preview environment <span className="note-divider">·</span> Showing sample data for layout preview</div>
    <section className="kpi-grid" aria-label="Inventory key metrics">{(data?.metrics || []).map((item, index) => <article className="kpi-card" key={item.label}><div className="kpi-top"><span className={`kpi-icon tone-${index}`}><item.Icon size={18}/></span><span className={`trend ${item.trend.startsWith('+') ? 'positive' : item.trend.startsWith('-') ? 'negative' : 'neutral'}`}>{item.trend}</span></div><div className="kpi-value">{item.value}</div><div className="kpi-label">{item.label}</div><div className="kpi-foot"><span>{item.detail}</span></div></article>)}</section>
    <section className="panel filter-panel"><div className="panel-heading filter-heading"><div><div className="section-title"><SlidersHorizontal size={16}/><h2>Filter operations</h2><span className="filter-count">{Object.values(filters).filter(Boolean).length + (query ? 1 : 0)}</span></div><p>Refine your dashboard data</p></div><button className="text-button" onClick={() => setFiltersOpen(!filtersOpen)}>{filtersOpen ? 'Hide filters' : 'Show filters'}<ChevronDown className={filtersOpen ? 'rotate' : ''} size={15}/></button></div>
      {filtersOpen && <div className="filter-controls"><label className="search-control"><Search size={16}/><input id="dashboard-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search references, products..."/><kbd>/</kbd></label>{selects.map(([key,label,options])=><label className="select-control" key={key}><span className="sr-only">{label}</span><select value={filters[key]} onChange={e => update(key,e.target.value)}><option value="">{label}</option>{options.map(o=><option key={o}>{o}</option>)}</select><ChevronDown size={14}/></label>)}<button className="clear-button" onClick={clear}><X size={14}/> Clear</button></div>}</section>
    <div className="dashboard-grid"><section className="panel stock-panel"><div className="panel-heading"><div><h2>Stock overview</h2><p>Current stock health across your warehouse</p></div><button className="icon-button panel-menu" aria-label="Stock overview options">···</button></div>{data ? <><div className="stock-summary"><div><strong>{data.stock.total}</strong><span>Total tracked products</span></div><div className="stock-legend"><span><i className="legend-dot healthy"/>Healthy <b>{data.stock.healthyPct}%</b></span><span><i className="legend-dot low"/>Low stock <b>{data.stock.lowPct}%</b></span><span><i className="legend-dot out"/>Out of stock <b>{data.stock.outPct}%</b></span></div></div><div className="stacked-bar" role="img" aria-label={`${data.stock.healthyPct}% healthy, ${data.stock.lowPct}% low stock, ${data.stock.outPct}% out of stock`}><span className="bar-healthy" style={{width:`${data.stock.healthyPct}%`}}/><span className="bar-low" style={{width:`${data.stock.lowPct}%`}}/><span className="bar-out" style={{width:`${data.stock.outPct}%`}}/></div><div className="stock-foot"><span><Check size={14}/>{data.stock.healthy} products at healthy levels</span><span>Updated just now</span></div></> : <Loading />}</section>
      <section className="panel alerts-panel"><div className="panel-heading"><div><div className="title-with-count"><h2>Low stock alerts</h2><span className="alert-count">{data?.alerts.length ?? '—'}</span></div><p>Products that need attention</p></div><button className="text-button">View all<ChevronRight size={14}/></button></div>{data?.alerts.length ? <div className="alert-list">{data.alerts.slice(0,3).map(item=><div className="alert-row" key={item.sku}><span className="product-thumb"><Package size={17}/></span><div className="alert-product"><strong>{item.product}</strong><small>{item.sku}</small></div><div className="alert-stock"><strong>{item.stock}</strong><small>of {item.reorder} reorder</small></div><span className={`stock-status ${item.stock === 0 ? 'out-status' : ''}`}>{item.stock === 0 ? 'Out' : 'Low'}</span></div>)}</div> : <div className="empty-state"><span className="empty-icon"><Check size={18}/></span><strong>All caught up</strong><span>No products need attention right now.</span></div>}</section></div>
    <section className="panel operations-panel"><div className="panel-heading operations-heading"><div><h2>Recent operations</h2><p>Track the latest inventory movements</p></div><button className="button button-secondary compact">View all operations<ChevronRight size={15}/></button></div><div className="table-wrap"><table><thead><tr><th>REFERENCE</th><th>OPERATION TYPE</th><th>PRODUCT</th><th>QUANTITY</th><th>LOCATION</th><th>STATUS</th><th>DATE</th></tr></thead><tbody>{operations.length ? operations.slice(0,5).map(row=><tr key={row.reference}><td><strong className="reference">{row.reference}</strong></td><td><span className="type-cell"><span className={`type-icon ${row.type.toLowerCase()}`}>{row.type === 'Receipts' ? <ArrowDownToLine size={14}/> : row.type === 'Delivery' ? <ArrowUpFromLine size={14}/> : <ArrowLeftRight size={14}/>}</span>{row.type}</span></td><td><strong className="product-cell">{row.product}</strong></td><td className="quantity">{row.quantity}</td><td><span className="location-cell"><MapPin size={13}/>{row.location}</span></td><td><span className={`status-pill ${row.status.toLowerCase()}`}><i/>{row.status}</span></td><td className="date-cell">{row.date}</td></tr>) : <tr><td colSpan="7"><div className="table-empty"><Search size={17}/>No operations match these filters.<button onClick={clear}>Clear filters</button></div></td></tr>}</tbody></table></div><div className="table-bottom"><span>Showing <strong>{Math.min(operations.length,5)}</strong> of <strong>{operations.length}</strong> operations</span><div className="pagination"><button aria-label="Previous page" disabled><ChevronLeft size={15}/></button><button className="current-page">1</button><button aria-label="Next page" disabled><ChevronRight size={15}/></button></div></div></section>
  </div>
}

function Loading() { return <div className="loading-state"><span className="spinner"/>Loading dashboard preview…</div> }
function Placeholder({ title, path }) { const Icon = path.includes('warehouse') ? Warehouse : path === '/profile' ? UserRound : path.includes('products') ? Package : ClipboardList; return <div className="content placeholder-content"><div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/> STOCKSENSE WORKSPACE</div><h1>{title}</h1><p className="page-subtitle">Your {title.toLowerCase()} workspace.</p></div></div><section className="panel placeholder-card"><span className="placeholder-icon"><Icon size={22}/></span><h2>{title} is ready to take shape</h2><p>This page is part of your StockSense workspace. Its tools and data will appear here as the application grows.</p><span className="coming-soon"><span/> Workspace foundation</span></section></div> }

export default App
