import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductById } from '../data/products';
import { useTranslation } from 'react-i18next';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, i18n } = useTranslation();

  const product = getProductById(productId);

  if (!product) {
    return (
      <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>
        <h2>{t('products.empty.title')}</h2>
        <button
          onClick={() => navigate('/')}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#1f2937', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
        >
          {t('detail.back')}
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
  };

  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const isEs = i18n.language.startsWith('es');
  const name = isEs && product.nameEs ? product.nameEs : product.name;
  const description = isEs && product.descriptionEs ? product.descriptionEs : product.description;
  const unit = isEs && product.unitEs ? product.unitEs : product.unit;

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
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
        {t('detail.back')}
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
              alt={name}
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
                  {t('product.out_of_stock')}
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
              {name}
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
                {unit}
              </span>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>
                {t('detail.description')}
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                {description}
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
                {t('detail.features')}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#16a34a', marginRight: '0.5rem' }}>✓</span>
                  {t('detail.feature.fresh')}
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#16a34a', marginRight: '0.5rem' }}>✓</span>
                  {t('detail.feature.selected')}
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#16a34a', marginRight: '0.5rem' }}>✓</span>
                  {t('detail.feature.value')}
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: '#16a34a', marginRight: '0.5rem' }}>✓</span>
                  {t('detail.feature.satisfaction')}
                </li>
              </ul>
            </div>

            {/* Add to Cart Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: '#374151', fontWeight: 500 }}>{t('detail.quantity')}</span>
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
              {product.inStock ? t('product.add_to_cart') : t('product.out_of_stock')}
            </button>

            <div style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              {t('detail.secure')}
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
            {t('detail.delivery.title')}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {t('detail.delivery.desc')}
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
            {t('detail.price.title')}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {t('detail.price.desc')}
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
            {t('detail.quality.title')}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {t('detail.quality.desc')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;