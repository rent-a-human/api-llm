import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import { useTranslation } from 'react-i18next';
// i18n initialization
import './i18n';
import './index.css';

// Scroll to top on route change component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout component to hold Header and Footer
const Layout = ({ children }) => {
  const { t } = useTranslation();
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Header />

      <main style={{ paddingBottom: '2rem', flex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '2rem 0',
        marginTop: 'auto'
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
                {t('app.title')}
              </h3>
              <p style={{
                color: '#9ca3af',
                fontSize: '0.875rem'
              }}>
                {t('app.subtitle')}
              </p>
            </div>

            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
                {t('footer.categories')}
              </h4>
              <ul style={{
                color: '#9ca3af',
                fontSize: '0.875rem',
                listStyle: 'none',
                padding: 0
              }}>
                <li style={{ marginBottom: '0.5rem' }}>{t('category.fresh_produce')}</li>
                <li style={{ marginBottom: '0.5rem' }}>{t('category.dairy_eggs')}</li>
                <li style={{ marginBottom: '0.5rem' }}>{t('category.meat_seafood')}</li>
                <li style={{ marginBottom: '0.5rem' }}>{t('category.bakery')}</li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>
                {t('footer.services')}
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
                {t('footer.contact')}
              </h4>
              <ul style={{
                color: '#9ca3af',
                fontSize: '0.875rem',
                listStyle: 'none',
                padding: 0
              }}>
                <li style={{ marginBottom: '0.5rem' }}>📞 1-800-SUPER</li>
                <li style={{ marginBottom: '0.5rem' }}>📧 support@lichigo.com</li>
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
              © 2024 Lichigo. All rights reserved. | Built with ❤️ using React
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/category/:categoryId" element={<ProductList />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;