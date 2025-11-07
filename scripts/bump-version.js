import fs from "fs";

// arquivo-alvo
const file = "index.html";

// timestamp: 2025.11.07.1742
const now = new Date();
const version = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, "0"),
  String(now.getDate()).padStart(2, "0"),
  String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0")
].join(".");

// lê HTML
let html = fs.readFileSync(file, "utf8");

// helper: força ?v=YYYY.MM.DD.HHMM (se já existir, substitui; se não existir, acrescenta)
function bump(assetPath) {
  // captura caminho com ou sem query (?v=...)
  const rx = new RegExp(`(${assetPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})(?:\\?v=[^"'>\\s]+)?`, "g");
  return (str) => str.replace(rx, `$1?v=${version}`);
}

// Ajuste aqui se seus caminhos mudarem
html = bump("css/style.css")(html); // se o href ainda for "style.css" na raiz, adicione também:
html = bump("style.css")(html);

html = bump("js/app.js")(html);
html = bump("app.js")(html);

// grava
fs.writeFileSync(file, html, "utf8");
console.log("✅ Versão atualizada para:", version);
