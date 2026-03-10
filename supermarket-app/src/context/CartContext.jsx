import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Load initial state from local storage or use defaults
const getInitialCartState = () => {
  try {
    const savedCart = localStorage.getItem('lichigo_cart');
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error("Failed to parse cart from local storage", error);
  }
  return {
    items: [],
    totalItems: 0,
    totalPrice: 0
  };
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      let newState;
      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + action.payload.price
        };
      } else {
        newState = {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }],
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + action.payload.price
        };
      }
      return newState;
    }

    case 'REMOVE_FROM_CART': {
      const itemToRemove = state.items.find(item => item.id === action.payload);
      if (itemToRemove) {
        const newItems = state.items.filter(item => item.id !== action.payload);
        return {
          ...state,
          items: newItems,
          totalItems: state.totalItems - itemToRemove.quantity,
          totalPrice: state.totalPrice - (itemToRemove.price * itemToRemove.quantity)
        };
      }
      return state;
    }

    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? {
            ...item,
            quantity: Math.max(0, action.payload.quantity),
            // We recalculate price based on unit price (assuming originalPrice is unit price)
            price: action.payload.originalPrice * Math.max(0, action.payload.quantity)
          }
          : item
      );

      const validItems = updatedItems.filter(item => item.quantity > 0);
      const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = validItems.reduce((sum, item) => sum + (item.price || 0), 0);

      return {
        ...state,
        items: validItems,
        totalItems,
        totalPrice
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, getInitialCartState());

  // Save to local storage whenever the cart state changes
  useEffect(() => {
    localStorage.setItem('lichigo_cart', JSON.stringify(state));
  }, [state]);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity, originalPrice) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity, originalPrice } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <CartContext.Provider value={{
      ...state,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};