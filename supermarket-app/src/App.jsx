import React, { useState } from 'react';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import { getProductById, getCategoryById } from './data/products';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState('products');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleViewChange = (view, categoryId = null) => {
    setCurrentView(view);
    setSelectedCategory(categoryId);
    if (view === 'products' && categoryId) {
      setSelectedCategory(categoryId);
    } else if (view === 'products') {
      setSelectedCategory(null);
    }
    if (view === 'detail') {
      setSelectedProduct(null);
    }
  };

  const handleProductClick = (product, categoryId = null) => {
    if (product) {
      setSelectedProduct(product);
      setCurrentView('detail');
    } else {
      // Handle category selection
      setSelectedCategory(categoryId);
      setCurrentView('products');
    }
  };

  const handleBackFromDetail = () => {
    setCurrentView('products');
    setSelectedProduct(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'detail':
        return (
          <ProductDetail
            product={selectedProduct}
            onBack={handleBackFromDetail}
          />
        );
      case 'cart':
        return <Cart />;
      case 'products':
      default:
        return (
          <ProductList
            selectedCategory={selectedCategory}
            onProductClick={handleProductClick}
          />
        );
    }
  };

  return (
    <CartProvider>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb' 
      }}>
        <Header
          currentView={currentView}
          onViewChange={handleViewChange}
          selectedCategory={selectedCategory}
        />
        
        <main style={{ paddingBottom: '2rem' }}>
          {renderCurrentView()}
        </main>

        {/* Footer */}
        <footer style={{
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '2rem 0',
          marginTop: '3rem'
        }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem'
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  marginBottom: '1rem' 
                }}>
                  🛒 SuperMarket
                </h3>
                <p style={{ 
                  color: '#9ca3af', 
                  fontSize: '0.875rem' 
                }}>
                  Your one-stop shop for fresh groceries and household items.
                </p>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
                  Categories
                </h4>
                <ul style={{ 
                  color: '#9ca3af', 
                  fontSize: '0.875rem',
                  listStyle: 'none',
                  padding: 0
                }}>
                  <li style={{ marginBottom: '0.5rem' }}>Fresh Produce</li>
                  <li style={{ marginBottom: '0.5rem' }}>Dairy & Eggs</li>
                  <li style={{ marginBottom: '0.5rem' }}>Meat & Seafood</li>
                  <li style={{ marginBottom: '0.5rem' }}>Bakery</li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
                  Services
                </h4>
                <ul style={{ 
                  color: '#9ca3af', 
                  fontSize: '0.875rem',
                  listStyle: 'none',
                  padding: 0
                }}>
                  <li style={{ marginBottom: '0.5rem' }}>Fast Delivery</li>
                  <li style={{ marginBottom: '0.5rem' }}>Quality Guarantee</li>
                  <li style={{ marginBottom: '0.5rem' }}>24/7 Support</li>
                  <li style={{ marginBottom: '0.5rem' }}>Easy Returns</li>
                </ul>
              </div>
              
              <div>
                <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
                  Contact
                </h4>
                <ul style={{ 
                  color: '#9ca3af', 
                  fontSize: '0.875rem',
                  listStyle: 'none',
                  padding: 0
                }}>
                  <li style={{ marginBottom: '0.5rem' }}>📞 1-800-SUPER</li>
                  <li style={{ marginBottom: '0.5rem' }}>📧 support@supermarket.com</li>
                  <li style={{ marginBottom: '0.5rem' }}>📍 123 Grocery St.</li>
                  <li style={{ marginBottom: '0.5rem' }}>🕒 Open 24/7</li>
                </ul>
              </div>
            </div>
            
            <div style={{ 
              borderTop: '1px solid #374151', 
              marginTop: '2rem',
              paddingTop: '1.5rem',
              textAlign: 'center'
            }}>
              <p style={{ 
                color: '#9ca3af', 
                fontSize: '0.875rem' 
              }}>
                © 2024 SuperMarket. All rights reserved. | Built with ❤️ using React
              </p>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}

export default App;