import React, { useState } from 'react';
import { FileText, Plus, PhoneCall, StickyNote, ArrowRight, Bell, AlertCircle, Clock, Check, Archive, ChevronDown } from 'lucide-react';

export default function Dashboard({ quotes, notes = [], currentUser, onStartNewQuote, onSelectQuote, onViewAllQuotes, onOpenQuickNote, onOpenProfile, onUpdateNoteStatus, onArchiveNote }) {
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  // Compute dynamic stats
  const now = new Date();
  const visitedCompaniesThisMonth = new Set(
    notes
      .filter((note) => {
        if (typeof note.timestamp !== 'number') return false;
        const d = new Date(note.timestamp);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .map((note) => (note.customerName || '').trim().toLowerCase())
      .filter(Boolean)
  ).size;
  const priceOfferCount = notes.filter((note) => note.status === 'Teklif Gönderildi').length;
  const toCallCount = notes.filter((note) => note.status === 'Geri Aranacak').length;

  // Aksiyon gerektiren notlar (bildirimler için) - arşivlenmemişler
  const actionableNotes = notes.filter((note) => 
    !note.isArchived &&
    (note.status === 'Geri Aranacak' || 
     note.status === 'Fiyat Bekliyor' || 
     note.status === 'Teklif Gönderildi')
  ).slice(0, 5); // Son 5 aksiyon notu

  const statusOptions = [
    { value: 'Geri Aranacak', label: 'Geri Aranacak', color: 'red' },
    { value: 'Fiyat Bekliyor', label: 'Fiyat Bekliyor', color: 'blue' },
    { value: 'Teklif Gönderildi', label: 'Teklif Gönderildi', color: 'green' },
    { value: 'Anlaşıldı', label: 'Anlaşıldı', color: 'emerald' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Onaylandı':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#137333]">Onaylandı</span>;
      case 'Bekliyor':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#fef7e0] text-[#b06000]">Bekliyor</span>;
      case 'Gönderildi':
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">Gönderildi</span>;
    }
  };

  const formatPrice = (val) => {
    return '₺' + Number(val).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen bg-slate-50">
      {/* Top Bar Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-[#1b365d] text-white p-2 rounded-xl shadow-md">
            <FileText size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1b365d]">
            Teklif<span className="text-[#ff6b00]">Pro</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenQuickNote}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow active-tap"
            title="Hızlı Müşteri Notu Al"
          >
            <PhoneCall size={14} />
            <span>Hızlı Not</span>
          </button>
          
          <button
            onClick={onOpenProfile}
            className="w-9 h-9 bg-[#1b365d] text-white rounded-full shadow-sm border-2 border-slate-200 flex items-center justify-center font-black text-sm active-tap"
            title="Profilim"
          >
            {currentUser ? currentUser.name.charAt(0) : 'U'}
          </button>
        </div>
      </div>

      {/* Greeting & Date */}
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-slate-800">
          Merhaba, {currentUser ? currentUser.name : 'Ali'}
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">10 Ağustos 2026, Pazartesi</p>
      </div>

      {/* BİLDİRİMLER - Aksiyon Gerektiren Notlar */}
      {actionableNotes.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={18} className="text-[#ff6b00]" />
            <h3 className="text-base font-bold text-slate-800">Bildirimler</h3>
            <span className="bg-[#ff6b00] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {actionableNotes.length}
            </span>
          </div>

          <div className="space-y-2">
            {actionableNotes.map((note) => {
              // Notification style based on status
              let bgColor, borderColor, iconColor, Icon;
              if (note.status === 'Geri Aranacak') {
                bgColor = 'bg-red-50';
                borderColor = 'border-red-200';
                iconColor = 'text-red-600';
                Icon = PhoneCall;
              } else if (note.status === 'Fiyat Bekliyor') {
                bgColor = 'bg-blue-50';
                borderColor = 'border-blue-200';
                iconColor = 'text-blue-600';
                Icon = Clock;
              } else {
                bgColor = 'bg-green-50';
                borderColor = 'border-green-200';
                iconColor = 'text-green-600';
                Icon = FileText;
              }

              const isExpanded = expandedNoteId === note.id;

              return (
                <div
                  key={note.id}
                  className={`${bgColor} ${borderColor} border-l-4 rounded-lg shadow-sm hover:shadow-md transition-all`}
                >
                  {/* Bildirim İçeriği */}
                  <div className="p-3 flex items-start gap-3">
                    <Icon size={18} className={`${iconColor} mt-0.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 text-sm truncate">
                          {note.customerName}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap ${
                          note.status === 'Geri Aranacak' ? 'bg-red-100 text-red-700' :
                          note.status === 'Fiyat Bekliyor' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {note.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1 leading-relaxed">
                        {note.noteText}
                      </p>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[10px] text-slate-400">{note.date}</span>
                        {note.contactPerson && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            {note.contactPerson}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                      className="flex-shrink-0 p-1 hover:bg-slate-200/50 rounded transition-colors"
                      title="Aksiyonlar"
                    >
                      <ChevronDown 
                        size={16} 
                        className={`text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Aksiyon Butonları */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0 flex gap-2 border-t border-slate-200/50 mt-2">
                      {/* Statü Değiştir Dropdown */}
                      <select
                        value={note.status}
                        onChange={(e) => {
                          onUpdateNoteStatus(note.id, e.target.value);
                          setExpandedNoteId(null);
                        }}
                        className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 font-medium focus:outline-none focus:border-[#1b365d] cursor-pointer"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      {/* Arşive Al Butonu */}
                      <button
                        onClick={() => {
                          onArchiveNote(note.id);
                          setExpandedNoteId(null);
                        }}
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                        title="Tamamlandı olarak işaretle"
                      >
                        <Check size={14} />
                        <span>Arşivle</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Metric Cards Grid matching Screenshot 1 */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {/* Total This Month */}
        <div className="bg-[#1b365d] text-white rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-slate-300 uppercase leading-tight">
            ZİYARET EDİLEN FİRMA
          </span>
          <span className="text-3xl font-extrabold mt-3">{visitedCompaniesThisMonth}</span>
        </div>

        {/* Fiyat Teklifi */}
        <div className="bg-[#e6f4ea] text-[#137333] rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-[#137333]/80 uppercase leading-tight">
            FİYAT TEKLİFİ
          </span>
          <span className="text-3xl font-extrabold mt-3">{priceOfferCount}</span>
        </div>

        {/* Aranacak */}
        <div className="bg-[#fef7e0] text-[#b06000] rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold tracking-wider text-[#b06000]/80 uppercase leading-tight">
            ARANACAK
          </span>
          <span className="text-3xl font-extrabold mt-3">{toCallCount}</span>
        </div>
      </div>

      {/* Recent Quotes Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#1b365d]" />
            <h3 className="text-lg font-bold text-slate-800">Son Teklifler</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{quotes.length} Teklif</span>
        </div>

        {quotes.length === 0 ? (
          <div className="bg-slate-100 rounded-2xl p-6 border border-slate-200 text-center">
            <FileText size={32} className="mx-auto text-slate-400 mb-2 opacity-50" />
            <p className="text-sm text-slate-500">Henüz teklif oluşturulmamış</p>
          </div>
        ) : (
          <>
            {/* Recent Quotes List */}
            <div className="space-y-3 mb-4">
              {quotes.slice(0, 3).map((quote) => (
                <div
                  key={quote.id}
                  onClick={() => onSelectQuote(quote)}
                  className="bg-white rounded-2xl p-4 border border-slate-100 card-shadow hover:border-slate-300 transition-all cursor-pointer active-tap"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-base leading-tight">
                      {quote.customer.companyName}
                    </h4>
                    {getStatusBadge(quote.status)}
                  </div>

                  <div className="flex justify-between items-end mt-3">
                    <span className="text-xs text-slate-400 font-medium">
                      {quote.date}
                    </span>
                    <span className="text-lg font-extrabold text-[#1b365d]">
                      {formatPrice(quote.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Quotes Button */}
            {quotes.length > 0 && (
              <button
                onClick={onViewAllQuotes}
                className="w-full bg-white border-2 border-[#1b365d] text-[#1b365d] rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#1b365d] hover:text-white transition-all active-tap"
              >
                <span>Tüm Teklifleri Gör</span>
                <ArrowRight size={18} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Prominent Floating "+ Yeni Teklif" Button matching Screenshot 1 */}
      <div className="flex justify-center mt-8">
        <button
          onClick={onStartNewQuote}
          className="bg-[#ff6b00] hover:bg-[#e05e00] text-white px-8 py-3.5 rounded-full font-bold text-base shadow-lg shadow-orange-500/30 flex items-center gap-2 active-tap transition-all"
        >
          <Plus size={22} strokeWidth={2.5} />
          <span>Yeni Teklif</span>
        </button>
      </div>
    </div>
  );
}
