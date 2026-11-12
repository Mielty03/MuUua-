import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const { login, isCloudAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await login(email, password);
    if (!res.ok) {
      setError(res.error || 'Error de autenticación');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#18141E] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#231E2B] border-2 border-white/15 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-400">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl font-bold">Acceso Privado · MuUua! CMS</h1>
          <p className="text-xs text-gray-400">
            Entorno exclusivo de administración y diseño visual.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Usuario / Correo Administradora
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@muuua.com"
              className="w-full px-4 py-3 rounded-xl bg-[#16131C] border border-white/15 text-white focus:border-pink-400 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-[#16131C] border border-white/15 text-white focus:border-pink-400 focus:outline-none text-sm"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-400/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-[#18141E] font-display font-bold text-base transition-colors disabled:opacity-50"
          >
            {submitting ? 'Verificando acceso...' : 'Iniciar sesión en el estudio'}
          </button>
        </form>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {isCloudAuth ? 'Protegido por Supabase Auth' : 'Modo Local (.env)'}
          </span>
          <span>Rutas protegidas</span>
        </div>
      </div>
    </div>
  );
};
