import React from 'react';
import { useCart } from '../context/CartContext';

const ProductDetail = ({ product, onBack }) => {
  const { addToCart } = useCart();

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    addToCart(product);
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          color: '#16a34a',
          background: 'none',
          border: 'none',
          fontWeight: 500,
          cursor: 'pointer',
          marginBottom: '1.5rem'
        }}
        onMouseEnter={(e) => e.target.style.color = '#15803d'}
        onMouseLeave={(e) => e.target.style.color = '#16a34a'}
      >
        ← Back to Products
      </button>

      <div style={{
        background: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem'
        }}>
          {/* Product Image */}
          <div style={{ position: 'relative' }}>
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x400?text=Product';
              }}
            />
            {!product.inStock && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ 
                  color: 'white', 
                  fontSize: '1.25rem', 
                  fontWeight: '600' 
                }}>
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div style={{ padding: '2rem' }}>
            <h1 style={{ 
              fontSize: '1.875rem', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '1rem'
            }}>
              {product.name}
            </h1>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ 
                fontSize: '2.25rem', 
                fontWeight: 'bold', 
                color: '#16a34a' 
              }}>
                {formatPrice(product.price)}
              </span>
              <span style={{ 
                color: '#6b7280', 
                fontSize: '1.125rem', 
                marginLeft: '0.5rem' 
              }}>
                {product.unit}
              </span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                Description
              </h3>
              <p style={{ 
                color: '#6b7280', 
                lineHeight: '1.6' 
              }}>
                {product.description}
              </p>
            </div>

            {/* Product Features */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '600', 
                color: '#1f2937',
                marginBottom: '0.75rem'
              }}>
                Features
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#16a34a', marginRight: '0.5rem' }}>✓</span>
                  Fresh and high quality
                </li>
                <li style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#16a34a', marginRight: '0.5rem' }}>✓</span>
                  Carefully selected
                </li>
                <li style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#16a34a', marginRight: '0.5rem' }}>✓</span>
                  Best value for money
                </li>
                <li style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#16a34a', marginRight: '0.5rem' }}>✓</span>
                  Satisfaction guaranteed
                </li>
              </ul>
            </div>

            {/* Add to Cart Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#374151', fontWeight: 500 }}>Quantity:</span>
                <select style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  outline: 'none'
                }}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: 600,
                border: 'none',
                cursor: product.inStock ? 'pointer' : 'not-allowed',
                backgroundColor: product.inStock ? '#16a34a' : '#d1d5db',
                color: product.inStock ? 'white' : '#9ca3af',
                marginBottom: '1rem'
              }}
              onMouseEnter={(e) => {
                if (product.inStock) e.target.style.backgroundColor = '#15803d';
              }}
              onMouseLeave={(e) => {
                if (product.inStock) e.target.style.backgroundColor = '#16a34a';
              }}
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>

            <div style={{ 
              textAlign: 'center', 
              fontSize: '0.875rem', 
              color: '#6b7280' 
            }}>
              🔒 Secure checkout guaranteed
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div style={{
        marginTop: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚚</div>
          <h3 style={{ 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Fast Delivery
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Free delivery on orders over $50
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💰</div>
          <h3 style={{ 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Best Price
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Competitive pricing guaranteed
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⭐</div>
          <h3 style={{ 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>
            Quality
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Premium quality products only
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;