import { DEFAULT_EXPERIENCE_CONFIG } from '../data/defaultConfig';
import { ExperienceConfig, VersionSnapshot } from '../types/experience';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const LOCAL_PUBLISHED_KEY = 'muuua_cms_published_v1';
const LOCAL_DRAFT_KEY = 'muuua_cms_draft_v1';
const LOCAL_VERSIONS_KEY = 'muuua_cms_versions_v1';

export const storageService = {
  /**
   * Carga la configuración publicada para la experiencia pública
   */
  async loadPublishedConfig(): Promise<ExperienceConfig> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('muuua_config')
          .select('payload')
          .eq('id', 'published')
          .maybeSingle();

        if (!error && data?.payload) {
          localStorage.setItem(LOCAL_PUBLISHED_KEY, JSON.stringify(data.payload));
          return data.payload as ExperienceConfig;
        }
      } catch (err) {
        console.warn('Fallo lectura Supabase, usando respaldo local:', err);
      }
    }

    const cached = localStorage.getItem(LOCAL_PUBLISHED_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as ExperienceConfig;
      } catch {
        return DEFAULT_EXPERIENCE_CONFIG;
      }
    }
    return DEFAULT_EXPERIENCE_CONFIG;
  },

  /**
   * Carga el borrador de trabajo para el panel administrativo privado
   */
  async loadDraftConfig(): Promise<ExperienceConfig> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('muuua_config')
          .select('payload')
          .eq('id', 'draft')
          .maybeSingle();

        if (!error && data?.payload) {
          localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(data.payload));
          return data.payload as ExperienceConfig;
        }
      } catch (err) {
        console.warn('Fallo lectura borrador Supabase:', err);
      }
    }

    const draft = localStorage.getItem(LOCAL_DRAFT_KEY);
    if (draft) {
      try {
        return JSON.parse(draft) as ExperienceConfig;
      } catch {
        return this.loadPublishedConfig();
      }
    }
    return this.loadPublishedConfig();
  },

  /**
   * Guarda cambios en borrador sin afectar aún a los visitantes públicos
   */
  async saveDraftConfig(config: ExperienceConfig): Promise<{ ok: boolean; mode: 'cloud' | 'local'; error?: string }> {
    const updated: ExperienceConfig = {
      ...config,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('muuua_config').upsert({
        id: 'draft',
        payload: updated,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        return { ok: false, mode: 'cloud', error: error.message };
      }
      return { ok: true, mode: 'cloud' };
    }

    return { ok: true, mode: 'local' };
  },

  /**
   * Publica la configuración en vivo y crea un punto de restauración histórico
   */
  async publishConfig(
    config: ExperienceConfig,
    versionLabel?: string
  ): Promise<{ ok: boolean; mode: 'cloud' | 'local'; error?: string }> {
    const publishedPayload: ExperienceConfig = {
      ...config,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(publishedPayload));
    localStorage.setItem(LOCAL_PUBLISHED_KEY, JSON.stringify(publishedPayload));

    const label =
      versionLabel ||
      `Publicación ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;

    // Guardar historial local
    const rawHistory = localStorage.getItem(LOCAL_VERSIONS_KEY);
    const history: VersionSnapshot[] = rawHistory ? JSON.parse(rawHistory) : [];
    history.unshift({
      id: crypto.randomUUID(),
      label,
      created_at: new Date().toISOString(),
      payload: publishedPayload,
    });
    localStorage.setItem(LOCAL_VERSIONS_KEY, JSON.stringify(history.slice(0, 20)));

    if (isSupabaseConfigured && supabase) {
      const { error: pubErr } = await supabase.from('muuua_config').upsert([
        { id: 'draft', payload: publishedPayload, updated_at: new Date().toISOString() },
        { id: 'published', payload: publishedPayload, updated_at: new Date().toISOString() },
      ]);

      if (pubErr) {
        return { ok: false, mode: 'cloud', error: pubErr.message };
      }

      await supabase.from('muuua_versions').insert({
        label,
        payload: publishedPayload,
      });

      return { ok: true, mode: 'cloud' };
    }

    return { ok: true, mode: 'local' };
  },

  /**
   * Obtiene historial de versiones anteriores
   */
  async getVersions(): Promise<VersionSnapshot[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('muuua_versions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        return data as VersionSnapshot[];
      }
    }

    const rawHistory = localStorage.getItem(LOCAL_VERSIONS_KEY);
    return rawHistory ? (JSON.parse(rawHistory) as VersionSnapshot[]) : [];
  },

  /**
   * Sube imágenes, GIFs o videos a Supabase Storage (o convierte a DataURL si es modo local)
   */
  async uploadMediaFile(file: File): Promise<{ url: string; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      const ext = file.name.split('.').pop() || 'bin';
      const filePath = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage.from('muuua-media').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        return { url: '', error: error.message };
      }

      const { data } = supabase.storage.from('muuua-media').getPublicUrl(filePath);
      return { url: data.publicUrl };
    }

    // Fallback: lectura local para vista previa y persistencia en navegador
    return new Promise((resolve) => {
      if (file.size > 4 * 1024 * 1024) {
        // Para videos grandes en local usamos ObjectURL temporal
        resolve({ url: URL.createObjectURL(file) });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve({ url: String(reader.result || '') });
      reader.onerror = () => resolve({ url: '', error: 'No se pudo leer el archivo.' });
      reader.readAsDataURL(file);
    });
  },
};
