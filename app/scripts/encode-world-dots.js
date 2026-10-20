#!/usr/bin/env node
// Encodes a list of map dots into the run-length string used by
// src/components/map/worldDots.ts.
//
// Usage (from app/):
//   node scripts/encode-world-dots.js <points.json> [--write]
//
// <points.json> is an array of {x, y} on the 1000x500 canvas, on the 2-degree
// grid (cell centres: x = round1((col + 0.5) * 1000 / 180),
// y = round1((row + 0.5) * 500 / 90)). Without --write the encoded string is
// printed; with --write the ENCODED line and FIRST_ROW in worldDots.ts are
// replaced in place.
//
// Format: rows are joined by "/", starting at FIRST_ROW (row 0 = lat 89).
// Each row is runs joined by ".", alternating off,on,off,on... starting with
// off (so a row starting at column 0 begins with "0"). Trailing off cells are
// omitted; an empty row is an empty string.

const fs = require('fs');
const path = require('path');

const COLS = 180;
const round1 = (n) => Math.round(n * 10) / 10;

function encode(points) {
  const cells = new Map(); // row -> Set(col)
  for (const p of points) {
    const col = Math.round((p.x * COLS) / 1000 - 0.5);
    const row = Math.round((p.y * 90) / 500 - 0.5);
    if (round1(((col + 0.5) * 1000) / COLS) !== p.x || round1(((row + 0.5) * 500) / 90) !== p.y) {
      throw new Error(`point ${p.x},${p.y} is not on the 2-degree grid`);
    }
    if (col < 0 || col >= COLS) throw new Error(`column out of range: ${p.x}`);
    if (!cells.has(row)) cells.set(row, new Set());
    cells.get(row).add(col);
  }
  const rows = [...cells.keys()];
  const first = Math.min(...rows);
  const last = Math.max(...rows);
  const out = [];
  for (let r = first; r <= last; r++) {
    const set = cells.get(r) || new Set();
    const runs = [];
    let on = false;
    let len = 0;
    for (let c = 0; c < COLS; c++) {
      if (set.has(c) === on) len++;
      else {
        runs.push(len);
        on = !on;
        len = 1;
      }
    }
    if (on) runs.push(len);
    out.push(runs.join('.'));
  }
  return { firstRow: first, encoded: out.join('/') };
}

function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const file = args.find((a) => !a.startsWith('--'));
  if (!file) {
    console.error('usage: node scripts/encode-world-dots.js <points.json> [--write]');
    process.exit(1);
  }
  const points = JSON.parse(fs.readFileSync(file, 'utf8'));
  const { firstRow, encoded } = encode(points);
  if (!write) {
    console.log(`FIRST_ROW = ${firstRow}\n${encoded}`);
    return;
  }
  const target = path.join(__dirname, '..', 'src', 'components', 'map', 'worldDots.ts');
  let src = fs.readFileSync(target, 'utf8');
  src = src.replace(/^const FIRST_ROW = \d+;$/m, `const FIRST_ROW = ${firstRow};`);
  src = src.replace(/^const ENCODED =\n  '[^']*';$/m, () => `const ENCODED =\n  '${encoded}';`);
  fs.writeFileSync(target, src);
  console.log(`wrote ${points.length} dots (${encoded.length} chars) to ${target}`);
}

if (require.main === module) main();
module.exports = { encode };
