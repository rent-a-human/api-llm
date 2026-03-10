import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { categories } from '../data/products';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { totalItems } = useCart();
  const [showCategories, setShowCategories] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const isProductsActive = location.pathname === '/' || location.pathname.startsWith('/category');

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('en') ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="header" style={{ position: 'sticky', top: 0, zIndex: 100, background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.5rem' }}>🛒</span>
            <span>Lichigo</span>
          </Link>

          {/* Navigation */}
          <nav className="nav" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Link
              to="/"
              className={`nav-btn ${isProductsActive ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              {t('nav.products')}
            </Link>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className={`nav-btn ${isProductsActive ? 'active' : ''}`}
              >
                {t('footer.categories')}
              </button>

              {showCategories && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '0.25rem',
                  background: 'white',
                  color: 'black',
                  borderRadius: '0.5rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  minWidth: '200px'
                }}>
                  {categories.map(category => (
                    <Link
                      key={category.id}
                      to={`/category/${category.id}`}
                      onClick={() => setShowCategories(false)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span>{category.icon}</span>
                      <span>{t(`category.${category.id.replace('-', '_')}`)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Cart & Language Toggle */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={toggleLanguage}
              style={{
                background: 'none',
                border: '1px solid #e5e7eb',
                padding: '0.3rem 0.6rem',
                borderRadius: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#4b5563',
                fontSize: '0.8rem'
              }}
            >
              {i18n.language.startsWith('en') ? 'ES' : 'EN'}
            </button>

            <Link
              to="/cart"
              className="cart-btn"
              style={{ textDecoration: 'none' }}
            >
              🛍️ {t('nav.cart')}
              {totalItems > 0 && (
                <span className="cart-badge">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginTop: '1rem',
          overflowX: 'auto'
        }}>
          <Link
            to="/"
            className={`nav-btn ${isProductsActive ? 'active' : ''}`}
            style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
          >
            {t('nav.products')}
          </Link>

          {/* Category Pills */}
          {categories.slice(0, 4).map(category => {
            const isCatActive = location.pathname === `/category/${category.id}`;
            return (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className={`category-pill ${isCatActive ? 'active' : ''}`}
                style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
              >
                {category.icon} {t(`category.${category.id.replace('-', '_')}`)}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;