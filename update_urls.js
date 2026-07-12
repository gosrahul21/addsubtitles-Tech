const fs = require('fs');

const files = [
  "src/app/page.tsx",
  "src/app/tools/page.tsx",
  "src/app/payment/success/page.tsx",
  "src/app/blog/silent-view-secret/page.tsx",
  "src/app/tools/youtube-transcript-generator/page.tsx"
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  content = content.replace(/href="\/editor"/g, `href={AppConfig.EDITOR_URL}`);
  content = content.replace(/router\.push\('\/editor'\)/g, `router.push(AppConfig.EDITOR_URL)`);
  
  if (original !== content) {
    // We made a change, so we need to add the import.
    const importStmt = `import { AppConfig } from "@/config/appConfig";\n`;
    if (content.startsWith(`"use client";`)) {
      content = content.replace(`"use client";`, `"use client";\n${importStmt}`);
    } else if (content.startsWith(`'use client';`)) {
      content = content.replace(`'use client';`, `'use client';\n${importStmt}`);
    } else if (content.startsWith(`"use client"`)) {
      content = content.replace(`"use client"`, `"use client"\n${importStmt}`);
    } else if (content.startsWith(`'use client'`)) {
      content = content.replace(`'use client'`, `'use client'\n${importStmt}`);
    } else {
      content = importStmt + content;
    }
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}

// Update urls.ts
const urlsPath = 'src/config/urls.ts';
fs.writeFileSync(urlsPath, `import { AppConfig } from './appConfig';\n\nexport const getEditorUrl = (toolSlug?: string): string => {\n  if (toolSlug === 'remove-silences-online') {\n    return \`\${AppConfig.EDITOR_URL}?subtitles=false&removeSilences=true\`;\n  }\n  return AppConfig.EDITOR_URL;\n};\n`);
console.log('Updated src/config/urls.ts');
