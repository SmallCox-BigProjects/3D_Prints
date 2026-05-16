#!/usr/bin/env node
/**
 * Scans print_files/<Category>/<Project>/meta.json and regenerates
 * the table rows in index.html between the <!-- PRINT_FILES_ROWS --> markers.
 *
 * Run: node scripts/generate-print-table.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..');
const PRINT_DIR = path.join(ROOT, 'print_files');
const INDEX     = path.join(ROOT, 'index.html');
const GH_BASE   = 'https://github.com/SmallCox-BigProjects/3D_Prints/tree/main/print_files';

const START_MARKER = '<!-- PRINT_FILES_ROWS -->';
const END_MARKER   = '<!-- /PRINT_FILES_ROWS -->';

const QUALITY_COLORS = {
  'Good':        { bg: '#dcfce7', text: '#166534' },
  'Medium':      { bg: '#fef9c3', text: '#854d0e' },
  'Low':         { bg: '#fee2e2', text: '#991b1b' },
  'Not Printed': { bg: '#f1f5f9', text: '#475569' },
};

// ── helpers ──────────────────────────────────────────────────────────────────

const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

function readMeta(dir) {
  const p = path.join(dir, 'meta.json');
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch { return {}; }
}

function findPreview(dir) {
  const IMAGE_EXTS = ['jpg','jpeg','png','webp','gif'];
  const NAMES      = ['preview','thumbnail','image','cover'];
  for (const name of NAMES)
    for (const ext of IMAGE_EXTS)
      if (fs.existsSync(path.join(dir, `${name}.${ext}`)))
        return `${name}.${ext}`;
  return null;
}

function dirs(p) {
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

// ── build rows ────────────────────────────────────────────────────────────────

const categories = dirs(PRINT_DIR);
if (!categories.length) {
  console.error('No category folders found in', PRINT_DIR);
  process.exit(1);
}

let rows = '';
let totalProjects = 0;

for (const cat of categories) {
  const catPath  = path.join(PRINT_DIR, cat);
  const projects = dirs(catPath);
  if (!projects.length) continue;

  rows += `          <tr class="category-row">
            <td colspan="5"><span class="category-label">${esc(cat)}</span></td>
          </tr>\n`;

  for (const proj of projects) {
    const projPath  = path.join(catPath, proj);
    const meta      = readMeta(projPath);
    const imgFile   = findPreview(projPath);

    const localLink = `print_files/${encodeURIComponent(cat)}/${encodeURIComponent(proj)}/`;
    const ghLink    = `${GH_BASE}/${encodeURIComponent(cat)}/${encodeURIComponent(proj)}/`;
    const name      = esc(meta.name  || proj);
    const quality   = meta.quality   || 'Not Printed';
    const time      = esc(meta.time  || '—');
    const notes     = esc(meta.notes || '');
    const qc        = QUALITY_COLORS[quality] || QUALITY_COLORS['Not Printed'];

    const imgHtml = imgFile
      ? `<img src="${localLink}${imgFile}" alt="${name}" class="preview-img">`
      : `<div class="img-placeholder">No<br>Image</div>`;

    rows += `          <tr>
            <td class="img-cell" data-label="Preview">${imgHtml}</td>
            <td class="name-link" data-label="Name"><a href="${ghLink}">${name}</a></td>
            <td data-label="Quality">
              <span class="quality-badge" style="background:${qc.bg};color:${qc.text}">${esc(quality)}</span>
            </td>
            <td data-label="Time">${time}</td>
            <td class="notes" data-label="Notes">${notes}</td>
          </tr>\n`;
    totalProjects++;
  }
}

// ── inject into index.html ────────────────────────────────────────────────────

let html = fs.readFileSync(INDEX, 'utf8');
const si = html.indexOf(START_MARKER);
const ei = html.indexOf(END_MARKER);

if (si === -1 || ei === -1) {
  console.error(`Markers not found in index.html.\nAdd ${START_MARKER} and ${END_MARKER} around the table body content.`);
  process.exit(1);
}

html = html.slice(0, si + START_MARKER.length) + '\n' + rows + '        ' + html.slice(ei);
fs.writeFileSync(INDEX, html, 'utf8');

console.log(`Done. ${categories.length} categories, ${totalProjects} projects written to index.html.`);
