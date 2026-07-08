import fs from 'fs';
import path from 'path';

const distHtmlPath = path.resolve('dist/index.html');
const destHtmlPath = path.resolve('Dashboard-for-Spreadsheet.html');
const destTxtPath = path.resolve('Dashboard-for-Spreadsheet.txt');

try {
  console.log('Running cross-platform postbuild script...');
  
  if (!fs.existsSync(distHtmlPath)) {
    console.error(`Error: build output file not found at ${distHtmlPath}`);
    process.exit(1);
  }

  // 1. Read dist/index.html
  let htmlContent = fs.readFileSync(distHtmlPath, 'utf8');

  // 2. Remove " crossorigin" attributes (with or without values)
  // Vite generates <script type="module" crossorigin src="..."></script>
  // or <link rel="stylesheet" crossorigin href="...">
  const modifiedContent = htmlContent.replace(/ crossorigin(="[^"]*")?/g, '');
  fs.writeFileSync(distHtmlPath, modifiedContent, 'utf8');
  console.log('Successfully stripped "crossorigin" attributes from dist/index.html');

  // 3. Copy to root destination files
  fs.copyFileSync(distHtmlPath, destHtmlPath);
  console.log(`Successfully copied to ${destHtmlPath}`);
  
  fs.copyFileSync(distHtmlPath, destTxtPath);
  console.log(`Successfully copied to ${destTxtPath}`);

  console.log('Postbuild process completed successfully.');
} catch (error) {
  console.error('Postbuild script failed:', error);
  process.exit(1);
}
