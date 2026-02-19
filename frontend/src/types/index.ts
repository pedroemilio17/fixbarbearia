export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  category: 'haircut' | 'beard' | 'shaving' | 'combo';
}

export interface CartItem {
  serviceId: string;
  quantity: number;
  serviceName: string;
  price: number;
}

export interface BookingData {
  date: string;
  time: string;
  paymentMethod: 'online' | 'cash';
  notes?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  booking: BookingData;
  total: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export type ThemeType = 'light' | 'dark';
