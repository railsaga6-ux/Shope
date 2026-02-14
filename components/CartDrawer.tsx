
import React from 'react';
import { useApp } from '../store';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const { cart, removeFromCart, updateCartQuantity, isCartOpen, setCartOpen } = useApp();

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300" 
        onClick={() => setCartOpen(false)} 
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[110] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Vault Basket</h2>
          </div>
          <button 
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 space-y-6 scrollbar-hide">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.product.id} className="flex gap-4 group">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={item.product.imageUrl} className="w-full h-full object-cover" alt={item.product.name} />
                </div>
                <div className="flex-grow space-y-2">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.product.name}</h4>
                    <span className="font-black text-indigo-600 text-sm">{(item.product.price * item.quantity).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-100">
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, -1)}
                        className="p-1 hover:bg-white rounded transition-all shadow-sm"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQuantity(item.product.id, 1)}
                        className="p-1 hover:bg-white rounded transition-all shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-slate-500 font-medium">Your vault is currently empty.</p>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Commitment</span>
              <span className="text-2xl font-black text-slate-900">{total.toLocaleString()} <span className="text-xs font-black text-indigo-500">PTS</span></span>
            </div>
            <button 
              onClick={() => {
                setCartOpen(false);
                onCheckout();
              }}
              className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"
            >
              Secure Checkout
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
