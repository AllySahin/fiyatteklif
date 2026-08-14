import React, { useState } from 'react';
import { Search, Plus, PhoneCall, Calendar, ArrowRight, Trash2, X, Check, ChevronDown, Archive } from 'lucide-react';

export default function CustomerNotes({ notes, onDeleteNote, onUpdateNoteStatus, onArchiveNote, onOpenNewNoteModal, onStartQuoteForCustomer }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const statusOptions = [
    { value: 'Geri Aranacak', label: 'Geri Aranacak' },
    { value: 'Fiyat Bekliyor', label: 'Fiyat Bekliyor' },
    { value: 'Teklif Gönderildi', label: 'Teklif Gönderildi' },
    { value: 'Anlaşıldı', label: 'Anlaşıldı' }
  ];

  // Arşiv durumuna göre filtreleme
  const filteredNotes = notes.filter(n => {
    // Arşiv görünümü açıksa sadece arşivlenenleri göster
    if (showArchived) {
      if (!n.isArchived) return false;
    } else {
      // Normal görünümde arşivlenmemişleri göster
      if (n.isArchived) return false;
    }
    
    if (statusFilter !== 'all' && n.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.customerName.toLowerCase().includes(q) ||
        (n.contactPerson || '').toLowerCase().includes(q) ||
        (n.noteText || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const archivedCount = notes.filter(n => n.isArchived).length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Anlaşıldı':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Anlaşıldı</span>;
      case 'Geri Aranacak':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Geri Aranacak</span>;
      case 'Teklif Gönderildi':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Teklif Gönderildi</span>;
      case 'Fiyat Bekliyor':
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Fiyat Bekliyor</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-28 pt-4 px-4">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1b365d]">
            {showArchived ? 'Arşiv' : 'Müşteri Notları'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {showArchived 
              ? `${archivedCount} arşivlenmiş not` 
              : 'Görüşme & takip notlarınız'
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-md transition-all ${
              showArchived
                ? 'bg-slate-600 hover:bg-slate-700 text-white'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
            title={showArchived ? 'Aktif Notlar' : 'Arşiv'}
          >
            <Archive size={16} />
            <span>{showArchived ? 'Geri' : 'Arşiv'}</span>
            {!showArchived && archivedCount > 0 && (
              <span className="bg-slate-700 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                {archivedCount}
              </span>
            )}
          </button>

          {!showArchived && (
            <button
              onClick={onOpenNewNoteModal}
              className="bg-[#ff6b00] hover:bg-[#e05e00] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 active-tap"
            >
              <Plus size={16} />
              <span>Yeni Not</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Müşteri veya not ara..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-[#1b365d] shadow-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Status Filter Chips - Sadece normal görünümde göster */}
      {!showArchived && (
        <div className="flex gap-1.5 overflow-x-auto pb-3 mb-2 no-scrollbar">
          {['all', 'Geri Aranacak', 'Fiyat Bekliyor', 'Teklif Gönderildi', 'Anlaşıldı'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#1b365d] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st === 'all' ? 'Tümü' : st}
            </button>
          ))}
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            {showArchived ? (
              <>
                <Archive size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-600 text-sm">Arşivlenmiş not bulunmuyor.</p>
                <p className="text-xs text-slate-400 mt-1">Tamamlanan notlar buraya arşivlenir.</p>
              </>
            ) : (
              <>
                <PhoneCall size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-600 text-sm">Henüz kayıtlı not bulunmuyor.</p>
                <p className="text-xs text-slate-400 mt-1">Müşteri görüşmeleriniz sonrasında hemen not ekleyebilirsiniz.</p>
              </>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isExpanded = expandedNoteId === note.id;
            const isArchived = note.isArchived;
            
            return (
              <div
                key={note.id}
                className={`bg-white rounded-2xl border border-slate-100 card-shadow ${isArchived ? 'opacity-60' : ''}`}
              >
                <div className="p-4 space-y-3">
                  {/* Note Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 text-base">{note.customerName}</h3>
                      {note.contactPerson && (
                        <p className="text-xs text-slate-500 font-medium">{note.contactPerson} {note.phone ? `• ${note.phone}` : ''}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(note.status)}
                      {isArchived && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">Arşivlendi</span>
                      )}
                    </div>
                  </div>

                  {/* Note Body */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-medium">
                    {note.noteText}
                  </div>

                  {/* Footer Date & Actions */}
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar size={13} />
                      <span>{note.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isArchived && (
                        <button
                          onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Aksiyonlar"
                        >
                          <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}

                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Notu Sil"
                      >
                        <Trash2 size={16} />
                      </button>

                      <button
                        onClick={() => onStartQuoteForCustomer({
                          companyName: note.customerName,
                          authorizedPerson: note.contactPerson || '',
                          phone: note.phone || '',
                          email: note.email || ''
                        })}
                        className="bg-[#1b365d] hover:bg-[#142847] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm active-tap"
                      >
                        <span>Teklif Hazırla</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Actions Panel - Sadece aktif notlar için */}
                {isExpanded && !isArchived && (
                  <div className="px-4 pb-4 pt-0 flex gap-2 border-t border-slate-100">
                    {/* Statü Değiştir Dropdown */}
                    <select
                      value={note.status}
                      onChange={(e) => {
                        onUpdateNoteStatus(note.id, e.target.value);
                        setExpandedNoteId(null);
                      }}
                      className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-[#1b365d] cursor-pointer shadow-sm"
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
                      className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
                      title="Tamamlandı olarak işaretle"
                    >
                      <Check size={14} />
                      <span>Arşivle</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
