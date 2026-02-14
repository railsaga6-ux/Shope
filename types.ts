
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin'
}

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // In points
  category: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
  createdAt: string;
};

export type User = {
  uid: string;
  email: string;
  displayName: string;
  balance: number; // Current points balance
  role: UserRole;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionType = 'TOPUP' | 'PURCHASE' | 'REFUND';

export type TransactionStatus = 'pending' | 'completed' | 'failed';

export type Transaction = {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number; // Tracks historical balance state
  status: TransactionStatus;
  paymentMethod?: string;
  date: string; // ISO String for frontend
  description: string;
};

export type OrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export type OrderItem = {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
};

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  totalPoints: number;
  status: OrderStatus;
  date: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
