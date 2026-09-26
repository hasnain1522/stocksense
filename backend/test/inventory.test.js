import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

test('receipt, transfer, delivery, adjustment and ledger are atomic and persistent', async t => {
  const temp = mkdtempSync(join(tmpdir(), 'stocksense-'))
  const port = 3219
  const launch = () => spawn(process.execPath, ['src/server.js'], { cwd: resolve('.'), env: { ...process.env, PORT: String(port), DB_PATH: join(temp, 'inventory.sqlite') }, stdio: 'ignore' })
  let child = launch()
  t.after(async () => { if (child.exitCode === null) { child.kill(); await new Promise(resolveClose => child.once('close', resolveClose)) } rmSync(temp, { recursive: true, force: true }) })
  const base = `http://127.0.0.1:${port}/api`
  let ready = false
  for (let i=0; i<60; i++) { try { if ((await fetch(`${base}/health`)).ok) { ready=true; break } } catch {} await new Promise(r=>setTimeout(r,150)) }
  assert.equal(ready, true, 'API starts')
  const request = async (path, method='GET', body, authToken) => {
    const response = await fetch(`${base}${path}`, { method, headers: { ...(body ? { 'content-type':'application/json' } : {}), ...(authToken ? { authorization:`Bearer ${authToken}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
    return { status:response.status, ...(await response.json()) }
  }
  const account = await request('/auth/signup','POST',{name:'Mohammed Hasnain',email:'hasnain@example.test',password:'stockpass123'})
  assert.equal(account.status,201)
  assert.equal(account.data.user.name,'Mohammed Hasnain')
  const me = await fetch(`${base}/auth/me`,{headers:{Authorization:`Bearer ${account.data.token}`}})
  assert.equal((await me.json()).data.user.email,'hasnain@example.test')
  assert.equal((await request('/auth/login','POST',{email:'hasnain@example.test',password:'badpassword'})).status,401)
  const reset = await request('/auth/request-password-reset','POST',{email:'hasnain@example.test'})
  assert.match(reset.data.devOtp,/^[0-9]{6}$/)
  assert.equal((await request('/auth/verify-otp','POST',{email:'hasnain@example.test',otp:reset.data.devOtp})).data.verified,true)
  assert.equal((await request('/auth/reset-password','POST',{email:'hasnain@example.test',otp:reset.data.devOtp,password:'newstockpass123'})).data.reset,true)
  const login=await request('/auth/login','POST',{email:'hasnain@example.test',password:'newstockpass123'})
  assert.equal(login.status,200)
  assert.equal((await request('/auth/logout','POST',{},login.data.token)).data.loggedOut,true)
  assert.equal((await request('/auth/me','GET',undefined,login.data.token)).status,401)
  const category=(await request('/categories','POST',{name:'Metals'})).data
  const warehouse=(await request('/warehouses','POST',{name:'Test Warehouse',code:'TEST'})).data
  const main=(await request('/locations','POST',{warehouse_id:warehouse.id,name:'Main Store',code:'MAIN'})).data
  const rack=(await request('/locations','POST',{warehouse_id:warehouse.id,name:'Production Rack',code:'RACK'})).data
  const product=(await request('/products','POST',{name:'Steel',sku:'STEEL-TEST',category_id:category.id,uom:'kg'})).data
  const receipt=(await request('/receipts','POST',{supplier:'Supplier',destination_location_id:main.id,lines:[{product_id:product.id,quantity:100}]})).data
  assert.equal((await request(`/receipts/${receipt.id}/validate`,'POST')).data.status,'DONE')
  assert.equal((await request(`/receipts/${receipt.id}/validate`,'POST')).status,409)
  const transfer=(await request('/transfers','POST',{source_location_id:main.id,destination_location_id:rack.id,lines:[{product_id:product.id,quantity:30}]})).data
  await request(`/transfers/${transfer.id}/validate`,'POST')
  const delivery=(await request('/deliveries','POST',{customer:'Customer',source_location_id:rack.id,lines:[{product_id:product.id,quantity:20}]})).data
  await request(`/deliveries/${delivery.id}/validate`,'POST')
  const adjustment=(await request('/adjustments','POST',{destination_location_id:rack.id,lines:[{product_id:product.id,counted_quantity:7}]})).data
  await request(`/adjustments/${adjustment.id}/validate`,'POST')
  const stock=(await request(`/products/${product.id}`)).data.stock
  assert.deepEqual(stock.map(s=>s.quantity).sort((a,b)=>a-b),[7,70])
  assert.equal((await request(`/ledger?productId=${product.id}`)).data.length,5)
  const insufficient=(await request('/deliveries','POST',{customer:'Customer',source_location_id:rack.id,lines:[{product_id:product.id,quantity:8}]})).data
  assert.equal((await request(`/deliveries/${insufficient.id}/validate`,'POST')).status,409)
  assert.equal((await request(`/products/${product.id}`)).data.stock.find(s=>s.location_id===rack.id).quantity,7)
  assert.equal((await request('/dashboard')).data.totalProductsInStock,1)
  child.kill()
  await new Promise(resolveClose => child.once('close', resolveClose))
  child = launch()
  ready = false
  for (let i=0; i<60; i++) { try { if ((await fetch(`${base}/health`)).ok) { ready=true; break } } catch {} await new Promise(r=>setTimeout(r,150)) }
  assert.equal(ready,true,'API restarts against the existing database')
  assert.equal((await request(`/products/${product.id}`)).data.stock.find(s=>s.location_id===rack.id).quantity,7)
})
