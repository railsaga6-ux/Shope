
import React, { useState } from 'react';
import { useApp } from '../store';
import { 
  ShoppingBag, 
  CreditCard, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Package, 
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Download,
  Trash2,
  Lock,
  UserCheck
} from 'lucide-react';

const HistoryView: React.FC = () => {
  const { transactions, orders, user, exportUserData, deleteAccount } = useApp();
  const [activeTab, setActiveTab] = useState<'orders' | 'transactions' | 'privacy'>('orders');

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Audit Logs</h1>
          <p className="text-slate-500 font-medium">Historical record of all vault activities and acquisitions.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            Acquisitions
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'transactions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <CreditCard className="w-4 h-4" />
            Financials
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'privacy' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <ShieldCheck className="w-4 h-4" />
            Privacy
          </button>
        </div>
      </div>

      {activeTab === 'orders' && (
        <section className="space-y-6 animate-in slide-in-from-left-4 duration-500">
          {orders.length > 0 ? (
            <div className="grid gap-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-slate-100 transition-all group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                        <Package className="w-10 h-10 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-xl font-black text-slate-900">{order.id}</p>
                          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-full flex items-center gap-1.5 ${
                            order.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {order.status === 'PENDING' ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between lg:justify-end gap-12 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Valuation</p>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">{order.totalPoints.toLocaleString()} <span className="text-xs text-indigo-500 font-black">PTS</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-[3rem] py-32 text-center shadow-sm">
               <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                 <ShoppingBag className="w-12 h-12 text-slate-200" />
               </div>
               <h3 className="text-2xl font-black text-slate-900 mb-2">No Acquisitions Detected</h3>
            </div>
          )}
        </section>
      )}

      {activeTab === 'transactions' && (
        <section className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-white border border-slate-200 rounded-[3rem] overflow-hidden shadow-sm">
            {transactions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-12 px-10 py-6 bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <div className="col-span-6 md:col-span-7">Event Narrative</div>
                  <div className="col-span-3 md:col-span-2 text-right">Points</div>
                  <div className="col-span-3 text-right">Historical Balance</div>
                </div>
                {transactions.map(trans => (
                  <div key={trans.id} className="grid grid-cols-12 px-10 py-8 items-center hover:bg-slate-50/50 transition-colors group">
                    <div className="col-span-6 md:col-span-7 flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        trans.type === 'TOPUP' ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'
                      }`}>
                        {trans.type === 'TOPUP' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg mb-1">{trans.description}</p>
                        <p className="text-[9px] font-mono text-slate-400 mb-2 uppercase">ID: {trans.id}</p>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(trans.date).toLocaleTimeString()}</span>
                          <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-emerald-500" /> SECURED</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-3 md:col-span-2 text-right">
                      <span className={`text-xl font-black ${
                        trans.type === 'TOPUP' ? 'text-emerald-500' : 'text-slate-900'
                      }`}>
                        {trans.type === 'TOPUP' ? '+' : '-'}{trans.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="col-span-3 text-right">
                      <p className="text-xl font-black text-slate-300 group-hover:text-slate-900 transition-colors">
                        {trans.balanceAfter.toLocaleString()}
                        <span className="text-[10px] ml-1 opacity-50 font-black">PTS</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center">
                <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No ledger entries detected.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'privacy' && (
        <section className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 space-y-6 shadow-sm">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                <Download className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Identity Portability</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Download a complete record of your node activity, including acquisition details and financial audit logs in a machine-readable JSON format.
              </p>
              <button 
                onClick={exportUserData}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
              >
                Request Identity Package
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 space-y-6 shadow-sm">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center">
                <ShieldAlert className="w-7 h-7 text-rose-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Purge Protocol</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Invoke the "Right to be Forgotten." This will permanently disconnect your identity from the PointShop Elite network and decommission all assets.
              </p>
              <button 
                onClick={deleteAccount}
                className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2 border border-rose-100"
              >
                <Trash2 className="w-4 h-4" />
                Decommission Identity
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <UserCheck className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Security Health Status</p>
                <h4 className="text-xl font-bold">Node Identity Verified</h4>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-400">Compliance Standard</p>
              <p className="font-black tracking-widest uppercase text-indigo-400">Elite 1.4-SEC</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HistoryView;
