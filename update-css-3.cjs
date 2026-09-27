const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Fix text color for decants and request h2
css = css.replace(/\.decants-content h2\s*\{[\s\S]*?\}/, `.decants-content h2 {
  color: var(--color-heading) !important;
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
}`);

css = css.replace(/\.request-content h2\s*\{[\s\S]*?\}/, `.request-content h2 {
  color: var(--color-heading) !important;
  font-size: 2.2rem;
  margin-bottom: 1rem;
}`);

// Swap blurred background from section to card
css = css.replace(/\.secondary-banner\s*\{[\s\S]*?background-color:\s*#f5f5f7;[\s\S]*?\}/, `.secondary-banner {
  position: relative;
  padding: 6rem 2rem;
  text-align: center;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
}`);

css = css.replace(/\.secondary-banner::after\s*\{[\s\S]*?\}/, ``); // Remove banner after

css = css.replace(/\.secondary-banner-content\s*\{[\s\S]*?\}/, `.secondary-banner-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 800px;
  border-radius: 30px;
  overflow: hidden;
  padding: 4rem 2rem;
  box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  border: 1px solid rgba(0,0,0,0.05);
}
.secondary-banner-content::before {
  content: '';
  position: absolute;
  top: -30px; left: -30px; right: -30px; bottom: -30px;
  background: url('/banner.jpeg') center/cover no-repeat;
  filter: blur(15px);
  z-index: -1;
  opacity: 0.9;
}`);

// Re-add secondary banner content h2 style just in case
css += `
.secondary-banner-content h2 {
  color: #ffffff !important;
  text-shadow: 0 2px 10px rgba(0,0,0,0.8);
}
.secondary-banner-content .step-text {
  color: #ffffff !important;
  text-shadow: 0 1px 5px rgba(0,0,0,0.8);
}
.secondary-banner-logo {
  position: relative;
  z-index: 2;
}
`;

fs.writeFileSync(cssPath, css);
console.log('CSS Updated for text color and inverted blur background');
