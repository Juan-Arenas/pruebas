const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /type Product = \{[\s\S]*?\};/,
  `type Product = {
  id: string;
  name: string;
  price: string;
  priceRaw: number;
  prices?: {
    '3ml': number;
    '5ml': number;
    '10ml': number;
    '100ml': number;
  };
  image: string;
  category: string;
  promotion?: string;
  description?: string;
  status?: 'activo' | 'agotado';
};`
);

content = content.replace(
  /const \[categories, setCategories\] = useState\(\['Amaderados', 'Dulces', 'C.*?tricos'\]\);/,
  `const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [categories, setCategories] = useState(['Amaderados', 'Dulces', 'Cítricos']);`
);

content = content.replace(
  /const \[selectedProductForSize, setSelectedProductForSize\] = useState<Product \| null>\(null\);/,
  `const [selectedProductForSize, setSelectedProductForSize] = useState<Product | null>(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [selectedDetailsSize, setSelectedDetailsSize] = useState<string>('100ml');`
);

content = content.replace(
  /if \(data\.phoneNumber\) setPhoneNumber\(data\.phoneNumber\);/,
  `if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
        if (data.instagramUrl) setInstagramUrl(data.instagramUrl);
        if (data.tiktokUrl) setTiktokUrl(data.tiktokUrl);`
);

content = content.replace(
  /categories: \['Amaderados', 'Dulces', 'C.*?tricos'\],/,
  `instagramUrl: '',
          tiktokUrl: '',
          categories: ['Amaderados', 'Dulces', 'Cítricos'],`
);

content = content.replace(
  /announcements: \['🚚 Envíos a toda Colombia 🇨🇴', '🛡️ Pagos 100% seguros', '⚡ Entregas rápidas y confiables'\]\);/,
  `announcements: ['🚚 Envíos a toda Colombia 🇨🇴', '🛡️ Pagos 100% seguros', '⚡ Entregas rápidas y confiables']`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
