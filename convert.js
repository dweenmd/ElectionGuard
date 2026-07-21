const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'UI design');
const appDir = path.join(__dirname, 'frontend', 'src', 'app');

const mappings = {
  '_1': 'dashboard/candidate',
  '_2': 'vote',
  '_3': 'results',
  '_4': 'admin',
  '_5': 'portal/upload',
  '_6': 'admin-2', // assuming duplicate or variation of admin
  '_7': 'portal/verify',
  '_9': 'profile'
};

function htmlToJsx(html) {
  let jsx = html;
  
  // Basic replacements
  jsx = jsx.replace(/class=/g, 'className=');
  jsx = jsx.replace(/for=/g, 'htmlFor=');
  jsx = jsx.replace(/<!--[\s\S]*?-->/g, ''); // Remove HTML comments
  
  // Close unclosed tags
  jsx = jsx.replace(/<(input|img|br|hr|meta|link)([^>]*?)(?<!\/)>/gi, '<$1$2 />');
  
  // Simple style string to object converter for common cases (very naive)
  jsx = jsx.replace(/style="([^"]*)"/g, (match, p1) => {
    return `style={{}}`; // Just strip inline styles for now to avoid compilation errors, they are minimal in Tailwind anyway
  });

  return jsx;
}

for (const [folder, route] of Object.entries(mappings)) {
  const htmlPath = path.join(uiDir, folder, 'code.html');
  if (fs.existsSync(htmlPath)) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    // Extract everything inside body
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : '';
    
    // Convert to JSX
    const jsxContent = htmlToJsx(bodyContent);
    
    // Create route directory
    const routeDir = path.join(appDir, route);
    fs.mkdirSync(routeDir, { recursive: true });
    
    // Write page.tsx
    const componentName = route.replace(/[^a-zA-Z0-9]/g, '_').replace(/_(.)/g, (_, c) => c.toUpperCase());
    const upperCompName = componentName.charAt(0).toUpperCase() + componentName.slice(1) + 'Page';
    
    const pageCode = `export default function ${upperCompName}() {
  return (
    <div className="w-full min-h-screen">
      {/* Auto-converted from ${folder}/code.html */}
      ${jsxContent}
    </div>
  );
}`;
    
    fs.writeFileSync(path.join(routeDir, 'page.tsx'), pageCode);
    console.log(`Converted ${folder} to /${route}/page.tsx`);
  }
}
