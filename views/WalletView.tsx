
import React, { useState } from 'react';
import { useApp } from '../store';
import { 
  CreditCard, 
  PlusCircle, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Wallet, 
  CheckCircle,
  Clock,
  Banknote,
  DollarSign
} from 'lucide-react';

const WalletView: React.FC = () => {
  const { user, addPoints, isProcessingBalance } = useApp();
  const [topupAmount, setTopupAmount] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedPack, setSelectedPack] = useState<number | null>(null);

  const packs = [
    { id: 1, amount: 1000, label: 'Starter Pack', price: '$10.00', bonus: 0, color: 'bg-slate-50' },
    { id: 2, amount: 5000, label: 'Elite Bundle', price: '$45.00', bonus: 500, color: 'bg-indigo-50 border-indigo-100', highlight: true },
    { id: 3, amount: 25000, label: 'Vault Sovereign', price: '$200.00', bonus: 5000, color: 'bg-amber-50 border-amber-100' },
  ];

  const handleTopup = async (amount: number, packId?: number) => {
    if (packId) setSelectedPack(packId);
    await addPoints(amount);
    if (packId) setSelectedPack(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Digital Economy</h1>
          <p className="text-slate-500 font-medium">Manage your vault balance and secure point allocations.</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-right-4">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-bold">Allocation Successful</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Balance Card */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Wallet className="w-80 h-80 -mr-20 -mt-20" />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Vault Identifier</p>
                  <p className="text-sm font-mono tracking-wider text-slate-300">ELITE-RESERVE-{user.uid.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Ledger Online</span>
                </div>
              </div>

              <div>
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4">Secured Balance</p>
                <div className="flex items-baseline gap-4">
                  <h2 className={`text-7xl font-black tracking-tighter transition-all duration-500 ${isProcessingBalance ? 'opacity-50 blur-[2px]' : ''}`}>
                    {user.balance.toLocaleString()}
                  </h2>
                  <span className="text-2xl font-black text-indigo-400">PTS</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-16 grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10">
                <ShieldCheck className="w-6 h-6 text-indigo-400 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Security Tier</p>
                <p className="font-bold text-sm">Military Grade</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10">
                <Clock className="w-6 h-6 text-amber-400 mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Last Update</p>
                <p className="font-bold text-sm">Just Now</p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Allocation */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <PlusCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Direct Allocation</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Manual Entry</p>
              </div>
            </div>

            <div className="space-y-6 flex-grow">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity (Points)</label>
                <div className="relative">
                  <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
                  <input 
                    type="number" 
                    value={topupAmount || ''}
                    onChange={(e) => setTopupAmount(Number(e.target.value))}
                    placeholder="Enter custom amount..."
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-black text-xl text-slate-900 transition-all"
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                   <p className="text-[10px] font-bold text-slate-400">Est. Value: <span className="text-slate-900">${(topupAmount / 100).toFixed(2)} USD</span></p>
                   <p className="text-[10px] font-bold text-slate-400">Min. 100 PTS</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex-grow">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Payment Method</p>
                  <p className="text-sm font-bold text-slate-900">Digital Wallet Simulation</p>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700">Change</button>
              </div>
            </div>

            <button
              onClick={() => handleTopup(topupAmount)}
              disabled={isProcessingBalance || topupAmount < 100}
              className="w-full mt-10 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 active:scale-[0.98]"
            >
              {isProcessingBalance ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Confirm Allocation
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Point Packages */}
      <div className="space-y-6 px-2">
        <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Zap className="w-6 h-6 text-amber-500" />
          Priority Packages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packs.map((pack) => (
            <div 
              key={pack.id} 
              className={`group relative border rounded-[2.5rem] p-10 transition-all duration-300 ${pack.color} ${pack.highlight ? 'ring-2 ring-indigo-500 shadow-2xl shadow-indigo-100 -translate-y-2' : 'hover:border-slate-300 hover:shadow-xl hover:-translate-y-1'}`}
            >
              {pack.bonus > 0 && (
                <div className="absolute -top-4 left-10">
                  <span className="bg-amber-400 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-amber-100">
                    +{pack.bonus} Bonus Points
                  </span>
                </div>
              )}
              
              <div className="mb-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">{pack.label}</h4>
                <div className="flex items-baseline gap-2">
                   <p className="text-4xl font-black text-slate-900 tracking-tighter">{(pack.amount + pack.bonus).toLocaleString()}</p>
                   <span className="text-sm font-black text-slate-400">PTS</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-12">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-indigo-600">{pack.price}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">One-time payment</span>
                </div>
                <button 
                  onClick={() => handleTopup(pack.amount + pack.bonus, pack.id)}
                  disabled={isProcessingBalance}
                  className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    pack.highlight 
                    ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-indigo-100' 
                    : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  {selectedPack === pack.id ? 'Processing...' : 'Acquire'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletView;
