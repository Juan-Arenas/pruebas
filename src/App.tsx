import { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Phone, MapPin, CheckCircle2, X, Plus, Minus, Trash2 } from 'lucide-react';
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

const ALL_PRODUCTS: Product[] = [
  { id: 1, name: 'CLUB DE NUIT INTENSE', price: '$220.000', priceRaw: 220000, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600', category: 'Amaderados' },
  { id: 2, name: 'LATTAFA ASAD', price: '$150.000', priceRaw: 150000, image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=600', category: 'Amaderados' },
  { id: 3, name: 'YARA ROSA', price: '$140.000', priceRaw: 140000, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600', category: 'Dulces' },
  { id: 4, name: 'HAWAS FOR HIM', price: '$260.000', priceRaw: 260000, image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600', category: 'Cítricos' },
  { id: 5, name: 'AL HARAMAIN DETOUR', price: '$170.000', priceRaw: 170000, image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=600', category: 'Dulces' },
  { id: 6, name: 'AFNAN 9 PM', price: '$180.000', priceRaw: 180000, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600', category: 'Dulces' },
  { id: 7, name: 'KHAMRAH LATTAFA', price: '$190.000', priceRaw: 190000, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600', category: 'Dulces' },
  { id: 8, name: 'CLUB DE NUIT UNTOLD', price: '$240.000', priceRaw: 240000, image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=600', category: 'Dulces' },
];

const CATEGORIES = ['Todas', 'Amaderados', 'Dulces', 'Cítricos'];

function App() {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('hermida_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [logoClicks, setLogoClicks] = useState(0);

  useEffect(() => {
    localStorage.setItem('hermida_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (logoClicks >= 3) {
      const pwd = prompt("Acceso al Panel de Administrador. Ingrese contraseña:");
      // Simple frontend check for demo. DO NOT hardcode real passwords in production!
      if (pwd === import.meta.env.VITE_ADMIN_PASSWORD || pwd === "admin123") {
         alert("¡Bienvenido al panel! (Esta es una versión de demostración)");
      } else if (pwd !== null) {
         alert("Contraseña incorrecta.");
      }
      setLogoClicks(0);
    }
    
    let timer: number;
    if (logoClicks > 0) {
      timer = window.setTimeout(() => setLogoClicks(0), 1500);
    }
    return () => clearTimeout(timer);
  }, [logoClicks]);

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

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

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

  const filteredProducts = ALL_PRODUCTS.filter(p => {
    const matchesCategory = activeCategory === 'Todas' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <header className="header">
        <div className="header-top">
          <div className="header-spacer"></div>
          <div className="header-logo" onClick={() => setLogoClicks(c => c + 1)} style={{ cursor: 'pointer' }}>
            <img src="/logo.jpg" alt="Hermida Perfumes" />
          </div>
          <div className="header-icons">
            <User size={24} />
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
              <p>No se encontraron perfumes con esa búsqueda.</p>
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

        <section className="secondary-banner" id="como-pedir">
          <div className="secondary-banner-content">
            <img src="/logo.jpg" alt="Hermida Perfumes Logo" className="secondary-banner-logo" />
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

      <footer className="footer" id="contacto">
        <div className="footer-content">
          <div className="footer-column">
            <h3>HERMIDA PERFUMES</h3>
            <p style={{ fontSize: '1rem', color: '#aaa', lineHeight: '1.8' }}>
              Nos especializamos en ofrecer perfumes originales de la más alta calidad, con envíos seguros a nivel nacional. Tu esencia, nuestra pasión.
            </p>
            <div className="social-links">
              <a href="https://instagram.com/hermidaperfumes" target="_blank" rel="noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="https://tiktok.com/@hermida.perfumes" target="_blank" rel="noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.68a6.34 6.34 0 0 0 6.27 6.36 6.34 6.34 0 0 0 6.33-6.33V8.53a8.17 8.17 0 0 0 4.79 1.54V6.62a4.91 4.91 0 0 1-2.8-.93Z"/></svg>
              </a>
            </div>
          </div>
          <div className="footer-column">
            <h3>Enlaces Rápidos</h3>
            <ul>
              <li><a href="#catalogo">Catálogo</a></li>
              <li><a href="#como-pedir">Cómo pedir</a></li>
              <li><a href="#">Políticas de envío</a></li>
              <li><a href="#">Términos y condiciones</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contáctanos</h3>
            <ul>
              <li><a href="https://wa.me/573144679154"><Phone size={18} color="var(--color-button)" /> +57 314 4679154</a></li>
              <li><a href="#"><MapPin size={18} color="var(--color-button)" /> Envíos a todo Colombia</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          PAGINA DEMO HECHA POR JUAN ARENAS :)
        </div>
      </footer>

      {/* Cart Sidebar */}
      {isCartOpen && <div className="cart-overlay" onClick={() => setIsCartOpen(false)}></div>}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h2>Tu Carrito ({cartCount})</h2>
          <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={48} />
              <p>Tu carrito está vacío</p>
              <button className="btn" onClick={() => setIsCartOpen(false)}>Ver Catálogo</button>
            </div>
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
                    <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total Estimado:</span>
              <span>${cartTotal.toLocaleString('es-CO')}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              Hacer Pedido por WhatsApp <Phone size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/573144679154?text=Hola,%20vengo%20de%20la%20página%20web%20y%20me%20gustaría%20hacer%20un%20pedido." 
        className="whatsapp-float" 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
      >
        <svg viewBox="0 0 32 32" width="30" height="30" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.002 0C7.178 0 0 7.178 0 16c0 2.802.73 5.438 2.015 7.747L.31 29.897l6.32-1.658c2.247 1.155 4.764 1.8 7.373 1.8 8.824 0 16-7.176 16-16S24.825 0 16.002 0zm0 27.355c-2.33 0-4.52-.605-6.425-1.656l-.46-.255-4.773 1.252 1.272-4.653-.284-.45C4.248 19.68 3.593 17.89 3.593 16c0-6.84 5.566-12.408 12.41-12.408 6.842 0 12.408 5.568 12.408 12.408 0 6.84-5.566 12.407-12.41 12.407zM22.82 18.61c-.372-.186-2.203-1.088-2.545-1.213-.34-.123-.59-.185-.838.186-.248.373-.96 1.214-1.178 1.46-.217.25-.435.28-.807.094-2.12-.11-3.692-.938-4.995-2.607-.272-.346.26-.33.987-1.785.123-.248.06-.465-.03-.65-.094-.187-.838-2.022-1.15-2.766-.3-.725-.603-.627-.838-.638-.216-.01-.465-.01-.713-.01-.25 0-.65.093-.99.465-.342.373-1.304 1.274-1.304 3.104 0 1.832 1.335 3.6 1.52 3.848.187.25 2.625 4.007 6.362 5.623 2.146.924 3.01.996 4.015.84 1.155-.18 2.204-.9 2.513-1.772.31-.87.31-1.614.218-1.77-.094-.155-.342-.25-.714-.436z"/>
        </svg>
      </a>
    </>
  );
}

export default App;
