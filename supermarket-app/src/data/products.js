export const categories = [
  { id: 'produce', name: 'Fresh Produce', icon: '🥬' },
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'meat', name: 'Meat & Seafood', icon: '🥩' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'pantry', name: 'Pantry', icon: '🥫' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
  { id: 'snacks', name: 'Snacks', icon: '🍿' },
  { id: 'household', name: 'Household', icon: '🧻' },
];

export const products = [
  // Fresh Produce
  { id: 1, name: 'Organic Bananas', category: 'produce', price: 2.99, unit: 'per lb', description: 'Fresh organic bananas, perfect for snacking', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop', inStock: true },
  { id: 2, name: 'Red Apples', category: 'produce', price: 3.49, unit: 'per lb', description: 'Crisp and sweet red apples', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop', inStock: true },
  { id: 3, name: 'Fresh Spinach', category: 'produce', price: 2.29, unit: 'per bag', description: 'Organic baby spinach leaves', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=300&fit=crop', inStock: true },
  { id: 4, name: 'Cherry Tomatoes', category: 'produce', price: 3.99, unit: 'per container', description: 'Sweet cherry tomatoes on the vine', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=300&fit=crop', inStock: true },
  { id: 5, name: 'Avocados', category: 'produce', price: 1.99, unit: 'each', description: 'Ripe Hass avocados', image: 'https://images.unsplash.com/photo-1524593869738-4ea064b7c74e?w=300&h=300&fit=crop', inStock: true },
  { id: 6, name: 'Carrots', category: 'produce', price: 1.79, unit: 'per lb', description: 'Fresh organic carrots', image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=300&h=300&fit=crop', inStock: true },

  // Dairy
  { id: 7, name: 'Whole Milk', category: 'dairy', price: 3.89, unit: 'per gallon', description: 'Fresh whole milk, 3.25% fat', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop', inStock: true },
  { id: 8, name: 'Greek Yogurt', category: 'dairy', price: 1.29, unit: 'per cup', description: 'Creamy Greek yogurt, vanilla flavor', image: 'https://images.unsplash.com/photo-1571212515416-8306c0788b7b?w=300&h=300&fit=crop', inStock: true },
  { id: 9, name: 'Cheddar Cheese', category: 'dairy', price: 4.99, unit: 'per 8oz', description: 'Sharp cheddar cheese block', image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=300&h=300&fit=crop', inStock: true },
  { id: 10, name: 'Butter', category: 'dairy', price: 3.49, unit: 'per lb', description: 'Unsalted sweet cream butter', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300&h=300&fit=crop', inStock: true },

  // Meat & Seafood
  { id: 11, name: 'Chicken Breast', category: 'meat', price: 6.99, unit: 'per lb', description: 'Boneless, skinless chicken breast', image: 'https://images.unsplash.com/photo-1604908553841-8ab8f11fd5a2?w=300&h=300&fit=crop', inStock: true },
  { id: 12, name: 'Ground Beef', category: 'meat', price: 5.49, unit: 'per lb', description: '85% lean ground beef', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=300&fit=crop', inStock: true },
  { id: 13, name: 'Salmon Fillet', category: 'meat', price: 12.99, unit: 'per lb', description: 'Fresh Atlantic salmon fillet', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=300&fit=crop', inStock: true },
  { id: 14, name: 'Pork Chops', category: 'meat', price: 7.99, unit: 'per lb', description: 'Center-cut pork chops', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=300&fit=crop', inStock: true },

  // Bakery
  { id: 15, name: 'Sourdough Bread', category: 'bakery', price: 4.49, unit: 'per loaf', description: 'Artisan sourdough bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop', inStock: true },
  { id: 16, name: 'Bagels', category: 'bakery', price: 3.99, unit: 'per dozen', description: 'Fresh baked plain bagels', image: 'https://images.unsplash.com/photo-1584204869327-1d72ccc2a2b0?w=300&h=300&fit=crop', inStock: true },
  { id: 17, name: 'Croissants', category: 'bakery', price: 5.99, unit: 'per 6-pack', description: 'Buttery flaky croissants', image: 'https://images.unsplash.com/photo-1555507036-ab794f9e8d58?w=300&h=300&fit=crop', inStock: true },
  { id: 18, name: 'Chocolate Chip Cookies', category: 'bakery', price: 4.99, unit: 'per dozen', description: 'Fresh baked chocolate chip cookies', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=300&fit=crop', inStock: true },

  // Pantry
  { id: 19, name: 'Quinoa', category: 'pantry', price: 7.99, unit: 'per lb', description: 'Organic white quinoa', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31b?w=300&h=300&fit=crop', inStock: true },
  { id: 20, name: 'Olive Oil', category: 'pantry', price: 12.99, unit: 'per bottle', description: 'Extra virgin olive oil, 1L', image: 'https://images.unsplash.com/photo-1474511014062-083a15c41c6b?w=300&h=300&fit=crop', inStock: true },
  { id: 21, name: 'Pasta', category: 'pantry', price: 1.99, unit: 'per box', description: 'Spaghetti pasta, 1 lb', image: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=300&h=300&fit=crop', inStock: true },
  { id: 22, name: 'Canned Tomatoes', category: 'pantry', price: 2.49, unit: 'per can', description: 'Diced tomatoes in juice', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=300&fit=crop', inStock: true },

  // Beverages
  { id: 23, name: 'Orange Juice', category: 'beverages', price: 4.99, unit: 'per bottle', description: 'Fresh squeezed orange juice', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=300&fit=crop', inStock: true },
  { id: 24, name: 'Coffee Beans', category: 'beverages', price: 11.99, unit: 'per bag', description: 'Medium roast coffee beans, 1 lb', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&h=300&fit=crop', inStock: true },
  { id: 25, name: 'Green Tea', category: 'beverages', price: 6.99, unit: 'per box', description: 'Organic green tea bags', image: 'https://images.unsplash.com/photo-1597318256215-026e3b84cd4e?w=300&h=300&fit=crop', inStock: true },

  // Snacks
  { id: 26, name: 'Almonds', category: 'snacks', price: 8.99, unit: 'per bag', description: 'Roasted almonds, lightly salted', image: 'https://images.unsplash.com/photo-1608039829570-78524f79c4c7?w=300&h=300&fit=crop', inStock: true },
  { id: 27, name: 'Granola Bars', category: 'snacks', price: 3.99, unit: 'per box', description: 'Oatmeal raisin granola bars', image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=300&h=300&fit=crop', inStock: true },
  { id: 28, name: 'Dark Chocolate', category: 'snacks', price: 2.99, unit: 'per bar', description: '70% cacao dark chocolate', image: 'https://images.unsplash.com/photo-1216581102771-8b7b1d849728?w=300&h=300&fit=crop', inStock: true },

  // Household
  { id: 29, name: 'Paper Towels', category: 'household', price: 8.99, unit: 'per roll', description: '6-pack paper towel rolls', image: 'https://images.unsplash.com/photo-1584467735871-3f2b4b5d5b2a?w=300&h=300&fit=crop', inStock: true },
  { id: 30, name: 'Dish Soap', category: 'household', price: 2.99, unit: 'per bottle', description: 'Lemon scented dish soap', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop', inStock: true },
];

export const getProductsByCategory = (categoryId) => {
  return products.filter(product => product.category === categoryId);
};

export const getProductById = (id) => {
  return products.find(product => product.id === parseInt(id));
};

export const getCategoryById = (id) => {
  return categories.find(category => category.id === id);
};