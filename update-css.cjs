const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace root and remove dark theme
css = css.replace(/:root\s*\{[\s\S]*?body\.dark-theme\s*\{[\s\S]*?\}/, `:root {
  --color-background: #f5f5f7;
  --color-foreground: #1d1d1f;
  --color-heading: #1d1d1f;
  --color-button: #007aff;
  --color-button-hover: #0056b3;
  --color-button-text: #ffffff;
  --color-border: rgba(0, 0, 0, 0.08);
  --color-card-bg: #ffffff;
  --color-announcement: #007aff;
  --color-announcement-text: #ffffff;
  --color-section-alt: #ffffff;
}`);

// Delete all other dark theme references
css = css.replace(/body\.dark-theme[^{]*\{[^}]*\}/g, '');
css = css.replace(/\.dark-theme[^{]*\{[^}]*\}/g, '');

// Adjust grid size for mobile
css = css.replace(/grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(140px,\s*1fr\)\);/, 'grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));');

// Coleccion text
css = css.replace(/\.nuestra-text\s*\{[\s\S]*?\}/, `.nuestra-text {
  font-family: 'Montserrat', sans-serif;
  color: var(--color-foreground);
  text-transform: uppercase;
  letter-spacing: -1px;
}`);

css = css.replace(/\.coleccion-text\s*\{[\s\S]*?\}/, `.coleccion-text {
  color: var(--color-button);
  font-family: 'Montserrat', sans-serif;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: -1px;
  text-shadow: 0 4px 15px rgba(0, 122, 255, 0.3);
}`);

// Add animation classes at the end
css += `
/* Animations & Claymorphism */
.clay-card {
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 
    35px 35px 68px 0px rgba(220, 220, 220, 0.5), 
    inset -8px -8px 16px 0px rgba(220, 220, 220, 0.4), 
    inset 0px 11px 28px 0px rgb(255, 255, 255);
  padding: 2.5rem;
  border: 1px solid rgba(255,255,255,0.4);
}

.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal.active {
  opacity: 1;
  transform: translateY(0);
}
.reveal-bar {
  position: relative;
  overflow: hidden;
}
.reveal-bar::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--color-button);
  transition: top 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
}
.reveal-bar.active::after {
  top: 0;
}
`;

fs.writeFileSync(cssPath, css);
console.log('Done');
