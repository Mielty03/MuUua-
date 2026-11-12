import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PublicExperience } from './components/public/PublicExperience';
import { AuthProvider } from './context/AuthContext';
import { ExperienceProvider } from './context/ExperienceContext';
import { AdminPortal } from './pages/AdminPortal';

export function App() {
  return (
    <AuthProvider>
      <ExperienceProvider>
        <HashRouter>
          <Routes>
            {/* Entorno 1: Experiencia pública limpia para visitantes */}
            <Route path="/" element={<PublicExperience />} />

            {/* Entorno 2: Panel privado protegido (acceso directo por URL privada /#/studio-admin) */}
            <Route path="/studio-admin" element={<AdminPortal />} />

            {/* Cualquier ruta desconocida redirige a la experiencia pública */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ExperienceProvider>
    </AuthProvider>
  );
}

export default App;
