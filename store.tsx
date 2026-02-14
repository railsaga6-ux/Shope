
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, Product, CartItem, Transaction, Order, UserRole, OrderStatus 
} from './types';
// Import only the necessary Firestore functions
import { 
  collection, doc, onSnapshot, query, where, 
  updateDoc, increment, setDoc, runTransaction, getDoc,
  orderBy, limit, deleteDoc
} from 'firebase/firestore';
// Import only the necessary Auth functions
import { 
  signOut as firebaseSignOut, onAuthStateChanged, deleteUser as firebaseDeleteUser
} from 'firebase/auth';
// Import the centralized services to avoid re-initialization and fix export errors
import { db, auth } from './services/firebase';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface AppStore {
  user: User | null;
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  orders: Order[];
  allUsers: User[]; 
  toasts: Toast[];
  isSyncing: boolean;
  isProcessingBalance: boolean;
  isCartOpen: boolean;
  selectedProduct: Product | null;
  lastTopupTime: number; 
  
  // UI Actions
  setUser: (user: User | null) => void;
  setAllUsers: (users: User[]) => void;
  signOut: () => Promise<void>;
  setCartOpen: (open: boolean) => void;
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;

  // Data Actions
  setProducts: (products: Product[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setOrders: (orders: Order[]) => void;
  setSelectedProduct: (product: Product | null) => void;

  // Cart Actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateCartQuantity: (productId: string, delta: number) => void;

  // Transactional Actions
  addPoints: (amount: number, paymentMethod?: string) => Promise<void>;
  processPurchase: (shippingAddress?: string) => Promise<boolean>;
  
  // Admin Product Management
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Admin Management Actions
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;

  // Data Protection Actions
  exportUserData: () => void;
  deleteAccount: () => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      products: [],
      cart: [],
      transactions: [],
      orders: [],
      allUsers: [],
      toasts: [],
      isSyncing: false,
      isProcessingBalance: false,
      isCartOpen: false,
      selectedProduct: null,
      lastTopupTime: 0,

      setUser: (user) => set({ user }),
      setAllUsers: (allUsers) => set({ allUsers }),
      setCartOpen: (open) => set({ isCartOpen: open }),
      
      addToast: (message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => get().removeToast(id), 4000);
      },
      
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      })),

      signOut: async () => {
        await firebaseSignOut(auth);
        set({ user: null, cart: [], orders: [], transactions: [], allUsers: [] });
        get().addToast("Vault connection terminated safely.", "info");
      },

      setProducts: (products) => set({ products }),
      setTransactions: (transactions) => set({ transactions }),
      setOrders: (orders) => set({ orders }),
      setSelectedProduct: (product) => set({ selectedProduct: product }),

      addToCart: (product) => set((state) => {
        const existing = state.cart.find(item => item.product.id === product.id);
        get().addToast(`${product.name} added to cart.`, 'success');
        if (existing) {
          return {
            cart: state.cart.map(item =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
            isCartOpen: true
          };
        }
        return { cart: [...state.cart, { product, quantity: 1 }], isCartOpen: true };
      }),

      removeFromCart: (productId) => set((state) => ({
        cart: state.cart.filter(item => item.product.id !== productId)
      })),

      updateCartQuantity: (productId, delta) => set((state) => ({
        cart: state.cart.map(item => {
          if (item.product.id === productId) {
            const newQty = Math.max(1, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
      })),

      clearCart: () => set({ cart: [] }),

      addPoints: async (amount, paymentMethod = 'Credit Card') => {
        const { user, lastTopupTime } = get();
        if (!user) return;

        const now = Date.now();
        if (now - lastTopupTime < 10000) {
          get().addToast("Security throttle active. Wait 10s.", "warning");
          return;
        }

        // Reasonable limit validation to detect fraud attempts
        if (amount < 100 || amount > 50000) {
          get().addToast("Allocation out of permitted range (100 - 50,000 PTS).", "error");
          return;
        }

        set({ isProcessingBalance: true });
        const transId = `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        try {
          await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists()) throw new Error("Target node not found.");
            
            const currentBalance = userSnap.data().balance;
            const newBalance = currentBalance + amount;

            const transRecord: Transaction = {
              id: transId,
              userId: user.uid,
              type: 'TOPUP',
              amount,
              balanceAfter: newBalance,
              status: 'completed',
              paymentMethod,
              date: new Date().toISOString(),
              description: `Top-up via ${paymentMethod}`
            };

            const transRef = doc(db, 'transactions', transId);
            transaction.set(transRef, transRecord);
            transaction.update(userRef, { 
              balance: increment(amount),
              updatedAt: new Date().toISOString()
            });
          });
          set({ lastTopupTime: Date.now() });
          get().addToast(`Allocation of ${amount} PTS complete.`, 'success');
        } catch (e: any) {
          get().addToast(e.message || "Financial allocation failed.", 'error');
        } finally {
          set({ isProcessingBalance: false });
        }
      },

      processPurchase: async (shippingAddress = "Elite Direct Delivery") => {
        const { user, cart } = get();
        if (!user || cart.length === 0) return false;

        const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        
        if (total <= 0) {
          get().addToast("Invalid transaction volume.", "error");
          return false;
        }

        set({ isProcessingBalance: true });
        
        try {
          await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await transaction.get(userRef);
            
            if (!userSnap.exists()) throw new Error("Identity verified but node missing.");
            if (userSnap.data().balance < total) {
              throw new Error("Insufficient funds in vault.");
            }

            const orderId = `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            const orderRef = doc(db, 'orders', orderId);
            const newOrder: Order = {
              id: orderId,
              userId: user.uid,
              items: cart.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                priceAtPurchase: item.product.price
              })),
              totalPoints: total,
              status: 'PENDING',
              date: new Date().toISOString()
            };
            transaction.set(orderRef, newOrder);

            const newBalance = userSnap.data().balance - total;
            transaction.update(userRef, { 
              balance: increment(-total),
              updatedAt: new Date().toISOString()
            });

            const transId = `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            const transRef = doc(db, 'transactions', transId);
            const transRecord: Transaction = {
              id: transId,
              userId: user.uid,
              type: 'PURCHASE',
              amount: total,
              balanceAfter: newBalance,
              status: 'completed',
              date: new Date().toISOString(),
              description: `Checkout order ${orderId} | Dest: ${shippingAddress}`
            };
            transaction.set(transRef, transRecord);

            for (const item of cart) {
              const productRef = doc(db, 'products', item.product.id);
              const prodSnap = await transaction.get(productRef);
              if (!prodSnap.exists() || prodSnap.data().stock < item.quantity) {
                 throw new Error(`Insufficient stock for ${item.product.name}`);
              }
              transaction.update(productRef, { stock: increment(-item.quantity) });
            }
          });

          set({ cart: [] });
          get().addToast("Purchase authorized and assets secured.", "success");
          return true;
        } catch (e: any) {
          get().addToast(e.message || "Authorization failed.", "error");
          return false;
        } finally {
          set({ isProcessingBalance: false });
        }
      },

      addProduct: async (p) => {
        await setDoc(doc(db, 'products', p.id), p);
        get().addToast("Asset initialized in global ledger.", "success");
      },
      updateProduct: async (p) => {
        await updateDoc(doc(db, 'products', p.id), p);
        get().addToast("Asset profile synchronized.", "success");
      },
      deleteProduct: async (id) => {
        await updateDoc(doc(db, 'products', id), { isActive: false });
        get().addToast("Asset decommissioned.", "warning");
      },

      updateOrderStatus: async (orderId, status) => {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status });
        get().addToast(`Order ${orderId} status updated to ${status}.`, "info");
      },

      updateUserRole: async (userId, role) => {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { role, updatedAt: new Date().toISOString() });
        get().addToast("Authority levels recalculated.", "warning");
      },

      exportUserData: () => {
        const { user, transactions, orders } = get();
        if (!user) return;
        
        const data = {
          profile: user,
          audit_trail: transactions,
          acquisition_history: orders,
          exported_at: new Date().toISOString(),
          system: "PointShop Elite Node 1.4.0"
        };
        
        // Circular reference replacer for JSON.stringify
        const getCircularReplacer = () => {
          const seen = new WeakSet();
          return (key: string, value: any) => {
            if (typeof value === "object" && value !== null) {
              if (seen.has(value)) {
                return "[Circular]";
              }
              seen.add(value);
            }
            return value;
          };
        };

        try {
          const jsonString = JSON.stringify(data, getCircularReplacer(), 2);
          const blob = new Blob([jsonString], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `elite_data_export_${user.uid.slice(0, 8)}.json`;
          a.click();
          URL.revokeObjectURL(url);
          get().addToast("Identity data packaged for export.", "success");
        } catch (err) {
          console.error("Export error:", err);
          get().addToast("Failed to package identity data.", "error");
        }
      },

      deleteAccount: async () => {
        const { user } = get();
        if (!user || !auth.currentUser) return;

        const confirm = window.confirm("CRITICAL: This will permanently purge your identity and all accumulated assets from the global ledger. This action is irreversible. Proceed?");
        if (!confirm) return;

        try {
          // 1. Clear Firestore Data
          const userRef = doc(db, 'users', user.uid);
          await deleteDoc(userRef);
          
          // 2. Delete Auth Entry
          await firebaseDeleteUser(auth.currentUser);
          
          get().signOut();
          get().addToast("Identity purged successfully.", "warning");
        } catch (e: any) {
          get().addToast("Purge failed. Elevated permissions or re-auth required.", "error");
        }
      }
    }),
    {
      name: 'pointshop-storage',
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);

export const useApp = () => useAppStore();

export const initSync = () => {
  const store = useAppStore.getState();

  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const currentUserData = userSnap.data() as User;
        store.setUser(currentUserData);
        
        onSnapshot(userRef, (doc) => {
          if (doc.exists()) store.setUser(doc.data() as User);
        });

        if (currentUserData.role === UserRole.ADMIN) {
          onSnapshot(query(collection(db, 'transactions'), orderBy('date', 'desc'), limit(100)), (snap) => {
            store.setTransactions(snap.docs.map(d => d.data() as Transaction));
          });
          onSnapshot(query(collection(db, 'orders'), orderBy('date', 'desc'), limit(100)), (snap) => {
            store.setOrders(snap.docs.map(d => d.data() as Order));
          });
          onSnapshot(query(collection(db, 'users'), limit(100)), (snap) => {
            store.setAllUsers(snap.docs.map(d => d.data() as User));
          });
        } else {
          const transQuery = query(
            collection(db, 'transactions'), 
            where('userId', '==', firebaseUser.uid),
            orderBy('date', 'desc')
          );
          onSnapshot(transQuery, (snap) => {
            store.setTransactions(snap.docs.map(d => d.data() as Transaction));
          });

          const ordersQuery = query(
            collection(db, 'orders'), 
            where('userId', '==', firebaseUser.uid),
            orderBy('date', 'desc')
          );
          onSnapshot(ordersQuery, (snap) => {
            store.setOrders(snap.docs.map(d => d.data() as Order));
          });
        }
      }
    } else {
      store.setUser(null);
    }
  });

  onSnapshot(collection(db, 'products'), (snap) => {
    store.setProducts(snap.docs.map(d => d.data() as Product).filter(p => p.isActive));
  });
};
