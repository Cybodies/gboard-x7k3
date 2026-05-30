"use strict";
/**
 * QA gate: syntax-check every inline <script> in the HTML files.
 * `new Function(src)` throws on any parse error. Exit 1 on failure so this can
 * gate a commit/CI step. Run: node test/parse-check.js
 *
 * Checks BOTH:
 *   - app.html   — the app (large inline script)
 *   - index.html — the static landing (small inline script)
 */
const fs = require("fs");
const path = require("path");
const { extractInlineScript } = require("./harness");

const FILES = ["app.html", "index.html"];

function parseCheck() {
  let total = 0;
  for (const f of FILES) {
    const p = path.join(__dirname, "..", f);
    if (!fs.existsSync(p)) throw new Error(`${f} not found`);
    const src = extractInlineScript(fs.readFileSync(p, "utf8"));
    // eslint-disable-next-line no-new-func
    new Function(src); // throws SyntaxError if the inline JS is malformed
    total += src.length;
  }
  return total;
}

module.exports = { parseCheck };

if (require.main === module) {
  try {
    const n = parseCheck();
    console.log(`PARSE OK (${n} chars of inline JS across ${FILES.join(" + ")})`);
  } catch (e) {
    console.error("PARSE ERROR:", e.message);
    process.exit(1);
  }
}
