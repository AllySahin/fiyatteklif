import React, { useMemo, useState } from 'react';
import { ArrowLeft, CalendarDays, FileText, Eye, Download, Search, X } from 'lucide-react';

const MONTHS_TR = [
  'Ocak',
  'Subat',
  'Mart',
  'Nisan',
  'Mayis',
  'Haziran',
  'Temmuz',
  'Agustos',
  'Eylul',
  'Ekim',
  'Kasim',
  'Aralik'
];

const formatTL = (val) => {
  return '₺' + Number(val || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getMonthKeyFromDate = (dateValue) => {
  if (!dateValue) return '';

  const s = String(dateValue).trim();
  let m;

  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return `${m[1]}${m[2]}`;

  m = s.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/);
  if (m) return `${m[3]}${m[2]}`;

  return '';
};

const getMonthKeyFromQuote = (quote) => {
  const idMatch = String(quote?.id || '').match(/^VEFA-[MI](\d{6})\d{3}$/);
  if (idMatch) return idMatch[1];

  const fromCreatedAt = getMonthKeyFromDate(quote?.createdAt?.slice?.(0, 10));
  if (fromCreatedAt) return fromCreatedAt;

  return getMonthKeyFromDate(quote?.date);
};

const formatMonthLabel = (monthKey) => {
  if (!/^\d{6}$/.test(monthKey)) return 'Tarih Yok';
  const year = monthKey.slice(0, 4);
  const monthIndex = Number(monthKey.slice(4, 6)) - 1;
  return `${MONTHS_TR[monthIndex] || 'Ay'} ${year}`;
};

const getCategoryLabel = (category) => {
  return category === 'myk' ? 'MYK' : 'Is Makinesi';
};

export default function QuotesArchive({ quotes = [], onBack, onSelectQuote }) {
  const sortedQuotes = useMemo(() => {
    return [...quotes].sort((a, b) => {
      const ad = String(a?.createdAt || a?.date || '');
      const bd = String(b?.createdAt || b?.date || '');
      return bd.localeCompare(ad);
    });
  }, [quotes]);

  const monthKeys = useMemo(() => {
    const keys = new Set();
    sortedQuotes.forEach((q) => {
      const key = getMonthKeyFromQuote(q);
      if (key) keys.add(key);
    });
    return Array.from(keys).sort((a, b) => b.localeCompare(a));
  }, [sortedQuotes]);

  const [selectedMonth, setSelectedMonth] = useState('all');
  const [serviceSearch, setServiceSearch] = useState('');

  const openSavedPdf = (quote) => {
    if (!quote?.pdfBase64) return;

    const pdfWindow = window.open('', '_blank');
    if (!pdfWindow) return;

    pdfWindow.document.write(`
      <html>
        <head>
          <title>${quote.id || 'Teklif PDF'}</title>
          <style>
            html, body { margin: 0; height: 100%; }
            iframe { border: 0; width: 100%; height: 100vh; }
          </style>
        </head>
        <body>
          <iframe src="data:application/pdf;base64,${quote.pdfBase64}"></iframe>
        </body>
      </html>
    `);
    pdfWindow.document.close();
  };

  const filteredQuotes = useMemo(() => {
    let result = sortedQuotes;
    
    // Ay filtresini uygula
    if (selectedMonth !== 'all') {
      result = result.filter((q) => getMonthKeyFromQuote(q) === selectedMonth);
    }
    
    // Hizmet arama filtresini uygula
    if (serviceSearch.trim()) {
      const searchTerm = serviceSearch.trim().toLowerCase();
      result = result.filter((q) => {
        // quote.items dizisinde arama terimi geçen bir item var mı?
        return q.items?.some((item) => {
          const itemTitle = String(item?.title || item?.name || '').toLowerCase();
          return itemTitle.includes(searchTerm);
        });
      });
    }
    
    return result;
  }, [sortedQuotes, selectedMonth, serviceSearch]);

  const groupedByMonth = useMemo(() => {
    const groups = {};
    filteredQuotes.forEach((q) => {
      const key = getMonthKeyFromQuote(q) || 'unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    });

    return Object.entries(groups).sort(([a], [b]) => {
      if (a === 'unknown') return 1;
      if (b === 'unknown') return -1;
      return b.localeCompare(a);
    });
  }, [filteredQuotes]);

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen bg-slate-50">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center active-tap"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-extrabold text-[#1b365d]">Tum Teklifler</h2>
          <p className="text-xs text-slate-500">Ay ay filtreleme ve tum teklif listesi</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-3 mb-4">
        <label className="text-xs font-bold text-slate-600 block mb-2">Hizmet Ara</label>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Ornek: forklift operatorlugu, ekskavatör..."
            value={serviceSearch}
            onChange={(e) => setServiceSearch(e.target.value)}
            className="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00]"
          />
          {serviceSearch && (
            <button
              onClick={() => setServiceSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <label className="text-xs font-bold text-slate-600 block mb-2">Ay Filtresi</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 outline-none"
        >
          <option value="all">Tumu</option>
          {monthKeys.map((key) => (
            <option key={key} value={key}>{formatMonthLabel(key)}</option>
          ))}
        </select>
      </div>

      {groupedByMonth.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <FileText size={30} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">Gosterilecek teklif bulunamadi.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByMonth.map(([monthKey, monthQuotes]) => {
            const monthTotal = monthQuotes.reduce((acc, q) => acc + Number(q?.totalAmount || 0), 0);

            return (
              <section key={monthKey} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 bg-slate-100 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} className="text-slate-500" />
                      <h3 className="font-bold text-slate-800">{monthKey === 'unknown' ? 'Tarih Yok' : formatMonthLabel(monthKey)}</h3>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">{monthQuotes.length} teklif</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Aylik Toplam: <span className="font-bold text-slate-700">{formatTL(monthTotal)}</span></p>
                </div>

                <div className="divide-y divide-slate-100">
                  {monthQuotes.map((quote) => {
                    // Eğer hizmet araması yapılıyorsa, eşleşen hizmetleri bul
                    const matchedServices = serviceSearch.trim()
                      ? (quote.items || []).filter((item) => {
                          const itemTitle = String(item?.title || item?.name || '').toLowerCase();
                          return itemTitle.includes(serviceSearch.trim().toLowerCase());
                        })
                      : [];

                    return (
                      <button
                        key={quote.id}
                        onClick={() => onSelectQuote(quote)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 active-tap"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-[#1b365d] text-sm truncate">{quote?.customer?.companyName || '-'}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{quote.id} • {quote.date || '-'}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">Hazirlayan: {quote?.createdByName || '-'}</p>
                            
                            {/* Eşleşen hizmetleri göster */}
                            {matchedServices.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-100">
                                <p className="text-[10px] font-bold text-[#ff6b00] mb-1">Eslesen Hizmetler:</p>
                                {matchedServices.map((item, idx) => (
                                  <p key={idx} className="text-[11px] text-slate-600 truncate">
                                    • {item.title || item.name}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold ${quote.category === 'myk' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                              {getCategoryLabel(quote.category)}
                            </span>
                            <p className="text-sm font-extrabold text-slate-800 mt-2">{formatTL(quote.totalAmount)}</p>
                            <div className="mt-2 flex items-center justify-end gap-2">
                              {quote.pdfBase64 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openSavedPdf(quote);
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700"
                                >
                                  <Eye size={12} />
                                  PDF
                                </button>
                              )}
                              {quote.pdfBase64 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const link = document.createElement('a');
                                    link.href = `data:application/pdf;base64,${quote.pdfBase64}`;
                                    link.download = quote.pdfFileName || `${quote.id || 'teklif'}.pdf`;
                                    link.click();
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-[#1b365d] text-white"
                                >
                                  <Download size={12} />
                                  İndir
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
