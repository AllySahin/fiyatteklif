import React, { useState } from 'react';
import { ArrowLeft, Phone, Mail, Building, User, MapPin, Hash, Users, X } from 'lucide-react';

export default function CustomerForm({ customerData, savedCustomers, onSubmit, onBack }) {
  const [formData, setFormData] = useState({
    companyName: customerData?.companyName || '',
    authorizedPerson: customerData?.authorizedPerson || '',
    phone: customerData?.phone || '',
    email: customerData?.email || '',
    address: customerData?.address || '',
    taxInfo: customerData?.taxInfo || ''
  });

  const [showSavedModal, setShowSavedModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectSavedCustomer = (cust) => {
    setFormData({
      companyName: cust.companyName || '',
      authorizedPerson: cust.authorizedPerson || '',
      phone: cust.phone || '',
      email: cust.email || '',
      address: cust.address || '',
      taxInfo: `${cust.taxOffice || ''} ${cust.taxNo || ''}`.trim()
    });
    setShowSavedModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      alert('Lütfen Firma Adını giriniz.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-24">
      {/* Header Bar matching Screenshot 3 */}
      <div className="bg-[#1b365d] text-white px-5 pt-8 pb-8 rounded-b-3xl shadow-md">
        <button 
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white mb-3 active-tap"
        >
          <ArrowLeft size={20} />
        </button>
        
        <h1 className="text-2xl font-bold">İşletme Bilgileri</h1>
        <p className="text-sm text-blue-200 mt-0.5">Adım 1/3</p>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit} className="px-5 pt-6 space-y-4">
        {/* Firma Adı */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            Firma Adı
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Örn: ABC İnşaat Ltd. Şti."
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-[#1b365d] shadow-sm"
            required
          />
        </div>

        {/* Yetkili Kişi */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            Yetkili Kişi
          </label>
          <input
            type="text"
            name="authorizedPerson"
            value={formData.authorizedPerson}
            onChange={handleChange}
            placeholder="Ad Soyad"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-[#1b365d] shadow-sm"
          />
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            Telefon
          </label>
          <div className="relative">
            <Phone size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0 (555) 000 00 00"
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-[#1b365d] shadow-sm"
            />
          </div>
        </div>

        {/* E-posta */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            E-posta
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ornek@firma.com"
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-[#1b365d] shadow-sm"
            />
          </div>
        </div>

        {/* Adres */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            Adres
          </label>
          <textarea
            name="address"
            rows={2}
            value={formData.address}
            onChange={handleChange}
            placeholder="Adres detayları..."
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-[#1b365d] shadow-sm resize-none"
          />
        </div>

        {/* Vergi No */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            Vergi No
          </label>
          <input
            type="text"
            name="taxInfo"
            value={formData.taxInfo}
            onChange={handleChange}
            placeholder="Vergi Dairesi ve No"
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-[#1b365d] shadow-sm"
          />
        </div>

        {/* Devam Et Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-[#ff6b00] hover:bg-[#e05e00] text-white py-3.5 rounded-xl font-bold text-base shadow-md active-tap transition-all"
          >
            Devam Et
          </button>
        </div>

        {/* Kayıtlı müşteriden seç link */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setShowSavedModal(true)}
            className="text-[#1b365d] hover:underline font-bold text-sm underline-offset-4"
          >
            Kayıtlı müşteriden seç
          </button>
        </div>
      </form>

      {/* Saved Customer Modal Drawer */}
      {showSavedModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-end p-0">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Kayıtlı Müşteri Seç</h3>
              <button 
                onClick={() => setShowSavedModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {savedCustomers.map((cust) => (
                <div
                  key={cust.id}
                  onClick={() => handleSelectSavedCustomer(cust)}
                  className="p-3.5 border border-slate-200 rounded-xl hover:border-[#1b365d] cursor-pointer transition-all active-tap"
                >
                  <h4 className="font-bold text-slate-800 text-base">{cust.companyName}</h4>
                  <p className="text-xs text-slate-500 mt-1">{cust.authorizedPerson} • {cust.phone}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{cust.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
