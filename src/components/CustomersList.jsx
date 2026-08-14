import React, { useState } from 'react';
import { Search, Building, Phone, Mail, MapPin, Plus, ArrowRight, X } from 'lucide-react';

export default function CustomersList({ customers, onAddCustomer, onStartQuoteForCustomer }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newPerson, setNewPerson] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const filteredCustomers = customers.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(q) ||
      (c.authorizedPerson || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q)
    );
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCompany.trim()) return;
    onAddCustomer({
      id: `CUST-${Date.now()}`,
      companyName: newCompany,
      authorizedPerson: newPerson,
      phone: newPhone,
      email: newEmail,
      address: newAddress
    });
    setNewCompany('');
    setNewPerson('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-28 pt-4 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1b365d]">Müşteriler</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kayıtlı firma ve yetkililer</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#1b365d] hover:bg-[#142847] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 active-tap"
        >
          <Plus size={16} />
          <span>Müşteri Ekle</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Firma veya yetkili ara..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-[#1b365d] shadow-sm"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Customers List */}
      <div className="space-y-3">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            className="bg-white rounded-2xl p-4 border border-slate-100 card-shadow space-y-2"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-slate-800 text-base">{cust.companyName}</h3>
              <button
                onClick={() => onStartQuoteForCustomer(cust)}
                className="text-[#ff6b00] hover:text-[#e05e00] font-bold text-xs flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 active-tap"
              >
                <span>Teklif Ver</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
              {cust.authorizedPerson && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Yetkili:</span>
                  <span>{cust.authorizedPerson}</span>
                </div>
              )}
              {cust.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-400" />
                  <span>{cust.phone}</span>
                </div>
              )}
              {cust.email && (
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-slate-400" />
                  <span>{cust.email}</span>
                </div>
              )}
              {cust.address && (
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">{cust.address}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-lg text-slate-800">Yeni Müşteri Ekle</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Firma Adı *</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="Firma Unvanı"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1b365d]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Yetkili Kişi</label>
                <input
                  type="text"
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1b365d]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1b365d]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1b365d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adres</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Adres Bilgisi"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1b365d]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#1b365d] text-white py-3 rounded-xl font-bold text-sm shadow active-tap"
                >
                  Müşteriyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
