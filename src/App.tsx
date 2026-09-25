import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, User, Phone, MapPin, CheckCircle2, X, Plus, Minus, Trash2, Edit, Save, Image as ImageIcon, Shield } from 'lucide-react';
import './index.css';

type Product = {
  id: number;
  name: string;
  price: string;
  priceRaw: number;
  image: string;
  category: string;
};

type CartItem = Product & { quantity: number };

const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: 'CLUB DE NUIT INTENSE', price: '$220.000', priceRaw: 220000, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600', category: 'Amaderados' },
  { id: 2, name: 'LATTAFA ASAD', price: '$150.000', priceRaw: 150000, image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=600', category: 'Amaderados' },
  { id: 3, name: 'YARA ROSA', price: '$140.000', priceRaw: 140000, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600', category: 'Dulces' },
  { id: 4, name: 'HAWAS FOR HIM', price: '$260.000', priceRaw: 260000, image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600', category: 'Cítricos' },
];

const CATEGORIES = ['Todas', 'Amaderados', 'Dulces', 'Cítricos'];

function App() {
  // DB State (Mocked with LocalStorage)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('hermida_db_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [siteLogo, setSiteLogo] = useState(() => {
    return localStorage.getItem('hermida_db_logo') || '/logo.jpg';
  });

  // App State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('hermida_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin State
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  
  // Admin Dashboard State
  const [adminTab, setAdminTab] = useState<'products' | 'add' | 'settings'>('products');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Sync DB to LocalStorage
  useEffect(() => {
    localStorage.setItem('hermida_db_products', JSON.stringify(products));
    localStorage.setItem('hermida_db_logo', siteLogo);
    localStorage.setItem('hermida_cart', JSON.stringify(cart));
  }, [products, siteLogo, cart]);

  // Admin Click Logic
  useEffect(() => {
    if (logoClicks >= 3) {
      if (!isAdminAuth) {
        setShowAdminLogin(true);
        setPin(['', '', '', '']);
      }
      setLogoClicks(0);
    }
    let timer: number;
    if (logoClicks > 0) {
      timer = window.setTimeout(() => setLogoClicks(0), 1000);
    }
    return () => clearTimeout(timer);
  }, [logoClicks, isAdminAuth]);

  // PIN Input Logic
  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const verifyPin = () => {
    const enteredPin = pin.join('');
    // Mock PIN logic. In production this should be validated via backend
    if (enteredPin === '1234') { 
      setIsAdminAuth(true);
      setShowAdminLogin(false);
    } else {
      alert('PIN Incorrecto');
      setPin(['', '', '', '']);
      pinRefs[0].current?.focus();
    }
  };

  // Cart Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };
  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };
  const removeFromCart = (id: number) => setCart(prev => prev.filter(item => item.id !== id));
  const cartTotal = cart.reduce((sum, item) => sum + (item.priceRaw * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    let text = "Hola Hermida Perfumes, quiero hacer el siguiente pedido:%0A%0A";
    cart.forEach(item => {
      text += `🛍️ ${item.quantity}x ${item.name} - $${(item.priceRaw * item.quantity).toLocaleString('es-CO')}%0A`;
    });
    text += `%0A💰 *Total: $${cartTotal.toLocaleString('es-CO')}*`;
    window.open(`https://wa.me/573144679154?text=${text}`, '_blank');
  };

  // Admin DB Logic
  const handleDeleteProduct = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este perfume?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
      setCart(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const priceRaw = parseInt(formData.get('priceRaw') as string);
    
    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : Date.now(),
      name: formData.get('name') as string,
      price: `$${priceRaw.toLocaleString('es-CO')}`,
      priceRaw: priceRaw,
      image: formData.get('image') as string,
      category: formData.get('category') as string,
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === newProduct.id ? newProduct : p));
      setEditingProduct(null);
    } else {
      setProducts(prev => [...prev, newProduct]);
    }
    setAdminTab('products');
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Todas' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="header-top">
          <div className="header-spacer"></div>
          <div className="header-logo" onClick={() => setLogoClicks(c => c + 1)} style={{ cursor: 'pointer' }} title="Toca 3 veces para administrador">
            <img src={siteLogo} alt="Hermida Perfumes" />
          </div>
          <div className="header-icons">
            <User size={24} onClick={() => setShowAdminLogin(true)} style={{ cursor: 'pointer' }} />
            <div className="cart-icon-wrapper" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={24} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </div>
          </div>
        </div>
        <nav className="header-nav">
          <a href="#catalogo" className="active">Catálogo</a>
          <a href="#como-pedir">Cómo Pedir</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </header>

      <main>
        {/* BANNER */}
        <section className="image-banner">
          <div className="banner-content">
            <p className="banner-subtitle">LA EXCLUSIVIDAD HECHA AROMA</p>
            <h1 className="banner-title">Hermida Perfumes</h1>
            <p className="banner-description">Descubre la esencia perfecta con nuestra colección de perfumería árabe, nicho y diseñador. Envíos 100% seguros a nivel nacional.</p>
            <a href="#catalogo" className="btn">
              Explorar Catálogo <ShoppingBag size={18} />
            </a>
          </div>
        </section>

        {/* CATALOGO */}
        <section className="featured-collection" id="catalogo">
          <div className="section-header">
            <h2>Catálogo Oficial</h2>
            <p>Encuentra la fragancia perfecta que hable por ti</p>
          </div>
          
          <div className="catalog-controls">
            <div className="search-bar">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar perfume..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="categories-filter">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#888' }}>
              <p>No se encontraron perfumes.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-image-wrapper">
                    <img src={product.image} alt={product.name} className="product-image" />
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-price">{product.price}</p>
                    <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                      Agregar al carrito
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* COMO PEDIR */}
        <section className="secondary-banner" id="como-pedir">
          <div className="secondary-banner-content">
            <img src={siteLogo} alt="Hermida Perfumes Logo" className="secondary-banner-logo" />
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#fff' }}>¿CÓMO HACER TU PEDIDO?</h2>
            <div className="order-steps-container">
              <p className="step-text"><CheckCircle2 size={20} color="var(--color-button)" /> 1. Agrega tus perfumes favoritos al carrito.</p>
              <p className="step-text"><CheckCircle2 size={20} color="var(--color-button)" /> 2. Toca el botón de "Hacer pedido" en tu carrito.</p>
              <p className="step-text"><CheckCircle2 size={20} color="var(--color-button)" /> 3. Se enviará tu orden lista por WhatsApp.</p>
              <p className="step-text"><CheckCircle2 size={20} color="var(--color-button)" /> 4. ¡Listo! Despachamos tu pedido de inmediato.</p>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer" id="contacto">
        <div className="footer-content">
          <div className="footer-column">
            <h3>HERMIDA PERFUMES</h3>
            <p style={{ fontSize: '1rem', color: '#aaa', lineHeight: '1.8' }}>
              Nos especializamos en ofrecer perfumes originales de la más alta calidad, con envíos seguros a nivel nacional. Tu esencia, nuestra pasión.
            </p>
          </div>
          <div className="footer-column">
            <h3>Contáctanos</h3>
            <ul>
              <li><a href="https://wa.me/573144679154"><Phone size={18} color="var(--color-button)" /> +57 314 4679154</a></li>
              <li><a href="#"><MapPin size={18} color="var(--color-button)" /> Envíos a todo Colombia</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">PAGINA DEMO HECHA POR JUAN ARENAS :)</div>
      </footer>

      {/* ADMIN LOGIN MODAL */}
      {showAdminLogin && (
        <div className="modal-overlay">
          <div className="admin-login-modal">
            <button className="modal-close" onClick={() => setShowAdminLogin(false)}><X size={20} /></button>
            <div className="admin-login-header">
              <Shield size={32} color="var(--color-button)" />
              <h2>Acceso Administrativo</h2>
            </div>
            <p className="admin-login-desc">Ingresa el PIN de 4 dígitos para gestionar el catálogo:</p>
            <div className="pin-inputs">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={pinRefs[i]}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={e => handlePinChange(i, e.target.value)}
                  onKeyDown={e => handlePinKeyDown(i, e)}
                  className="pin-box"
                  autoComplete="off"
                />
              ))}
            </div>
            <button className="btn admin-submit-btn" onClick={verifyPin}>
              Entrar al Panel
            </button>
            <p style={{marginTop: '1rem', fontSize: '0.75rem', color: '#666'}}>PIN de prueba: 1234</p>
          </div>
        </div>
      )}

      {/* ADMIN DASHBOARD MODAL */}
      {isAdminAuth && (
        <div className="admin-dashboard-overlay">
          <div className="admin-dashboard">
            <div className="admin-header">
              <h2>Panel de Control</h2>
              <button className="modal-close" onClick={() => setIsAdminAuth(false)}><X size={24} /></button>
            </div>
            <div className="admin-tabs">
              <button className={adminTab === 'products' ? 'active' : ''} onClick={() => { setAdminTab('products'); setEditingProduct(null); }}>Productos</button>
              <button className={adminTab === 'add' || editingProduct ? 'active' : ''} onClick={() => { setAdminTab('add'); setEditingProduct(null); }}>
                {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
              </button>
              <button className={adminTab === 'settings' ? 'active' : ''} onClick={() => setAdminTab('settings')}>Configuración</button>
            </div>
            
            <div className="admin-content">
              {adminTab === 'products' && !editingProduct && (
                <div className="admin-products-list">
                  {products.map(p => (
                    <div key={p.id} className="admin-product-item">
                      <img src={p.image} alt={p.name} />
                      <div className="admin-product-info">
                        <h4>{p.name}</h4>
                        <p>{p.price}</p>
                      </div>
                      <div className="admin-product-actions">
                        <button onClick={() => { setEditingProduct(p); setAdminTab('add'); }} className="edit-btn"><Edit size={18} /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="del-btn"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {(adminTab === 'add' || editingProduct) && (
                <form className="admin-form" onSubmit={handleSaveProduct}>
                  <div className="form-group">
                    <label>Nombre del Perfume</label>
                    <input type="text" name="name" defaultValue={editingProduct?.name} required />
                  </div>
                  <div className="form-group">
                    <label>Precio (Ej: 180000)</label>
                    <input type="number" name="priceRaw" defaultValue={editingProduct?.priceRaw} required />
                  </div>
                  <div className="form-group">
                    <label>Categoría</label>
                    <select name="category" defaultValue={editingProduct?.category || 'Amaderados'}>
                      <option value="Amaderados">Amaderados</option>
                      <option value="Dulces">Dulces</option>
                      <option value="Cítricos">Cítricos</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>URL de Imagen</label>
                    <input type="url" name="image" defaultValue={editingProduct?.image} required placeholder="https://..." />
                  </div>
                  <button type="submit" className="btn form-submit-btn">
                    <Save size={18} /> {editingProduct ? 'Guardar Cambios' : 'Agregar Producto'}
                  </button>
                </form>
              )}

              {adminTab === 'settings' && (
                <div className="admin-form">
                  <div className="form-group">
                    <label>URL del Logotipo</label>
                    <input 
                      type="text" 
                      value={siteLogo} 
                      onChange={e => setSiteLogo(e.target.value)} 
                      placeholder="Ej: /logo.jpg o https://..." 
                    />
                    <small style={{ color: '#888', marginTop: '0.5rem', display: 'block' }}>Para subir una imagen local, necesitas cambiar el código o usar una base de datos real. Por ahora, usa una URL.</small>
                  </div>
                  <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,50,50,0.1)', border: '1px solid #ff3333', borderRadius: '8px' }}>
                    <h3 style={{ color: '#ff3333', marginBottom: '1rem' }}>Conexión a Base de Datos</h3>
                    <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
                      Actualmente el panel guarda los datos en la <b>memoria de tu navegador (LocalStorage)</b>. Esto significa que solo tú ves los cambios.
                      Para que los cambios se guarden "en los archivos" y todos los clientes lo vean en tiempo real, se requiere conectar la web a un servidor como <b>Supabase</b> o <b>Firebase</b>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {isCartOpen && <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Tu Carrito ({cartCount})</h2>
          <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}><X size={24} /></button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
             <div className="empty-cart"><ShoppingBag size={48} /><p>Tu carrito está vacío</p></div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  <p className="cart-item-price">${(item.priceRaw * item.quantity).toLocaleString('es-CO')}</p>
                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                    </div>
                    <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total"><span>Total:</span><span>${cartTotal.toLocaleString('es-CO')}</span></div>
            <button className="checkout-btn" onClick={handleCheckout}>Hacer Pedido por WhatsApp <Phone size={18} /></button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
