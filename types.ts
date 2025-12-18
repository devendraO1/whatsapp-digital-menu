
export interface Shop {
  id: string;
  name: string;
  slug: string;
  currency: string;
  whatsappNumber: string;
  logoUrl?: string;
}

export interface MenuItem {
  id: string;
  shopId: string;
  name: string;
  price: number;
  category: string;
  description: string;
  isAvailable: boolean;
  imageUrl?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export enum UserRole {
  VENDOR = 'VENDOR',
  CUSTOMER = 'CUSTOMER'
}
