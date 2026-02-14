
import React, { useState, useMemo } from 'react';
import { useApp } from './store';
import { UserRole, User } from './types';
// Import only necessary Auth functions
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification 
} from 'firebase/auth';
// Import only necessary Firestore functions
import { doc, setDoc } from 'firebase/firestore';
// Import initialized services
import { auth, db } from './services/firebase';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const AuthView: React.FC = () => {
  const { addToast } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: ''
  });

  // Password complexity: 8+ chars, mixed case, numbers, symbols
  const passwordCriteria = useMemo(() => {
    const p = formData.password;
    return {
      length: p.length >= 8,
      mixed: /[a-z]/.test(p) && /[A-Z]/.test(p),
      number: /\d/.test(p),
      symbol: /[@$!%*?&]/.test(p)
    };
  }, [formData.password]);

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && !isPasswordValid) {
      addToast("Security key does not meet complexity requirements.", "error");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        addToast("Authentication verified. Welcome back.", "success");
      } else {
        const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Trigger email verification
        try {
          await sendEmailVerification(cred.user);
          addToast("Verification email dispatched. Please check your inbox.", "info");
        } catch (vErr) {
          console.error("Verification error:", vErr);
        }

        const newUser: User = {
          uid: cred.user.uid,
          email: formData.email,
          displayName: formData.displayName,
          balance: 1000, 
          role: UserRole.CUSTOMER,
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.displayName}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', cred.user.uid), newUser);
        addToast("Account initialized with baseline security.", "success");
      }
    } catch (err: any) {
      addToast(err.message || 'Authorization error. Check credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 animate-in zoom-in duration-500">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl rotate-12 mb-6 shadow-xl shadow-indigo-200">
              <Sparkles className="w-10 h-10 text-white -rotate-12" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">PointShop <span className="text-indigo-600">Elite</span></h1>
            <p className="text-slate-500 mt-2 font-medium">
              {isLogin ? 'Sign in to your digital vault' : 'Secure your membership'}
            </p>
          </div>

          <div className="flex bg-slate-50 p-1.5 rounded-2xl mb-8 border border-slate-100">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Register
            </button>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    type="text" 
                    required={!isLogin}
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    placeholder="Alex Sterling"
                    className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@company.com"
                  className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Key</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900"
                />
              </div>

              {/* Password Complexity Feedback */}
              {!isLogin && formData.password.length > 0 && (
                <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Complexity Audit</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'length', label: '8+ Chars' },
                      { key: 'mixed', label: 'Mixed Case' },
                      { key: 'number', label: 'Numerical' },
                      { key: 'symbol', label: 'Symbol' }
                    ].map(c => (
                      <div key={c.key} className="flex items-center gap-2">
                        {passwordCriteria[c.key as keyof typeof passwordCriteria] ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-slate-300" />
                        )}
                        <span className={`text-[9px] font-bold ${passwordCriteria[c.key as keyof typeof passwordCriteria] ? 'text-slate-900' : 'text-slate-400'}`}>
                          {c.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={isLoading || (!isLogin && !isPasswordValid)}
              className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all group disabled:opacity-30 mt-4 shadow-xl shadow-slate-200 active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Establish Connection' : 'Secure Vault Membership'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            End-to-End Encryption Protocol
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
