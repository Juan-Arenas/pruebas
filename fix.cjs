const fs = require('fs');
let buf = fs.readFileSync('src/App.tsx');
let str = buf.toString('latin1');
str = str.replace(/C\uFFFDtricos/g, 'Cítricos');
str = str.replace(/C\?tricos/g, 'Cítricos');
str = str.replace(/Ctricos/g, 'Cítricos');
str = str.replace(/\[\s*'.*?Env.*?s a toda Colombia.*?',.*?\].*/g, "['🚚 Envíos a toda Colombia 🇨🇴', '🛡️ Pagos 100% seguros', '⚡ Entregas rápidas y confiables']);");
fs.writeFileSync('src/App.tsx', str, 'utf8');
