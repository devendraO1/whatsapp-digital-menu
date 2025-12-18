
import React, { useState } from 'react';
import { useShop } from '../contexts/ShopContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, shop, updateCart, clearCart } = useShop();
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleWhatsAppCheckout = () => {
    if (!customerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!shop) return;

    let message = `*New Order from ${customerName}* 📝\n`;
    if (tableNumber) message += `📍 Table: ${tableNumber}\n`;
    message += `--------------------------\n`;
    
    cart.forEach(item => {
      message += `• ${item.quantity} x ${item.name} (${shop.currency}${item.price})\n`;
    });
    
    message += `--------------------------\n`;
    message += `*Total: ${shop.currency}${cartTotal}*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${shop.whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    clearCart();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-[80vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Your Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Your cart is empty</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                <div>
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-500">{shop?.currency}{item.price * item.quantity}</p>
                </div>
                <div className="flex items-center bg-white rounded-lg border">
                  <button onClick={() => updateCart(item, -1)} className="p-2 text-green-600 font-bold">-</button>
                  <span className="px-2 font-bold">{item.quantity}</span>
                  <button onClick={() => updateCart(item, 1)} className="p-2 text-green-600 font-bold">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && shop && (
          <div className="p-6 bg-gray-50 border-t space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Your Name</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="e.g. John"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Table No.</label>
                <input 
                  type="text" 
                  value={tableNumber}
                  onChange={e => setTableNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">Grand Total</span>
              <span className="text-2xl font-black text-gray-900">{shop.currency}{cartTotal}</span>
            </div>

            <button 
              onClick={handleWhatsAppCheckout}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center space-x-2 active:scale-[0.98] transition-transform"
            >
              <span>Order via WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
