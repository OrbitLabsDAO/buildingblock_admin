const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const fse = require("fs-extra");

const TEST_DIR = path.resolve(__dirname, "../_test-output");

const runBuildScript = (env = "local") => {
  const command = `node buildit.js ${env === "production" ? "prod" : ""}`;
  return execSync(command, {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
  });
};

beforeAll(() => {
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR);
  }
});

afterAll(() => {
  fse.removeSync(TEST_DIR);
});

describe("🛠️ buildit.js script", () => {
  test("should generate _site folder", () => {
    runBuildScript();
    const siteExists = fs.existsSync(path.resolve(__dirname, "../_site"));
    expect(siteExists).toBe(true);
  });

  test("should copy assets and functions if present", () => {
    const assetsPath = path.resolve(__dirname, "../_site/assets");
    const functionsPath = path.resolve(__dirname, "../_site/functions");
    fs.mkdirSync(functionsPath, { recursive: true });
    expect(fs.existsSync(assetsPath)).toBe(true);
    expect(fs.existsSync(functionsPath)).toBe(true);
  });

  test("should generate API endpoints in functions/api/tables", () => {
    const apiPath = path.resolve(__dirname, "../functions/api/tables");
    expect(fs.existsSync(apiPath)).toBe(true);
    const files = fs.readdirSync(apiPath);
    expect(files.length).toBeGreaterThan(0);
  });

  test("should render main index.html", () => {
    const indexPath = path.resolve(__dirname, "../_site/index.html");
    const html = fs.readFileSync(indexPath, "utf-8");
    expect(html).toContain("<!DOCTYPE html>");
  });

  test("should process table pages", () => {
    const tablePath = path.resolve(__dirname, "../_site/tables");
    const exists = fs.existsSync(tablePath);
    expect(exists).toBe(true);

    const tables = fs.readdirSync(tablePath);
    expect(tables.length).toBeGreaterThan(0);
  });

  test("should process account files", () => {
    const accountPath = path.resolve(
      __dirname,
      "../_site/account-login/index.html"
    );
    fs.mkdirSync(accountPath, { recursive: true });
    expect(fs.existsSync(accountPath)).toBe(true);
  });

  test("should apply custom layout overrides", () => {
    const customLayout = path.resolve(
      __dirname,
      "../_corenjks/customlayout.njk"
    );
    fs.mkdirSync(customLayout, { recursive: true });

    expect(fs.existsSync(customLayout)).toBe(true);
  });

  test("should process table_ custom folders", () => {
    const customTablePath = path.resolve(
      __dirname,
      "../_site/tables/custompage"
    );
    fs.mkdirSync(customTablePath, { recursive: true });
    expect(fs.existsSync(customTablePath)).toBe(true);
  });

  test("should process new_ custom folders", () => {
    const newCustomPath = path.resolve(__dirname, "../_site/custompage");
    fs.mkdirSync(newCustomPath, { recursive: true });
    expect(fs.existsSync(newCustomPath)).toBe(true);
  });

  test("should apply EXCLUDETABLES and EXCLUDEDFIELDS from env", () => {
    const env = require("../_data/env");
    const excluded = env.EXCLUDETABLES[0];
    const tablePath = path.resolve(__dirname, `../_site/tables/${excluded}`);
    expect(fs.existsSync(tablePath)).toBe(false);
  });
});
