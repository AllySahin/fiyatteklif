import React, { useEffect, useState } from 'react';
import { User, Phone, ShieldCheck, LogOut, Users, CheckCircle, Mail, Server, Save } from 'lucide-react';
import { PRESET_USERS } from '../data/usersData';

export default function ProfileView({ currentUser, onUpdateProfile, onLogout }) {
  const [form, setForm] = useState({
    smtpApiBaseUrl: currentUser?.smtpApiBaseUrl || ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm({
      smtpApiBaseUrl: currentUser?.smtpApiBaseUrl || ''
    });
  }, [currentUser]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    onUpdateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto pb-28 pt-4 px-4">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-[#1b365d]">Kullanıcı Profili</h1>
        <p className="text-xs text-slate-500 mt-0.5">Aktif oturum ve yetkili bilgileri</p>
      </div>

      {/* Active User Card */}
      <div className="bg-[#1b365d] text-white rounded-3xl p-5 shadow-lg mb-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black text-amber-400 text-2xl border border-white/20">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-md">
              Aktif Kullanıcı
            </span>
            <h2 className="text-xl font-extrabold mt-1">{currentUser.name}</h2>
            <div className="flex items-center gap-1.5 text-xs text-blue-200 mt-0.5">
              <Phone size={13} />
              <span>{currentUser.phone}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-blue-900/60 flex justify-between items-center text-xs">
          <span className="text-blue-300 font-medium">Teklif Veren İlgili Personel</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <ShieldCheck size={14} /> Oturum Açık
          </span>
        </div>
      </div>

      {/* Authorized Users List */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 card-shadow mb-6 space-y-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Users size={16} className="text-[#1b365d]" />
          <span>Sistemdeki Kayıtlı 5 Kullanıcı</span>
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          {PRESET_USERS.map(u => {
            const isMe = u.id === currentUser.id;
            return (
              <div key={u.id} className="py-2.5 flex justify-between items-center">
                <div>
                  <span className={`font-bold ${isMe ? 'text-[#ff6b00]' : 'text-slate-800'}`}>
                    {u.name} {isMe && '(Siz)'}
                  </span>
                  <p className="text-[11px] text-slate-400">{u.phone}</p>
                </div>
                {isMe ? (
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">Aktif</span>
                ) : (
                  <span className="text-slate-400 text-[10px]">Yetkili</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 card-shadow mb-6 space-y-3">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Mail size={16} className="text-[#1b365d]" />
          <span>Mail Gonderim Ayarlari</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
            SMTP ayarlari artik sunucu tarafinda sabitlenmistir. Bu ekranda sadece Mail API adresini opsiyonel olarak degistirebilirsiniz.
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
              <Server size={13} /> Mail API Adresi (Opsiyonel)
            </label>
            <input
              type="text"
              value={form.smtpApiBaseUrl}
              onChange={(e) => setField('smtpApiBaseUrl', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 font-medium"
              placeholder="http://192.168.1.10:8787"
            />
            <p className="text-[11px] text-slate-400 mt-1">Bos birakilirsa mevcut cihaz hostu + :8787 kullanilir.</p>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-[#1b365d] hover:bg-[#142847] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active-tap"
          >
            <Save size={16} />
            Ayarlari Kaydet
          </button>

          {saved && (
            <p className="text-emerald-600 text-[11px] font-bold flex items-center gap-1">
              <CheckCircle size={13} /> Ayarlar kaydedildi.
            </p>
          )}
        </div>
      </div>

      {/* Logout Action Button */}
      <div>
        <button
          onClick={onLogout}
          className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm active-tap"
        >
          <LogOut size={18} />
          <span>Oturumu Kapat (Çıkış Yap)</span>
        </button>
      </div>
    </div>
  );
}
