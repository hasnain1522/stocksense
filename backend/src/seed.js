import { db, transaction } from './db.js'

transaction(() => {
  if (db.prepare('SELECT COUNT(*) n FROM products').get().n) { console.log('Database already contains products; seed skipped.'); return }
  const category = db.prepare('INSERT INTO categories(name) VALUES(?)')
  const categoryIds = ['Metals','Hardware','Packaging'].map(n=>category.run(n).lastInsertRowid)
  const warehouse=db.prepare('INSERT INTO warehouses(name,code) VALUES(?,?)').run('Main Warehouse','MAIN').lastInsertRowid
  const location=db.prepare('INSERT INTO locations(warehouse_id,name,code) VALUES(?,?,?)')
  const store=location.run(warehouse,'Main Store','MAIN-STORE').lastInsertRowid
  const rack=location.run(warehouse,'Production Rack','PROD-RACK').lastInsertRowid
  const product=db.prepare('INSERT INTO products(name,sku,category_id,uom,reorder_level) VALUES(?,?,?,?,?)')
  const products=[product.run('Steel Coil','STL-001',categoryIds[0],'kg',25).lastInsertRowid,product.run('Hex Bolts M8','HRD-008',categoryIds[1],'units',100).lastInsertRowid,product.run('Shipping Carton','PKG-020',categoryIds[2],'units',40).lastInsertRowid]
  const balance=db.prepare('INSERT INTO stock_balances(product_id,location_id,quantity) VALUES(?,?,?)')
  balance.run(products[0],store,80);balance.run(products[0],rack,20);balance.run(products[1],store,240);balance.run(products[2],rack,18)
  db.prepare('INSERT INTO reorder_rules(product_id,location_id,minimum_quantity,preferred_quantity) VALUES(?,?,?,?)').run(products[0],store,25,100)
  const op=db.prepare("INSERT INTO operations(reference,type,status,supplier_customer,destination_location_id,validated_at) VALUES(?,?,'DONE',?, ?,CURRENT_TIMESTAMP)")
  const hist=op.run('RCV-SEED-001','RECEIPT','Demo Metals Ltd',store).lastInsertRowid
  db.prepare('INSERT INTO operation_lines(operation_id,product_id,quantity,destination_location_id) VALUES(?,?,?,?)').run(hist,products[0],80,store)
  db.prepare('INSERT INTO stock_ledger(operation_id,operation_type,reference,product_id,quantity_delta,destination_location_id,previous_quantity,resulting_quantity) VALUES(?,?,?,?,?,?,?,?)').run(hist,'RECEIPT','RCV-SEED-001',products[0],80,store,0,80)
})
console.log('Development seed data created.')
