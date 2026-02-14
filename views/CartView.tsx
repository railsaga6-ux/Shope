
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MapPin,
  Truck,
  Lock,
  Activity
} from 'lucide-react';

interface CartViewProps {
  onSuccess: () => void;
}

const CartView: React.FC<CartViewProps> = ({ onSuccess }) => {
  const { cart, removeFromCart, updateCartQuantity, user, processPurchase, isProcessingBalance } = useApp();
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'processing' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [logPhase, setLogPhase] = useState(0);
  const [address, setAddress] = useState({
    name: user?.displayName || '',
    street: '',
    city: '',
    zip: ''
  });

  const logs = [
    "Synchronizing Ledger Node...",
    "Validating Vault Reserves...",
    "Securing Atomic Inventory Locks...",
    "Finalizing Cryptographic Signature..."
  ];

  useEffect(() => {
    if (checkoutStep === 'processing') {
      const interval = setInterval(() => {
        setLogPhase(prev => (prev + 1) % logs.length);
      }, 700);
      return () => clearInterval(interval);
    }
  }, [checkoutStep]);

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const canAfford = user ? user.balance >= total : false;
  const isAddressComplete = address.street && address.city && address.zip;

  const handleCheckout = async () => {
    if (!isAddressComplete) {
      setError("Please complete your delivery coordinates.");
      return;
    }
    
    setCheckoutStep('processing');
    setError(null);
    
    const shippingString = `${address.street}, ${address.city}, ${address.zip}`;
    const success = await processPurchase(shippingString);
    
    if (success) {
      setCheckoutStep('success');
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } else {
      setError('Authorization failed. Vault integrity check bypassed or stock depleted.');
      setCheckoutStep('idle');
    }
  };

  if (checkoutStep === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-400 blur-3xl opacity-20 animate-pulse"></div>
          <CheckCircle2 className="w-32 h-32 text-emerald-500 relative z-10" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Purchase Secured</h2>
        <p className="text-slate-500 max-w-md mx-auto font-medium">
          Your order has been validated and recorded. Assets are being prepared for dispatch to your coordinates.
        </p>
        <div className="pt-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-50 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-100 animate-bounce">
            Redirecting to Ledger...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 animate-in slide-in-from-bottom-6 duration-700">
      {/* Processing Modal Overlay */}
      {checkoutStep === 'processing' && (
        <div className="fixed inset-0 z-[200] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-300">
             <div className="relative inline-block">
               <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
               <Lock className="absolute inset-0 m-auto w-8 h-8 text-indigo-500" />
             </div>
             <div className="space-y-2">
               <h3 className="text-2xl font-black text-white tracking-tight">Securing Assets</h3>
               <div className="flex items-center justify-center gap-2 text-indigo-400">
                 <Activity className="w-4 h-4 animate-pulse" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em]">{logs[logPhase]}</p>
               </div>
             </div>
             <p className="text-slate-400 text-sm font-medium">Please do not disconnect. Atomic validation is in progress.</p>
          </div>
        </div>
      )}

      <div className="flex-grow space-y-12">
        {/* Cart Items */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Acquisition List</h2>
          </div>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.product.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 flex flex-col sm:flex-row items-center gap-8 group hover:border-indigo-200 transition-all">
                <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={item.product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.product.name} />
                </div>
                <div className="flex-grow w-full">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{item.product.name}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{item.product.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-slate-900">{(item.product.price * item.quantity).toLocaleString()}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PTS</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                      <button onClick={() => updateCartQuantity(item.product.id, -1)} className="p-2 hover:bg-white rounded-lg shadow-sm"><Minus className="w-4 h-4" /></button>
                      <span className="w-8 text-center font-black text-slate-900">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.product.id, 1)} className="p-2 hover:bg-white rounded-lg shadow-sm"><Plus className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Form */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <MapPin className="w-6 h-6 text-indigo-600" />
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Delivery Coordinates</h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Receiver</label>
                <input 
                  type="text" 
                  value={address.name}
                  onChange={(e) => setAddress({...address, name: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Shipping Sector (Street)</label>
                <input 
                  type="text" 
                  placeholder="E.g. 128 Innovation Way"
                  value={address.street}
                  onChange={(e) => setAddress({...address, street: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City Node</label>
                <input 
                  type="text" 
                  placeholder="New Silicon"
                  value={address.city}
                  onChange={(e) => setAddress({...address, city: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Regional Code</label>
                <input 
                  type="text" 
                  placeholder="94025"
                  value={address.zip}
                  onChange={(e) => setAddress({...address, zip: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Sidebar */}
      <div className="w-full lg:w-[450px]">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50 sticky top-28 border-t-8 border-t-indigo-600 space-y-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Financial Summary</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-slate-500 font-bold text-sm">
              <span>Subtotal Commitment</span>
              <span className="text-slate-900">{total.toLocaleString()} PTS</span>
            </div>
            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-end">
                <span className="text-lg font-black text-slate-900">Grand Total</span>
                <div className="text-right">
                  <span className="text-4xl font-black text-indigo-600 leading-none">{total.toLocaleString()}</span>
                  <p className="text-[10px] font-black text-slate-400 uppercase mt-2 tracking-[0.2em]">Transaction Value</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Vault Status</p>
                <p className={`text-xl font-black ${canAfford ? 'text-slate-900' : 'text-red-600'}`}>
                  {user?.balance.toLocaleString()} <span className="text-xs text-slate-400">PTS</span>
                </p>
              </div>
              <div className={`p-4 rounded-2xl ${canAfford ? 'bg-white text-indigo-600' : 'bg-red-100 text-red-600'}`}>
                <CreditCard className="w-6 h-6" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-xs font-black uppercase tracking-widest">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={!canAfford || checkoutStep === 'processing' || isProcessingBalance}
              className={`w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all ${
                canAfford && checkoutStep === 'idle'
                ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-2xl hover:-translate-y-1' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              Authorize Transaction
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Atomic Validation Protocols Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;
