import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, User, Phone, MapPin, CheckCircle2, X, Plus, Minus, Trash2, Edit, Save, Shield, Sun, Moon, UploadCloud, Info } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import './index.css';

type Product = {
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
};

type CartItem = Product & { quantity: number; selectedSize: string };

function App() {
  const [theme, setTheme] = useState('light');
  const [products, setProducts] = useState<Product[]>([]);
  const [siteLogo, setSiteLogo] = useState('/logo.jpg');
  const [adminPin, setAdminPin] = useState('1907');
  const [phoneNumber, setPhoneNumber] = useState('573144679154');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [categories, setCategories] = useState(['Amaderados', 'Dulces', 'Cítricos']);
  const [announcements, setAnnouncements] = useState(['🚚 Envíos a toda Colombia 🇨🇴', '🛡️ Pagos 100% seguros', '⚡ Entregas rápidas y confiables']);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('hermida_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [selectedDetailsSize, setSelectedDetailsSize] = useState<string>('100ml');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const [adminTab, setAdminTab] = useState<'menu' | 'products' | 'add' | 'settings'>('menu');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach((doc) => prods.push({ id: doc.id, ...doc.data() } as Product));
      setProducts(prods);
      setLoading(false);
    });

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.siteLogo) setSiteLogo(data.siteLogo);
        if (data.adminPin) setAdminPin(data.adminPin);
        if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
        if (data.instagramUrl) setInstagramUrl(data.instagramUrl);
        if (data.tiktokUrl) setTiktokUrl(data.tiktokUrl);
        if (data.categories) setCategories(data.categories);
        if (data.announcements) setAnnouncements(data.announcements);
      } else {
        setDoc(doc(db, 'settings', 'global'), {
          siteLogo: '/logo.jpg',
          adminPin: '1907',
          phoneNumber: '573144679154',
          instagramUrl: 'https://instagram.com/hermida.perfumes',
          tiktokUrl: 'https://tiktok.com/@hermida.perfumes',
          categories: ['Amaderados', 'Dulces', 'Cítricos'],
          announcements: ['🚚 Envíos a toda Colombia 🇨🇴', '🛡️ Pagos 100% seguros', '⚡ Entregas rápidas y confiables']
        });
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeSettings();
    };
  }, []);

  useEffect(() => localStorage.setItem('hermida_cart', JSON.stringify(cart)), [cart]);

  useEffect(() => {
    if (showAdminLogin || isAdminAuth || isCartOpen || selectedProductDetails) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showAdminLogin, isAdminAuth, isCartOpen, selectedProductDetails]);

  useEffect(() => {
    if (logoClicks >= 5) {
      setShowAdminLogin(true);
      setLogoClicks(0);
    }
    const timer = setTimeout(() => setLogoClicks(0), 3000);
    return () => clearTimeout(timer);
  }, [logoClicks]);

  const verifyPin = () => {
    const enteredPin = pin.join('');
    if (enteredPin === adminPin) {
      setIsAdminAuth(true);
      setShowAdminLogin(false);
      setPin(['', '', '', '']);
      setAdminTab('menu');
    } else {
      alert('PIN Incorrecto');
      setPin(['', '', '', '']);
      pinRefs[0].current?.focus();
    }
  };

  const getPriceForSize = (product: Product, size: string) => {
    if (product.prices && product.prices[size as keyof typeof product.prices]) {
      return product.prices[size as keyof typeof product.prices] as number;
    }
    return product.priceRaw;
  };

  const addToCart = (product: Product, size: string) => {
    if (product.status === 'agotado') return;
    
    const finalSize = size || '100ml';
    const finalId = `${product.id}-${finalSize}`;
    const finalName = `${product.name} (${finalSize})`;
    const priceRaw = getPriceForSize(product, finalSize);
    
    setCart((prev) => {
      const existing = prev.find((item) => item.id === finalId);
      if (existing) {
        return prev.map((item) => item.id === finalId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, id: finalId, name: finalName, priceRaw, price: `$${priceRaw.toLocaleString('es-CO')}`, quantity: 1, selectedSize: finalSize }];
    });
    
    setSelectedProductDetails(null);
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

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.priceRaw * item.quantity), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    let message = `*NUEVO PEDIDO - HERMIDA PERFUMES*%0A%0A`;
    cart.forEach(item => {
      message += `▪️ ${item.quantity}x ${item.name} - $${(item.priceRaw * item.quantity).toLocaleString('es-CO')}%0A`;
    });
    message += `%0A*TOTAL: $${cartTotal.toLocaleString('es-CO')}*%0A%0A`;
    message += `Hola, me gustaría confirmar este pedido.`;
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isLogo: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          if (isLogo) {
            updateDoc(doc(db, 'settings', 'global'), { siteLogo: dataUrl }).then(() => setIsUploading(false));
          } else {
            setTempImageUrl(dataUrl);
            setIsUploading(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const imgToSave = tempImageUrl || (editingProduct?.image || '');
    
    if (!imgToSave) {
      alert("Debes subir una imagen para el producto.");
      return;
    }

    const basePrice = parseInt(formData.get('price100ml') as string) || 0;

    const prodData = {
      name: formData.get('name'),
      price: `$${basePrice.toLocaleString('es-CO')}`,
      priceRaw: basePrice,
      prices: {
        '3ml': parseInt(formData.get('price3ml') as string) || 0,
        '5ml': parseInt(formData.get('price5ml') as string) || 0,
        '10ml': parseInt(formData.get('price10ml') as string) || 0,
        '100ml': basePrice
      },
      category: formData.get('category'),
      promotion: formData.get('promotion') || '',
      description: formData.get('description') || '',
      status: formData.get('status') as 'activo' | 'agotado',
      image: imgToSave
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), prodData);
      } else {
        const newRef = doc(collection(db, 'products'));
        await setDoc(newRef, prodData);
      }
      setAdminTab('products');
      setEditingProduct(null);
      setTempImageUrl('');
    } catch (error) {
      alert("Error al guardar producto");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCategories = (formData.get('categories') as string).split(',').map(s => s.trim()).filter(s => s);
    const newAnns = (formData.get('announcements') as string).split(',').map(s => s.trim()).filter(s => s);
    
    await updateDoc(doc(db, 'settings', 'global'), {
      phoneNumber: formData.get('phoneNumber'),
      instagramUrl: formData.get('instagramUrl'),
      tiktokUrl: formData.get('tiktokUrl'),
      categories: newCategories,
      announcements: newAnns
    });
    alert('Configuración guardada exitosamente');
  };

  const handleSavePin = async (newPin: string) => {
    if (newPin.length === 4) {
      await updateDoc(doc(db, 'settings', 'global'), { adminPin: newPin });
      alert('PIN actualizado exitosamente');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'Todas' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="announcement-bar">
        <div className="announcement-scroll">
          {Array(10).fill(announcements).flat().map((ann, idx) => (
            <span key={idx} className="announcement-item">
              {ann} <span className="dot">•</span>
            </span>
          ))}
        </div>
      </div>

      <header className="header">
        <div className="header-container">
          <div className="logo-section" onClick={() => setLogoClicks(c => c + 1)} style={{ cursor: 'pointer' }}>
            <img src={siteLogo} alt="Hermida Perfumes" className="logo-img" />
            <div className="logo-text">
              <h1 className="store-name">HERMIDA PERFUMES</h1>
              <span className="tagline">Elige Como Quieres Ser Recordado ✨</span>
            </div>
          </div>

          <nav className="header-nav">
            <a href="#catalogo" className="active">Catálogo</a>
            <a href="#como-pedir">Cómo Pedir</a>
            <a href="#contacto">Contacto</a>
          </nav>

          <div className="header-icons">
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="theme-toggle" title="Cambiar tema">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <User size={20} onClick={() => setShowAdminLogin(true)} style={{ cursor: 'pointer' }} />
            <button className="cart-btn-header" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={20} /> Carrito <span className="cart-badge-inline">{cart.length}</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="featured-collection" id="catalogo">
          <div className="section-header">
            <h2>Catálogo Oficial Hermida Perfumes</h2>
            <p>Explora nuestra colección completa de perfumería árabe, nicho y diseñador</p>
          </div>

          <div className="catalog-controls">
            <div className="valen-search-bar">
              <Search size={20} className="valen-search-icon" />
              <input
                type="text"
                placeholder="Buscar productos... (ej. Lattafa, Creed, Dulce)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="valen-search-input"
              />
            </div>
            <div className="categories-filter">
              {['Todas', ...categories].map(cat => (
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

          <p className="catalog-count-text">
            Mostrando {filteredProducts.length} productos
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#888' }}>
              <p>Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#888' }}>
              <p>No hay perfumes en esta categoría.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <div key={product.id} className="product-card" onClick={() => { setSelectedProductDetails(product); setSelectedDetailsSize('100ml'); }}>
                  <div className="product-image-wrapper">
                    {product.promotion && <div className="product-promo-badge">{product.promotion}</div>}
                    {product.status === 'agotado' && <div className="product-promo-badge" style={{ background: '#333' }}>AGOTADO</div>}
                    <img src={product.image} alt={product.name} className="product-image" />
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-price">{product.price}</p>
                    <button 
                      className="add-to-cart-btn" 
                      style={{ opacity: product.status === 'agotado' ? 0.5 : 1 }}
                      onClick={(e) => { e.stopPropagation(); setSelectedProductDetails(product); setSelectedDetailsSize('100ml'); }}
                    >
                      <span>{product.status === 'agotado' ? 'Agotado' : 'Ver y Agregar'}</span> <Info size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="secondary-banner" id="como-pedir">
          <div className="secondary-banner-content">
            <img src={siteLogo} alt="Hermida Perfumes Logo" className="secondary-banner-logo" />
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--color-foreground)' }}>¿CÓMO HACER TU PEDIDO?</h2>
            <div className="order-steps-container">
              <p className="step-text"><CheckCircle2 size={20} color="var(--color-button)" /> 1. Elige tu perfume y tamaño favorito.</p>
              <p className="step-text"><CheckCircle2 size={20} color="var(--color-button)" /> 2. Agrégalo al carrito y ve a pagar.</p>
              <p className="step-text"><CheckCircle2 size={20} color="var(--color-button)" /> 3. Se enviará tu orden directa a WhatsApp.</p>
              <p className="step-text"><CheckCircle2 size={20} color="var(--color-button)" /> 4. Despachamos de inmediato a todo el país.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" id="contacto">
        <div className="footer-content">
          <div className="footer-column">
            <h3 style={{ color: 'var(--color-button)' }}>HERMIDA PERFUMES</h3>
            <p className="footer-text" style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--color-foreground)', fontWeight: '500' }}>
              Nos especializamos en ofrecer perfumes originales de la más alta calidad, con envíos seguros a nivel nacional.
            </p>
            <div className="social-links" style={{ marginTop: '1.5rem' }}>
              <a href={`https://wa.me/${phoneNumber}`} className="social-btn whatsapp" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                WHATSAPP
              </a>
              {tiktokUrl && (
                <a href={tiktokUrl} className="social-btn" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
                  TIKTOK
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} className="social-btn" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  INSTAGRAM
                </a>
              )}
            </div>
          </div>
          <div className="footer-column">
            <h3 style={{ color: 'var(--color-button)' }}>Contáctanos</h3>
            <ul>
              <li><a href={`https://wa.me/${phoneNumber}`}><Phone size={18} color="var(--color-button)" /> +{phoneNumber}</a></li>
              <li><a href="#"><MapPin size={18} color="var(--color-button)" /> Envíos a todo Colombia</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom" style={{ color: 'var(--color-foreground)' }}>© {new Date().getFullYear()} Hermida Perfumes. Todos los derechos reservados.</div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${phoneNumber}?text=Hola,%20quisiera%20más%20información`}
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" />
      </a>

      {/* Product Details Modal */}
      {selectedProductDetails && (
        <div className="modal-overlay" onClick={() => setSelectedProductDetails(null)}>
          <div className="product-details-modal" onClick={e => e.stopPropagation()}>
            <button className="product-modal-close" onClick={() => setSelectedProductDetails(null)}>
              <X size={28} />
            </button>
            
            <div className="product-modal-image-col">
              <img src={selectedProductDetails.image} alt={selectedProductDetails.name} />
            </div>
            
            <div className="product-modal-info-col">
              <h2 className="product-modal-title">{selectedProductDetails.name}</h2>
              <div className="product-modal-price">
                ${getPriceForSize(selectedProductDetails, selectedDetailsSize).toLocaleString('es-CO')}
              </div>
              
              <div className="product-modal-desc">
                {selectedProductDetails.description || 'Una fragancia excepcional que define tu presencia y elegancia.'}
              </div>

              <h4 style={{ marginBottom: '1rem', color: 'var(--color-foreground)', opacity: 0.8 }}>Elige tu tamaño</h4>
              <div className="product-modal-sizes">
                {['3ml', '5ml', '10ml', '100ml'].map(size => {
                  const hasPrice = selectedProductDetails.prices?.[size as keyof typeof selectedProductDetails.prices] || (size === '100ml' && selectedProductDetails.priceRaw);
                  if (!hasPrice) return null;
                  const price = size === '100ml' ? selectedProductDetails.priceRaw : selectedProductDetails.prices[size as keyof typeof selectedProductDetails.prices];
                  return (
                    <div 
                      key={size}
                      className={`size-option ${selectedDetailsSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedDetailsSize(size)}
                    >
                      <div className="size-option-left">
                        <div className="radio-circle"></div>
                        <span className="size-option-name">{size}</span>
                      </div>
                      <span className="size-option-price">${price.toLocaleString('es-CO')}</span>
                    </div>
                  )
                })}
              </div>
              
              <button 
                className="btn product-modal-add-btn"
                style={{ opacity: selectedProductDetails.status === 'agotado' ? 0.5 : 1 }} 
                onClick={() => { addToCart(selectedProductDetails, selectedDetailsSize); }}
                disabled={selectedProductDetails.status === 'agotado'}
              >
                {selectedProductDetails.status === 'agotado' ? 'AGOTADO' : 'AÑADIR AL CARRITO'} <ShoppingBag size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel Setup */}
      {showAdminLogin && (
        <div className="modal-overlay">
          <div className="admin-login-modal">
            <button className="modal-close" onClick={() => setShowAdminLogin(false)}><X size={20} /></button>
            <div className="admin-login-header">
              <Shield size={40} color="var(--color-button)" />
              <h2>Acceso Administrativo</h2>
            </div>
            <p className="admin-login-desc">Ingresa el PIN de 4 dígitos para gestionar tu tienda.</p>
            <div className="pin-inputs">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  ref={pinRefs[idx]}
                  type="password"
                  maxLength={1}
                  value={digit}
                  className="pin-box"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/[0-9]/.test(val) || val === '') {
                      const newPin = [...pin];
                      newPin[idx] = val;
                      setPin(newPin);
                      if (val && idx < 3) pinRefs[idx + 1].current?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !pin[idx] && idx > 0) {
                      pinRefs[idx - 1].current?.focus();
                    }
                  }}
                />
              ))}
            </div>
            <button className="btn admin-submit-btn" onClick={verifyPin}>Verificar PIN</button>
          </div>
        </div>
      )}

      {isAdminAuth && (
        <div className="admin-dashboard-overlay">
          <div className="admin-dashboard">
            <button className="admin-close-btn" onClick={() => setIsAdminAuth(false)}><X size={28} /></button>
            
            {adminTab === 'menu' && (
              <div className="admin-menu-view">
                <h2>¿Qué cambios quieres realizar?</h2>
                <div className="admin-menu-grid">
                  <button className="admin-menu-btn" onClick={() => setAdminTab('add')}>
                    <Plus size={32} /> <span>Agregar Producto</span>
                  </button>
                  <button className="admin-menu-btn" onClick={() => setAdminTab('products')}>
                    <Edit size={32} /> <span>Editar Productos</span>
                  </button>
                  <button className="admin-menu-btn" onClick={() => setAdminTab('settings')}>
                    <Save size={32} /> <span>Configuraciones Generales</span>
                  </button>
                </div>
              </div>
            )}

            {adminTab !== 'menu' && (
              <div className="admin-workspace">
                <div className="admin-workspace-header">
                  <button className="back-btn" onClick={() => setAdminTab('menu')}>&larr; Volver al Menú</button>
                  <h3>{adminTab === 'products' ? 'Gestión de Productos' : adminTab === 'add' ? (editingProduct ? 'Editar Producto' : 'Nuevo Producto') : 'Configuración'}</h3>
                </div>
                
                <div className="admin-content-scroll">
                  {adminTab === 'products' && (
                    <div className="admin-products-list">
                      {products.length === 0 && <p style={{ color: '#888' }}>No hay productos.</p>}
                      {products.map(p => (
                        <div key={p.id} className="admin-product-item">
                          <img src={p.image} alt={p.name} />
                          <div className="admin-prod-info">
                            <h4>{p.name}</h4>
                            <p>{p.price}</p>
                          </div>
                          <div className="admin-prod-actions">
                            <button onClick={() => { setEditingProduct(p); setAdminTab('add'); }}><Edit size={18} /></button>
                            <button onClick={() => handleDeleteProduct(p.id)} style={{color: '#ff3b3b'}}><Trash2 size={18} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {adminTab === 'add' && (
                    <form onSubmit={handleSaveProduct} className="admin-form">
                      <div className="form-group">
                        <label>Nombre del Perfume</label>
                        <input name="name" required defaultValue={editingProduct?.name} />
                      </div>
                      <div className="form-group">
                        <label>Categoría</label>
                        <select name="category" required defaultValue={editingProduct?.category || categories[0]}>
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Estado del producto</label>
                        <select name="status" defaultValue={editingProduct?.status || 'activo'}>
                          <option value="activo">Activo (Disponible)</option>
                          <option value="agotado">Agotado</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Descripción y Notas (Opcional)</label>
                        <textarea name="description" rows={3} defaultValue={editingProduct?.description}></textarea>
                      </div>

                      <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label>Precio Perfume (100ml)</label>
                          <input name="price100ml" type="number" required defaultValue={editingProduct?.prices?.['100ml'] || editingProduct?.priceRaw} />
                        </div>
                        <div className="form-group">
                          <label>Precio Decant 10ml</label>
                          <input name="price10ml" type="number" defaultValue={editingProduct?.prices?.['10ml'] || ''} />
                        </div>
                        <div className="form-group">
                          <label>Precio Decant 5ml</label>
                          <input name="price5ml" type="number" defaultValue={editingProduct?.prices?.['5ml'] || ''} />
                        </div>
                        <div className="form-group">
                          <label>Precio Decant 3ml</label>
                          <input name="price3ml" type="number" defaultValue={editingProduct?.prices?.['3ml'] || ''} />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Texto de Promoción (Ej: 30% OFF)</label>
                        <input name="promotion" defaultValue={editingProduct?.promotion} placeholder="Dejar vacío si no hay promo" />
                      </div>
                      <div className="form-group">
                        <label>Imagen del Producto</label>
                        <div className="upload-container">
                          {(tempImageUrl || editingProduct?.image) && (
                            <img src={tempImageUrl || editingProduct?.image} alt="Preview" className="image-preview" />
                          )}
                          <label className="upload-btn">
                            {isUploading ? 'Subiendo...' : <><UploadCloud size={20} /> Subir Imagen</>}
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, false)} disabled={isUploading} hidden />
                          </label>
                        </div>
                      </div>
                      <button type="submit" className="btn" style={{width: '100%', justifyContent: 'center'}} disabled={isUploading}>
                        <Save size={18} /> {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                      </button>
                    </form>
                  )}

                  {adminTab === 'settings' && (
                    <form onSubmit={handleSaveSettings} className="admin-form">
                      <div className="admin-settings-section">
                        <h4 style={{marginBottom: '1rem', color: 'var(--color-button)'}}>Configuración de WhatsApp</h4>
                        <div className="form-group">
                          <label>Número de WhatsApp (con código de país ej: 57314...)</label>
                          <input name="phoneNumber" required defaultValue={phoneNumber} />
                        </div>
                        <div className="form-group">
                          <label>Instagram URL (Opcional)</label>
                          <input name="instagramUrl" defaultValue={instagramUrl} placeholder="https://instagram.com/hermida..." />
                        </div>
                        <div className="form-group">
                          <label>TikTok URL (Opcional)</label>
                          <input name="tiktokUrl" defaultValue={tiktokUrl} placeholder="https://tiktok.com/@hermida..." />
                        </div>
                      </div>

                      <div className="admin-settings-section">
                        <h4 style={{marginBottom: '1rem', color: 'var(--color-button)'}}>Diseño y Contenido</h4>
                        <div className="form-group">
                          <label>Categorías (separadas por coma)</label>
                          <input name="categories" required defaultValue={categories.join(', ')} />
                        </div>
                        <div className="form-group">
                          <label>Mensajes del Carrusel (separados por coma)</label>
                          <input name="announcements" required defaultValue={announcements.join(', ')} />
                        </div>
                        <div className="form-group">
                          <label>Logotipo del Sitio</label>
                          <div className="upload-container">
                            <img src={siteLogo} alt="Logo Preview" className="image-preview" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                            <label className="upload-btn">
                              {isUploading ? 'Actualizando...' : <><UploadCloud size={20} /> Subir Nuevo Logo</>}
                              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, true)} disabled={isUploading} hidden />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="admin-settings-section" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                        <h4 style={{marginBottom: '1rem', color: 'var(--color-button)'}}>Seguridad</h4>
                        <div className="form-group">
                          <label>Cambiar PIN de Admin (4 dígitos)</label>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <input type="text" maxLength={4} placeholder="Nuevo PIN" id="newPinInput" onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }} />
                            <button type="button" className="btn" onClick={() => {
                              const input = document.getElementById('newPinInput') as HTMLInputElement;
                              if (input.value.length === 4) { handleSavePin(input.value); input.value = ''; }
                              else alert('El PIN debe tener exactamente 4 dígitos.');
                            }}>Actualizar PIN</button>
                          </div>
                        </div>
                      </div>

                      <button type="submit" className="btn" style={{width: '100%', justifyContent: 'center', marginTop: '1rem'}}>
                        <Save size={18} /> Guardar Configuración Global
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="cart-sidebar open">
          <div className="cart-header">
            <h3>Tu Carrito ({cart.length})</h3>
            <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}><X size={24} color="var(--color-foreground)" /></button>
          </div>
          <div className="cart-items">
            {cart.length === 0 ? (
              <div className="empty-cart"><ShoppingBag size={48} /><p>Tu carrito está vacío</p></div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                  <div className="cart-item-details">
                    <h4 style={{ color: 'var(--color-foreground)' }}>{item.name}</h4>
                    <span className="cart-item-price">${item.priceRaw.toLocaleString('es-CO')}</span>
                    <div className="cart-item-controls">
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                        <span style={{ color: '#fff', fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
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
              <div className="cart-total" style={{ color: 'var(--color-foreground)' }}><span>Total:</span><span>${cartTotal.toLocaleString('es-CO')}</span></div>
              <button className="checkout-btn" onClick={handleCheckout}>Hacer Pedido por WhatsApp <Phone size={18} /></button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
