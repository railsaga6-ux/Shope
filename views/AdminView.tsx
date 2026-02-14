
import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import { Product, UserRole, Transaction, Order, OrderStatus, User } from '../types';
import { CATEGORIES } from '../constants';
import { generateProductDescription } from '../services/gemini';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  TrendingUp, 
  Users, 
  AlertCircle,
  Wand2,
  Save,
  X,
  ShieldCheck,
  Layers,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  FileText,
  Activity,
  ShoppingBag,
  MoreVertical,
  CheckCircle,
  Clock,
  ShieldAlert,
  Menu
} from 'lucide-react';

const AdminView: React.FC = () => {
  const { 
    products, addProduct, updateProduct, deleteProduct, 
    orders, transactions, allUsers, user,
    updateOrderStatus, updateUserRole
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'orders' | 'users'>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const lowStockItems = products.filter(p => p.stock < 10);
  const pendingOrders = orders.filter(o => o.status === 'PENDING');

  // Dashboard Stats
  const stats = [
    { label: 'Asset Value (PTS)', value: products.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString(), icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Volume', value: orders.reduce((acc, o) => acc + o.totalPoints, 0).toLocaleString(), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Nodes', value: allUsers.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' }, 
    { label: 'System Alerts', value: lowStockItems.length + pendingOrders.length, icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', critical: (lowStockItems.length + pendingOrders.length) > 0 },
  ];

  // Chart Data
  const categoryVolume = CATEGORIES.filter(c => c !== 'All').map(cat => ({
    name: cat,
    total: products.filter(p => p.category === cat).reduce((sum, p) => sum + p.price, 0)
  }));

  const orderTrend = useMemo(() => {
    const last7Days = Array.from({length: 7}).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date: date.split('-').slice(1).join('/'),
      count: orders.filter(o => o.date.startsWith(date)).length,
      volume: orders.filter(o => o.date.startsWith(date)).reduce((acc, o) => acc + o.totalPoints, 0) / 100
    }));
  }, [orders]);

  const handleAiGenerate = async () => {
    if (!editingProduct?.name || !editingProduct?.category) return;
    setIsAiLoading(true);
    const desc = await generateProductDescription(editingProduct.name, editingProduct.category);
    setEditingProduct(prev => ({ ...prev, description: desc }));
    setIsAiLoading(false);
  };

  const handleSaveProduct = () => {
    if (!editingProduct?.name || !editingProduct?.price) return;
    if (editingProduct.id) {
      updateProduct(editingProduct as Product);
    } else {
      const newP: Product = {
        ...editingProduct as Product,
        id: Math.random().toString(36).substr(2, 9),
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      addProduct(newP);
    }
    setEditingProduct(null);
  };

  const filteredItems = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeTab === 'inventory') return products.filter(p => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term));
    if (activeTab === 'orders') return orders.filter(o => o.id.toLowerCase().includes(term) || o.userId.toLowerCase().includes(term));
    if (activeTab === 'users') return allUsers.filter(u => u.displayName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    return [];
  }, [products, orders, allUsers, searchTerm, activeTab]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Control</h1>
             <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg shadow-indigo-100">
                <ShieldCheck className="w-3 h-3" />
                Root Authority
             </span>
          </div>
          <p className="text-slate-500 font-medium">Global oversight of PointShop Elite infrastructure.</p>
        </div>
        
        <div className="flex items-center gap-3">
           {activeTab === 'inventory' && (
             <button 
               onClick={() => setEditingProduct({})}
               className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-lg shadow-indigo-100"
             >
               <Plus className="w-5 h-5" />
               New Asset
             </button>
           )}
           <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger Synchronized</span>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`bg-white p-6 rounded-3xl border ${stat.critical ? 'border-orange-200 bg-orange-50/5' : 'border-slate-200'} shadow-sm flex items-center gap-5 transition-all`}>
            <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl ${stat.critical ? 'animate-pulse' : ''}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabbed Navigation */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200 overflow-hidden">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'inventory', label: 'Inventory', icon: Layers },
          { id: 'orders', label: 'Orders', icon: ShoppingBag },
          { id: 'users', label: 'Nodes', icon: UserCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
              ? 'bg-white text-indigo-600 shadow-md' 
              : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar for specific tabs */}
      {activeTab !== 'dashboard' && (
        <div className="relative w-full max-w-xl animate-in slide-in-from-top-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={`Filter ${activeTab}...`} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
        </div>
      )}

      {/* Main View Area */}
      <div className="grid grid-cols-1 gap-10">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Main Chart */}
              <div className="lg:col-span-8 space-y-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 px-2">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                  Transaction Volume (Last 7 Days)
                </h2>
                <div className="bg-white p-8 border border-slate-200 rounded-[2.5rem] h-[400px] shadow-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={orderTrend}>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{stroke: '#6366f1', strokeWidth: 2}}
                        contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                      />
                      <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVolume)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Feed/Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 px-2">
                  <Activity className="w-6 h-6 text-indigo-600" />
                  Live Ledger
                </h2>
                <div className="bg-white border border-slate-200 rounded-[2.5rem] h-[400px] overflow-y-auto scrollbar-hide shadow-sm p-4">
                   <div className="space-y-4">
                    {transactions.slice(0, 10).map(trans => (
                      <div key={trans.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trans.type === 'TOPUP' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                             {trans.type === 'TOPUP' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-900 truncate max-w-[100px] leading-none uppercase">{trans.type}</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-1">{new Date(trans.date).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black">{trans.amount.toLocaleString()} PTS</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Secondary Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 space-y-6 shadow-sm">
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Inventory Distribution</h3>
                 <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryVolume}>
                        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                          {categoryVolume.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'][index % 4]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 space-y-6 shadow-sm">
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Critical Alerts</h3>
                 <div className="space-y-3">
                    {lowStockItems.length > 0 ? lowStockItems.slice(0, 3).map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                        <span className="text-xs font-bold text-orange-900">{p.name}</span>
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{p.stock} Left</span>
                      </div>
                    )) : <p className="text-xs text-slate-400">No stock alerts.</p>}
                 </div>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 space-y-6 shadow-sm">
                 <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Pending Actions</h3>
                 <div className="space-y-3">
                    {pendingOrders.length > 0 ? pendingOrders.slice(0, 3).map(o => (
                      <div key={o.id} className="flex items-center justify-between p-3 bg-indigo-50 rounded-xl border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => setActiveTab('orders')}>
                        <span className="text-xs font-bold text-indigo-900">{o.id}</span>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{o.totalPoints} PTS</span>
                      </div>
                    )) : <p className="text-xs text-slate-400">No pending orders.</p>}
                 </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Asset</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Price (PTS)</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Stock</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map(p => {
                    const product = p as Product;
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <img src={product.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                            <span className="font-bold text-slate-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">{product.category}</td>
                        <td className="px-8 py-6 font-black text-indigo-600">{product.price.toLocaleString()}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${product.stock < 10 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {product.stock} Units
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => setEditingProduct(product)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button onClick={() => deleteProduct(product.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Node (User ID)</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Volume</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map(o => {
                    const order = o as Order;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-6 font-black text-slate-900">{order.id}</td>
                        <td className="px-8 py-6 text-xs text-slate-400 font-mono">{order.userId}</td>
                        <td className="px-8 py-6 font-black text-slate-900">{order.totalPoints.toLocaleString()} PTS</td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                            order.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 
                            order.status === 'SHIPPED' ? 'bg-indigo-50 text-indigo-600' :
                            order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {order.status === 'PENDING' ? <Clock className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex justify-end gap-2">
                              {order.status === 'PENDING' && (
                                <button onClick={() => updateOrderStatus(order.id, 'SHIPPED')} className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors">Ship</button>
                              )}
                              {order.status === 'SHIPPED' && (
                                <button onClick={() => updateOrderStatus(order.id, 'DELIVERED')} className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors">Deliver</button>
                              )}
                              <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
             <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Node Identity</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Authority</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Balance</th>
                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map(u => {
                    const nodeUser = u as User;
                    return (
                      <tr key={nodeUser.uid} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <img src={nodeUser.photoURL} className="w-10 h-10 rounded-xl bg-slate-100 object-cover" />
                            <div>
                              <p className="font-bold text-slate-900">{nodeUser.displayName}</p>
                              <p className="text-xs text-slate-500 font-mono">{nodeUser.uid}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            nodeUser.role === UserRole.ADMIN ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {nodeUser.role}
                          </span>
                        </td>
                        <td className="px-8 py-6 font-black text-slate-900">{nodeUser.balance.toLocaleString()} PTS</td>
                        <td className="px-8 py-6 text-right">
                          {nodeUser.uid !== user?.uid ? (
                            <button 
                              onClick={() => updateUserRole(nodeUser.uid, nodeUser.role === UserRole.ADMIN ? UserRole.CUSTOMER : UserRole.ADMIN)}
                              className="text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-all flex items-center gap-2 ml-auto"
                            >
                              <ShieldAlert className="w-3 h-3" />
                              Flip Privilege
                            </button>
                          ) : (
                            <span className="text-[10px] font-black text-slate-300 uppercase italic">Immutable Root</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product Editor Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setEditingProduct(null)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="px-10 pt-10 pb-6 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-900">
                {editingProduct.id ? 'Modify Asset' : 'Initialize Asset Deployment'}
              </h2>
              <button onClick={() => setEditingProduct(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="px-10 pb-10 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Name</label>
                  <input 
                    type="text" 
                    value={editingProduct.name || ''} 
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Economic Sector</label>
                  <select 
                    value={editingProduct.category || ''} 
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 appearance-none"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Narrative Engine</label>
                  <button 
                    onClick={handleAiGenerate}
                    disabled={isAiLoading || !editingProduct.name || !editingProduct.category}
                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                  >
                    <Wand2 className={`w-3 h-3 ${isAiLoading ? 'animate-spin' : ''}`} />
                    Optimize Text
                  </button>
                </div>
                <textarea 
                  value={editingProduct.description || ''} 
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Valuation (PTS)</label>
                  <input 
                    type="number" 
                    value={editingProduct.price || 0} 
                    onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Inventory Reserve</label>
                  <input 
                    type="number" 
                    value={editingProduct.stock || 0} 
                    onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Asset Asset Image (URL)</label>
                <input 
                  type="text" 
                  value={editingProduct.imageUrl || ''} 
                  onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-400"
                />
              </div>

              <button 
                onClick={handleSaveProduct}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-[0.98]"
              >
                Commit Asset to Ledger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
