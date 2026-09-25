import React from 'react';
import { Search, ShoppingBag, User, ChevronLeft, ChevronRight } from 'lucide-react';
import './index.css';

function App() {
  const products = [
    { id: 1, name: 'CLUB DE NUIT INTENSE MAN', price: '$220.000', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600' },
    { id: 2, name: 'LATTAFA ASAD', price: '$150.000', image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=600' },
    { id: 3, name: 'YARA ROSA', price: '$140.000', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600' },
    { id: 4, name: 'HAWAS FOR HIM', price: '$260.000', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600' },
    { id: 5, name: 'AL HARAMAIN DETOUR NOIR', price: '$170.000', image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&q=80&w=600' },
    { id: 6, name: 'AFNAN 9 PM', price: '$180.000', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600' },
    { id: 7, name: 'KHAMRAH LATTAFA', price: '$190.000', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600' },
    { id: 8, name: 'CLUB DE NUIT UNTOLD', price: '$240.000', image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=600' },
  ];

  return (
    <>
      <div className="announcement-bar">
        <ChevronLeft size={16} color="#aaa" />
        <span className="announcement-text">🚚 ENVÍO GRATIS EN COMPRAS SUPERIORES A $300.000 COP</span>
        <ChevronRight size={16} color="#aaa" />
      </div>

      <header className="header">
        <div className="header-top">
          <div className="header-search">
            <Search size={22} color="#fff" />
          </div>
          <div className="header-logo">
            <a href="#">
              <img src="/logo.jpg" alt="Hermida Perfumes" />
            </a>
          </div>
          <div className="header-icons">
            <User size={22} color="#fff" />
            <ShoppingBag size={22} color="#fff" />
          </div>
        </div>
        <nav className="header-nav">
          <a href="#" style={{ textDecoration: 'underline', textUnderlineOffset: '6px', color: '#d4af37' }}>Inicio</a>
          <a href="#">Catálogo</a>
          <a href="#">Árabes</a>
          <a href="#">Diseñador</a>
          <a href="#">Nicho</a>
          <a href="#">Gift Sets</a>
          <a href="#">Testers</a>
          <a href="#">Contacto</a>
        </nav>
      </header>

      <main>
        <section className="image-banner">
          <div className="banner-content">
            <p className="banner-subtitle">PERFUMERÍA DE</p>
            <h1 className="banner-title">DISEÑADOR</h1>
            <div className="banner-logo-wrapper">
              <div className="banner-logo-line"></div>
              <img src="/logo.jpg" alt="Logo" />
              <div className="banner-logo-line"></div>
            </div>
            <p className="banner-description">Marcas icónicas. Fragancias inolvidables.</p>
          </div>
        </section>

        <section className="featured-collection">
          <div className="section-header">
            <h2>MÁS VENDIDOS</h2>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-wrapper">
                  <img src={product.image} alt={product.name} className="product-image" />
                </div>
                <h3 className="product-title">{product.name}</h3>
                <p className="product-price">{product.price}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="secondary-banner">
          <div className="secondary-banner-content">
            <img src="/logo.jpg" alt="Hermida Perfumes Logo" className="secondary-banner-logo" />
            <h2 className="secondary-banner-title">LA ESENCIA DE LA EXCLUSIVIDAD</h2>
            <button className="btn" style={{ backgroundColor: '#fff', color: '#121212' }}>Conocer Más</button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-column">
            <h3>HERMIDA PERFUMES</h3>
            <p style={{ fontSize: '0.9rem', color: '#555', marginTop: '1rem' }}>
              Nos especializamos en ofrecer perfumes originales de la más alta calidad, con envíos seguros a nivel nacional.
            </p>
          </div>
          <div className="footer-column">
            <h3>Enlaces Rápidos</h3>
            <ul>
              <li><a href="#">Buscar</a></li>
              <li><a href="#">Políticas de envío</a></li>
              <li><a href="#">Políticas de devolución</a></li>
              <li><a href="#">Términos del servicio</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contacto</h3>
            <ul>
              <li><a href="#">WhatsApp: +57 300 000 0000</a></li>
              <li><a href="#">Email: info@hermidaperfumes.com</a></li>
              <li><a href="#">Instagram: @hermidaperfumes</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          PAGINA DEMO HECHA POR JUAN ARENAS :)
        </div>
      </footer>
    </>
  );
}

export default App;
