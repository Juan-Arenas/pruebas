import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, User, Phone, MapPin, CheckCircle2, X, Plus, Minus, Trash2, Edit, Save, Shield } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import './index.css';

type Product = {
  id: string;
  name: string;
  price: string;
  priceRaw: number;
  image: string;
  category: string;
};

type CartItem = Product & { quantity: number };

const CATEGORIES = ['Todas', 'Amaderados', 'Dulces', 'Cítricos'];

function App() {
  // DB State (Firebase Firestore)
  const [products, setProducts] = useState<Product[]>([]);
  const [siteLogo, setSiteLogo] = useState('/logo.jpg');
  const [adminPin, setAdminPin] = useState('1234');
  const [loading, setLoading] = useState(true);

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

  // Firebase Realtime Connection
  useEffect(() => {
    // 1. Suscribirse a los productos
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(prods);
      setLoading(false);
    });

    // 2. Suscribirse a la configuración (Logo y PIN)
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.siteLogo) setSiteLogo(data.siteLogo);
        if (data.adminPin) setAdminPin(data.adminPin);
      } else {
        // Inicializar documento de settings si no existe
        setDoc(doc(db, 'settings', 'global'), { siteLogo: '/logo.jpg', adminPin: '1234' });
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSettings();
    };
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('hermida_cart', JSON.stringify(cart));
  }, [cart]);

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (showAdminLogin || isAdminAuth || isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showAdminLogin, isAdminAuth, isCartOpen]);

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
    if (enteredPin === adminPin) { 
      setIsAdminAuth(true);
      setShowAdminLogin(false);
      setPin(['', '', '', '']); // Reset para la proxima vez
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
  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
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

  // Firebase Admin Logic
  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este perfume?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        setCart(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Error al eliminar. Revisa tu conexión a Firebase.");
      }
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const priceRaw = parseInt(formData.get('priceRaw') as string);
    
    const productData = {
      name: formData.get('name') as string,
      price: `$${priceRaw.toLocaleString('es-CO')}`,
      priceRaw: priceRaw,
      image: formData.get('image') as string,
      category: formData.get('category') as string,
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
      } else {
        const newId = Date.now().toString();
        await setDoc(doc(db, 'products', newId), productData);
      }
      setEditingProduct(null);
      setAdminTab('products');
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar producto.");
    }
  };

  const handleSaveLogo = async (newLogo: string) => {
    setSiteLogo(newLogo); // Actualización optimista
    try {
      await updateDoc(doc(db, 'settings', 'global'), { siteLogo: newLogo });
    } catch (error) {
      console.error("Error al actualizar logo:", error);
    }
  };

  const handleSavePin = async (newPin: string) => {
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) return;
    setAdminPin(newPin);
    try {
      await updateDoc(doc(db, 'settings', 'global'), { adminPin: newPin });
      alert("PIN actualizado correctamente.");
    } catch (error) {
      console.error("Error al actualizar PIN:", error);
    }
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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#888' }}>
              <p>Cargando productos desde la base de datos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#888' }}>
              <p>No se encontraron perfumes. ¡Agrega uno desde el panel de administrador!</p>
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
          </div>
        </div>
      )}

      {/* ADMIN DASHBOARD MODAL */}
      {isAdminAuth && (
        <div className="admin-dashboard-overlay">
          <div className="admin-dashboard">
            <div className="admin-header">
              <h2>Panel de Control (En Vivo)</h2>
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
                  {products.length === 0 && <p style={{color: '#888'}}>No hay productos en la base de datos.</p>}
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
                    <Save size={18} /> {editingProduct ? 'Guardar Cambios' : 'Agregar a la Nube'}
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
                      onChange={e => handleSaveLogo(e.target.value)} 
                      placeholder="Ej: /logo.jpg o https://..." 
                    />
                    <small style={{ color: '#888', marginTop: '0.5rem', display: 'block' }}>El cambio se guarda y se refleja inmediatamente para todos los usuarios.</small>
                  </div>
                  <div className="form-group" style={{ marginTop: '2rem' }}>
                    <label>Cambiar PIN de Acceso (4 dígitos)</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input 
                        type="text" 
                        maxLength={4}
                        placeholder="Nuevo PIN (Ej: 1234)" 
                        id="newPinInput"
                        onKeyPress={(e) => {
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                      <button 
                        className="btn" 
                        onClick={() => {
                          const input = document.getElementById('newPinInput') as HTMLInputElement;
                          if (input.value.length === 4) {
                            handleSavePin(input.value);
                            input.value = '';
                          } else {
                            alert('El PIN debe tener exactamente 4 dígitos.');
                          }
                        }}
                      >
                        Actualizar PIN
                      </button>
                    </div>
                    <small style={{ color: '#888', marginTop: '0.5rem', display: 'block' }}>No olvides tu nuevo PIN, ya que es la única forma de acceder al panel.</small>
                  </div>
                  <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(50,255,100,0.1)', border: '1px solid #32ff64', borderRadius: '8px' }}>
                    <h3 style={{ color: '#32ff64', marginBottom: '1rem' }}>Conexión Establecida</h3>
                    <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
                      El sistema está <b>conectado a Firebase</b>. Cualquier cambio que hagas aquí afectará a todos los visitantes de la página de forma inmediata en tiempo real.
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
