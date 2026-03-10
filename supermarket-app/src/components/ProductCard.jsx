import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTranslation } from 'react-i18next';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const isEs = i18n.language.startsWith('es');
  const name = isEs && product.nameEs ? product.nameEs : product.name;
  const description = isEs && product.descriptionEs ? product.descriptionEs : product.description;
  const unit = isEs && product.unitEs ? product.unitEs : product.unit;

  return (
    <div
      className="product-card"
      onClick={() => navigate(`/product/${product.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div style={{ position: 'relative' }}>
        <img
          src={product.image}
          alt={name}
          className="product-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x300?text=Product';
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
            <span style={{ color: 'white', fontWeight: 600 }}>{t('product.out_of_stock')}</span>
          </div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{name}</h3>
        <p className="product-description">{description}</p>

        <div className="product-footer">
          <div>
            <span className="product-price">${product.price.toFixed(2)}</span>
            <span className="product-unit"> {unit}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`add-btn ${!product.inStock ? 'disabled' : ''}`}
          >
            {product.inStock ? t('product.add_to_cart') : t('product.out_of_stock')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;