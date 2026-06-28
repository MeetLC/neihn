import fs from "fs";
import path from "path";

const root = process.cwd();
const htmlFiles = ["index.html"];

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function fileVersion(absPath) {
  const stat = fs.statSync(absPath);
  return String(Math.floor(stat.mtimeMs));
}

function bumpInHtml(html, relPath, version) {
  const escaped = escapeRegExp(relPath);
  const rx = new RegExp(`(${escaped})(?:\\?v=[^"'>\\s]+)?`, "g");
  return html.replace(rx, `$1?v=${version}`);
}

function getImportedCssFiles(mainCssAbs) {
  const css = fs.readFileSync(mainCssAbs, "utf8");
  const imports = [];
  const importRx = /@import\s+url\(["']?(.+?\.css)(?:\?v=[^"']*)?["']?\)/g;
  let match;

  while ((match = importRx.exec(css)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

const assets = [
  "css/main.css",
  "js/app.js",
  "img/project1-full.webp",
];

const versions = {};

for (const rel of assets) {
  const abs = path.join(root, rel);
  if (fs.existsSync(abs)) {
    versions[rel] = fileVersion(abs);
  }
}

const mainCssAbs = path.join(root, "css/main.css");
if (fs.existsSync(mainCssAbs)) {
  const importedCss = getImportedCssFiles(mainCssAbs);
  for (const rel of importedCss) {
    const cleanRel = rel.replace(/^\.\/?/, "");
    const abs = path.join(root, "css", cleanRel);
    if (fs.existsSync(abs)) {
      versions[`css/${cleanRel}`] = fileVersion(abs);
    }
  }
}

for (const htmlName of htmlFiles) {
  const htmlPath = path.join(root, htmlName);
  if (!fs.existsSync(htmlPath)) continue;

  let html = fs.readFileSync(htmlPath, "utf8");

  for (const [rel, v] of Object.entries(versions)) {
    html = bumpInHtml(html, rel, v);
  }

  fs.writeFileSync(htmlPath, html, "utf8");
  console.log(`✅ Atualizado ${htmlName}`);
}

console.log("Versões aplicadas:", versions);