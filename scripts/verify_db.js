// scripts/verify_db.js
const fs = require('fs');
const path = require('path');

// Compile check or run through ts-node or just inspect db.ts directly
const dbPath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
const content = fs.readFileSync(dbPath, 'utf-8');

console.log('db.ts size:', content.length);
console.log('Includes supplierInvoices:', content.includes('supplierInvoices'));
console.log('Includes sinv_scenario_a_precision:', content.includes('sinv_scenario_a_precision'));
console.log('Includes ship_9905_chennai_pune:', content.includes('ship_9905_chennai_pune'));
console.log('Includes comp_bharat_tooling:', content.includes('comp_bharat_tooling'));

// Update data/connector_db.json if it exists to include the new supplierInvoices
const dbJsonPath = path.join(__dirname, '..', 'data', 'connector_db.json');
if (fs.existsSync(dbJsonPath)) {
  const jsonContent = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'));
  console.log('Existing json companies:', jsonContent.companies.length);
  console.log('Existing json shipments:', jsonContent.shipments.length);
}
