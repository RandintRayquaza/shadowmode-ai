const fs = require('fs');
const path = require('path');

const filePaths = [
  'HistoryPage.jsx',
  'SettingsPage.jsx'
].map(file => path.join('c:/Users/kashish/OneDrive/Desktop/shadowmode/frontend/src/features', file.includes('History') ? 'history' : 'settings', 'ui', file));

const replacements = [
  // text-white variations
  { regex: /text-white\/40/g, replacement: 'text-muted-foreground' },
  { regex: /text-white\/30/g, replacement: 'text-muted-foreground' },
  { regex: /text-white\/20/g, replacement: 'text-muted-foreground/60' },
  { regex: /text-white\/10/g, replacement: 'text-muted-foreground/40' },
  { regex: /text-white\b/g, replacement: 'text-foreground' },
  
  // text-black variations (if any)
  { regex: /text-black\/40/g, replacement: 'text-muted-foreground' },
  { regex: /text-black\/30/g, replacement: 'text-muted-foreground' },
  { regex: /text-black\/20/g, replacement: 'text-muted-foreground/60' },
  { regex: /text-black\/10/g, replacement: 'text-muted-foreground/40' },
  
  // bg-white variations
  { regex: /bg-white\/\.?0?[2345]/g, replacement: 'bg-card' },
  { regex: /bg-white\/10/g, replacement: 'bg-muted/50' },
  { regex: /bg-white\/15/g, replacement: 'bg-muted/70' },
  { regex: /bg-white\/20/g, replacement: 'bg-muted' },
  
  // border-white variations
  { regex: /border-white\/\.?0?[2345]/g, replacement: 'border-border' },
  { regex: /border-white\/10/g, replacement: 'border-border/60' },
  { regex: /border-white\/15/g, replacement: 'border-border/80' },
  { regex: /border-white\/20/g, replacement: 'border-border' },
  
  { regex: /text-emerald-400/g, replacement: 'text-emerald-500 dark:text-emerald-400' },
  { regex: /text-amber-400/g, replacement: 'text-amber-500 dark:text-amber-400' },
  { regex: /text-red-400/g, replacement: 'text-red-500 dark:text-red-400' },
  { regex: /text-blue-400/g, replacement: 'text-blue-500 dark:text-blue-400' },
  { regex: /text-orange-400/g, replacement: 'text-orange-500 dark:text-orange-400' }
];

filePaths.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(r => {
      content = content.replace(r.regex, r.replacement);
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  } else {
    console.warn('File not found', filePath);
  }
});
