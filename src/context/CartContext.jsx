// src/context/CartContext.jsx
import React, { createContext, useEffect, useState, useCallback } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    // Notify other windows
    try { window.dispatchEvent(new CustomEvent('cart:update', { detail: cartItems })); } catch {}
  }, [cartItems]);

  // Respond to external cart clear events (logout, explicit)
  useEffect(() => {
    const onCartCleared = () => setCartItems([]);
    const onLogout = () => setCartItems([]);
    window.addEventListener('app:cartCleared', onCartCleared);
    window.addEventListener('app:logout', onLogout);
    return () => {
      window.removeEventListener('app:cartCleared', onCartCleared);
      window.removeEventListener('app:logout', onLogout);
    };
  }, []);

  // Multi-tab sync
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'cart') {
        try {
          setCartItems(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addItem = useCallback((product, qty = 1) => {
    setCartItems(prev => {
      const idx = prev.findIndex(i => i._id === product._id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx].quantity = (copy[idx].quantity || 0) + qty;
        return copy;
      }
      return [...prev, { ...product, quantity: qty }];
    });
  }, []);

  const updateQuantity = useCallback((productId, qty) => {
    setCartItems(prev => {
      const result = prev.map(i => i._id === productId ? { ...i, quantity: qty } : i).filter(i => i.quantity > 0);
      return result;
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setCartItems(prev => prev.filter(i => i._id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('app:cartCleared'));
  }, []);

  const cartCount = cartItems.reduce((s, it) => s + (it.quantity || 0), 0);

  return (
    <CartContext.Provider value={{
      cartItems, addItem, updateQuantity, removeItem, clearCart, cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
