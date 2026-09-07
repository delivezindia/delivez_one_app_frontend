const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, file.name);
    if (file.isDirectory()) {
      if (file.name !== 'node_modules' && file.name !== '.git') searchDir(full);
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.js')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('30 minutes') || (content.includes('scheduledAt') && content.includes('must be'))) {
        console.log('Found in:', full);
        content.split('\n').forEach((line, idx) => {
          if (line.includes('30 minutes') || (line.includes('scheduledAt') && line.includes('must be'))) {
            console.log('  Line ' + (idx + 1) + ': ' + line.trim());
          }
        });
      }
    }
  }
}

searchDir('C:\\Users\\Rax\\Desktop\\Delivery_app_site_backend\\src');
