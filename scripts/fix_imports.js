const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
let content = fs.readFileSync(dbPath, 'utf-8');

content = content.replace(
  /IndustrialCluster\r?\n\}\s*IndustrialCluster,\r?\n\s*SupplierInvoice,/,
  `IndustrialCluster,
  SupplierInvoice,`
);

fs.writeFileSync(dbPath, content, 'utf-8');
console.log('Fixed imports in db.ts');
