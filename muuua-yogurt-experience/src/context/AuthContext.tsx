import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

interface AuthContextType {
  isAuthenticated: boolean;
  adminEmail: string | null;
  loading: boolean;
  isCloudAuth: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_KEY = 'muuua_admin_session_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setIsAuthenticated(Boolean(data.session));
          setAdminEmail(data.session?.user?.email ?? null);
          setLoading(false);
        }

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (mounted) {
            setIsAuthenticated(Boolean(session));
            setAdminEmail(session?.user?.email ?? null);
          }
        });

        return () => listener.subscription.unsubscribe();
      } else {
        // Modo local con sesión temporal
        const saved = sessionStorage.getItem(SESSION_KEY);
        if (mounted) {
          if (saved) {
            setIsAuthenticated(true);
            setAdminEmail(saved);
          }
          setLoading(false);
        }
      }
    };

    initAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { ok: false, error: 'Credenciales inválidas o usuario no autorizado.' };
      }
      setIsAuthenticated(Boolean(data.session));
      setAdminEmail(data.session?.user?.email ?? email);
      return { ok: true };
    }

    // Autenticación de respaldo configurada por variables de entorno (.env)
    const envUser = import.meta.env.VITE_FALLBACK_ADMIN_USER || 'admin@muuua.com';
    const envPass = import.meta.env.VITE_FALLBACK_ADMIN_PASS || 'MuUuaRodeo2026!';

    if (email.trim().toLowerCase() === envUser.toLowerCase() && password === envPass) {
      sessionStorage.setItem(SESSION_KEY, email);
      setIsAuthenticated(true);
      setAdminEmail(email);
      return { ok: true };
    }

    return { ok: false, error: 'Usuario o contraseña incorrectos.' };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setAdminEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        adminEmail,
        loading,
        isCloudAuth: isSupabaseConfigured,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
