import React, { useState } from 'react';
import { FileText, Lock, User, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { PRESET_USERS, VALID_PASSWORD } from '../data/usersData';

export default function LoginScreen({ onLoginSuccess }) {
  const [selectedUserId, setSelectedUserId] = useState(PRESET_USERS[0].id);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== VALID_PASSWORD) {
      setErrorMsg('Girdiğiniz şifre hatalı! Lütfen tekrar deneyin.');
      return;
    }

    const matchedUser = PRESET_USERS.find(u => u.id === selectedUserId);
    if (matchedUser) {
      onLoginSuccess(matchedUser);
    }
  };

  const activeUser = PRESET_USERS.find(u => u.id === selectedUserId);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 max-w-md mx-auto relative selection:bg-orange-200">
      <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        {/* Header Branding */}
        <div className="bg-[#1b365d] text-white p-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-3 border border-white/20 shadow-inner">
            <FileText size={36} className="text-amber-400" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white">
            Teklif<span className="text-[#ff6b00]">Pro</span>
          </h1>
          <p className="text-xs text-blue-200 mt-1 font-medium">
            Vefa Eğitim & MYK Mobil Fiyat Teklif Sistemi
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-start gap-2 animate-shake">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kullanıcı Adı Seçin:
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#1b365d]"
              >
                {PRESET_USERS.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.phone})
                  </option>
                ))}
              </select>
            </div>
            {activeUser && (
              <p className="text-[11px] text-slate-400 mt-1 pl-1">
                Yetkili Tel: <span className="font-semibold text-slate-600">{activeUser.phone}</span>
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Giriş Şifresi:
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#1b365d]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me note */}
          <div className="text-[11px] text-slate-400 bg-amber-50 border border-amber-200/60 p-2.5 rounded-xl">
            🔒 <span className="font-bold text-amber-800">Tek seferlik giriş:</span> Bir kez giriş yaptığınızda hesabınız bu cihazda kayıtlı kalacaktır.
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-[#ff6b00] hover:bg-[#e05e00] text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 active-tap transition-all"
          >
            <LogIn size={20} />
            <span>Sisteme Giriş Yap</span>
          </button>
        </form>
      </div>
    </div>
  );
}
