import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_EXPERIENCE_CONFIG } from '../data/defaultConfig';
import { storageService } from '../services/storageService';
import { ExperienceConfig, VersionSnapshot } from '../types/experience';

interface ExperienceContextType {
  publishedConfig: ExperienceConfig;
  draftConfig: ExperienceConfig;
  loading: boolean;
  hasUnsavedChanges: boolean;
  versions: VersionSnapshot[];
  updateDraft: (updater: (prev: ExperienceConfig) => ExperienceConfig) => void;
  saveDraft: () => Promise<{ ok: boolean; error?: string }>;
  discardDraftChanges: () => Promise<void>;
  publishChanges: (label?: string) => Promise<{ ok: boolean; error?: string }>;
  restoreVersion: (snapshot: VersionSnapshot) => Promise<void>;
  resetToFactoryDefault: () => void;
}

const ExperienceContext = createContext<ExperienceContextType | undefined>(undefined);

export const ExperienceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publishedConfig, setPublishedConfig] = useState<ExperienceConfig>(DEFAULT_EXPERIENCE_CONFIG);
  const [draftConfig, setDraftConfig] = useState<ExperienceConfig>(DEFAULT_EXPERIENCE_CONFIG);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);

  useEffect(() => {
    const bootstrap = async () => {
      const [pub, draft, hist] = await Promise.all([
        storageService.loadPublishedConfig(),
        storageService.loadDraftConfig(),
        storageService.getVersions(),
      ]);
      setPublishedConfig(pub);
      setDraftConfig(draft);
      setVersions(hist);
      setLoading(false);
    };
    bootstrap();
  }, []);

  // Aplicar variables CSS dinámicas según la configuración publicada
  useEffect(() => {
    const root = document.documentElement;
    const t = publishedConfig.theme;
    root.style.setProperty('--font-display', `'${t.fontDisplay}', cursive, sans-serif`);
    root.style.setProperty('--font-body', `'${t.fontBody}', sans-serif`);
    root.style.setProperty('--color-primary', t.primaryColor);
    root.style.setProperty('--color-secondary', t.secondaryColor);
    root.style.setProperty('--color-accent', t.accentColor);
    root.style.setProperty('--color-bg', t.backgroundColor);
    root.style.setProperty('--color-text', t.textColor);
    root.style.setProperty('--border-radius', `${t.borderRadius}px`);
  }, [publishedConfig]);

  const updateDraft = (updater: (prev: ExperienceConfig) => ExperienceConfig) => {
    setDraftConfig((prev) => {
      const next = updater(prev);
      setHasUnsavedChanges(true);
      return next;
    });
  };

  const saveDraft = async () => {
    const res = await storageService.saveDraftConfig(draftConfig);
    if (res.ok) {
      setHasUnsavedChanges(false);
    }
    return res;
  };

  const discardDraftChanges = async () => {
    const latestPublished = await storageService.loadPublishedConfig();
    setDraftConfig(latestPublished);
    setHasUnsavedChanges(false);
  };

  const publishChanges = async (label?: string) => {
    const res = await storageService.publishConfig(draftConfig, label);
    if (res.ok) {
      setPublishedConfig(draftConfig);
      setHasUnsavedChanges(false);
      const hist = await storageService.getVersions();
      setVersions(hist);
    }
    return res;
  };

  const restoreVersion = async (snapshot: VersionSnapshot) => {
    setDraftConfig(snapshot.payload);
    setHasUnsavedChanges(true);
  };

  const resetToFactoryDefault = () => {
    setDraftConfig(DEFAULT_EXPERIENCE_CONFIG);
    setHasUnsavedChanges(true);
  };

  return (
    <ExperienceContext.Provider
      value={{
        publishedConfig,
        draftConfig,
        loading,
        hasUnsavedChanges,
        versions,
        updateDraft,
        saveDraft,
        discardDraftChanges,
        publishChanges,
        restoreVersion,
        resetToFactoryDefault,
      }}
    >
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => {
  const ctx = useContext(ExperienceContext);
  if (!ctx) throw new Error('useExperience debe usarse dentro de ExperienceProvider');
  return ctx;
};
