import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

const Cart = () => {
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleQuantityChange = (productId, newQuantity, originalPrice) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity, originalPrice);
    }
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  if (items.length === 0) {
    return (
      <div className="container cart-container">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h2 className="empty-title">{t('cart.empty')}</h2>
          <p className="empty-description">{t('cart.empty_desc')}</p>
          <button
            onClick={() => navigate('/')}
            style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {t('cart.start_shopping')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart-container">
      <div className="cart-header">
        <h2 className="cart-title">🛍️ {t('cart.title')}</h2>
        <button
          onClick={clearCart}
          className="clear-cart-btn"
        >
          {t('cart.clear')}
        </button>
      </div>

      <div className="cart-grid">
        {/* Cart Items */}
        <div>
          <div className="cart-items">
            <div style={{
              padding: '1rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                {t('cart.items', { count: totalItems })}
              </h3>
            </div>

            <div>
              {items.map(item => (
                <div key={item.id} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64x64?text=Product';
                    }}
                  />

                  <div className="cart-item-info">
                    <h4 className="cart-item-name">
                      {item.name}
                    </h4>
                    <p className="cart-item-unit">{item.unit}</p>
                    <p className="cart-item-price">
                      {formatPrice(item.price / item.quantity)} {t('cart.each')}
                    </p>
                  </div>

                  <div className="quantity-controls">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.price / item.quantity)}
                      className="quantity-btn"
                    >
                      -
                    </button>

                    <span className="quantity-display">{item.quantity}</span>

                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.price / item.quantity)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {formatPrice(item.price)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="remove-btn"
                    >
                      {t('cart.remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="order-summary">
            <h3 className="summary-title">{t('cart.order_summary')}</h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <div className="summary-row">
                <span>{t('cart.subtotal')}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <div className="summary-row">
                <span>{t('cart.tax')}</span>
                <span>{formatPrice(totalPrice * 0.08)}</span>
              </div>

              <div className="summary-total">
                <span>{t('cart.total')}</span>
                <span>{formatPrice(totalPrice * 1.08)}</span>
              </div>
            </div>

            <button
              className="checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              {t('cart.checkout')}
            </button>

            <button
              className="continue-shopping-btn"
              onClick={() => navigate('/')}
            >
              {t('cart.continue_shopping')}
            </button>

            {/* Security badges */}
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                textAlign: 'center',
                marginBottom: '0.5rem'
              }}>{t('cart.secure_checkout')}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem'
                }}>🔒 SSL</span>
                <span style={{
                  fontSize: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem'
                }}>💳 Safe</span>
                <span style={{
                  fontSize: '0.75rem',
                  backgroundColor: '#f3f4f6',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.25rem'
                }}>✅ Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;