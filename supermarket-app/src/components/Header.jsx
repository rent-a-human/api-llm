import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { categories } from '../data/products';

const Header = ({ currentView, onViewChange, selectedCategory }) => {
  const { totalItems } = useCart();
  const [showCategories, setShowCategories] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo">
            <span style={{ fontSize: '1.5rem' }}>🛒</span>
            <span>SuperMarket</span>
          </div>

          {/* Navigation */}
          <nav className="nav">
            <button
              onClick={() => onViewChange('products')}
              className={`nav-btn ${currentView === 'products' ? 'active' : ''}`}
            >
              Products
            </button>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className={`nav-btn ${currentView === 'products' ? 'active' : ''}`}
              >
                Categories
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
                    <button
                      key={category.id}
                      onClick={() => {
                        onViewChange('products', category.id);
                        setShowCategories(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Cart */}
          <button
            onClick={() => onViewChange('cart')}
            className="cart-btn"
          >
            🛍️ Cart
            {totalItems > 0 && (
              <span className="cart-badge">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          flexWrap: 'wrap', 
          marginTop: '1rem',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => onViewChange('products')}
            className={`nav-btn ${currentView === 'products' ? 'active' : ''}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            Products
          </button>
          
          {/* Category Pills */}
          {categories.slice(0, 4).map(category => (
            <button
              key={category.id}
              onClick={() => onViewChange('products', category.id)}
              className={`category-pill ${selectedCategory === category.id ? 'active' : ''}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;