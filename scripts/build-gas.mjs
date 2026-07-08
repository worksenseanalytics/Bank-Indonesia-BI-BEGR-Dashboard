import fs from 'fs';
import path from 'path';

const DIST_GAS = './dist-gas';

try {
  // 1. Ensure dist-gas directory exists
  if (!fs.existsSync(DIST_GAS)) {
    fs.mkdirSync(DIST_GAS, { recursive: true });
  }

  // 2. Copy Code.gs
  if (fs.existsSync('./gas-src/Code.gs')) {
    fs.copyFileSync('./gas-src/Code.gs', path.join(DIST_GAS, 'Code.gs'));
    console.log('✓ Code.gs copied to dist-gas/');
  } else {
    console.error('✗ Code.gs not found in gas-src/');
  }

  // 3. Copy setup.gs
  if (fs.existsSync('./gas-src/setup.gs')) {
    fs.copyFileSync('./gas-src/setup.gs', path.join(DIST_GAS, 'setup.gs'));
    console.log('✓ setup.gs copied to dist-gas/');
  } else {
    console.error('✗ setup.gs not found in gas-src/');
  }

  // 4. Copy Dashboard-for-Spreadsheet.html
  if (fs.existsSync('./Dashboard-for-Spreadsheet.html')) {
    fs.copyFileSync('./Dashboard-for-Spreadsheet.html', path.join(DIST_GAS, 'Dashboard-for-Spreadsheet.html'));
    console.log('✓ Dashboard-for-Spreadsheet.html copied to dist-gas/');
  } else {
    console.error('✗ Dashboard-for-Spreadsheet.html not found in root. Run production build first.');
  }

  // 5. Write appsscript.json manifest
  const appsscriptJson = {
    "timeZone": "Asia/Jakarta",
    "dependencies": {
      "enabledAdvancedServices": [
        {
          "userSymbol": "Sheets",
          "serviceId": "sheets",
          "version": "v4"
        }
      ]
    },
    "webapp": {
      "access": "ANYONE",
      "executeAs": "USER_DEPLOYING"
    },
    "exceptionLogging": "STACKDRIVER",
    "runtimeVersion": "V8"
  };

  fs.writeFileSync(
    path.join(DIST_GAS, 'appsscript.json'),
    JSON.stringify(appsscriptJson, null, 2),
    'utf8'
  );
  console.log('✓ appsscript.json created in dist-gas/');
  console.log('\n✓ GAS Build completed successfully inside /dist-gas');

} catch (err) {
  console.error('✗ Build GAS failed:', err.message);
  process.exit(1);
}
