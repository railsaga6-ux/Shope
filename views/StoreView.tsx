
import React, { useState, useMemo } from 'react';
import { useApp } from '../store';
import ProductCard from '../components/ProductCard';
import { CATEGORIES } from '../constants';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  X, 
  ShoppingBag, 
  Star, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';

const StoreView: React.FC = () => {
  const { products, selectedProduct, setSelectedProduct, addToCart } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                           p.description.toLowerCase().includes(search.toLowerCase()) ||
                           p.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesPrice = p.price <= priceRange;
      const matchesStock = onlyInStock ? p.stock > 0 : true;
      return matchesSearch && matchesCategory && matchesPrice && matchesStock && p.isActive;
    });
  }, [products, search, activeCategory, priceRange, onlyInStock]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative h-64 sm:h-96 rounded-[2.5rem] overflow-hidden bg-slate-900 flex items-center">
        <img 
          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Hero"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="relative z-10 px-8 sm:px-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Sparkles className="w-4 h-4" />
            Limited Edition Drops
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 tracking-tighter leading-[0.9]">
            The Elite <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Collection.</span>
          </h1>
          <p className="text-slate-300 text-lg font-medium leading-relaxed max-w-md">
            Unlock premium technology and designer essentials using your accumulated loyalty points.
          </p>
        </div>
      </section>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between sticky top-20 z-30 p-2 bg-slate-50/80 backdrop-blur-xl rounded-[2rem] border border-slate-200/50">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text"
            placeholder="Search our vault..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide px-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeCategory === cat 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' 
                : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="w-px h-8 bg-slate-200 mx-2 flex-shrink-0" />
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${showFilters ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-white text-slate-500 border border-slate-200'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filter Drawer */}
      {showFilters && (
        <div className="p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Price Ceiling (PTS)</h4>
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="100" 
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between font-bold text-sm text-slate-900">
                <span>0 PTS</span>
                <span className="text-indigo-600">{priceRange.toLocaleString()} PTS</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Availability</h4>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                  onClick={() => setOnlyInStock(!onlyInStock)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${onlyInStock ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200 group-hover:border-indigo-400'}`}
                >
                  {onlyInStock && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className="text-sm font-bold text-slate-700">Show In-Stock Only</span>
              </label>
            </div>

            <div className="flex items-end justify-end">
              <button 
                onClick={() => {
                  setPriceRange(5000);
                  setOnlyInStock(false);
                  setActiveCategory('All');
                }}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
          Discovering {filteredProducts.length} Exclusive Items
        </h2>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center animate-in fade-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-100 rounded-[2rem] mb-6">
            <Filter className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Vault Search Returned Nothing</h2>
          <p className="text-slate-500 font-medium">Try broadening your search or adjusting the filters.</p>
        </div>
      )}

      {/* Product Quick View Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300" 
            onClick={() => setSelectedProduct(null)}
          ></div>
          <div className="relative bg-white w-full max-w-6xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[800px] animate-in zoom-in-95 duration-500">
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-8 right-8 z-20 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white hover:text-slate-900 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Image Section */}
            <div className="w-full md:w-1/2 h-80 md:h-auto relative">
              <img 
                src={selectedProduct.imageUrl} 
                className="absolute inset-0 w-full h-full object-cover"
                alt={selectedProduct.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2 block">Premium Tier</span>
                <h3 className="text-4xl font-black tracking-tighter leading-none">{selectedProduct.name}</h3>
              </div>
            </div>

            {/* Modal Content Section */}
            <div className="w-full md:w-1/2 flex flex-col p-10 lg:p-16 overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest">
                  <Star className="w-4 h-4 fill-current" />
                  Elite Verified
                </div>
                <span className="text-3xl font-black text-slate-900">{selectedProduct.price.toLocaleString()} PTS</span>
              </div>

              <div className="space-y-8 mb-12">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">The Narrative</h4>
                  <p className="text-xl text-slate-600 leading-relaxed font-medium">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category</h5>
                    <p className="font-bold text-slate-900">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Availability</h5>
                    <p className={`font-bold ${selectedProduct.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {selectedProduct.stock > 0 ? `In Stock (${selectedProduct.stock} units)` : 'Out of Stock'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Key Features</h5>
                  <div className="space-y-3">
                    {['Exclusive Elite Benefits', 'Lifetime Quality Guarantee', 'Fast Global Shipping'].map(feature => (
                      <div key={feature} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                        <span className="text-sm font-bold text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-10 flex gap-4">
                <button 
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  disabled={selectedProduct.stock === 0}
                  className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-600 shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {selectedProduct.stock > 0 ? 'Commit to Purchase' : 'Notify Availability'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreView;
