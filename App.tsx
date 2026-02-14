
import React, { useEffect, useState, Component, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useApp, initSync } from './store';
import Layout from './components/Layout';
import StoreView from './views/StoreView';
import WalletView from './views/WalletView';
import CartView from './views/CartView';
import HistoryView from './views/HistoryView';
import AdminView from './views/AdminView';
import AuthView from './views/AuthView';
import { UserRole } from './types';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

// --- Production Error Boundary ---
interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; }
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">System Decoupled</h1>
            <p className="text-slate-400 font-medium">The vault encountered an unhandled exception. Restarting the session is required.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-white hover:text-indigo-600 transition-all shadow-xl"
            >
              Re-Establish Connection
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Notification Center ---
const NotificationCenter: React.FC = () => {
  const { toasts, removeToast } = useApp();
  
  return (
    <div className="fixed top-8 right-8 z-[999] space-y-4 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-3xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-right-8 duration-300 w-80 lg:w-96 ${
            toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800' :
            toast.type === 'error' ? 'bg-rose-50/90 border-rose-100 text-rose-800' :
            toast.type === 'warning' ? 'bg-amber-50/90 border-amber-100 text-amber-800' :
            'bg-indigo-50/90 border-indigo-100 text-indigo-800'
          }`}
        >
          <div className="flex-shrink-0">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-500" />}
          </div>
          <p className="flex-grow text-xs font-black uppercase tracking-widest leading-relaxed">
            {toast.message}
          </p>
          <button 
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

const Main: React.FC = () => {
  const [activeTab, setActiveTab] = useState('shop');
  const { user } = useApp();

  useEffect(() => {
    initSync(); 
  }, []);

  if (!user) {
    return <AuthView />;
  }

  const renderView = () => {
    switch (activeTab) {
      case 'shop': return <StoreView />;
      case 'wallet': return <WalletView />;
      case 'cart': return <CartView onSuccess={() => setActiveTab('history')} />;
      case 'history': return <HistoryView />;
      case 'admin': return user.role === UserRole.ADMIN ? <AdminView /> : <StoreView />;
      default: return <StoreView />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <NotificationCenter />
      {renderView()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Main />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
