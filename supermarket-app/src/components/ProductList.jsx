import React, { useState } from 'react';
import ProductCard from './ProductCard';
import { categories, getProductsByCategory } from '../data/products';

const ProductList = ({ selectedCategory, onProductClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const currentCategory = selectedCategory 
    ? categories.find(cat => cat.id === selectedCategory)
    : null;

  let products = selectedCategory 
    ? getProductsByCategory(selectedCategory)
    : [];

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
          {currentCategory ? `${currentCategory.icon} ${currentCategory.name}` : '🛒 All Products'}
        </h2>
        <p style={{ color: '#6b7280' }}>
          {products.length} products found
        </p>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filters-row">
          {/* Search */}
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ color: '#374151', fontWeight: 500 }}>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="categories-pills">
          <button
            onClick={() => onProductClick(null, null)}
            className={`category-pill ${!selectedCategory ? 'active' : ''}`}
          >
            All Products
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onProductClick(null, category.id)}
              className={`category-pill ${selectedCategory === category.id ? 'active' : ''}`}
            >
              {category.icon} {category.name}
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
              onProductClick={onProductClick}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">No products found</h3>
          <p className="empty-description">
            {searchTerm 
              ? `No products match "${searchTerm}"`
              : selectedCategory 
                ? "This category is currently empty"
                : "No products available"
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductList;