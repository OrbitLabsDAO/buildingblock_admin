const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Directories to clean
const functionsDir = path.join(__dirname, "functions");
const corenjksDir = path.join(__dirname, "_corenjks");

// Excluded paths (relative to root like 'functions/api/...')
const excludeItems = [
  "_corenjks/htmlinputs/default.njk",
  "_corenjks/htmlinputs/integer.njk",
  "_corenjks/htmlinputs/real.njk",
  "_corenjks/htmlinputs/text.njk",
  "_corenjks/htmlinputs/varchar.njk",
  "_corenjks/htmlinputs/select.njk",
  "_corenjks/htmlinputs/image.njk",
  "_corenjks/js/account-dashboard.js",
  "_corenjks/js/account-settings.js",
  "_corenjks/js/account.js",
  "_corenjks/js/tableAdd.js",
  "_corenjks/js/tableEdit.js",
  "_corenjks/js/tableIndex.js",
  "_corenjks/js/tableView.js",
  "functions/api",
  "functions/api/tables",
  "functions/api/tables/_user.js",
  "functions/api/account-settings.js",
  "functions/api/account.js",
  "functions/api/lookups.js",
  "_corenjks/htmlinputs",
  "_corenjks/js",
  "_corenjks/account-create.njk",
  "_corenjks/account-dashboard.njk",
  "_corenjks/account-login.njk",
  "_corenjks/account-resetpassword.njk",
  "_corenjks/account-settings.njk",
  "_corenjks/account-verify.njk",
  "_corenjks/apiGenerator.njk",
  "_corenjks/indexMain.njk",
  "_corenjks/layout-login.njk",
  "_corenjks/layout.njk",
  "_corenjks/tableAdd.njk",
  "_corenjks/tableEdit.njk",
  "_corenjks/tableIndex.njk",
  "_corenjks/tableView.njk",
  "functions/api/property.js", //you can remove this, this is the demo script
  "functions/api/property_amenities.js", //you can remove this, this is the demo script
  "functions/api/property_images.js", //you can remove this, this is the demo script
  "functions/api/crowdfund.js", //you can remove this, this is the demo script
];

// Setup readline interface for CLI interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Ask user a yes/no question and return the response
const askQuestion = (question) => {
  return new Promise((resolve) => rl.question(question, resolve));
};

// Normalize paths to use forward slashes for consistent matching
const normalizePath = (p) => p.split(path.sep).join("/");

// Check if a given path should be excluded
const isExcluded = (relativePath, rootPrefix = "") => {
  const fullPath = normalizePath(path.join(rootPrefix, relativePath));
  return excludeItems.includes(fullPath);
};

// Recursively clean a directory
const cleanDirectory = async (dir, rootPrefix = "") => {
  console.log(`\n🔍 Cleaning "${rootPrefix}"...\n`);

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const itemPath = path.join(dir, item);
    const relativePath = path.join(rootPrefix, item);
    const normalizedRelPath = normalizePath(relativePath);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      if (isExcluded(normalizedRelPath)) {
        console.log(`❌ Excluded folder: ${normalizedRelPath}`);
        // Still check subfolders
        await cleanDirectory(itemPath, normalizedRelPath);
      } else {
        const confirm = await askQuestion(
          `🗂️ Delete folder "${normalizedRelPath}"? (y/n): `
        );
        if (confirm.toLowerCase() === "y") {
          fs.rmSync(itemPath, { recursive: true, force: true });
          console.log(`✅ Deleted folder: ${normalizedRelPath}`);
        } else {
          console.log(`⏭️ Skipped folder: ${normalizedRelPath}`);
          await cleanDirectory(itemPath, normalizedRelPath); // Continue inside
        }
      }
    } else if (stats.isFile()) {
      if (isExcluded(normalizedRelPath)) {
        console.log(`❌ Excluded file: ${normalizedRelPath}`);
      } else {
        const confirm = await askQuestion(
          `📄 Delete file "${normalizedRelPath}"? (y/n): `
        );
        if (confirm.toLowerCase() === "y") {
          fs.unlinkSync(itemPath);
          console.log(`✅ Deleted file: ${normalizedRelPath}`);
        } else {
          console.log(`⏭️ Skipped file: ${normalizedRelPath}`);
        }
      }
    }
  }
};

// Clean both directories
const cleanDirectories = async () => {
  await cleanDirectory(functionsDir, "functions");
  await cleanDirectory(corenjksDir, "_corenjks");
  rl.close();
};

// Run the cleanup
cleanDirectories();
