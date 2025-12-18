
import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Shop, MenuItem, CartItem } from '../types';

interface ShopContextType {
  shop: Shop | null;
  menuItems: MenuItem[];
  cart: CartItem[];
  loading: boolean;
  setShopBySlug: (slug: string) => Promise<void>;
  updateCart: (item: MenuItem, delta: number) => void;
  clearCart: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Persistence: Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('wa_menu_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('wa_menu_cart', JSON.stringify(cart));
  }, [cart]);

  const setShopBySlug = async (slug: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, 'shops'), where('slug', '==', slug));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const shopDoc = querySnapshot.docs[0];
        const shopData = { id: shopDoc.id, ...shopDoc.data() } as Shop;
        setShop(shopData);

        // Real-time listener for the sub-collection 'menu'
        const menuQuery = collection(db, `shops/${shopDoc.id}/menu`);
        const unsubscribe = onSnapshot(menuQuery, (snapshot) => {
          const items = snapshot.docs.map(doc => ({
            id: doc.id,
            shopId: shopDoc.id,
            ...doc.data()
          })) as MenuItem[];
          setMenuItems(items);
        });

        return () => unsubscribe();
      } else {
        setShop(null);
      }
    } catch (error) {
      console.error("Error fetching shop:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCart = (item: MenuItem, delta: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) return prev.filter(i => i.id !== item.id);
        return prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i);
      }
      if (delta > 0) return [...prev, { ...item, quantity: 1 }];
      return prev;
    });
  };

  const clearCart = () => setCart([]);

  return (
    <ShopContext.Provider value={{ 
      shop, 
      menuItems, 
      cart, 
      loading, 
      setShopBySlug, 
      updateCart, 
      clearCart 
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
