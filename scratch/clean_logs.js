const fs = require('fs');
const path = require('path');

const dbFile = path.join(__dirname, '..', '.data', 'db.json');

if (fs.existsSync(dbFile)) {
  const data = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  
  if (data.securityLogs) {
    const beforeCount = data.securityLogs.length;
    data.securityLogs = data.securityLogs.filter(
      (l) => !l.path.includes('/api/admin/log-security') && !l.path.includes('/api/admin')
    );
    console.log(`Cleaned security logs: from ${beforeCount} to ${data.securityLogs.length}`);
  }
  
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
}
