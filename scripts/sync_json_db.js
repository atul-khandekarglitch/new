// scripts/sync_json_db.js
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
const dbJsonPath = path.join(__dirname, '..', 'data', 'connector_db.json');

// Extract INITIAL_DATA from db.ts using regex or eval safely
// Since db.ts is TS, let's extract the objects or let's create a clean sync:
if (fs.existsSync(dbJsonPath)) {
  const jsonDb = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'));
  
  // Read db.ts and extract seedSupplierInvoices JSON if needed, or simply delete connector_db.json so that db.ts regenerates it with fresh INITIAL_DATA!
  // Wait, if we remove connector_db.json, getDatabase() will write INITIAL_DATA into connector_db.json automatically!
  // But wait, does connector_db.json have anything crucial? Let's check!
  console.log('Orders in json:', jsonDb.orders ? jsonDb.orders.length : 0);
  console.log('Invoices in json:', jsonDb.invoices ? jsonDb.invoices.length : 0);
  console.log('Listings in json:', jsonDb.listings ? jsonDb.listings.length : 0);
}
