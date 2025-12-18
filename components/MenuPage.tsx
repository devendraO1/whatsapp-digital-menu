
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import CartDrawer from './CartDrawer';

const MenuPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { shop, menuItems, cart, loading, setShopBySlug, updateCart } = useShop();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (slug) setShopBySlug(slug);
  }, [slug]);

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(menuItems.map(item => item.category))];
    return cats;
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return menuItems;
    return menuItems.filter(item => item.category === activeCategory);
  }, [menuItems, activeCategory]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading Menu...</div>;
  if (!shop) return <div className="p-8 text-center text-red-500 font-bold">Menu not found. Check the URL.</div>;

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-24 relative shadow-xl border-x">
      <div className="bg-green-600 text-white p-6 pt-10 rounded-b-3xl shadow-lg">
        <h1 className="text-3xl font-bold">{shop.name}</h1>
        <p className="opacity-90 text-sm mt-1">Order via WhatsApp</p>
      </div>

      <div className="sticky top-16 z-40 bg-gray-50/95 backdrop-blur-sm border-b overflow-x-auto whitespace-nowrap px-4 py-3 no-scrollbar">
        <div className="flex space-x-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat 
                  ? 'bg-green-600 text-white shadow-sm' 
                  : 'bg-white text-gray-600 border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredItems.map(item => {
          const cartItem = cart.find(i => i.id === item.id);
          return (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start transition-transform active:scale-[0.98]">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  {!item.isAvailable && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Sold Out</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                <p className="text-green-700 font-bold mt-2">{shop.currency}{item.price}</p>
              </div>
              
              <div className="ml-4 flex flex-col items-center">
                {item.isAvailable ? (
                  cartItem ? (
                    <div className="flex items-center bg-green-50 rounded-lg border border-green-200">
                      <button onClick={() => updateCart(item, -1)} className="p-2 text-green-600 font-bold">-</button>
                      <span className="px-2 font-bold text-green-700">{cartItem.quantity}</span>
                      <button onClick={() => updateCart(item, 1)} className="p-2 text-green-600 font-bold">+</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => updateCart(item, 1)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md"
                    >
                      Add
                    </button>
                  )
                ) : (
                  <span className="text-gray-400 text-xs font-bold uppercase p-2">Unavailable</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-green-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-2xl hover:bg-green-700 transition-all"
          >
            <div className="flex items-center space-x-3">
              <span className="bg-green-500 px-2 py-0.5 rounded-lg text-sm font-bold">{cartCount}</span>
              <span className="font-bold">View Cart</span>
            </div>
            <span className="font-bold">{shop.currency}{cartTotal}</span>
          </button>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default MenuPage;
