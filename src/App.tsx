import { Search, ShoppingBag, User, Sparkles, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import './index.css';

function App() {
  const products = [
    { id: 1, name: 'CLUB DE NUIT INTENSE', price: '$220.000', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600' },
    { id: 2, name: 'LATTAFA ASAD', price: '$150.000', image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=600' },
    { id: 3, name: 'YARA ROSA', price: '$140.000', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600' },
    { id: 4, name: 'HAWAS FOR HIM', price: '$260.000', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600' },
    { id: 5, name: 'AL HARAMAIN DETOUR', price: '$170.000', image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=600' },
    { id: 6, name: 'AFNAN 9 PM', price: '$180.000', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600' },
    { id: 7, name: 'KHAMRAH LATTAFA', price: '$190.000', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600' },
    { id: 8, name: 'CLUB DE NUIT UNTOLD', price: '$240.000', image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=600' },
  ];

  return (
    <>
      <div className="announcement-bar">
        <Sparkles size={16} />
        <span>ENVÍOS A TODA COLOMBIA 🇨🇴 | PAGOS CONTRA ENTREGA</span>
        <Sparkles size={16} />
      </div>

      <header className="header">
        <div className="header-top">
          <div className="header-search">
            <Search size={24} />
          </div>
          <div className="header-logo">
            <a href="#">
              <img src="/logo.jpg" alt="Hermida Perfumes" />
            </a>
          </div>
          <div className="header-icons">
            <User size={24} />
            <ShoppingBag size={24} />
          </div>
        </div>
        <nav className="header-nav">
          <a href="#" className="active">Catálogo</a>
          <a href="#como-pedir">Cómo Pedir</a>
          <a href="#contacto">Contacto</a>
          <a href="#">Árabes</a>
          <a href="#">Nicho</a>
        </nav>
      </header>

      <main>
        <section className="image-banner">
          <div className="banner-content">
            <p className="banner-subtitle">LA EXCLUSIVIDAD HECHA AROMA</p>
            <h1 className="banner-title">Hermida Perfumes</h1>
            <p className="banner-description">Descubre la esencia perfecta con nuestra colección de perfumería árabe, nicho y diseñador. Envíos 100% seguros a nivel nacional.</p>
            <button className="btn">
              Explorar Catálogo <ShoppingBag size={18} />
            </button>
          </div>
        </section>

        <section className="featured-collection" id="catalogo">
          <div className="section-header">
            <h2>Catálogo Oficial</h2>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-wrapper">
                  <img src={product.image} alt={product.name} className="product-image" />
                </div>
                <h3 className="product-title">{product.name}</h3>
                <p className="product-price">{product.price}</p>
                <button className="add-to-cart-btn">Agregar al carrito</button>
              </div>
            ))}
          </div>
        </section>

        <section className="secondary-banner" id="como-pedir">
          <div className="secondary-banner-content">
            <img src="/logo.jpg" alt="Hermida Perfumes Logo" className="secondary-banner-logo" />
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#fff' }}>¿CÓMO HACER TU PEDIDO?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', margin: '0 auto', textAlign: 'left', background: '#111', padding: '2rem', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem' }}><CheckCircle2 color="var(--color-button)" /> 1. Agrega tus perfumes favoritos al carrito.</p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem' }}><CheckCircle2 color="var(--color-button)" /> 2. Envíanos tu lista por WhatsApp.</p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem' }}><CheckCircle2 color="var(--color-button)" /> 3. Confirma tus datos de envío (Nombre, Teléfono, Dirección).</p>
              <p style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem' }}><CheckCircle2 color="var(--color-button)" /> 4. ¡Listo! Despachamos tu pedido de inmediato.</p>
            </div>
            <a href="https://wa.me/573144679154" target="_blank" rel="noreferrer" className="btn" style={{ marginTop: '2rem' }}>
              Pedir por WhatsApp <Phone size={18} />
            </a>
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

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/573144679154?text=Hola,%20vengo%20de%20la%20página%20web%20y%20me%20gustaría%20hacer%20un%20pedido." 
        className="whatsapp-float" 
        target="_blank" 
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
      >
        <svg viewBox="0 0 32 32" width="35" height="35" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.002 0C7.178 0 0 7.178 0 16c0 2.802.73 5.438 2.015 7.747L.31 29.897l6.32-1.658c2.247 1.155 4.764 1.8 7.373 1.8 8.824 0 16-7.176 16-16S24.825 0 16.002 0zm0 27.355c-2.33 0-4.52-.605-6.425-1.656l-.46-.255-4.773 1.252 1.272-4.653-.284-.45C4.248 19.68 3.593 17.89 3.593 16c0-6.84 5.566-12.408 12.41-12.408 6.842 0 12.408 5.568 12.408 12.408 0 6.84-5.566 12.407-12.41 12.407zM22.82 18.61c-.372-.186-2.203-1.088-2.545-1.213-.34-.123-.59-.185-.838.186-.248.373-.96 1.214-1.178 1.46-.217.25-.435.28-.807.094-2.12-.11-3.692-.938-4.995-2.607-.272-.346.26-.33.987-1.785.123-.248.06-.465-.03-.65-.094-.187-.838-2.022-1.15-2.766-.3-.725-.603-.627-.838-.638-.216-.01-.465-.01-.713-.01-.25 0-.65.093-.99.465-.342.373-1.304 1.274-1.304 3.104 0 1.832 1.335 3.6 1.52 3.848.187.25 2.625 4.007 6.362 5.623 2.146.924 3.01.996 4.015.84 1.155-.18 2.204-.9 2.513-1.772.31-.87.31-1.614.218-1.77-.094-.155-.342-.25-.714-.436z"/>
        </svg>
      </a>
    </>
  );
}

export default App;
