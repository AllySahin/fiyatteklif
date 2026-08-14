import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Check, ChevronDown, ChevronUp, Plus, Minus, Edit3, X } from 'lucide-react';
import { SUBCATEGORIES, POLY_SUBCATEGORIES, IS_MAKINESI_SUBCATS } from '../data/catalogData';

export default function ItemSelect({ catalog, selectedItems, category, onToggleItem, onUpdateItemPrice, onBack, onConfirm }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openGroups, setOpenGroups] = useState({});
  const [openParents, setOpenParents] = useState({}); // For parent item accordion
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState('');

  const subcats = category === 'ismakineleri'
    ? IS_MAKINESI_SUBCATS
    : [...SUBCATEGORIES, ...POLY_SUBCATEGORIES].filter(s => s.cat === category);

  // Group items: separate parents, children, and standalone
  const grouped = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = {};
    
    for (const sub of subcats) {
      const allItems = catalog.filter(item => {
        if (item.subcategory !== sub.id) return false;
        if (item.category !== category) return false;
        if (q) return item.title.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
        return true;
      });

      if (allItems.length === 0) continue;

      // Separate parents and standalone items
      const parents = allItems.filter(i => i.isParent);
      const standalone = allItems.filter(i => !i.isParent && !i.isChild);
      const children = allItems.filter(i => i.isChild);

      // Build parent-children map
      const itemsWithChildren = parents.map(parent => {
        const childItems = children.filter(c => c.parentCode === parent.code);
        return {
          ...parent,
          children: childItems
        };
      });

      // Combine: items with children, then standalone
      const orderedItems = [...itemsWithChildren, ...standalone];
      
      if (orderedItems.length > 0) {
        result[sub.id] = orderedItems;
      }
    }
    
    return result;
  }, [catalog, subcats, category, searchQuery]);

  const toggleGroup = (id) => setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleParent = (id) => setOpenParents(prev => ({ ...prev, [id]: !prev[id] }));

  const effectiveOpen = searchQuery.trim()
    ? Object.fromEntries(Object.keys(grouped).map(id => [id, true]))
    : openGroups;

  const effectiveParentOpen = searchQuery.trim()
    ? Object.fromEntries(
        Object.values(grouped).flat().filter(i => i.children?.length > 0).map(i => [i.id, true])
      )
    : openParents;

  const selectedCount = selectedItems.length;

  // Handle parent toggle: if parent has children, toggle all children
  const handleParentToggle = (parent) => {
    if (parent.children && parent.children.length > 0) {
      const parentSelected = selectedItems.find(s => s.id === parent.id);
      const allChildrenSelected = parent.children.every(child => 
        selectedItems.find(s => s.id === child.id)
      );
      
      if (allChildrenSelected || (category === 'myk' && parentSelected)) {
        // Deselect all children
        parent.children.forEach(child => {
          const sel = selectedItems.find(s => s.id === child.id);
          if (sel) onToggleItem(child);
        });

        if (category === 'myk' && parentSelected) {
          onToggleItem(parent);
        }
      } else {
        if (category === 'myk' && !parentSelected) {
          onToggleItem(parent);
        }

        // Select all children
        parent.children.forEach(child => {
          const sel = selectedItems.find(s => s.id === child.id);
          if (!sel) onToggleItem(child);
        });
      }
    } else {
      // No children, toggle normally
      onToggleItem(parent);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditVal(String(item.price ?? item.basePrice));
  };

  const commitEdit = (item) => {
    const v = parseInt(editVal, 10);
    if (!isNaN(v) && v > 0) onUpdateItemPrice(item.id, v);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto flex flex-col">

      {/* ── Sticky Header ──────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[#1b365d] shadow-md">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button onClick={onBack} className="text-white/80 hover:text-white p-1 -ml-1">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold text-white leading-tight">Teklif Kalemleri</h2>
            <p className="text-xs text-blue-200 truncate">
              {category === 'myk' ? 'Lonca Belgelendirme A.Ş. MYK Sınav Tarifeleri' : 'İş Makineleri Kursları'}
            </p>
          </div>
          {selectedCount > 0 && (
            <span className="bg-[#ff6b00] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {selectedCount} kalem
            </span>
          )}
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <Search size={15} className="text-blue-200 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Kalem ara (isim veya kod)..."
              className="flex-1 bg-transparent text-white placeholder-blue-300 text-sm outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-blue-200 active-tap">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Accordion List ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-52 px-3 pt-3 space-y-2">
        {subcats.map(sub => {
          const items = grouped[sub.id];
          if (!items) return null;
          const isOpen = effectiveOpen[sub.id] ?? false;
          const selectedInGroup = items.filter(i => selectedItems.find(s => s.id === i.id)).length;

          return (
            <div key={sub.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <button
                onClick={() => toggleGroup(sub.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 active-tap"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${selectedInGroup > 0 ? 'bg-[#ff6b00]' : 'bg-slate-300'}`} />
                  <span className="font-bold text-[#1b365d] text-sm text-left leading-tight">{sub.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {selectedInGroup > 0 && (
                    <span className="bg-orange-100 text-[#ff6b00] text-xs font-bold px-2 py-0.5 rounded-full">
                      {selectedInGroup}✓
                    </span>
                  )}
                  <span className="text-slate-400 text-xs">{items.length} kalem</span>
                  {isOpen
                    ? <ChevronUp size={16} className="text-slate-400" />
                    : <ChevronDown size={16} className="text-slate-400" />
                  }
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {items.map(item => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isParentOpen = effectiveParentOpen[item.id] ?? false;
                    const parentSel = selectedItems.find(s => s.id === item.id);
                    
                    // For parents with children: check if all children are selected
                    const allChildrenSelected = hasChildren 
                      ? item.children.every(c => selectedItems.find(s => s.id === c.id))
                      : false;
                    const someChildrenSelected = hasChildren
                      ? item.children.some(c => selectedItems.find(s => s.id === c.id))
                      : false;

                    // For standalone items or parents without children
                    const sel = selectedItems.find(s => s.id === item.id);
                    const isEditing = editingId === item.id;

                    return (
                      <div key={item.id} className="bg-white">
                        {/* Parent or Standalone Item */}
                        <div className={`px-4 py-3 flex items-start gap-3 transition-colors ${hasChildren ? 'bg-slate-50' : (sel ? 'bg-orange-50' : 'bg-white')}`}>
                          <button
                            onClick={() => hasChildren ? handleParentToggle(item) : onToggleItem(item)}
                            className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors active-tap ${
                              hasChildren
                                ? ((allChildrenSelected || (category === 'myk' && parentSel)) ? 'bg-[#ff6b00] border-[#ff6b00]' : (someChildrenSelected ? 'bg-orange-300 border-orange-300' : 'border-slate-300 bg-white'))
                                : (sel ? 'bg-[#ff6b00] border-[#ff6b00]' : 'border-slate-300 bg-white')
                            }`}
                          >
                            {(hasChildren ? (allChildrenSelected || (category === 'myk' && parentSel)) : sel) && <Check size={11} strokeWidth={3} className="text-white" />}
                            {hasChildren && someChildrenSelected && !allChildrenSelected && <Minus size={11} strokeWidth={3} className="text-white" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className={`text-[13px] font-semibold leading-snug ${hasChildren ? 'text-[#1b365d] font-bold' : 'text-slate-800'}`}>
                                  {item.title}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{item.code}</p>

                                {!hasChildren && (
                                  <div className="flex items-center gap-2 mt-1.5">
                                    {isEditing ? (
                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="number"
                                          value={editVal}
                                          onChange={e => setEditVal(e.target.value)}
                                          onBlur={() => commitEdit(item)}
                                          onKeyDown={e => e.key === 'Enter' && commitEdit(item)}
                                          autoFocus
                                          className="w-28 border border-[#ff6b00] rounded-lg px-2 py-1 text-sm font-bold text-[#1b365d] outline-none"
                                        />
                                        <button onClick={() => commitEdit(item)} className="text-green-600 active-tap">
                                          <Check size={14} />
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="text-slate-400 active-tap">
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <span className={`text-sm font-bold ${sel ? 'text-[#ff6b00]' : 'text-[#1b365d]'}`}>
                                          {(sel?.price ?? item.basePrice).toLocaleString('tr-TR')} ₺
                                        </span>
                                        {sel && (
                                          <button
                                            onClick={() => startEdit(sel ?? item)}
                                            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#ff6b00] active-tap"
                                          >
                                            <Edit3 size={11} /> düzenle
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}

                                {hasChildren && (
                                  <div className="mt-1.5">
                                    <span className="text-sm font-bold text-[#1b365d]">
                                      {item.basePrice.toLocaleString('tr-TR')} ₺
                                    </span>
                                    <span className="text-[11px] text-slate-400 ml-2">
                                      ({item.children.length} birim)
                                    </span>
                                  </div>
                                )}
                              </div>

                              {hasChildren && (
                                <button
                                  onClick={() => toggleParent(item.id)}
                                  className="shrink-0 p-1 -mr-1 active-tap"
                                >
                                  {isParentOpen
                                    ? <ChevronUp size={16} className="text-slate-400" />
                                    : <ChevronDown size={16} className="text-slate-400" />
                                  }
                                </button>
                              )}
                            </div>
                          </div>

                          {!hasChildren && sel && (
                            <div className="flex items-center gap-1 mt-1 shrink-0">
                              <button
                                onClick={() => onToggleItem({ ...item, qty: (sel.qty ?? 1) - 1 })}
                                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center active-tap"
                                disabled={(sel.qty ?? 1) <= 1}
                              >
                                <Minus size={13} className="text-slate-500" />
                              </button>
                              <span className="w-6 text-center text-sm font-bold text-[#1b365d]">{sel.qty ?? 1}</span>
                              <button
                                onClick={() => onToggleItem({ ...item, qty: (sel.qty ?? 1) + 1 })}
                                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center active-tap"
                              >
                                <Plus size={13} className="text-slate-500" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Children Items (nested accordion) */}
                        {hasChildren && isParentOpen && (
                          <div className="border-t border-slate-200 bg-slate-50/50 divide-y divide-slate-100">
                            {item.children.map(child => {
                              const childSel = selectedItems.find(s => s.id === child.id);
                              const childEditing = editingId === child.id;

                              return (
                                <div
                                  key={child.id}
                                  className={`pl-8 pr-4 py-3 flex items-start gap-3 transition-colors ${childSel ? 'bg-orange-50' : 'bg-white'}`}
                                >
                                  <button
                                    onClick={() => onToggleItem(child)}
                                    className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors active-tap ${childSel ? 'bg-[#ff6b00] border-[#ff6b00]' : 'border-slate-300 bg-white'}`}
                                  >
                                    {childSel && <Check size={11} strokeWidth={3} className="text-white" />}
                                  </button>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start gap-2">
                                      {child.unitCode && (
                                        <span className="shrink-0 bg-[#1b365d] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                          {child.unitCode}
                                        </span>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium text-slate-700 leading-snug">{child.title}</p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">{child.code}</p>

                                        <div className="flex items-center gap-2 mt-1.5">
                                          {childEditing ? (
                                            <div className="flex items-center gap-1.5">
                                              <input
                                                type="number"
                                                value={editVal}
                                                onChange={e => setEditVal(e.target.value)}
                                                onBlur={() => commitEdit(child)}
                                                onKeyDown={e => e.key === 'Enter' && commitEdit(child)}
                                                autoFocus
                                                className="w-28 border border-[#ff6b00] rounded-lg px-2 py-1 text-sm font-bold text-[#1b365d] outline-none"
                                              />
                                              <button onClick={() => commitEdit(child)} className="text-green-600 active-tap">
                                                <Check size={14} />
                                              </button>
                                              <button onClick={() => setEditingId(null)} className="text-slate-400 active-tap">
                                                <X size={14} />
                                              </button>
                                            </div>
                                          ) : (
                                            <>
                                              <span className={`text-sm font-bold ${childSel ? 'text-[#ff6b00]' : 'text-[#1b365d]'}`}>
                                                {(childSel?.price ?? child.basePrice).toLocaleString('tr-TR')} ₺
                                              </span>
                                              {childSel && (
                                                <button
                                                  onClick={() => startEdit(childSel ?? child)}
                                                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#ff6b00] active-tap"
                                                >
                                                  <Edit3 size={11} /> düzenle
                                                </button>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {childSel && (
                                    <div className="flex items-center gap-1 mt-1 shrink-0">
                                      <button
                                        onClick={() => onToggleItem({ ...child, qty: (childSel.qty ?? 1) - 1 })}
                                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center active-tap"
                                        disabled={(childSel.qty ?? 1) <= 1}
                                      >
                                        <Minus size={13} className="text-slate-500" />
                                      </button>
                                      <span className="w-6 text-center text-sm font-bold text-[#1b365d]">{childSel.qty ?? 1}</span>
                                      <button
                                        onClick={() => onToggleItem({ ...child, qty: (childSel.qty ?? 1) + 1 })}
                                        className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center active-tap"
                                      >
                                        <Plus size={13} className="text-slate-500" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
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

      {/* ── Bottom Confirm Bar ──────────────────────────────────────────────── */}
      {selectedCount > 0 && (
        <div
          className="fixed left-0 right-0 max-w-md mx-auto px-4 py-4 bg-white/95 backdrop-blur border-t border-slate-100 shadow-xl z-50"
          style={{ bottom: 'calc(82px + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            onClick={onConfirm}
            className="w-full bg-[#ff6b00] hover:bg-[#e05e00] text-white font-bold py-4 rounded-2xl shadow-lg text-base active-tap"
          >
            {selectedCount} Kalem Seçildi — Teklifi Hazırla →
          </button>
        </div>
      )}
    </div>
  );
}
