import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminLogin } from '../components/admin/AdminLogin';

/**
 * Portal privado de administración protegido por autenticación real.
 * No existe ningún enlace hacia esta ruta desde la experiencia pública.
 */
export const AdminPortal: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#14111A] text-white flex items-center justify-center">
        <p className="font-display text-lg">Verificando credenciales...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
};
