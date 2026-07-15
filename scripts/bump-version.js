import fs from "fs";
import path from "path";

const root = process.cwd();

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function fileVersion(absPath) {
  const stat = fs.statSync(absPath);
  return String(Math.floor(stat.mtimeMs));
}

function bumpVersionInText(text, relPath, version) {
  const escaped = escapeRegExp(relPath);
  const rx = new RegExp(`(${escaped})(?:\\?v=[^"'>\\s)]+)?`, "g");
  return text.replace(rx, `$1?v=${version}`);
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

function rewriteCssImports(mainCssAbs) {
  let css = fs.readFileSync(mainCssAbs, "utf8");
  const imports = getImportedCssFiles(mainCssAbs);

  for (const rel of imports) {
    const cleanRel = rel.replace(/^\.\/?/, "");
    const abs = path.join(path.dirname(mainCssAbs), cleanRel);
    if (!fs.existsSync(abs)) continue;

    const v = fileVersion(abs);
    const escaped = escapeRegExp(rel);
    const rx = new RegExp(`(@import\\s+url\\(["']?)${escaped}(?:\\?v=[^"']*)?(["']?\\))`, "g");
    css = css.replace(rx, `$1${rel}?v=${v}$2`);
  }

  fs.writeFileSync(mainCssAbs, css, "utf8");
}

const assets = [
  "css/main.css",
  "js/app.js",
  "img/project1-full.webp",
  "img/project1.webp",
  "img/neihn-preview-1200x630.webp",
];

const versions = {};

for (const rel of assets) {
  const abs = path.join(root, rel);
  if (fs.existsSync(abs)) {
    versions[rel] = fileVersion(abs);
  }
}

const htmlPath = path.join(root, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");

// atualiza HTML
for (const [rel, v] of Object.entries(versions)) {
  html = bumpVersionInText(html, rel, v);
}

// atualiza main.css com os imports versionados
const mainCssAbs = path.join(root, "css/main.css");
if (fs.existsSync(mainCssAbs)) {
  rewriteCssImports(mainCssAbs);
}

fs.writeFileSync(htmlPath, html, "utf8");
console.log("✅ Versionamento atualizado com sucesso.");