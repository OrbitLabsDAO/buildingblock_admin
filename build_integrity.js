const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Path to the 'functions' and '_corenjks' directories
const functionsDir = path.join(__dirname, "functions");
const corenjksDir = path.join(__dirname, "_corenjks");

// Array of folder names and files to exclude from deletion
const excludeItems = [
  "htmlinputs",
  "js",
  "account-create.njk",
  "account-dashboard.njk",
  "account-login.njk",
  "account-resetpassword.njk",
  "account-settings.njk",
  "account-verify.njk",
  "apiGenerator.njk",
  "indexMain.njk",
  "layout-login.njk",
  "layout.njk",
  "tableAdd.njk",
  "tableEdit.njk",
  "tableIndex.njk",
  "tableView.njk",
  "api",
  "api/tables/adminuser.js", // Keep this specific file
  "account-settings.js",
  "account.js",
];

// Setup readline interface for user input in the CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask the user for confirmation
// It returns a Promise that resolves when the user responds
/**
 * @param {string} question - The question to ask the user
 * @returns {Promise<string>} - A Promise that resolves with the user's response
 */
const askQuestion = (question) => {
  return new Promise((resolve) => rl.question(question, resolve));
};

// Function to clean the given directory
/**
 * @param {string} dir - The path to the directory to clean
 * @param {string} dirName - The name of the directory to clean
 */
const cleanDirectory = async (dir, dirName) => {
  console.log(`\nCleaning the "${dirName}" directory...\n`);

  // Read the directory
  const items = fs.readdirSync(dir); // Using synchronous read to avoid potential issues

  // Loop through all the items (files/folders) in the directory
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stats = fs.statSync(itemPath); // Using synchronous stat to avoid potential issues

    // If it's a folder and it's not in the exclude list, we want to inspect it
    if (stats.isDirectory()) {
      // Exclude folders that are in the excludeItems array
      if (!excludeItems.includes(item)) {
        const confirmDeleteFolder = await askQuestion(
          // Ask the user if they want to delete the folder
          `Do you want to delete the folder "${item}" in "${dirName}"? (y/n): `
        );
        if (confirmDeleteFolder.toLowerCase() === "y") {
          // Delete the folder if the user confirmed
          fs.rmdirSync(itemPath, { recursive: true });
          console.log(`Deleted folder ${item} in ${dirName}`);
        } else {
          console.log(`Skipped deleting folder ${item} in ${dirName}`);
        }
      } else {
        console.log(`Excluded folder ${item} in ${dirName}`);
        // Handle subdirectory `api/tables` case specifically
        if (item === "api") {
          // Check inside api/tables if files are not excluded
          const apiTablesDir = path.join(itemPath, "tables");
          if (fs.existsSync(apiTablesDir)) {
            const tableItems = fs.readdirSync(apiTablesDir);
            for (const tableItem of tableItems) {
              const tableItemPath = path.join(apiTablesDir, tableItem);
              // Exclude files that are in the excludeItems array
              if (!excludeItems.includes(`api/tables/${tableItem}`)) {
                const confirmDeleteTableFile = await askQuestion(
                  // Ask the user if they want to delete the file
                  `Do you want to delete the file "${tableItem}" in "api/tables"? (y/n): `
                );
                if (confirmDeleteTableFile.toLowerCase() === "y") {
                  // Delete the file if the user confirmed
                  fs.unlinkSync(tableItemPath);
                  console.log(`Deleted file ${tableItem} in api/tables`);
                } else {
                  console.log(
                    `Skipped deleting file ${tableItem} in api/tables`
                  );
                }
              } else {
                console.log(`Excluded file ${tableItem} in api/tables`);
              }
            }
          }
        }
      }
    }
    // If it's a file and it's not in the exclude list, we should delete it
    else if (stats.isFile()) {
      // Exclude files that are in the excludeItems array
      if (!excludeItems.includes(item)) {
        const confirmDeleteFile = await askQuestion(
          // Ask the user if they want to delete the file
          `Do you want to delete the file "${item}" in "${dirName}"? (y/n): `
        );
        if (confirmDeleteFile.toLowerCase() === "y") {
          // Delete the file if the user confirmed
          fs.unlinkSync(itemPath);
          console.log(`Deleted file ${item} in ${dirName}`);
        } else {
          console.log(`Skipped deleting file ${item} in ${dirName}`);
        }
      } else {
        console.log(`Excluded file ${item} in ${dirName}`);
      }
    }
  }
};

// Function to clean both directories
/**
 * Cleans both the 'functions' and '_corenjks' directories by checking if
 * files and folders are not in the excludeItems array and asking the user
 * for confirmation to delete them.
 */
const cleanDirectories = async () => {
  // Clean 'functions' directory
  await cleanDirectory(functionsDir, "functions");

  // Clean '_corenjks' directory
  await cleanDirectory(corenjksDir, "_corenjks");

  // Close the readline interface after all operations are done
  rl.close();
};

// Run the function to clean both directories
cleanDirectories();
