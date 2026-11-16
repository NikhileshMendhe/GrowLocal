import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useToast } from './ToastContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { trackActivity } from '../lib/activityTracker.js';

const CartContext = createContext(null);

const BASE_STORAGE_KEY = 'growlocal_cart_items';

function getStorageKey(userId) {
  return userId ? `${BASE_STORAGE_KEY}_${userId}` : BASE_STORAGE_KEY;
}

export function CartProvider({ children }) {
  const toast = useToast();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;

  const [items, setItems] = useState(() => {
    try {
      const key = getStorageKey(user?.id);
      const saved = localStorage.getItem(key) || localStorage.getItem(BASE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // When user logs in or switches, load or merge their saved cart
  useEffect(() => {
    try {
      const userKey = getStorageKey(user?.id);
      const userSaved = localStorage.getItem(userKey);
      if (userSaved) {
        setItems(JSON.parse(userSaved));
      } else if (user?.id) {
        // Transfer guest cart to user cart upon login
        const guestSaved = localStorage.getItem(BASE_STORAGE_KEY);
        if (guestSaved) {
          const guestItems = JSON.parse(guestSaved);
          setItems(guestItems);
          localStorage.setItem(userKey, JSON.stringify(guestItems));
        }
      }
    } catch {}
  }, [user?.id]);

  // Save cart changes to local storage
  useEffect(() => {
    try {
      const key = getStorageKey(user?.id);
      localStorage.setItem(key, JSON.stringify(items));
      if (!user?.id) {
        localStorage.setItem(BASE_STORAGE_KEY, JSON.stringify(items));
      }
    } catch {}
  }, [items, user?.id]);

  const addToCart = useCallback(
    (product, quantity = 1) => {
      if (!product || !product.id) return;

      // Rule: If logged-out customer attempts to add products, show Login/Signup modal
      // and restore intended action after successful login.
      if (!isAuthenticated) {
        toast('Please sign in to add items to your cart');
        openAuthModal('login', () => {
          // Callback invoked after successful login
          setItems((prev) => {
            const existingIndex = prev.findIndex((item) => item.product.id === product.id);
            if (existingIndex > -1) {
              const copy = [...prev];
              copy[existingIndex].quantity += quantity;
              return copy;
            }
            return [...prev, { product, quantity }];
          });
          trackActivity({
            activityType: 'add_to_cart',
            product,
            quantity,
            customer: userRef.current,
          });
          toast(`Added "${product.name}" to cart`);
          setIsCartOpen(true);
        });
        return;
      }

      setItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.product.id === product.id);
        if (existingIndex > -1) {
          const copy = [...prev];
          copy[existingIndex].quantity += quantity;
          return copy;
        }
        return [...prev, { product, quantity }];
      });

      // Track activity in Supabase
      trackActivity({
        activityType: 'add_to_cart',
        product,
        quantity,
        customer: user,
      });

      toast(`Added "${product.name}" to cart`);
    },
    [isAuthenticated, openAuthModal, toast, user]
  );

  const updateQuantity = useCallback(
    (productId, delta) => {
      let targetProduct = null;
      let resultingQty = 0;

      setItems((prev) =>
        prev
          .map((item) => {
            if (item.product.id === productId) {
              targetProduct = item.product;
              const newQty = item.quantity + delta;
              resultingQty = newQty;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean)
      );

      if (targetProduct) {
        if (resultingQty > 0) {
          trackActivity({
            activityType: 'update_cart_quantity',
            product: targetProduct,
            quantity: resultingQty,
            customer: user,
            metadata: { delta },
          });
        } else {
          trackActivity({
            activityType: 'remove_from_cart',
            product: targetProduct,
            quantity: 0,
            customer: user,
          });
        }
      }
    },
    [user]
  );

  const removeFromCart = useCallback(
    (productId) => {
      let removedProduct = null;
      let removedQty = 0;

      setItems((prev) => {
        const found = prev.find((item) => item.product.id === productId);
        if (found) {
          removedProduct = found.product;
          removedQty = found.quantity;
        }
        return prev.filter((item) => item.product.id !== productId);
      });

      if (removedProduct) {
        trackActivity({
          activityType: 'remove_from_cart',
          product: removedProduct,
          quantity: removedQty,
          customer: user,
        });
      }
    },
    [user]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price || 0) * item.quantity,
    0
  );

  const value = {
    items,
    totalCount,
    subtotal,
    isCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
