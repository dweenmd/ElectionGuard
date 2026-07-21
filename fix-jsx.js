const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'frontend', 'src', 'app'), function(filePath) {
  if (filePath.endsWith('.tsx') && filePath !== path.join(__dirname, 'frontend', 'src', 'app', 'layout.tsx') && !filePath.includes('portal\\layout.tsx') && !filePath.includes('portal/layout.tsx') && !filePath.includes('portal\\page.tsx') && !filePath.includes('portal/page.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove all <script>...</script> blocks
    const newContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '{/* Inline script removed */}');
    
    // Remove inline event handlers like onclick="..."
    const noEvents = newContent.replace(/ on[a-z]+="[^"]*"/gi, '');
    
    // Fix class= to className= just in case
    const noClass = noEvents.replace(/ class=/g, ' className=');
    
    if (content !== noClass) {
      fs.writeFileSync(filePath, noClass);
      console.log(`Fixed scripts in ${filePath}`);
    }
  }
});
