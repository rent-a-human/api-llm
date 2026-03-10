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
  { id: 1, name: 'Organic Bananas', nameEs: 'Plátanos Orgánicos', category: 'produce', price: 2.99, unit: 'per lb', unitEs: 'por libra', description: 'Fresh organic bananas, perfect for snacking', descriptionEs: 'Plátanos orgánicos frescos, perfectos para picar', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop', inStock: true },
  { id: 2, name: 'Red Apples', nameEs: 'Manzanas Rojas', category: 'produce', price: 3.49, unit: 'per lb', unitEs: 'por libra', description: 'Crisp and sweet red apples', descriptionEs: 'Manzanas rojas crujientes y dulces', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop', inStock: true },
  { id: 3, name: 'Fresh Spinach', nameEs: 'Espinacas Frescas', category: 'produce', price: 2.29, unit: 'per bag', unitEs: 'por bolsa', description: 'Organic baby spinach leaves', descriptionEs: 'Hojas de espinaca baby orgánica', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=300&fit=crop', inStock: true },
  { id: 4, name: 'Cherry Tomatoes', nameEs: 'Tomates Cherry', category: 'produce', price: 3.99, unit: 'per container', unitEs: 'por envase', description: 'Sweet cherry tomatoes on the vine', descriptionEs: 'Tomates cherry dulces en rama', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=300&fit=crop', inStock: true },
  { id: 5, name: 'Avocados', nameEs: 'Aguacates', category: 'produce', price: 1.99, unit: 'each', unitEs: 'c/u', description: 'Ripe Hass avocados', descriptionEs: 'Aguacates Hass maduros', image: 'https://images.unsplash.com/photo-1524593869738-4ea064b7c74e?w=300&h=300&fit=crop', inStock: true },
  { id: 6, name: 'Carrots', nameEs: 'Zanahorias', category: 'produce', price: 1.79, unit: 'per lb', unitEs: 'por libra', description: 'Fresh organic carrots', descriptionEs: 'Zanahorias orgánicas frescas', image: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=300&h=300&fit=crop', inStock: true },

  // Dairy
  { id: 7, name: 'Whole Milk', nameEs: 'Leche Entera', category: 'dairy', price: 3.89, unit: 'per gallon', unitEs: 'por galón', description: 'Fresh whole milk, 3.25% fat', descriptionEs: 'Leche entera fresca, 3.25% de grasa', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop', inStock: true },
  { id: 8, name: 'Greek Yogurt', nameEs: 'Yogur Griego', category: 'dairy', price: 1.29, unit: 'per cup', unitEs: 'por taza', description: 'Creamy Greek yogurt, vanilla flavor', descriptionEs: 'Yogur griego cremoso, sabor vainilla', image: 'https://images.unsplash.com/photo-1571212515416-8306c0788b7b?w=300&h=300&fit=crop', inStock: true },
  { id: 9, name: 'Cheddar Cheese', nameEs: 'Queso Cheddar', category: 'dairy', price: 4.99, unit: 'per 8oz', unitEs: 'por 8oz', description: 'Sharp cheddar cheese block', descriptionEs: 'Bloque de queso cheddar fuerte', image: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=300&h=300&fit=crop', inStock: true },
  { id: 10, name: 'Butter', nameEs: 'Mantequilla', category: 'dairy', price: 3.49, unit: 'per lb', unitEs: 'por libra', description: 'Unsalted sweet cream butter', descriptionEs: 'Mantequilla de crema dulce sin sal', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300&h=300&fit=crop', inStock: true },

  // Meat & Seafood
  { id: 11, name: 'Chicken Breast', nameEs: 'Pechuga de Pollo', category: 'meat', price: 6.99, unit: 'per lb', unitEs: 'por libra', description: 'Boneless, skinless chicken breast', descriptionEs: 'Pechuga de pollo sin hueso ni piel', image: 'https://images.unsplash.com/photo-1604908553841-8ab8f11fd5a2?w=300&h=300&fit=crop', inStock: true },
  { id: 12, name: 'Ground Beef', nameEs: 'Carne Molida', category: 'meat', price: 5.49, unit: 'per lb', unitEs: 'por libra', description: '85% lean ground beef', descriptionEs: 'Carne molida 85% magra', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=300&fit=crop', inStock: true },
  { id: 13, name: 'Salmon Fillet', nameEs: 'Filete de Salmón', category: 'meat', price: 12.99, unit: 'per lb', unitEs: 'por libra', description: 'Fresh Atlantic salmon fillet', descriptionEs: 'Filete fresco de salmón del Atlántico', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=300&fit=crop', inStock: true },
  { id: 14, name: 'Pork Chops', nameEs: 'Chuletas de Cerdo', category: 'meat', price: 7.99, unit: 'per lb', unitEs: 'por libra', description: 'Center-cut pork chops', descriptionEs: 'Chuletas de cerdo de corte central', image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=300&fit=crop', inStock: true },

  // Bakery
  { id: 15, name: 'Sourdough Bread', nameEs: 'Pan de Masa Madre', category: 'bakery', price: 4.49, unit: 'per loaf', unitEs: 'por hogaza', description: 'Artisan sourdough bread', descriptionEs: 'Pan artesanal de masa madre', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop', inStock: true },
  { id: 16, name: 'Bagels', nameEs: 'Bagels', category: 'bakery', price: 3.99, unit: 'per dozen', unitEs: 'por docena', description: 'Fresh baked plain bagels', descriptionEs: 'Bagels simples recién horneados', image: 'https://images.unsplash.com/photo-1584204869327-1d72ccc2a2b0?w=300&h=300&fit=crop', inStock: true },
  { id: 17, name: 'Croissants', nameEs: 'Croissants', category: 'bakery', price: 5.99, unit: 'per 6-pack', unitEs: 'por paquete de 6', description: 'Buttery flaky croissants', descriptionEs: 'Cruasanes hojaldrados con mantequilla', image: 'https://images.unsplash.com/photo-1555507036-ab794f9e8d58?w=300&h=300&fit=crop', inStock: true },
  { id: 18, name: 'Chocolate Chip Cookies', nameEs: 'Galletas con Chispas de Chocolate', category: 'bakery', price: 4.99, unit: 'per dozen', unitEs: 'por docena', description: 'Fresh baked chocolate chip cookies', descriptionEs: 'Galletas con chispas de chocolate recién horneadas', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=300&h=300&fit=crop', inStock: true },

  // Pantry
  { id: 19, name: 'Quinoa', nameEs: 'Quinua', category: 'pantry', price: 7.99, unit: 'per lb', unitEs: 'por libra', description: 'Organic white quinoa', descriptionEs: 'Quinua blanca orgánica', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31b?w=300&h=300&fit=crop', inStock: true },
  { id: 20, name: 'Olive Oil', nameEs: 'Aceite de Oliva', category: 'pantry', price: 12.99, unit: 'per bottle', unitEs: 'por botella', description: 'Extra virgin olive oil, 1L', descriptionEs: 'Aceite de oliva virgen extra, 1L', image: 'https://images.unsplash.com/photo-1474511014062-083a15c41c6b?w=300&h=300&fit=crop', inStock: true },
  { id: 21, name: 'Pasta', nameEs: 'Pasta', category: 'pantry', price: 1.99, unit: 'per box', unitEs: 'por caja', description: 'Spaghetti pasta, 1 lb', descriptionEs: 'Pasta espagueti, 1 libra', image: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=300&h=300&fit=crop', inStock: true },
  { id: 22, name: 'Canned Tomatoes', nameEs: 'Tomates Enlatados', category: 'pantry', price: 2.49, unit: 'per can', unitEs: 'por lata', description: 'Diced tomatoes in juice', descriptionEs: 'Tomates cortados en cubitos en jugo', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=300&fit=crop', inStock: true },

  // Beverages
  { id: 23, name: 'Orange Juice', nameEs: 'Jugo de Naranja', category: 'beverages', price: 4.99, unit: 'per bottle', unitEs: 'por botella', description: 'Fresh squeezed orange juice', descriptionEs: 'Jugo de naranja recién exprimido', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=300&fit=crop', inStock: true },
  { id: 24, name: 'Coffee Beans', nameEs: 'Granos de Café', category: 'beverages', price: 11.99, unit: 'per bag', unitEs: 'por bolsa', description: 'Medium roast coffee beans, 1 lb', descriptionEs: 'Granos de café de tueste medio, 1 libra', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&h=300&fit=crop', inStock: true },
  { id: 25, name: 'Green Tea', nameEs: 'Té Verde', category: 'beverages', price: 6.99, unit: 'per box', unitEs: 'por caja', description: 'Organic green tea bags', descriptionEs: 'Bolsitas de té verde orgánico', image: 'https://images.unsplash.com/photo-1597318256215-026e3b84cd4e?w=300&h=300&fit=crop', inStock: true },

  // Snacks
  { id: 26, name: 'Almonds', nameEs: 'Almendras', category: 'snacks', price: 8.99, unit: 'per bag', unitEs: 'por bolsa', description: 'Roasted almonds, lightly salted', descriptionEs: 'Almendras tostadas, ligeramente saladas', image: 'https://images.unsplash.com/photo-1608039829570-78524f79c4c7?w=300&h=300&fit=crop', inStock: true },
  { id: 27, name: 'Granola Bars', nameEs: 'Barras de Granola', category: 'snacks', price: 3.99, unit: 'per box', unitEs: 'por caja', description: 'Oatmeal raisin granola bars', descriptionEs: 'Barras de granola de avena con pasas', image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=300&h=300&fit=crop', inStock: true },
  { id: 28, name: 'Dark Chocolate', nameEs: 'Chocolate Oscuro', category: 'snacks', price: 2.99, unit: 'per bar', unitEs: 'por barra', description: '70% cacao dark chocolate', descriptionEs: 'Chocolate negro al 70% de cacao', image: 'https://images.unsplash.com/photo-1216581102771-8b7b1d849728?w=300&h=300&fit=crop', inStock: true },

  // Household
  { id: 29, name: 'Paper Towels', nameEs: 'Toallas de Papel', category: 'household', price: 8.99, unit: 'per roll', unitEs: 'por rollo', description: '6-pack paper towel rolls', descriptionEs: 'Paquete de 6 rollos de toallas de papel', image: 'https://images.unsplash.com/photo-1584467735871-3f2b4b5d5b2a?w=300&h=300&fit=crop', inStock: true },
  { id: 30, name: 'Dish Soap', nameEs: 'Jabón para Platos', category: 'household', price: 2.99, unit: 'per bottle', unitEs: 'por botella', description: 'Lemon scented dish soap', descriptionEs: 'Jabón lavaplatos con aroma a limón', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop', inStock: true },
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