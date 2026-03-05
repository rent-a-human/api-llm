# 🛒 SuperMarket - React Grocery Shopping App

A complete React supermarket application built with Vite, featuring a modern shopping cart system, product catalog, and responsive design.

## ✨ Features

- **Product Catalog**: Browse products by categories (Fresh Produce, Dairy, Meat & Seafood, Bakery, Pantry, Beverages, Snacks, Household)
- **Shopping Cart**: Add/remove items, update quantities, real-time total calculation
- **Product Details**: Detailed product views with images, descriptions, and features
- **Search & Filter**: Search products and sort by name or price
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Modern UI**: Clean, professional design with hover effects and smooth transitions
- **Local Data**: Hardcoded product data with real images from Unsplash

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd supermarket-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📁 Project Structure

```
supermarket-app/
├── src/
│   ├── components/          # React components
│   │   ├── Header.jsx      # Navigation header
│   │   ├── ProductCard.jsx # Individual product display
│   │   ├── ProductList.jsx # Product listing page
│   │   ├── ProductDetail.jsx # Detailed product view
│   │   └── Cart.jsx        # Shopping cart
│   ├── context/
│   │   └── CartContext.jsx # Cart state management
│   ├── data/
│   │   └── products.js     # Product and category data
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # Application entry point
│   ├── index.css           # Global styles
│   └── App.css             # Component-specific styles
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite configuration
```

## 🎨 Technology Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Context API** - State management for shopping cart
- **CSS3** - Custom styling with responsive design
- **ES6+ JavaScript** - Modern JavaScript features

## 🛍️ Features Overview

### Product Catalog
- 30+ products across 8 categories
- Real product images from Unsplash
- Search functionality
- Sort by name or price
- Category filtering

### Shopping Cart
- Add/remove items
- Quantity management
- Real-time total calculation
- Tax calculation (8%)
- Order summary
- Clear cart functionality

### User Experience
- Responsive design for mobile and desktop
- Smooth transitions and hover effects
- Loading states for images
- Error handling for broken images
- Empty state messages

## 📱 Responsive Design

The app is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 🎯 Key Components

### Header Component
- Logo and branding
- Navigation menu
- Category dropdown
- Shopping cart with item count

### Product List Component
- Grid layout for products
- Search and filter controls
- Category navigation pills
- Responsive product cards

### Product Detail Component
- Large product image
- Detailed description
- Features list
- Add to cart functionality

### Cart Component
- Item list with images
- Quantity controls
- Price calculations
- Order summary with tax
- Checkout buttons

## 🛒 Cart Context

The application uses React Context for state management:

```javascript
// Cart context provides:
- items: Array of cart items
- totalItems: Total number of items
- totalPrice: Total price before tax
- addToCart(): Add item to cart
- removeFromCart(): Remove item from cart
- updateQuantity(): Update item quantity
- clearCart(): Clear all items
```

## 📊 Sample Data

The app includes realistic sample data:
- **30 products** across 8 categories
- **Product details**: Name, price, description, category, image
- **Categories**: Fresh Produce, Dairy, Meat & Seafood, Bakery, Pantry, Beverages, Snacks, Household
- **Real images** from Unsplash for visual appeal

## 🔧 Customization

### Adding New Products
Edit `src/data/products.js` to add new products:

```javascript
export const products = [
  // Existing products...
  {
    id: 31,
    name: 'New Product',
    category: 'produce',
    price: 4.99,
    unit: 'per item',
    description: 'Product description',
    image: 'https://example.com/image.jpg',
    inStock: true
  }
];
```

### Styling
- Global styles: `src/index.css`
- Component styles: `src/App.css`
- All styles use custom CSS classes for easy customization

### Adding New Categories
Edit both `categories` array and `products` in `src/data/products.js`

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The `dist` folder can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎨 Design Features

- Modern gradient header
- Card-based layout
- Smooth hover animations
- Professional color scheme (green theme)
- Responsive grid system
- Mobile-first approach

## 🔒 Security & Best Practices

- No sensitive data in client-side code
- Error handling for images
- Input validation
- Responsive images
- Accessible navigation

## 📈 Performance

- Optimized bundle size
- Efficient re-renders with React Context
- Lazy loading for images
- Minimal dependencies
- Fast Vite build system

## 🎉 Conclusion

This supermarket app demonstrates a complete e-commerce solution built with React, featuring modern development practices, responsive design, and a professional user interface. It can be easily extended with real API integration, payment processing, and user authentication.