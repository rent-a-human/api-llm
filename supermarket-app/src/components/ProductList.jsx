import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { categories, getProductsByCategory, products as allProducts } from '../data/products';
import { useTranslation } from 'react-i18next';

const ProductList = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const selectedCategory = categoryId || null;

  const currentCategory = selectedCategory
    ? categories.find(cat => cat.id === selectedCategory)
    : null;

  let products = selectedCategory
    ? getProductsByCategory(selectedCategory)
    : allProducts;

  // Filter products by search term
  if (searchTerm) {
    products = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Sort products
  products.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '0.5rem'
        }}>
          {currentCategory ? `${currentCategory.icon} ${t(`category.${currentCategory.id.replace('-', '_')}`)}` : `🛒 ${t('nav.products')}`}
        </h2>
        <p style={{ color: '#6b7280' }}>
          {t('products.found', { count: products.length })}
        </p>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filters-row">
          {/* Search */}
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <input
              type="text"
              placeholder={t('products.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ color: '#374151', fontWeight: 500 }}>{t('products.sort_by')}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">{t('products.sort.name')}</option>
              <option value="price-low">{t('products.sort.price_low')}</option>
              <option value="price-high">{t('products.sort.price_high')}</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="categories-pills">
          <button
            onClick={() => navigate('/')}
            className={`category-pill ${!selectedCategory ? 'active' : ''}`}
          >
            {t('products.all')}
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => navigate(`/category/${category.id}`)}
              className={`category-pill ${selectedCategory === category.id ? 'active' : ''}`}
            >
              {category.icon} {t(`category.${category.id.replace('-', '_')}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">{t('products.empty.title')}</h3>
          <p className="empty-description">
            {searchTerm
              ? t('products.empty.search', { term: searchTerm })
              : selectedCategory
                ? t('products.empty.category')
                : t('products.empty.default')
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductList;