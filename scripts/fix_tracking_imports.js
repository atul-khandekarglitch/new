const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'app', 'tracking', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  /ArrowRight\r?\n\} from "lucide-react";/,
  `ArrowRight,
  Building2
} from "lucide-react";`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Added Building2 to imports in tracking page');
