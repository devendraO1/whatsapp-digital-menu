
import { Shop, MenuItem } from '../types';

const SHOPS_KEY = 'whatsapp_menu_shops';
const ITEMS_KEY = 'whatsapp_menu_items';

// Helper to simulate async database calls
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const storageService = {
  async getShops(): Promise<Shop[]> {
    await delay(300);
    const data = localStorage.getItem(SHOPS_KEY);
    return data ? JSON.parse(data) : [];
  },

  async getShopBySlug(slug: string): Promise<Shop | undefined> {
    const shops = await this.getShops();
    return shops.find(s => s.slug === slug);
  },

  async saveShop(shop: Shop): Promise<void> {
    const shops = await this.getShops();
    const index = shops.findIndex(s => s.id === shop.id);
    if (index > -1) {
      shops[index] = shop;
    } else {
      shops.push(shop);
    }
    localStorage.setItem(SHOPS_KEY, JSON.stringify(shops));
  },

  async getMenuItems(shopId: string): Promise<MenuItem[]> {
    await delay(300);
    const data = localStorage.getItem(ITEMS_KEY);
    const allItems: MenuItem[] = data ? JSON.parse(data) : [];
    return allItems.filter(item => item.shopId === shopId);
  },

  async saveMenuItem(item: MenuItem): Promise<void> {
    const data = localStorage.getItem(ITEMS_KEY);
    const allItems: MenuItem[] = data ? JSON.parse(data) : [];
    const index = allItems.findIndex(i => i.id === item.id);
    
    if (index > -1) {
      allItems[index] = item;
    } else {
      allItems.push(item);
    }
    localStorage.setItem(ITEMS_KEY, JSON.stringify(allItems));
  },

  async deleteMenuItem(id: string): Promise<void> {
    const data = localStorage.getItem(ITEMS_KEY);
    const allItems: MenuItem[] = data ? JSON.parse(data) : [];
    const filtered = allItems.filter(i => i.id !== id);
    localStorage.setItem(ITEMS_KEY, JSON.stringify(filtered));
  },

  // Seed initial demo data
  async seedDemoData() {
    const shops = await this.getShops();
    if (shops.length === 0) {
      const demoShop: Shop = {
        id: 'demo-shop-1',
        name: 'The Chai Spot',
        slug: 'the-chai-spot',
        currency: '₹',
        whatsappNumber: '919876543210'
      };
      await this.saveShop(demoShop);

      const demoItems: MenuItem[] = [
        { id: '1', shopId: demoShop.id, name: 'Masala Chai', price: 25, category: 'Tea', description: 'Classic spiced milk tea', isAvailable: true },
        { id: '2', shopId: demoShop.id, name: 'Ginger Tea', price: 20, category: 'Tea', description: 'Fresh ginger infused tea', isAvailable: true },
        { id: '3', shopId: demoShop.id, name: 'Samosa (2pcs)', price: 40, category: 'Snacks', description: 'Crispy fried pastries with potato filling', isAvailable: true },
        { id: '4', shopId: demoShop.id, name: 'Paneer Pakora', price: 80, category: 'Snacks', description: 'Fried cottage cheese fritters', isAvailable: true },
      ];
      
      for (const item of demoItems) {
        await this.saveMenuItem(item);
      }
    }
  }
};
