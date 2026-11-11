const fs = require("fs");
const path = require("path");

function inspect(file) {
  const buf = fs.readFileSync(file);
  const jsonLength = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLength).toString("utf8"));
  const nodes = (json.nodes || []).map((n) => n.name || "(unnamed)");
  const pos = (json.accessors || []).filter((a) => a.type === "VEC3" && a.min && a.max);
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  for (const a of pos) {
    min = min.map((v, i) => Math.min(v, a.min[i]));
    max = max.map((v, i) => Math.max(v, a.max[i]));
  }
  const size = min.map((v, i) => +(max[i] - v).toFixed(3));
  console.log(path.basename(file));
  console.log("  nodes:", nodes.slice(0, 12).join(", "));
  console.log("  bbox size:", size.join(" x "), "m");
  console.log("  min:", min.map((n) => +n.toFixed(3)).join(", "), "max:", max.map((n) => +n.toFixed(3)).join(", "));
}

const dir = path.join("public", "models");
for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".glb"))) {
  inspect(path.join(dir, name));
}
