import fs from 'fs';
import path from 'path';

const cssPath = path.resolve('client/src/index.css');
let css = fs.readFileSync(cssPath, 'utf-8');

// Global variable replacements
css = css.replace(/--bg-primary: #f6f5f0;/g, '--bg-primary: #f5f5f6;');
css = css.replace(/--text-primary: #121212;/g, '--text-primary: #282c3f;');
css = css.replace(/--text-secondary: #5a5a5a;/g, '--text-secondary: #535766;');
css = css.replace(/--text-muted: #888888;/g, '--text-muted: #7e818c;');
css = css.replace(/--border-color: #121212;/g, '--border-color: #eaeaec;');
css = css.replace(/--color-yellow: #ffde47;/g, '--color-yellow: #ffc200;');
css = css.replace(/--color-yellow-hover: #ffd514;/g, '--color-yellow-hover: #e5af00;');
css = css.replace(/--color-pink: #ff99c8;/g, '--color-primary: #ff3f6c;\n  --color-primary-hover: #f12b59;\n  --color-pink: #ff3f6c;');

// Typography
css = css.replace(/--font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;/g, `--font-sans: 'Whitney', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;`);

// Shadows (from offset hard shadows to soft drop shadows)
css = css.replace(/--shadow-flat: 4px 4px 0px 0px #121212;/g, '--shadow-flat: 0 1px 4px rgba(0,0,0,0.08);');
css = css.replace(/--shadow-flat: 0px 0px 0px 0px #121212;/g, '--shadow-flat: 0 1px 4px rgba(0,0,0,0.08);');
css = css.replace(/--shadow-flat-hover: 6px 6px 0px 0px #121212;/g, '--shadow-flat-hover: 0 4px 12px rgba(0,0,0,0.12);');
css = css.replace(/--shadow-flat-active: 1px 1px 0px 0px #121212;/g, '--shadow-flat-active: 0 1px 2px rgba(0,0,0,0.08);');
css = css.replace(/--shadow-flat-sm: 2px 2px 0px 0px #121212;/g, '--shadow-flat-sm: 0 1px 2px rgba(0,0,0,0.05);');
css = css.replace(/--shadow-flat-lg: 8px 8px 0px 0px #121212;/g, '--shadow-flat-lg: 0 8px 24px rgba(0,0,0,0.12);');

// General properties
css = css.replace(/background-color: #eaeae6;/g, 'background-color: var(--bg-primary);');
css = css.replace(/2px solid var\(--border-color\)/g, '1px solid var(--border-color)');
css = css.replace(/border-radius: 0px;/g, 'border-radius: 4px;');
css = css.replace(/border-radius: 0;/g, 'border-radius: 4px;');

// Theme specific colors
css = css.replace(/\.neo-btn\.primary \{\s*background: var\(--color-yellow\);\s*\}/g, '.neo-btn.primary {\n  background: var(--color-primary);\n  color: #fff;\n  border-color: var(--color-primary);\n}');
css = css.replace(/\.neo-btn\.primary:hover \{\s*background: var\(--color-yellow-hover\);\s*\}/g, '.neo-btn.primary:hover {\n  background: var(--color-primary-hover);\n  border-color: var(--color-primary-hover);\n}');

// Logo badge styling adjustments
css = css.replace(/transform: rotate\(-1\.5deg\);/g, '/* transform: rotate(-1.5deg); */');
css = css.replace(/transform: rotate\(-2\.5deg\) scale\(1\.04\);/g, 'transform: scale(1.02);');

fs.writeFileSync(cssPath, css);
console.log('index.css updated successfully');
