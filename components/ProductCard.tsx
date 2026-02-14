
import React from 'react';
import { Product } from '../types';
import { useApp } from '../store';
import { Plus, Tag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setSelectedProduct } = useApp();

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
      <div className="aspect-square w-full overflow-hidden bg-slate-100 relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700 cursor-pointer"
          onClick={() => setSelectedProduct(product)}
        />
        
        {/* Overlay Buttons */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button 
            onClick={() => setSelectedProduct(product)}
            className="p-3 bg-white rounded-full shadow-lg text-slate-900 hover:bg-indigo-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
            title="Quick View"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 backdrop-blur shadow-sm text-slate-900 border border-slate-100">
            <Tag className="w-3 h-3 text-indigo-600" />
            {product.category}
          </span>
        </div>
        
        {product.stock <= 5 && product.stock > 0 && (
           <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-md text-[9px] font-black bg-orange-500 text-white uppercase tracking-widest">
              Limited: {product.stock} left
            </span>
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-4 py-2 rounded-xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest shadow-xl">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 
            className="text-lg font-bold text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => setSelectedProduct(product)}
          >
            {product.name}
          </h3>
        </div>
        
        <p className="text-xs text-slate-500 line-clamp-1 mb-4 font-medium italic">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-900 leading-none">
              {product.price.toLocaleString()}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Points</span>
          </div>
          
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              product.stock > 0 
              ? 'bg-indigo-600 text-white hover:bg-slate-900 shadow-lg shadow-indigo-100 active:scale-95' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {product.stock > 0 ? (
              <>
                <Plus className="w-4 h-4" />
                Add to Cart
              </>
            ) : 'Waitlist'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
