import React, { useState, useMemo } from 'react';
import { Search, Edit3, X, Check, ChevronDown, ChevronUp, RotateCcw, TrendingDown, TrendingUp } from 'lucide-react';
import { SUBCATEGORIES, POLY_SUBCATEGORIES } from '../data/catalogData';

export default function CatalogManagement({ catalog, onUpdateBasePrice, onResetCatalog }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openGroups, setOpenGroups] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editPriceVal, setEditPriceVal] = useState('');
  const [compareMode, setCompareMode] = useState(false);

  const toggleGroup = (id) => setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

  // Normal grouping (by subcategory)
  const grouped = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = {};
    const allSubcats = [...SUBCATEGORIES, ...POLY_SUBCATEGORIES];
    
    for (const sub of allSubcats) {
      const items = catalog.filter(item => {
        if (item.subcategory !== sub.id) return false;
        if (q) return item.title.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
        return true;
      });
      if (items.length > 0) result[sub.id] = items;
    }
    return result;
  }, [catalog, searchQuery]);

  // Comparison grouping (by code - shows both Lonca and Poly)
  const comparisonGroups = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const q = searchQuery.trim().toLowerCase();
    const codeMap = new Map();
    
    // Group by base code (without revision)
    catalog.forEach(item => {
      if (!item.title.toLowerCase().includes(q) && !item.code.toLowerCase().includes(q)) return;
      
      // Extract base code (remove revision like /03, /01, etc)
      const baseCode = item.code.replace(/[-\/]\d+$/, '');
      
      if (!codeMap.has(baseCode)) {
        codeMap.set(baseCode, { lonca: null, poly: null, title: item.title });
      }
      
      const group = codeMap.get(baseCode);
      if (item.category === 'myk') {
        group.lonca = item;
      } else if (item.category === 'poly') {
        group.poly = item;
      }
    });
    
    // Filter to only show items that exist in both firms
    return Array.from(codeMap.entries())
      .filter(([_, group]) => group.lonca && group.poly)
      .map(([code, group]) => ({ code, ...group }));
  }, [catalog, searchQuery]);

  // Auto-open groups when searching
  const effectiveOpen = searchQuery.trim()
    ? Object.fromEntries(Object.keys(grouped).map(id => [id, true]))
    : openGroups;

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditPriceVal(String(item.basePrice));
  };

  const handleSavePrice = (id) => {
    const num = parseFloat(editPriceVal);
    if (!isNaN(num) && num > 0) onUpdateBasePrice(id, num);
    setEditingId(null);
  };

  const fmt = (v) => Number(v).toLocaleString('tr-TR') + ' ₺';

  const getCategoryName = (cat) => {
    if (cat === 'myk') return 'LONCA';
    if (cat === 'poly') return 'POLY';
    return cat.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-28 pt-4 px-4">

      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1b365d]">Fiyat Kataloğu</h1>
          <p className="text-xs text-slate-500 mt-0.5">{catalog.length} kalem — Tüm Firmalar</p>
        </div>
        {onResetCatalog && (
          <button
            onClick={() => { if (window.confirm('Katalog sıfırlansın mı?')) onResetCatalog(); }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 border border-slate-300 px-3 py-2 rounded-xl bg-white hover:bg-red-50 hover:border-red-300 hover:text-red-600 active-tap"
          >
            <RotateCcw size={14} /><span>Sıfırla</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="İsim veya UY kodu ile ara..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#1b365d] shadow-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400 active-tap">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Toggle Compare Mode (only visible when searching) */}
      {searchQuery.trim() && comparisonGroups.length > 0 && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setCompareMode(false)}
            className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              !compareMode 
                ? 'bg-[#1b365d] text-white' 
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Tüm Sonuçlar
          </button>
          <button
            onClick={() => setCompareMode(true)}
            className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              compareMode 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            📊 Fiyat Karşılaştır ({comparisonGroups.length})
          </button>
        </div>
      )}

      {/* Comparison View */}
      {compareMode && searchQuery.trim() && comparisonGroups.length > 0 && (
        <div className="space-y-3 mb-6">
          {comparisonGroups.map((group) => {
            const loncaPrice = group.lonca.basePrice;
            const polyPrice = group.poly.basePrice;
            const diff = Math.abs(loncaPrice - polyPrice);
            const diffPercent = ((diff / Math.max(loncaPrice, polyPrice)) * 100).toFixed(1);
            const loncaCheaper = loncaPrice < polyPrice;
            
            return (
              <div key={group.code} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Title */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <p className="text-sm font-bold text-slate-800">{group.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{group.lonca.code}</p>
                </div>
                
                {/* Price Comparison */}
                <div className="p-4 space-y-3">
                  {/* Lonca */}
                  <div className={`flex items-center justify-between p-3 rounded-xl ${
                    loncaCheaper ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">LONCA</span>
                        {loncaCheaper && (
                          <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                            <TrendingDown size={10} /> AVANTAJLI
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-lg font-extrabold ${loncaCheaper ? 'text-green-700' : 'text-red-600'}`}>
                      {fmt(loncaPrice)}
                    </span>
                  </div>

                  {/* Poly */}
                  <div className={`flex items-center justify-between p-3 rounded-xl ${
                    !loncaCheaper ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-200'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">POLY</span>
                        {!loncaCheaper && (
                          <span className="px-2 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                            <TrendingDown size={10} /> AVANTAJLI
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-lg font-extrabold ${!loncaCheaper ? 'text-green-700' : 'text-red-600'}`}>
                      {fmt(polyPrice)}
                    </span>
                  </div>

                  {/* Price Difference */}
                  <div className="pt-2 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-500">
                      Fark: <span className="font-bold text-slate-700">{fmt(diff)}</span>
                      <span className="text-slate-400"> ({diffPercent}%)</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accordion Groups (Normal View) */}
      {!compareMode && (
        <div className="space-y-2">
          {[...SUBCATEGORIES, ...POLY_SUBCATEGORIES].map(sub => {
            const items = grouped[sub.id];
            if (!items) return null;
            const isOpen = effectiveOpen[sub.id] ?? false;

            return (
              <div key={sub.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">

                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(sub.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 active-tap"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      sub.cat === 'myk' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <div className="text-left">
                      <span className="font-bold text-[#1b365d] text-sm block">{sub.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {sub.cat === 'myk' ? 'LONCA' : 'POLY'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-slate-400 text-xs">{items.length}</span>
                    {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>

                {/* Group Body */}
                {isOpen && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-slate-800 leading-snug">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-400">{item.code}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              item.category === 'myk' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {getCategoryName(item.category)}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {editingId === item.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={editPriceVal}
                                onChange={(e) => setEditPriceVal(e.target.value)}
                                onBlur={() => handleSavePrice(item.id)}
                                onKeyDown={e => e.key === 'Enter' && handleSavePrice(item.id)}
                                className="w-20 border border-[#ff6b00] rounded-lg px-2 py-1 text-xs font-bold outline-none"
                                autoFocus
                              />
                              <button onClick={() => handleSavePrice(item.id)} className="text-green-600 active-tap">
                                <Check size={14} />
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => handleStartEdit(item)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-extrabold text-slate-700 cursor-pointer hover:border-orange-300 active-tap"
                            >
                              {fmt(item.basePrice)}
                              <Edit3 size={11} className="text-slate-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {Object.keys(grouped).length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Search size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Eşleşen kalem bulunamadı.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
