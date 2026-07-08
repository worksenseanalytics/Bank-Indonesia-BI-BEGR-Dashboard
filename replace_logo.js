import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFiles = [
  path.resolve(__dirname, 'Dashboard-for-Spreadsheet.html'),
  path.resolve(__dirname, 'Dashboard-for-Spreadsheet.txt'),
  path.resolve(__dirname, 'dist-gas/Dashboard-for-Spreadsheet.html')
];

const oldUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Bankindonesialogo.svg';
const newUrl = 'https://drive.google.com/uc?export=view&id=1XHz_8e4uXzD2ypOQCFgEwrqF9mIcwNQO';

targetFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Processing file: ${filePath}`);
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(oldUrl)) {
      const occurrences = content.split(oldUrl).length - 1;
      content = content.split(oldUrl).join(newUrl);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Replaced ${occurrences} occurrences in ${path.basename(filePath)}`);
    } else {
      console.log(`- Old URL not found in ${path.basename(filePath)}`);
    }
  } else {
    console.log(`✗ File not found: ${filePath}`);
  }
});

