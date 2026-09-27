const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Secondary banner background fix
css = css.replace(/\.secondary-banner\s*\{[\s\S]*?background-color:\s*#111;[\s\S]*?\}/, `.secondary-banner {
  position: relative;
  overflow: hidden;
  padding: 6rem 2rem;
  text-align: center;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f7;
}`);
css = css.replace(/\.secondary-banner::after\s*\{[\s\S]*?\}/, `.secondary-banner::after {
  content: '';
  position: absolute;
  top: -30px; left: -30px; right: -30px; bottom: -30px;
  background: url('/banner.jpeg') center/cover no-repeat;
  filter: blur(15px);
  z-index: 0;
  opacity: 0.7;
}`);

// Sections background to make glass pop
css = css.replace(/\.decants-section\s*\{[\s\S]*?\}/, `.decants-section {
  background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  color: #ffffff;
  padding: 6rem 2rem;
  text-align: center;
  position: relative;
}`);
css = css.replace(/\.request-section\s*\{[\s\S]*?\}/, `.request-section {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  color: #000;
  padding: 6rem 2rem;
  text-align: center;
  position: relative;
}`);

// Trust items stronger shadow
css = css.replace(/\.trust-item\s*\{[\s\S]*?\}/, `.trust-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  flex: 1;
  min-width: 200px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.06) !important;
  border: 1px solid rgba(0,0,0,0.05) !important;
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.trust-item:hover {
  transform: translateY(-10px);
  box-shadow: 0 35px 60px rgba(0,0,0,0.15), 0 15px 25px rgba(0,0,0,0.1) !important;
}`);

// Contact Card and Buttons
css = css.replace(/\.contact-card\s*\{[\s\S]*?\}/, `.contact-card {
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 30px;
  padding: 4rem 3rem;
  max-width: 700px;
  margin: 0 auto 2rem auto;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.5);
}`);

css = css.replace(/\.contact-btn\s*\{[\s\S]*?\}/, `.contact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.2rem;
  border-radius: 50px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  color: #fff !important;
  font-size: 1.1rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}
.contact-btn:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 30px rgba(0,0,0,0.2);
}`);

// Add glass-card class
css += `
/* Liquid Glass / Glassmorphism */
.glass-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  padding: 4rem;
  position: relative;
  overflow: hidden;
  z-index: 1;
}
.glass-card::before {
  content: '';
  position: absolute;
  top: 0; left: -150%; width: 50%; height: 100%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%);
  transform: skewX(-25deg);
  animation: shine 5s infinite cubic-bezier(0.16, 1, 0.3, 1);
  z-index: -1;
}
@keyframes shine {
  0% { left: -150%; }
  20% { left: 200%; }
  100% { left: 200%; }
}
`;

fs.writeFileSync(cssPath, css);
console.log('CSS Updated');
