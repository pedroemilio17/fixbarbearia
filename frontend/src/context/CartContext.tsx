import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem, BookingData, Order } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (serviceId: string, serviceName: string, price: number) => void;
  removeItem: (serviceId: string) => void;
  updateQuantity: (serviceId: string, quantity: number) => void;
  getTotal: () => number;
  getCartCount: () => number;
  clearCart: () => void;
  createOrder: (booking: BookingData) => Order | null;
  getOrders: () => Order[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'fix_barbearia_cart';
const ORDERS_STORAGE_KEY = 'fix_barbearia_orders';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, mounted]);

  const addItem = (serviceId: string, serviceName: string, price: number) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.serviceId === serviceId);

      if (existingItem) {
        return prev.map((item) =>
          item.serviceId === serviceId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          serviceId,
          serviceName,
          price,
          quantity: 1,
        },
      ];
    });
  };

  const removeItem = (serviceId: string) => {
    setItems((prev) => prev.filter((item) => item.serviceId !== serviceId));
  };

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(serviceId);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.serviceId === serviceId ? { ...item, quantity } : item
      )
    );
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const clearCart = () => {
    setItems([]);
  };

  const createOrder = (booking: BookingData): Order | null => {
    if (items.length === 0) return null;

    const order: Order = {
      id: `ORDER-${Date.now()}`,
      items: [...items],
      booking,
      total: getTotal(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    const orders = getOrders();
    orders.push(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

    clearCart();
    return order;
  };

  const getOrders = (): Order[] => {
    const orders = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (orders) {
      try {
        return JSON.parse(orders);
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    }
    return [];
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        getTotal,
        getCartCount,
        clearCart,
        createOrder,
        getOrders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
