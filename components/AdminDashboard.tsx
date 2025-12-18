
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Shop, MenuItem } from '../types';
import { QRCodeCanvas } from 'qrcode.react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingShop, setIsEditingShop] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({ isAvailable: true, category: 'General' });
  const [showItemForm, setShowItemForm] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const shops = await storageService.getShops();
    if (shops.length > 0) {
      const activeShop = shops[0];
      setShop(activeShop);
      const menuItems = await storageService.getMenuItems(activeShop.id);
      setItems(menuItems);
    }
    setLoading(false);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${shop?.slug || 'shop'}-qr-menu.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const handleUpdateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shop) {
      await storageService.saveShop(shop);
      setIsEditingShop(false);
      alert('Shop settings updated!');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shop && newItem.name && newItem.price) {
      const item: MenuItem = {
        id: Math.random().toString(36).substr(2, 9),
        shopId: shop.id,
        name: newItem.name,
        price: Number(newItem.price),
        category: newItem.category || 'General',
        description: newItem.description || '',
        isAvailable: true,
      };
      await storageService.saveMenuItem(item);
      setShowItemForm(false);
      setNewItem({ isAvailable: true, category: 'General' });
      loadData();
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    const updated = { ...item, isAvailable: !item.isAvailable };
    await storageService.saveMenuItem(updated);
    loadData();
  };

  const deleteItem = async (id: string) => {
    if (confirm('Delete this item?')) {
      await storageService.deleteMenuItem(id);
      loadData();
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading Dashboard...</div>;

  if (!shop) return (
    <div className="max-w-xl mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl text-center border">
      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </div>
      <h2 className="text-2xl font-bold mb-2">Welcome to Apna Menu</h2>
      <p className="text-gray-500 mb-8">Set up your digital menu in seconds and start receiving orders via WhatsApp.</p>
      <button 
        onClick={async () => { await storageService.seedDemoData(); loadData(); }}
        className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-green-700 transition-all"
      >
        Initialize My Shop
      </button>
    </div>
  );

  const customerUrl = `${window.location.origin}${window.location.pathname}#/menu/${shop.slug}`;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{shop.name}</h1>
          <p className="text-gray-500">Manage your menu and track growth</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link 
            to={`/menu/${shop.slug}`} 
            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all border"
          >
            Preview Menu
          </Link>
          <button 
            onClick={() => setShowItemForm(true)}
            className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all"
          >
            + Add Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & QR */}
        <div className="space-y-8">
          {/* Share Section */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border overflow-hidden">
            <h2 className="text-lg font-bold mb-6 flex items-center">
              <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              </span>
              Share Your Menu
            </h2>
            
            <div className="flex flex-col items-center">
              <div className="p-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 mb-6">
                <QRCodeCanvas 
                  id="qr-code-canvas"
                  value={customerUrl} 
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="w-full space-y-3">
                <button 
                  onClick={downloadQRCode}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  <span>Download QR Code</span>
                </button>
                <button 
                  onClick={() => copyToClipboard(customerUrl)}
                  className={`w-full flex items-center justify-center space-x-2 border-2 py-3 rounded-xl font-bold transition-all ${copySuccess ? 'bg-green-50 border-green-200 text-green-600' : 'hover:bg-gray-50'}`}
                >
                  {copySuccess ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                      <span>Copy Menu Link</span>
                    </>
                  )}
                </button>
              </div>
              <p className="mt-4 text-[10px] text-gray-400 font-mono break-all text-center px-4">{customerUrl}</p>
            </div>
          </div>

          {/* Settings Section */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Shop Info</h2>
              <button onClick={() => setIsEditingShop(!isEditingShop)} className="text-sm text-green-600 font-bold hover:underline">
                {isEditingShop ? 'Cancel' : 'Edit Info'}
              </button>
            </div>

            {isEditingShop ? (
              <form onSubmit={handleUpdateShop} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Store Name</label>
                  <input type="text" value={shop.name} onChange={e => setShop({...shop, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp No (Include Code)</label>
                  <input type="text" value={shop.whatsappNumber} onChange={e => setShop({...shop, whatsappNumber: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg">Save Settings</button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">WhatsApp</span>
                  <span className="font-semibold">{shop.whatsappNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Currency</span>
                  <span className="font-semibold">{shop.currency}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500 text-sm">Items</span>
                  <span className="font-semibold">{items.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Menu List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gray-50/50">
              <h2 className="text-xl font-bold">Live Menu Items</h2>
            </div>
            
            <div className="divide-y">
              {items.map(item => (
                <div key={item.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded-full uppercase tracking-wider">{item.category}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    <p className="text-green-700 font-black mt-2">{shop.currency}{item.price}</p>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${item.isAvailable ? 'text-green-500' : 'text-red-500'}`}>
                        {item.isAvailable ? 'In Stock' : 'Sold Out'}
                      </span>
                      <button 
                        onClick={() => toggleAvailability(item)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors relative ${item.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${item.isAvailable ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <button onClick={() => deleteItem(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  </div>
                  <p className="text-gray-400 font-medium">Your menu is empty.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Item Form Modal */}
      {showItemForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-bold">Create New Item</h3>
              <button onClick={() => setShowItemForm(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">✕</button>
            </div>
            <form onSubmit={handleAddItem} className="p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Item Name</label>
                  <input 
                    type="text" required placeholder="e.g. Special Masala Chai"
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none transition-all"
                    value={newItem.name || ''}
                    onChange={e => setNewItem({...newItem, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price ({shop.currency})</label>
                    <input 
                      type="number" required placeholder="0.00"
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none transition-all"
                      value={newItem.price || ''}
                      onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                    <input 
                      type="text" placeholder="e.g. Tea"
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none transition-all"
                      value={newItem.category || ''}
                      onChange={e => setNewItem({...newItem, category: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                  <textarea 
                    placeholder="Describe your item..."
                    className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl focus:border-green-500 outline-none transition-all h-24"
                    value={newItem.description || ''}
                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowItemForm(false)} className="flex-1 py-4 font-bold border-2 rounded-2xl hover:bg-gray-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-4 font-bold bg-green-600 text-white rounded-2xl shadow-xl hover:bg-green-700 transition-all">Add to Menu</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
