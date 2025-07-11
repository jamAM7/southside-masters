const fs = require("fs");

const rawData = fs.readFileSync("licenses.json", "utf-8");
const licenses = JSON.parse(rawData);

const seen = new Set();
const summary = [];

for (const [pkg, data] of Object.entries(licenses)) {
  const id = `${pkg} - ${data.licenses}`;
  if (!seen.has(id)) {
    seen.add(id);
    summary.push(id);
  }
}

summary.sort();

fs.writeFileSync("LICENSES_USED.txt", summary.join("\n"));
console.log("Clean license list saved to LICENSES_USED.txt");
