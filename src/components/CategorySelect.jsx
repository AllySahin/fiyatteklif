import React from 'react';
import { ArrowLeft, Truck, Award, ChevronRight } from 'lucide-react';
import { CATEGORIES } from '../data/catalogData';

export default function CategorySelect({ onSelectCategory, onBack }) {
  const getIcon = (iconName) => {
    switch(iconName) {
      case 'Truck': return <Truck size={28} />;
      case 'Award': return <Award size={28} />;
      default: return <Award size={28} />;
    }
  };

  const getBgColor = (id) => {
    if (id === 'ismakineleri') return 'bg-amber-50 text-amber-600';
    if (id === 'myk') return 'bg-blue-50 text-blue-600';
    if (id === 'poly') return 'bg-green-50 text-green-600';
    return 'bg-slate-50 text-slate-600';
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-24">
      {/* Deep Navy Blue Header matching Screenshot 2 */}
      <div className="bg-[#1b365d] text-white px-5 pt-8 pb-8 rounded-b-3xl shadow-md">
        <button 
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white mb-4 active-tap"
        >
          <ArrowLeft size={20} />
        </button>
        
        <h1 className="text-2xl font-bold">Yeni Teklif Oluştur</h1>
        <p className="text-sm text-blue-200 mt-1">Teklif vermek istediğiniz firmayı seçin</p>
      </div>

      {/* Dynamic Category Cards */}
      <div className="px-5 -mt-4 space-y-4">
        {CATEGORIES.map((category) => (
          <div
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className="bg-white rounded-2xl p-5 border border-slate-100 card-shadow flex items-center justify-between cursor-pointer hover:border-orange-200 transition-all active-tap"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl ${getBgColor(category.id)} flex items-center justify-center flex-shrink-0`}>
                {getIcon(category.icon)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{category.name}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{category.count}</p>
              </div>
            </div>
            <ChevronRight size={22} className="text-slate-400" />
          </div>
        ))}
      </div>
    </div>
  );
}
