import React, { useState } from 'react';
import { X, PhoneCall, Save, Building, User, Phone, Mail } from 'lucide-react';

export default function QuickNoteModal({ savedCustomers, onSaveNote, onClose }) {
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [noteText, setNoteText] = useState('');
  const [status, setStatus] = useState('Geri Aranacak');

  const handleSelectCustomer = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    const cust = savedCustomers.find(c => c.id === selectedId);
    if (cust) {
      setCustomerName(cust.companyName);
      setContactPerson(cust.authorizedPerson || '');
      setPhone(cust.phone || '');
      setEmail(cust.email || '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Lütfen Firma veya Müşteri adını giriniz.');
      return;
    }
    if (!noteText.trim()) {
      alert('Lütfen not içeriğini yazınız.');
      return;
    }

    onSaveNote({
      customerName,
      contactPerson,
      phone,
      email,
      noteText,
      status,
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-[#1b365d]">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <PhoneCall size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg">Hızlı Müşteri Notu</h3>
              <p className="text-[11px] text-slate-400">Görüşme detayını anında kaydedin</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X size={22} />
          </button>
        </div>

        {/* Saved Customer Dropdown Shortcut */}
        {savedCustomers.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kayıtlı Müşterilerden Doldur:
            </label>
            <select
              onChange={handleSelectCustomer}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="">-- Müşteri Seçin --</option>
              {savedCustomers.map(c => (
                <option key={c.id} value={c.id}>{c.companyName} ({c.authorizedPerson})</option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Firma Adı */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Firma / Müşteri Adı *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Örn: ABC İnşaat Ltd."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:border-[#1b365d] focus:outline-none"
              required
            />
          </div>

          {/* Yetkili & Telefon Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Yetkili Kişi
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Ad Soyad"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:border-[#1b365d] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0 (555) 000 00 00"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:border-[#1b365d] focus:outline-none"
              />
            </div>
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Görüşme Durumu
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none"
            >
              <option value="Geri Aranacak">Geri Aranacak</option>
              <option value="Fiyat Bekliyor">Fiyat Bekliyor</option>
              <option value="Teklif Gönderildi">Teklif Gönderildi</option>
              <option value="Anlaşıldı">Anlaşıldı</option>
            </select>
          </div>

          {/* Not Metni */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Görüşme Notu *
            </label>
            <textarea
              rows={3}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Konuşulan detayları, istekleri buraya not alın..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs font-medium focus:border-[#1b365d] focus:outline-none resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#ff6b00] hover:bg-[#e05e00] text-white py-3 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active-tap"
            >
              <Save size={16} />
              <span>Notu Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
