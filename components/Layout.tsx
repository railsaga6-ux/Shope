
import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { UserRole } from '../types';
// Import initialized auth instead of re-getting it
import { auth } from '../services/firebase';
import { 
  ShoppingBag, 
  User as UserIcon, 
  LayoutDashboard, 
  History, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  ShoppingCart,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import CartDrawer from './CartDrawer';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { user, cart, signOut, setCartOpen } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showVerificationBanner, setShowVerificationBanner] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      setShowVerificationBanner(true);
    }
  }, [auth.currentUser]);

  const navItems = [
    { id: 'shop', label: 'Store', icon: ShoppingBag, roles: [UserRole.CUSTOMER, UserRole.ADMIN] },
    { id: 'history', label: 'History', icon: History, roles: [UserRole.CUSTOMER] },
    { id: 'wallet', label: 'Wallet', icon: CreditCard, roles: [UserRole.CUSTOMER] },
    { id: 'admin', label: 'Dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN] },
  ];

  const visibleNav = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <CartDrawer onCheckout={() => setActiveTab('cart')} />
      
      {/* Security Warning Banner */}
      {showVerificationBanner && (
        <div className="bg-amber-50 border-b border-amber-100 py-3 px-4 animate-in slide-in-from-top duration-500">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                Security Alert: Email identity unverified. Functional limitations may apply.
              </p>
            </div>
            <button 
              onClick={() => setShowVerificationBanner(false)}
              className="text-amber-400 hover:text-amber-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('shop')}>
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100 group-hover:rotate-12 transition-transform">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 hidden sm:block">PointShop<span className="text-indigo-600">Elite</span></span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {visibleNav.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                    activeTab === item.id 
                    ? 'text-indigo-600 bg-indigo-50 shadow-sm' 
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Controls */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="hidden lg:flex items-center gap-4 px-5 py-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Balance</p>
                    <p className="text-sm font-black text-indigo-600 leading-none mt-0.5">{user.balance.toLocaleString()} <span className="text-[10px]">PTS</span></p>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img src={user.photoURL} className="w-9 h-9 rounded-xl bg-slate-200 object-cover shadow-sm" alt="User" />
                      {auth.currentUser?.emailVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border-2 border-white">
                          <ShieldCheck className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-black text-slate-900 hidden xl:inline uppercase tracking-wider">{user.displayName}</span>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setCartOpen(true)}
                className="relative p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-xl bg-slate-900 text-[10px] font-black text-white ring-4 ring-slate-50 animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-3 bg-white border border-slate-200 rounded-2xl text-slate-600"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-white/95 backdrop-blur-xl pt-24 animate-in slide-in-from-top duration-300">
          <div className="p-8 space-y-4">
            {visibleNav.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] text-xl font-black uppercase tracking-widest transition-all ${
                  activeTab === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200' : 'bg-slate-50 text-slate-900 border border-slate-100'
                }`}
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </button>
            ))}
            <div className="border-t border-slate-100 my-8 pt-8">
               <div className="flex items-center gap-4 px-6 py-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <img src={user?.photoURL} className="w-16 h-16 rounded-[1.5rem] object-cover" alt="User" />
                 <div>
                   <p className="font-black text-slate-900 uppercase tracking-widest">{user?.displayName}</p>
                   <p className="text-lg font-black text-indigo-600">{user?.balance.toLocaleString()} Points</p>
                 </div>
               </div>
            </div>
            <button 
              onClick={() => {
                signOut();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] bg-red-50 text-red-600 font-black uppercase tracking-widest"
            >
              <LogOut className="w-6 h-6" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-3 rounded-2xl">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">PointShop Elite</span>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Compliance</a>
            </div>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">© 2024 PointShop Elite Economy. Secure Blockchain Simulation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
