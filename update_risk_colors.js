const fs = require('fs');

// 1. Update risk-statistics.tsx
const statsFile = 'src/components/risk-analysis/risk-statistics.tsx';
if (fs.existsSync(statsFile)) {
  let content = fs.readFileSync(statsFile, 'utf8');
  content = content.replace(/text-cyan-400/g, 'text-primary');
  content = content.replace(/bg-cyan-500\/15 border-cyan-500\/25/g, 'bg-primary/15 border-primary/25');
  content = content.replace(/bg-cyan-500/g, 'bg-primary');
  
  // Replace accent in Avg Risk Score icon to primary
  content = content.replace(/iconColor: 'text-accent'/g, "iconColor: 'text-primary'");
  content = content.replace(/iconBg: 'bg-accent\\/15 border-accent\\/25'/g, "iconBg: 'bg-primary/15 border-primary/25'");
  
  fs.writeFileSync(statsFile, content);
  console.log('Updated ' + statsFile);
}

// 2. Update risk-distribution.tsx
const distFile = 'src/components/risk-analysis/risk-distribution.tsx';
if (fs.existsSync(distFile)) {
  let content = fs.readFileSync(distFile, 'utf8');
  content = content.replace(/bg-emerald-500\/15 border border-emerald-500\/25/g, 'bg-primary/15 border border-primary/25');
  content = content.replace(/text-emerald-400/g, 'text-primary');
  
  content = content.replace(/bg-emerald-500 inline-block/g, 'bg-secondary inline-block'); // Risk Level generic
  content = content.replace(/bg-cyan-500 inline-block/g, 'bg-primary inline-block'); // Vulnerabilities generic
  
  content = content.replace(/#10b981/g, '#00e676'); // Medium -> neon green
  content = content.replace(/#06b6d4/g, '#00e5ff'); // Low -> cyan
  
  // CustomTooltip uses 'rgba(16,185,129,0.05)'
  content = content.replace(/rgba\(16,185,129,0.05\)/g, 'rgba(0,229,255,0.05)');
  
  fs.writeFileSync(distFile, content);
  console.log('Updated ' + distFile);
}
