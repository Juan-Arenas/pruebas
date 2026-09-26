const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update Product type
code = code.replace(/prices\?:\s*\{\s*'3ml': number;\s*'5ml': number;\s*'10ml': number;\s*'100ml': number;\s*\};/g, 'prices?: Record<string, number>;');

// 2. Add customPrices state
code = code.replace(/const \[pin, setPin\] = useState\(\['', '', '', ''\]\);/g, "const [pin, setPin] = useState(['', '', '', '']);\n  const [customPrices, setCustomPrices] = useState<{size: string, price: number}[]>([]);");

// 3. Update handleSaveProduct
code = code.replace(/const basePrice = parseInt\(formData.get\('price100ml'\) as string\) \|\| 0;\s*const prodData = \{\s*name: formData.get\('name'\),\s*price: \\\$\$\{basePrice.toLocaleString\('es-CO'\)\},\s*priceRaw: basePrice,\s*prices: \{\s*'3ml': parseInt\(formData.get\('price3ml'\) as string\) \|\| 0,\s*'5ml': parseInt\(formData.get\('price5ml'\) as string\) \|\| 0,\s*'10ml': parseInt\(formData.get\('price10ml'\) as string\) \|\| 0,\s*'100ml': basePrice\s*\},\s*category: formData.get\('category'\),\s*promotion: formData.get\('promotion'\) \|\| '',\s*description: formData.get\('description'\) \|\| '',\s*status: formData.get\('status'\) as 'activo' \| 'agotado',\s*image: imgToSave\s*\};/g, const pricesObj: Record<string, number> = {};
    customPrices.forEach(p => { if (p.size && p.price > 0) pricesObj[p.size] = p.price; });
    
    // Fallback base price if empty
    const basePrice = customPrices.length > 0 ? customPrices[0].price : 0;

    const prodData = {
      name: formData.get('name'),
      price: \\\$\\,
      priceRaw: basePrice,
      prices: pricesObj,
      category: formData.get('category'),
      promotion: formData.get('promotion') || '',
      description: formData.get('description') || '',
      status: formData.get('status') as 'activo' | 'agotado',
      image: imgToSave
    };);

// 4. Update the add product button
code = code.replace(/<button className="admin-menu-btn" onClick=\{\(\) => setAdminTab\('add'\)\}>/g, <button className="admin-menu-btn" onClick={() => { setEditingProduct(null); setCustomPrices([{size: '100ml', price: 0}]); setAdminTab('add'); }}>);
code = code.replace(/<button onClick=\{\(\) => \{ setEditingProduct\(p\); setAdminTab\('add'\); \}\}>/g, <button onClick={() => { setEditingProduct(p); setCustomPrices(p.prices ? Object.entries(p.prices).map(([size, price]) => ({size, price})) : [{size: '100ml', price: p.priceRaw || 0}]); setAdminTab('add'); }}>);

// 5. Replace the prices form UI
code = code.replace(/<div className="form-row" style=\{\{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' \}\}>[\s\S]*?<\/div>\s*<\/div>/g, <div className="form-group">
                        <label>Tamaños y Precios</label>
                        {customPrices.map((cp, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                            <input type="text" placeholder="Tamaño (ej. 50ml)" value={cp.size} onChange={e => {
                              const newP = [...customPrices];
                              newP[idx].size = e.target.value;
                              setCustomPrices(newP);
                            }} required />
                            <input type="number" placeholder="Precio" value={cp.price || ''} onChange={e => {
                              const newP = [...customPrices];
                              newP[idx].price = parseInt(e.target.value) || 0;
                              setCustomPrices(newP);
                            }} required />
                            <button type="button" onClick={() => setCustomPrices(customPrices.filter((_, i) => i !== idx))} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0 1rem' }}>X</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => setCustomPrices([...customPrices, {size: '', price: 0}])} style={{ background: 'var(--color-button)', color: 'white', border: 'none', borderRadius: '4px', padding: '0.5rem 1rem', marginTop: '0.5rem', cursor: 'pointer' }}>+ Agregar Tamaño</button>
                      </div>);

// 6. Fix product details modal prices rendering
code = code.replace(/\{\['3ml', '5ml', '10ml', '100ml'\].map\(size => \{[\s\S]*?const hasPrice = [^;]*;[\s\S]*?if \(!hasPrice\) return null;[\s\S]*?const price = [^;]*;[\s\S]*?return \([\s\S]*?<div[\s\S]*?key=\{size\}[\s\S]*?className=\{size-option \$\{selectedDetailsSize === size \? 'active' : ''\}\}[\s\S]*?onClick=\{\(\) => setSelectedDetailsSize\(size\)\}[\s\S]*?>[\s\S]*?<div className="size-option-left">[\s\S]*?<div className="radio-circle"><\/div>[\s\S]*?<span className="size-option-name">\{size\}<\/span>[\s\S]*?<\/div>[\s\S]*?<span className="size-option-price">\\\$\{price\.toLocaleString\('es-CO'\)\}<\/span>[\s\S]*?<\/div>[\s\S]*?\)\s*\}\)\}/g, {Object.entries(selectedProductDetails.prices || { '100ml': selectedProductDetails.priceRaw }).map(([size, price]) => {
                  return (
                    <div 
                      key={size}
                      className={\size-option \\}
                      onClick={() => setSelectedDetailsSize(size)}
                    >
                      <div className="size-option-left">
                        <div className="radio-circle"></div>
                        <span className="size-option-name">{size}</span>
                      </div>
                      <span className="size-option-price">\</span>
                    </div>
                  )
                })});

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated');
