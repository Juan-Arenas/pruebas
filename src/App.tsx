import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, User, Phone, X, Plus, Minus, Trash2, Edit, Save, Shield, UploadCloud, Filter, ArrowRight } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import './index.css';

type Product = {
  id: string;
  name: string;
  price: string;
  priceRaw: number;
  prices?: Record<string, number>;
  image: string;
  category?: string;
  categories?: string[];
  promotion?: string;
  description?: string;
  status?: 'activo' | 'agotado';
};

type CartItem = Product & { quantity: number; selectedSize: string };

function App() {
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
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const pinRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const [adminTab, setAdminTab] = useState<'menu' | 'products' | 'add' | 'settings'>('menu');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [customPrices, setCustomPrices] = useState<{size: string, price: number}[]>([]);

  useEffect(() => {
    document.body.className = 'light-theme';
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const reveals = document.querySelectorAll('.reveal, .reveal-bar');
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 100;
        if (elementTop < windowHeight - elementVisible) {
          reveals[i].classList.add('active');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    if (showAdminLogin || isAdminAuth || isCartOpen || selectedProductDetails || isMobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showAdminLogin, isAdminAuth, isCartOpen, selectedProductDetails, isMobileFiltersOpen]);

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
    if (product.prices && product.prices[size]) {
      return product.prices[size];
    }
    return product.priceRaw || 0;
  };

  const addToCart = (product: Product, size: string) => {
    if (product.status === 'agotado') return;
    
    const availableSizes = Object.keys(product.prices || {});
    let finalSize = size;
    if (!product.prices || availableSizes.length === 0) {
      finalSize = 'Botella';
    }
    
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

    const pricesObj: Record<string, number> = {};
    customPrices.forEach(p => { if (p.size && p.price > 0) pricesObj[p.size] = p.price; });
    const basePrice = customPrices.length > 0 ? customPrices[0].price : 0;

    const selectedCats = formData.getAll('product_categories') as string[];
    const prodData = {
      name: formData.get('name'),
      price: `$${basePrice.toLocaleString('es-CO')}`,
      priceRaw: basePrice,
      prices: pricesObj,
      category: selectedCats.length > 0 ? selectedCats[0] : (formData.get('category') || ''),
      categories: selectedCats,
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
    const matchesCategory = activeCategory === 'Todas' || activeCategory === 'Decants' || p.category === activeCategory || (p.categories && p.categories.includes(activeCategory));
    
    let isDecantMatch = true;
    if (activeCategory === 'Decants') {
       isDecantMatch = p.prices ? Object.keys(p.prices).some(s => s.toLowerCase().includes('ml')) : false;
    }
    
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.categories && p.categories.join(' ').toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch && isDecantMatch;
  });

  const getBottleSize = (prices?: Record<string, number>) => {
    if (!prices || Object.keys(prices).length === 0) return 'Botella';
    const keys = Object.keys(prices);
    const bottleKey = keys.find(k => k.toLowerCase().includes('100') || k.toLowerCase().includes('botella'));
    return bottleKey || keys[0];
  }

  const ProductCardComponent = ({ product }: { product: Product }) => {
    const [selectedSize, setSelectedSize] = useState<string>(getBottleSize(product.prices));
    
    const availableSizes = product.prices ? Object.keys(product.prices) : [];
    const hasDecants = availableSizes.length > 1;

    return (
      <div className="product-card premium-card fade-in-up">
        <div className="product-card-inner">
          <div className="product-image-wrapper" onClick={() => { setSelectedProductDetails(product); setSelectedDetailsSize(selectedSize); }}>
            {product.promotion && <div className="product-promo-badge">{product.promotion}</div>}
            {product.status === 'agotado' && <div className="product-promo-badge agotado">AGOTADO</div>}
            <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
            <div className="quick-view-overlay">
              <span>VISTA RÁPIDA</span>
            </div>
          </div>
          
          <div className="product-info">
            {product.category && <span className="product-brand">{product.category}</span>}
            <h3 className="product-title">{product.name}</h3>
            
            {!hasDecants ? (
              <div className="product-single-price">
                <span className="price-val">${getPriceForSize(product, selectedSize).toLocaleString('es-CO')}</span>
                <span className="price-label">· Botella</span>
              </div>
            ) : (
              <div className="product-decants-container">
                <div className="product-single-price">
                   <span className="price-val">${getPriceForSize(product, selectedSize).toLocaleString('es-CO')}</span>
                   <span className="price-label">· {selectedSize}</span>
                </div>
                <p className="decants-title">PRESENTACIONES</p>
                <div className="decants-options">
                  {availableSizes.map(size => (
                    <button 
                      key={size} 
                      className={`decant-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedSize(size); }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button 
              className="btn-add-premium" 
              style={{ opacity: product.status === 'agotado' ? 0.5 : 1, pointerEvents: product.status === 'agotado' ? 'none' : 'auto' }}
              onClick={(e) => { e.stopPropagation(); addToCart(product, selectedSize); }}
            >
              {product.status === 'agotado' ? 'AGOTADO' : '+ AGREGAR'}
            </button>
          </div>
        </div>
      </div>
    );
  };

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

      <header className="header premium-header">
        <div className="header-container">
          <div className="logo-section" onClick={() => setLogoClicks(c => c + 1)} style={{ cursor: 'pointer' }}>
            <img src={siteLogo} alt="Hermida Perfumes" className="logo-img" />
            <div className="logo-text">
              <h1 className="store-name">HERMIDA</h1>
              <span className="tagline">Perfumes</span>
            </div>
          </div>

          <nav className="header-nav desktop-nav">
            <a href="#catalogo" className="active">Catálogo</a>
            <a href="#como-pedir">Cómo Pedir</a>
            <a href="#decants">Decants</a>
            <a href="#contacto">Contacto</a>
          </nav>

          <div className="header-icons">
            <Search size={22} className="icon-btn search-trigger" onClick={() => document.getElementById('main-search')?.focus()} />
            <User size={22} className="icon-btn" onClick={() => setShowAdminLogin(true)} />
            <button className="cart-btn-header premium-cart-btn" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag size={20} /> <span className="cart-badge-inline">{cart.length}</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Removed Hero Section */}

        <section className="decants-promo-section reveal" id="decants">
          <div className="decants-promo-content glass-card">
            <h2>DESCUBRE ANTES DE COMPRAR</h2>
            <p>Prueba tus fragancias favoritas en formato decant de 5 ml y 10 ml antes de llevar la botella completa.</p>
            <button className="btn-outline-light" onClick={() => { setActiveCategory('Decants'); document.getElementById('catalogo')?.scrollIntoView({behavior: 'smooth'}); }}>VER TODOS LOS DECANTS</button>
          </div>
        </section>

        <section className="catalog-section" id="catalogo">
          <div className="catalog-header reveal">
            <h2>NUESTRA COLECCIÓN</h2>
          </div>

          <div className="catalog-controls reveal">
            <div className="modern-search-wrapper">
              <Search size={20} className="search-icon" />
              <input
                id="main-search"
                type="text"
                placeholder="Busca tu fragancia (ej. Khamrah, Lattafa...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="modern-search-input"
              />
            </div>
            
            <div className="desktop-filters">
              {['Todas', 'Decants', ...categories].map(cat => (
                <button
                  key={cat}
                  className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button className="mobile-filter-btn" onClick={() => setIsMobileFiltersOpen(true)}>
              <Filter size={18} /> FILTRAR Y ORDENAR
            </button>
          </div>

          {loading ? (
            <div className="skeleton-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <div key={n} className="skeleton-card">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-text short"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text button"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <p>No se encontraron resultados para tu búsqueda.</p>
              <button className="btn-outline-dark" onClick={() => {setSearchQuery(''); setActiveCategory('Todas');}}>Ver todos los productos</button>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCardComponent key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <section className="editorial-section reveal">
          <div className="editorial-content">
            <h2>UNA FRAGANCIA DICE MÁS DE TI DE LO QUE IMAGINAS.</h2>
            <p>La perfumería es el arte de crear recuerdos imborrables.</p>
            <button className="btn-outline-light" onClick={() => document.getElementById('catalogo')?.scrollIntoView({behavior: 'smooth'})}>DESCUBRIR HERMIDA</button>
          </div>
        </section>
      </main>

      <footer className="footer reveal" id="contacto">
        <div className="footer-content">
           <div className="footer-brand">
              <img src={siteLogo} alt="Logo" className="footer-logo" />
              <h3>HERMIDA PERFUMES</h3>
              <p>Perfumería premium con envíos seguros a toda Colombia.</p>
           </div>
           <div className="footer-links">
              <h4>Enlaces</h4>
              <a href="#catalogo">Catálogo</a>
              <a href="#decants">Decants</a>
              <a href="#como-pedir">Cómo comprar</a>
           </div>
           <div className="footer-social">
              <h4>Síguenos</h4>
              <div className="social-links-row">
                 <a href={instagramUrl || "https://instagram.com"} target="_blank" rel="noreferrer" className="social-icon">IG</a>
                 <a href={tiktokUrl || "https://tiktok.com"} target="_blank" rel="noreferrer" className="social-icon">TK</a>
              </div>
           </div>
        </div>
        <div className="footer-bottom">
           <p>© {new Date().getFullYear()} Hermida Perfumes. Todos los derechos reservados.</p>
        </div>
      </footer>

      <a href={`https://wa.me/${phoneNumber}`} target="_blank" rel="noreferrer" className="whatsapp-fab">
        <svg viewBox="0 0 24 24" fill="white" width="30" height="30"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
      </a>

      {selectedProductDetails && (
        <div className="premium-modal-overlay" onClick={() => setSelectedProductDetails(null)}>
          <div className="premium-modal-content" onClick={e => e.stopPropagation()}>
            <button className="premium-modal-close" onClick={() => setSelectedProductDetails(null)}>
              <X size={24} />
            </button>
            <div className="premium-modal-grid">
              <div className="modal-img-col">
                <img src={selectedProductDetails.image} alt={selectedProductDetails.name} />
              </div>
              <div className="modal-info-col">
                <span className="modal-brand">{selectedProductDetails.category}</span>
                <h2 className="modal-title">{selectedProductDetails.name}</h2>
                <div className="modal-price-wrap">
                  <span className="modal-price">${getPriceForSize(selectedProductDetails, selectedDetailsSize).toLocaleString('es-CO')}</span>
                </div>
                <div className="modal-desc">
                  {selectedProductDetails.description || 'Una fragancia elegante y duradera. Perfecta para dejar una impresión inolvidable.'}
                </div>
                
                {selectedProductDetails.prices && Object.keys(selectedProductDetails.prices).length > 0 && (
                  <div className="modal-sizes">
                    <h4>PRESENTACIONES DISPONIBLES</h4>
                    <div className="size-selector-grid">
                      {Object.entries(selectedProductDetails.prices).map(([size, price]) => (
                        <div 
                          key={size}
                          className={`size-box ${selectedDetailsSize === size ? 'active' : ''}`}
                          onClick={() => setSelectedDetailsSize(size)}
                        >
                          <span className="sz-name">{size}</span>
                          <span className="sz-price">${price.toLocaleString('es-CO')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button 
                  className="btn-premium-solid"
                  disabled={selectedProductDetails.status === 'agotado'}
                  onClick={() => addToCart(selectedProductDetails, selectedDetailsSize)}
                >
                  {selectedProductDetails.status === 'agotado' ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`modern-cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>CARRITO ({cart.length})</h3>
          <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}><X size={24} /></button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart-modern">
              <ShoppingBag size={48} />
              <p>Tu carrito está vacío</p>
              <button className="btn-outline-dark" onClick={() => setIsCartOpen(false)}>Seguir comprando</button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="modern-cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <span className="item-price">${item.priceRaw.toLocaleString('es-CO')}</span>
                  <div className="item-actions">
                    <div className="qty-picker">
                      <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14}/></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14}/></button>
                    </div>
                    <button className="trash-btn" onClick={() => removeFromCart(item.id)}><Trash2 size={18}/></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer-modern">
            <div className="cart-total-modern">
              <span>SUBTOTAL</span>
              <span>${cartTotal.toLocaleString('es-CO')}</span>
            </div>
            <button className="btn-premium-solid full-width" onClick={handleCheckout}>
              FINALIZAR PEDIDO <Phone size={18} />
            </button>
          </div>
        )}
      </div>

      <div className={`mobile-filters-overlay ${isMobileFiltersOpen ? 'open' : ''}`} onClick={() => setIsMobileFiltersOpen(false)}></div>
      <div className={`mobile-filters-sheet ${isMobileFiltersOpen ? 'open' : ''}`}>
        <div className="sheet-header">
          <h3>Filtrar por</h3>
          <button onClick={() => setIsMobileFiltersOpen(false)}><X size={24} /></button>
        </div>
        <div className="sheet-content">
          {['Todas', 'Decants', ...categories].map(cat => (
            <button
              key={cat}
              className={`sheet-filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => { setActiveCategory(cat); setIsMobileFiltersOpen(false); }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {showAdminLogin && (
        <div className="modal-overlay">
          <div className="admin-login-modal">
            <button className="modal-close" onClick={() => setShowAdminLogin(false)}><X size={20} /></button>
            <div className="admin-login-header">
              <Shield size={40} color="var(--color-accent)" />
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
            <button className="btn-premium-solid full-width" onClick={verifyPin}>Verificar PIN</button>
          </div>
        </div>
      )}

      {isAdminAuth && (
         <div className="admin-dashboard-overlay">
           <div className="admin-dashboard">
             <button className="admin-close-btn" onClick={() => setIsAdminAuth(false)}><X size={28} /></button>
             
             {adminTab === 'menu' && (
               <div className="admin-menu-view">
                 <h2>Panel de Administración</h2>
                 <div className="admin-menu-grid">
                   <button className="admin-menu-btn" onClick={() => { setEditingProduct(null); setCustomPrices([{size: '100ml', price: 0}]); setAdminTab('add'); }}>
                     <Plus size={32} /> <span>Agregar Producto</span>
                   </button>
                   <button className="admin-menu-btn" onClick={() => setAdminTab('products')}>
                     <Edit size={32} /> <span>Editar Productos</span>
                   </button>
                   <button className="admin-menu-btn" onClick={() => setAdminTab('settings')}>
                     <Save size={32} /> <span>Configuraciones</span>
                   </button>
                 </div>
               </div>
             )}
 
             {adminTab !== 'menu' && (
               <div className="admin-workspace">
                 <div className="admin-workspace-header">
                   <button className="back-btn" onClick={() => setAdminTab('menu')}>&larr; Volver</button>
                   <h3>{adminTab === 'products' ? 'Productos' : adminTab === 'add' ? (editingProduct ? 'Editar' : 'Nuevo') : 'Configuración'}</h3>
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
                             <button onClick={() => { setEditingProduct(p); setCustomPrices(p.prices ? Object.entries(p.prices).map(([size, price]) => ({size, price})) : [{size: '100ml', price: p.priceRaw || 0}]); setAdminTab('add'); }} className="edit-btn"><Edit size={18} /></button>
                             <button onClick={() => handleDeleteProduct(p.id)} className="del-btn"><Trash2 size={18} /></button>
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
                         <label>Categorías</label>
                         <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                           {categories.map(c => (
                             <label key={c} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0 }}>
                               <input type="checkbox" name="product_categories" value={c} defaultChecked={editingProduct?.categories?.includes(c) || editingProduct?.category === c} />
                               {c}
                             </label>
                           ))}
                         </div>
                       </div>
                       <div className="form-group">
                         <label>Estado</label>
                         <select name="status" defaultValue={editingProduct?.status || 'activo'}>
                           <option value="activo">Activo</option>
                           <option value="agotado">Agotado</option>
                         </select>
                       </div>
                       <div className="form-group">
                         <label>Descripción</label>
                         <textarea name="description" rows={3} defaultValue={editingProduct?.description}></textarea>
                       </div>
 
                       <div className="form-group">
                         <label>Tamaños y Precios</label>
                         {customPrices.map((cp, idx) => (
                           <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                             <input type="text" placeholder="Tamaño" value={cp.size} onChange={e => {
                               const newP = [...customPrices];
                               newP[idx].size = e.target.value;
                               setCustomPrices(newP);
                             }} required />
                             <input type="number" placeholder="Precio" value={cp.price || ''} onChange={e => {
                               const newP = [...customPrices];
                               newP[idx].price = parseInt(e.target.value) || 0;
                               setCustomPrices(newP);
                             }} required />
                             <button type="button" onClick={() => setCustomPrices(customPrices.filter((_, i) => i !== idx))} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '0 1rem' }}>X</button>
                           </div>
                         ))}
                         <button type="button" onClick={() => setCustomPrices([...customPrices, {size: '', price: 0}])} className="btn-outline-dark" style={{ marginTop: '0.5rem' }}>+ Agregar Tamaño</button>
                       </div>
 
                       <div className="form-group">
                         <label>Promoción</label>
                         <input name="promotion" defaultValue={editingProduct?.promotion} placeholder="Ej: 30% OFF" />
                       </div>
                       <div className="form-group">
                         <label>Imagen</label>
                         <div className="upload-container">
                           {(tempImageUrl || editingProduct?.image) && (
                             <img src={tempImageUrl || editingProduct?.image} alt="Preview" className="image-preview" />
                           )}
                           <label className="btn-outline-dark upload-btn-label">
                             {isUploading ? 'Subiendo...' : <><UploadCloud size={20} /> Subir Imagen</>}
                             <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, false)} disabled={isUploading} hidden />
                           </label>
                         </div>
                       </div>
                       <button type="submit" className="btn-premium-solid full-width" disabled={isUploading}>
                         <Save size={18} /> {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                       </button>
                     </form>
                   )}
 
                   {adminTab === 'settings' && (
                     <form onSubmit={handleSaveSettings} className="admin-form">
                       <div className="form-group">
                         <label>WhatsApp (código país)</label>
                         <input name="phoneNumber" required defaultValue={phoneNumber} />
                       </div>
                       <div className="form-group">
                         <label>Instagram URL</label>
                         <input name="instagramUrl" defaultValue={instagramUrl} />
                       </div>
                       <div className="form-group">
                         <label>TikTok URL</label>
                         <input name="tiktokUrl" defaultValue={tiktokUrl} />
                       </div>
                       <div className="form-group">
                         <label>Categorías (comas)</label>
                         <input name="categories" required defaultValue={categories.join(', ')} />
                       </div>
                       <div className="form-group">
                         <label>Logo</label>
                         <div className="upload-container">
                           <img src={siteLogo} alt="Logo" className="image-preview" />
                           <label className="btn-outline-dark upload-btn-label">
                             {isUploading ? 'Actualizando...' : 'Subir Nuevo Logo'}
                             <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, true)} disabled={isUploading} hidden />
                           </label>
                         </div>
                       </div>
                       <div className="form-group">
                         <label>Nuevo PIN</label>
                         <input type="text" maxLength={4} id="newPinInput" />
                         <button type="button" className="btn-outline-dark" onClick={() => {
                           const input = document.getElementById('newPinInput') as HTMLInputElement;
                           if (input.value.length === 4) { handleSavePin(input.value); input.value = ''; }
                         }}>Actualizar PIN</button>
                       </div>
                       <button type="submit" className="btn-premium-solid full-width">
                         Guardar Configuración
                       </button>
                     </form>
                   )}
                 </div>
               </div>
             )}
           </div>
         </div>
       )}
    </>
  );
}

export default App;
