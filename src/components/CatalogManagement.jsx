import React, { useState, useMemo } from 'react';
import { Search, Edit3, X, Check, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { SUBCATEGORIES, IS_MAKINESI_SUBCATS } from '../data/catalogData';

export default function CatalogManagement({ catalog, onUpdateBasePrice, onResetCatalog }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openGroups, setOpenGroups] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editPriceVal, setEditPriceVal] = useState('');

  const toggleGroup = (id) => setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

  // Normal grouping (by subcategory)
  const grouped = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = {};
    const allSubcats = [
      ...IS_MAKINESI_SUBCATS.map(sub => ({ ...sub, cat: 'ismakineleri' })),
      ...SUBCATEGORIES,
      ...['ismakineleri', 'myk']
        .filter(category => catalog.some(item => item.category === category && item.subcategory === `manuel_${category}`))
        .map(category => ({
          id: `manuel_${category}`,
          cat: category,
          name: 'Manuel Eklenen Kalemler'
        }))
    ];
    
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
    if (cat === 'ismakineleri') return 'İŞ MAKİNELERİ';
    return cat.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-28 pt-4 px-4">

      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1b365d]">Fiyat Kataloğu</h1>
          <p className="text-xs text-slate-500 mt-0.5">{catalog.length} kalem — İş Makineleri ve LONCA</p>
        </div>
        {onResetCatalog && (
          <button
            onClick={() => {
              if (window.confirm('Tüm kullanıcılar için katalog varsayılan kalemlere sıfırlansın mı? Eklenen manuel kalemler ve fiyat değişiklikleri silinir.')) {
                onResetCatalog();
              }
            }}
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

      {/* Accordion Groups (Normal View) */}
      <div className="space-y-2">
          {[...IS_MAKINESI_SUBCATS.map(sub => ({ ...sub, cat: 'ismakineleri' })), ...SUBCATEGORIES].map(sub => {
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
                      sub.cat === 'myk' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />
                    <div className="text-left">
                      <span className="font-bold text-[#1b365d] text-sm block">{sub.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {sub.cat === 'myk' ? 'LONCA' : 'İŞ MAKİNELERİ'}
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
                                : 'bg-amber-100 text-amber-700'
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
    </div>
  );
}
