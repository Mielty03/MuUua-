-- ============================================================================
-- ESQUEMA DE BASE DE DATOS Y SEGURIDAD PARA MuUua! EXPERIENCE CMS
-- Ejecutar este script en el SQL Editor de tu proyecto gratuito en Supabase
-- ============================================================================

-- 1. Tabla principal de configuración publicada y borradores
CREATE TABLE IF NOT EXISTS public.muuua_config (
  id TEXT PRIMARY KEY, -- 'published' o 'draft'
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 2. Tabla de historial de versiones (para restaurar versiones anteriores)
CREATE TABLE IF NOT EXISTS public.muuua_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. Habilitar Row Level Security (RLS) - Protección real a nivel de servidor
ALTER TABLE public.muuua_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muuua_versions ENABLE ROW LEVEL SECURITY;

-- POLÍTICA PÚBLICA: Cualquier visitante puede LEER únicamente la configuración 'published'
CREATE POLICY "Publico lee configuracion publicada"
  ON public.muuua_config
  FOR SELECT
  USING (id = 'published');

-- POLÍTICA PRIVADA: Solo la administradora autenticada puede LEER borradores, INSERTAR o ACTUALIZAR
CREATE POLICY "Admin control total config"
  ON public.muuua_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin control total versiones"
  ON public.muuua_versions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Bucket de Storage para subir imágenes, GIFs y videos reales de preparación
INSERT INTO storage.buckets (id, name, public)
VALUES ('muuua-media', 'muuua-media', true)
ON CONFLICT (id) DO NOTHING;

-- Lectura pública de multimedia
CREATE POLICY "Multimedia publica"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'muuua-media');

-- Subida/edición/borrado exclusivo para administradora autenticada
CREATE POLICY "Admin sube multimedia"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'muuua-media');

CREATE POLICY "Admin modifica multimedia"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'muuua-media');

CREATE POLICY "Admin elimina multimedia"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'muuua-media');
