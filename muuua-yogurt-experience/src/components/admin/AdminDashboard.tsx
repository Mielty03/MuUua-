import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  Film,
  GitBranch,
  History,
  Layers,
  LogOut,
  Milk,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useExperience } from '../../context/ExperienceContext';
import {
  AnswerOption,
  CupDecoration,
  Ingredient,
  PersonalityResult,
  Question,
  TextureDefinition,
} from '../../types/experience';
import { PublicExperience } from '../public/PublicExperience';
import { YogurtCupRenderer } from '../yogurt/YogurtCupRenderer';
import { MediaUploader } from './MediaUploader';

type AdminTab =
  | 'design'
  | 'cup'
  | 'ingredients'
  | 'questions'
  | 'routes'
  | 'personalities'
  | 'animations'
  | 'versions';

export const AdminDashboard: React.FC = () => {
  const { adminEmail, logout } = useAuth();
  const {
    draftConfig,
    hasUnsavedChanges,
    versions,
    updateDraft,
    saveDraft,
    discardDraftChanges,
    publishChanges,
    restoreVersion,
    resetToFactoryDefault,
  } = useExperience();

  const [activeTab, setActiveTab] = useState<AdminTab>('cup');
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [toast, setToast] = useState<string>('');
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>(
    draftConfig.ingredients[0]?.id || ''
  );
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    draftConfig.questions[0]?.id || ''
  );
  const [selectedPersonalityId, setSelectedPersonalityId] = useState<string>(
    draftConfig.personalities[0]?.id || ''
  );

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  const handleSaveDraft = async () => {
    const res = await saveDraft();
    if (res.ok) notify('Borrador guardado correctamente.');
    else notify(`Error al guardar: ${res.error}`);
  };

  const handlePublish = async () => {
    const label = prompt('Nombre opcional para esta versión publicada (ej. Versión Feria):');
    const res = await publishChanges(label || undefined);
    if (res.ok) notify('¡Cambios publicados en vivo en la experiencia pública!');
    else notify(`Error al publicar: ${res.error}`);
  };

  const handleDiscard = async () => {
    if (confirm('¿Descartar todos los cambios no publicados y volver a la versión en vivo?')) {
      await discardDraftChanges();
      notify('Cambios descartados.');
    }
  };

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'cup', label: 'Editor del Vaso', icon: <Milk className="w-4 h-4" /> },
    { id: 'ingredients', label: 'Ingredientes y Texturas', icon: <Layers className="w-4 h-4" /> },
    { id: 'questions', label: 'Editor de Preguntas', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'routes', label: 'Rutas y Conexiones', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'personalities', label: 'Personalidades', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'animations', label: 'Animaciones y Videos', icon: <Film className="w-4 h-4" /> },
    { id: 'design', label: 'Diseño Global y Textos', icon: <Palette className="w-4 h-4" /> },
    { id: 'versions', label: 'Historial y Versiones', icon: <History className="w-4 h-4" /> },
  ];

  // =========================================================================
  // MODAL DE VISTA PREVIA COMPLETA ANTES DE PUBLICAR
  // =========================================================================
  if (showFullPreview) {
    return (
      <div className="relative">
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-[#18141E] text-white px-4 py-3 rounded-2xl border-2 border-pink-400 shadow-2xl">
          <span className="text-xs font-bold">Vista Previa del Borrador</span>
          <button
            onClick={() => setShowFullPreview(false)}
            className="px-3 py-1.5 rounded-xl bg-pink-500 text-[#18141E] text-xs font-bold"
          >
            Volver al Editor
          </button>
        </div>
        <PublicExperience overrideConfig={draftConfig} isPreviewMode={true} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#14111A] text-white flex flex-col">
      {/* BARRA SUPERIOR DE PUBLICACIÓN Y CONTROL */}
      <header className="sticky top-0 z-40 bg-[#1E1926] border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-lg bg-pink-500 text-[#14111A] font-display font-bold text-sm">
            MuUua! Studio CMS
          </span>
          <span className="text-xs text-gray-400 hidden sm:inline">
            Sesión: <strong className="text-gray-200">{adminEmail}</strong>
          </span>
          {hasUnsavedChanges && (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[11px] font-bold">
              Cambios sin publicar
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowFullPreview(true)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-sky-400" />
            <span>Vista previa</span>
          </button>

          <button
            onClick={handleDiscard}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-xs font-bold flex items-center gap-1.5 text-gray-300 hover:text-red-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Descartar</span>
          </button>

          <button
            onClick={handleSaveDraft}
            className="px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Guardar borrador</span>
          </button>

          <button
            onClick={handlePublish}
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-[#14111A] text-xs font-display font-bold flex items-center gap-1.5 shadow-lg"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Publicar en vivo</span>
          </button>

          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* NOTIFICACIÓN FLOTANTE */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-500 text-[#14111A] px-4 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toast}</span>
        </div>
      )}

      {/* NAVEGACIÓN DE SECCIONES DEL CMS */}
      <nav className="bg-[#191521] border-b border-white/10 px-4 py-2 flex items-center gap-1.5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-pink-500 text-[#14111A]'
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* CONTENIDO PRINCIPAL DEL EDITOR */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* ===================================================================
            TAB 1: EDITOR VISUAL DEL VASO (CON VISTA PREVIA EN TIEMPO REAL)
        =================================================================== */}
        {activeTab === 'cup' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Panel izquierdo de controles */}
            <div className="lg:col-span-7 space-y-6 bg-[#1E1926] p-6 rounded-3xl border border-white/10">
              <h2 className="font-display text-xl font-bold">
                Personalización del Vaso y Decoraciones
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Silueta del envase
                  </label>
                  <select
                    value={draftConfig.cup.shape}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        cup: { ...prev.cup, shape: e.target.value as any },
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                  >
                    <option value="classic-jar">Frasco Artesanal Redondeado</option>
                    <option value="tall-parfait">Copa Alta Parfait</option>
                    <option value="artisan-tub">Tarrina Casera</option>
                    <option value="retro-cup">Vaso Retro Clásico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Estilo del borde superior
                  </label>
                  <select
                    value={draftConfig.cup.rimStyle}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        cup: { ...prev.cup, rimStyle: e.target.value as any },
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                  >
                    <option value="rounded">Redondeado suave</option>
                    <option value="flat">Plano moderno</option>
                    <option value="wavy">Orgánico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Ancho del vaso: {draftConfig.cup.width}px
                  </label>
                  <input
                    type="range"
                    min={180}
                    max={320}
                    value={draftConfig.cup.width}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        cup: { ...prev.cup, width: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Alto del vaso: {draftConfig.cup.height}px
                  </label>
                  <input
                    type="range"
                    min={220}
                    max={400}
                    value={draftConfig.cup.height}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        cup: { ...prev.cup, height: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Color del cristal / fondo vaso
                  </label>
                  <input
                    type="color"
                    value={draftConfig.cup.glassColor}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        cup: { ...prev.cup, glassColor: e.target.value },
                      }))
                    }
                    className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Transparencia cristal: {Math.round(draftConfig.cup.glassOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={0.95}
                    step={0.05}
                    value={draftConfig.cup.glassOpacity}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        cup: { ...prev.cup, glassOpacity: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Color del trazo / borde
                  </label>
                  <input
                    type="color"
                    value={draftConfig.cup.borderColor}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        cup: { ...prev.cup, borderColor: e.target.value },
                      }))
                    }
                    className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Grosor de línea: {draftConfig.cup.borderWidth}px
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={draftConfig.cup.borderWidth}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        cup: { ...prev.cup, borderWidth: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>

              {/* Etiqueta y Cuchara */}
              <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draftConfig.cup.showSpoon}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        cup: { ...prev.cup, showSpoon: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-pink-500"
                  />
                  <span>Mostrar cuchara artesanal</span>
                </label>

                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draftConfig.cup.showLabel}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        cup: { ...prev.cup, showLabel: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-pink-500"
                  />
                  <span>Mostrar etiqueta frontal</span>
                </label>

                {draftConfig.cup.showSpoon && (
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      Color de cuchara
                    </label>
                    <input
                      type="color"
                      value={draftConfig.cup.spoonColor}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          cup: { ...prev.cup, spoonColor: e.target.value },
                        }))
                      }
                      className="w-full h-9 rounded-xl"
                    />
                  </div>
                )}

                {draftConfig.cup.showLabel && (
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      Texto de etiqueta
                    </label>
                    <input
                      type="text"
                      value={draftConfig.cup.labelText}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          cup: { ...prev.cup, labelText: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-xs"
                    />
                  </div>
                )}
              </div>

              <MediaUploader
                label="Ilustración personalizada superpuesta al vaso (PNG transparente opcional)"
                value={draftConfig.cup.customCupOverlayUrl}
                accept="image/*"
                onChange={(url) =>
                  updateDraft((prev) => ({
                    ...prev,
                    cup: { ...prev.cup, customCupOverlayUrl: url },
                  }))
                }
              />

              {/* Stickers y decoraciones posicionables */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base">
                    Stickers y Decoraciones del Vaso
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newDec: CupDecoration = {
                        id: `dec-${Date.now()}`,
                        type: 'sticker',
                        label: 'NUEVO STICKER',
                        color: '#7AFCFF',
                        x: 50,
                        y: 20,
                        scale: 1,
                        rotation: 0,
                        visible: true,
                      };
                      updateDraft((prev) => ({
                        ...prev,
                        cup: {
                          ...prev.cup,
                          decorations: [...prev.cup.decorations, newDec],
                        },
                      }));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-pink-500 text-[#14111A] text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir sticker</span>
                  </button>
                </div>

                {draftConfig.cup.decorations.map((dec, idx) => (
                  <div
                    key={dec.id}
                    className="p-3 rounded-2xl bg-[#14111A] border border-white/10 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={dec.label}
                        onChange={(e) =>
                          updateDraft((prev) => {
                            const copy = [...prev.cup.decorations];
                            copy[idx] = { ...dec, label: e.target.value };
                            return { ...prev, cup: { ...prev.cup, decorations: copy } };
                          })
                        }
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#1E1926] border border-white/15 text-xs"
                      />
                      <input
                        type="color"
                        value={dec.color}
                        onChange={(e) =>
                          updateDraft((prev) => {
                            const copy = [...prev.cup.decorations];
                            copy[idx] = { ...dec, color: e.target.value };
                            return { ...prev, cup: { ...prev.cup, decorations: copy } };
                          })
                        }
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft((prev) => ({
                            ...prev,
                            cup: {
                              ...prev.cup,
                              decorations: prev.cup.decorations.filter((d) => d.id !== dec.id),
                            },
                          }))
                        }
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-400">
                      <label>
                        Pos X ({dec.x}%)
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={dec.x}
                          onChange={(e) =>
                            updateDraft((prev) => {
                              const copy = [...prev.cup.decorations];
                              copy[idx] = { ...dec, x: Number(e.target.value) };
                              return { ...prev, cup: { ...prev.cup, decorations: copy } };
                            })
                          }
                          className="w-full accent-pink-500"
                        />
                      </label>
                      <label>
                        Pos Y ({dec.y}%)
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={dec.y}
                          onChange={(e) =>
                            updateDraft((prev) => {
                              const copy = [...prev.cup.decorations];
                              copy[idx] = { ...dec, y: Number(e.target.value) };
                              return { ...prev, cup: { ...prev.cup, decorations: copy } };
                            })
                          }
                          className="w-full accent-pink-500"
                        />
                      </label>
                      <label>
                        Rotación ({dec.rotation}°)
                        <input
                          type="range"
                          min={-45}
                          max={45}
                          value={dec.rotation}
                          onChange={(e) =>
                            updateDraft((prev) => {
                              const copy = [...prev.cup.decorations];
                              copy[idx] = { ...dec, rotation: Number(e.target.value) };
                              return { ...prev, cup: { ...prev.cup, decorations: copy } };
                            })
                          }
                          className="w-full accent-pink-500"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vista Previa en vivo del Vaso */}
            <div className="lg:col-span-5">
              <div
                className="sticky top-24 p-8 rounded-3xl border border-white/15 flex flex-col items-center justify-center min-h-[460px]"
                style={{ background: draftConfig.theme.backgroundGradient }}
              >
                <span className="px-3 py-1 rounded-full bg-[#14111A] text-white text-xs font-bold mb-6">
                  Vista Previa en Tiempo Real
                </span>
                <YogurtCupRenderer
                  cup={draftConfig.cup}
                  ingredients={draftConfig.ingredients.slice(0, 5)}
                  textures={draftConfig.textures}
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: EDITOR DE INGREDIENTES Y TEXTURAS
        =================================================================== */}
        {activeTab === 'ingredients' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lista de ingredientes */}
            <div className="lg:col-span-4 bg-[#1E1926] p-5 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">
                  Ingredientes ({draftConfig.ingredients.length})
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const newIng: Ingredient = {
                      id: `ing-${Date.now()}`,
                      name: 'Nuevo Ingrediente Artesanal',
                      category: 'fruit',
                      color: '#FFB5E8',
                      secondaryColor: '#FF6B9D',
                      texture: 'creamy',
                      layerOrder: 2,
                      heightPercentage: 20,
                      opacity: 0.95,
                      description: 'Descripción sensorial del ingrediente.',
                      animation: 'pour',
                      particleCount: 8,
                      particleSize: 12,
                    };
                    updateDraft((prev) => ({
                      ...prev,
                      ingredients: [...prev.ingredients, newIng],
                    }));
                    setSelectedIngredientId(newIng.id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-pink-500 text-[#14111A] text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              </div>

              <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
                {draftConfig.ingredients.map((ing) => (
                  <button
                    key={ing.id}
                    onClick={() => setSelectedIngredientId(ing.id)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedIngredientId === ing.id
                        ? 'bg-pink-500/20 border-pink-400'
                        : 'bg-[#14111A] border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-6 h-6 rounded-full border border-white/30 shrink-0"
                        style={{ backgroundColor: ing.color }}
                      />
                      <div>
                        <p className="font-bold text-sm">{ing.name}</p>
                        <p className="text-[11px] text-gray-400">
                          Capa #{ing.layerOrder} · Textura: {ing.texture}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Formulario de edición del ingrediente seleccionado + Vista previa */}
            <div className="lg:col-span-8 space-y-6">
              {(() => {
                const ing = draftConfig.ingredients.find((i) => i.id === selectedIngredientId);
                if (!ing) return <p className="text-gray-400">Selecciona o crea un ingrediente.</p>;

                const updateIng = (patch: Partial<Ingredient>) => {
                  updateDraft((prev) => ({
                    ...prev,
                    ingredients: prev.ingredients.map((item) =>
                      item.id === ing.id ? { ...item, ...patch } : item
                    ),
                  }));
                };

                return (
                  <div className="bg-[#1E1926] p-6 rounded-3xl border border-white/10 space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-bold">Editando: {ing.name}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar el ingrediente "${ing.name}"?`)) {
                            updateDraft((prev) => ({
                              ...prev,
                              ingredients: prev.ingredients.filter((i) => i.id !== ing.id),
                            }));
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) => updateIng({ name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Categoría
                        </label>
                        <select
                          value={ing.category}
                          onChange={(e) => updateIng({ category: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                        >
                          <option value="base">Base láctea (Fondo)</option>
                          <option value="fruit">Fruta / Compota</option>
                          <option value="topping">Topping crujiente</option>
                          <option value="drizzle">Salsa / Miel</option>
                          <option value="magic">Elemento mágico / Especial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Color de capa
                        </label>
                        <input
                          type="color"
                          value={ing.color}
                          onChange={(e) => updateIng({ color: e.target.value })}
                          className="w-full h-10 rounded-xl cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Color de trozos / partículas
                        </label>
                        <input
                          type="color"
                          value={ing.secondaryColor}
                          onChange={(e) => updateIng({ secondaryColor: e.target.value })}
                          className="w-full h-10 rounded-xl cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Textura visual
                        </label>
                        <select
                          value={ing.texture}
                          onChange={(e) => updateIng({ texture: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                        >
                          {draftConfig.textures.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Orden de capa dentro del vaso (1 = abajo, 5 = arriba)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={ing.layerOrder}
                          onChange={(e) => updateIng({ layerOrder: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Grosor en vaso: {ing.heightPercentage}%
                        </label>
                        <input
                          type="range"
                          min={8}
                          max={50}
                          value={ing.heightPercentage}
                          onChange={(e) =>
                            updateIng({ heightPercentage: Number(e.target.value) })
                          }
                          className="w-full accent-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Cantidad de trozos/partículas: {ing.particleCount}
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={18}
                          value={ing.particleCount}
                          onChange={(e) => updateIng({ particleCount: Number(e.target.value) })}
                          className="w-full accent-pink-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">
                        Descripción
                      </label>
                      <input
                        type="text"
                        value={ing.description}
                        onChange={(e) => updateIng({ description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                      />
                    </div>

                    <MediaUploader
                      label="Ilustración o foto de trozo del ingrediente (opcional)"
                      value={ing.imageUrl}
                      accept="image/*"
                      onChange={(url) => updateIng({ imageUrl: url })}
                    />

                    {/* Mini vista previa aislada del ingrediente en el vaso */}
                    <div className="p-4 rounded-2xl bg-[#FFF8F0] flex items-center justify-center">
                      <YogurtCupRenderer
                        cup={{ ...draftConfig.cup, width: 160, height: 200 }}
                        ingredients={[ing]}
                        textures={draftConfig.textures}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Gestor de Texturas Personalizadas */}
              <div className="bg-[#1E1926] p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold">
                    Biblioteca de Texturas ({draftConfig.textures.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newTex: TextureDefinition = {
                        id: `tex-${Date.now()}`,
                        name: 'Nueva Textura',
                        description: 'Textura personalizada',
                        cssPattern:
                          'radial-gradient(circle, rgba(255,255,255,0.6) 20%, transparent 25%)',
                        opacity: 0.9,
                        blur: 0,
                        overlayColor: '#FFFFFF',
                      };
                      updateDraft((prev) => ({
                        ...prev,
                        textures: [...prev.textures, newTex],
                      }));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-400 text-[#14111A] text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crear textura</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {draftConfig.textures.map((tex, idx) => (
                    <div
                      key={tex.id}
                      className="p-3 rounded-2xl bg-[#14111A] border border-white/10 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={tex.name}
                          onChange={(e) =>
                            updateDraft((prev) => {
                              const copy = [...prev.textures];
                              copy[idx] = { ...tex, name: e.target.value };
                              return { ...prev, textures: copy };
                            })
                          }
                          className="bg-transparent font-bold text-sm border-b border-white/20 focus:outline-none"
                        />
                        <span
                          className="w-8 h-8 rounded-lg border border-white/20 shrink-0"
                          style={{
                            backgroundColor: '#FF85A1',
                            backgroundImage: tex.cssPattern,
                            backgroundSize: '12px 12px',
                          }}
                        />
                      </div>
                      <label className="block text-[11px] text-gray-400">
                        Intensidad patrón: {Math.round(tex.opacity * 100)}%
                        <input
                          type="range"
                          min={0.1}
                          max={1}
                          step={0.05}
                          value={tex.opacity}
                          onChange={(e) =>
                            updateDraft((prev) => {
                              const copy = [...prev.textures];
                              copy[idx] = { ...tex, opacity: Number(e.target.value) };
                              return { ...prev, textures: copy };
                            })
                          }
                          className="w-full accent-sky-400"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: EDITOR DE PREGUNTAS Y RESPUESTAS
        =================================================================== */}
        {activeTab === 'questions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-[#1E1926] p-5 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">
                  Preguntas ({draftConfig.questions.length})
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const nextOrder = draftConfig.questions.length + 1;
                    const newQ: Question = {
                      id: `q-${Date.now()}`,
                      order: nextOrder,
                      stepLabel: `PASO 0${nextOrder}`,
                      title: 'Nueva pregunta sensorial',
                      subtitle: 'Subtítulo descriptivo',
                      layout: 'grid-2',
                      options: [
                        {
                          id: `opt-${Date.now()}-1`,
                          text: 'Opción A',
                          accentColor: '#FF85A1',
                          ingredientIds: [draftConfig.ingredients[0]?.id || ''],
                          personalityScores: {},
                        },
                        {
                          id: `opt-${Date.now()}-2`,
                          text: 'Opción B',
                          accentColor: '#7C83FD',
                          ingredientIds: [draftConfig.ingredients[1]?.id || ''],
                          personalityScores: {},
                        },
                      ],
                    };
                    updateDraft((prev) => ({
                      ...prev,
                      questions: [...prev.questions, newQ],
                    }));
                    setSelectedQuestionId(newQ.id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-pink-500 text-[#14111A] text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva pregunta</span>
                </button>
              </div>

              <div className="space-y-2">
                {[...draftConfig.questions]
                  .sort((a, b) => a.order - b.order)
                  .map((q, idx, arr) => (
                    <div
                      key={q.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-2 ${
                        selectedQuestionId === q.id
                          ? 'bg-pink-500/20 border-pink-400'
                          : 'bg-[#14111A] border-white/10'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedQuestionId(q.id)}
                        className="text-left flex-1"
                      >
                        <span className="text-[10px] font-bold text-pink-400 uppercase">
                          #{q.order} · {q.stepLabel}
                        </span>
                        <p className="font-bold text-sm line-clamp-1">{q.title}</p>
                      </button>
                      <div className="flex flex-col gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => {
                            const prevQ = arr[idx - 1];
                            updateDraft((prev) => ({
                              ...prev,
                              questions: prev.questions.map((item) => {
                                if (item.id === q.id) return { ...item, order: prevQ.order };
                                if (item.id === prevQ.id) return { ...item, order: q.order };
                                return item;
                              }),
                            }));
                          }}
                          className="p-1 rounded bg-white/10 disabled:opacity-30"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          disabled={idx === arr.length - 1}
                          onClick={() => {
                            const nextQ = arr[idx + 1];
                            updateDraft((prev) => ({
                              ...prev,
                              questions: prev.questions.map((item) => {
                                if (item.id === q.id) return { ...item, order: nextQ.order };
                                if (item.id === nextQ.id) return { ...item, order: q.order };
                                return item;
                              }),
                            }));
                          }}
                          className="p-1 rounded bg-white/10 disabled:opacity-30"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              {(() => {
                const q = draftConfig.questions.find((item) => item.id === selectedQuestionId);
                if (!q) return <p className="text-gray-400">Selecciona una pregunta.</p>;

                const updateQ = (patch: Partial<Question>) => {
                  updateDraft((prev) => ({
                    ...prev,
                    questions: prev.questions.map((item) =>
                      item.id === q.id ? { ...item, ...patch } : item
                    ),
                  }));
                };

                return (
                  <div className="bg-[#1E1926] p-6 rounded-3xl border border-white/10 space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-bold">Editar Pregunta #{q.order}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('¿Eliminar esta pregunta?')) {
                            updateDraft((prev) => ({
                              ...prev,
                              questions: prev.questions.filter((item) => item.id !== q.id),
                            }));
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar pregunta</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Etiqueta superior
                        </label>
                        <input
                          type="text"
                          value={q.stepLabel}
                          onChange={(e) => updateQ({ stepLabel: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Título de la pregunta
                        </label>
                        <input
                          type="text"
                          value={q.title}
                          onChange={(e) => updateQ({ title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">
                        Subtítulo / Instrucción
                      </label>
                      <input
                        type="text"
                        value={q.subtitle}
                        onChange={(e) => updateQ({ subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                      />
                    </div>

                    {/* Respuestas asociadas */}
                    <div className="pt-4 border-t border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-display font-bold text-base">
                          Opciones de Respuesta ({q.options.length})
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            const newOpt: AnswerOption = {
                              id: `opt-${Date.now()}`,
                              text: 'Nueva respuesta',
                              subtext: '',
                              accentColor: '#6EE7B7',
                              ingredientIds: [],
                              personalityScores: {},
                            };
                            updateQ({ options: [...q.options, newOpt] });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-400 text-[#14111A] text-xs font-bold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar respuesta</span>
                        </button>
                      </div>

                      {q.options.map((opt, optIdx) => {
                        const updateOpt = (patch: Partial<AnswerOption>) => {
                          const copy = [...q.options];
                          copy[optIdx] = { ...opt, ...patch };
                          updateQ({ options: copy });
                        };

                        return (
                          <div
                            key={opt.id}
                            className="p-4 rounded-2xl bg-[#14111A] border border-white/10 space-y-3"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={opt.accentColor}
                                onChange={(e) => updateOpt({ accentColor: e.target.value })}
                                className="w-9 h-9 rounded cursor-pointer"
                              />
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => updateOpt({ text: e.target.value })}
                                placeholder="Texto de la respuesta"
                                className="flex-1 px-3 py-2 rounded-xl bg-[#1E1926] border border-white/15 text-sm font-bold"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateQ({
                                    options: q.options.filter((o) => o.id !== opt.id),
                                  })
                                }
                                className="p-2 rounded-xl bg-red-500/20 text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <input
                              type="text"
                              value={opt.subtext || ''}
                              onChange={(e) => updateOpt({ subtext: e.target.value })}
                              placeholder="Subtexto opcional..."
                              className="w-full px-3 py-1.5 rounded-xl bg-[#1E1926] border border-white/10 text-xs"
                            />

                            {/* Asociar ingredientes que agrega al vaso */}
                            <div>
                              <span className="block text-[11px] font-bold text-gray-400 mb-1.5">
                                Ingredientes que agrega esta respuesta al vaso:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {draftConfig.ingredients.map((ing) => {
                                  const active = opt.ingredientIds.includes(ing.id);
                                  return (
                                    <button
                                      key={ing.id}
                                      type="button"
                                      onClick={() => {
                                        const nextIds = active
                                          ? opt.ingredientIds.filter((id) => id !== ing.id)
                                          : [...opt.ingredientIds, ing.id];
                                        updateOpt({ ingredientIds: nextIds });
                                      }}
                                      className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                                        active
                                          ? 'border-white text-[#14111A]'
                                          : 'bg-white/5 border-white/10 text-gray-400'
                                      }`}
                                      style={active ? { backgroundColor: ing.color } : undefined}
                                    >
                                      {active ? '✓ ' : '+ '}
                                      {ing.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Puntuación hacia personalidades */}
                            <div>
                              <span className="block text-[11px] font-bold text-gray-400 mb-1.5">
                                Puntos hacia cada personalidad:
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {draftConfig.personalities.map((pers) => (
                                  <div
                                    key={pers.id}
                                    className="flex items-center justify-between bg-[#1E1926] px-2.5 py-1.5 rounded-lg border border-white/10 text-xs"
                                  >
                                    <span className="truncate pr-1">{pers.name}</span>
                                    <input
                                      type="number"
                                      min={0}
                                      max={10}
                                      value={opt.personalityScores[pers.id] || 0}
                                      onChange={(e) =>
                                        updateOpt({
                                          personalityScores: {
                                            ...opt.personalityScores,
                                            [pers.id]: Number(e.target.value),
                                          },
                                        })
                                      }
                                      className="w-12 px-1.5 py-0.5 rounded bg-[#14111A] border border-white/15 text-center font-bold"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <MediaUploader
                              label="Imagen ilustrada opcional para esta tarjeta de respuesta"
                              value={opt.imageUrl}
                              accept="image/*"
                              onChange={(url) => updateOpt({ imageUrl: url })}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 4: MAPA VISUAL DE RUTAS Y CONEXIONES
        =================================================================== */}
        {activeTab === 'routes' && (
          <div className="bg-[#1E1926] p-6 rounded-3xl border border-white/10 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold">
                Mapa Visual de Rutas: Respuesta → Ingrediente → Personalidad
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Visualiza y ajusta rápidamente cómo cada respuesta alimenta el vaso y conduce a cada
                personalidad final.
              </p>
            </div>

            <div className="space-y-4">
              {[...draftConfig.questions]
                .sort((a, b) => a.order - b.order)
                .map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-2xl bg-[#14111A] border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-base text-pink-400">
                        {q.stepLabel}: {q.title}
                      </h3>
                      <button
                        onClick={() => {
                          setSelectedQuestionId(q.id);
                          setActiveTab('questions');
                        }}
                        className="text-xs underline text-sky-400"
                      >
                        Editar nodos
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((opt) => {
                        const ings = opt.ingredientIds
                          .map((id) => draftConfig.ingredients.find((i) => i.id === id))
                          .filter(Boolean);
                        const linkedPers = Object.entries(opt.personalityScores)
                          .filter(([, pts]) => pts > 0)
                          .map(([pid, pts]) => ({
                            pers: draftConfig.personalities.find((p) => p.id === pid),
                            pts,
                          }))
                          .filter((x) => x.pers);

                        return (
                          <div
                            key={opt.id}
                            className="p-3 rounded-xl bg-[#1E1926] border border-white/10 flex flex-col gap-2 text-xs"
                          >
                            <div className="font-bold text-white flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: opt.accentColor }}
                              />
                              <span>«{opt.text}»</span>
                            </div>

                            <div className="pl-5 border-l-2 border-dashed border-white/20 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="text-gray-400">Agrega al vaso:</span>
                                {ings.length === 0 ? (
                                  <span className="text-gray-500 italic">Ninguno</span>
                                ) : (
                                  ings.map((i) => (
                                    <span
                                      key={i!.id}
                                      style={{ backgroundColor: i!.color }}
                                      className="px-2 py-0.5 rounded-full text-[#14111A] font-bold text-[10px]"
                                    >
                                      {i!.name} ({i!.texture})
                                    </span>
                                  ))
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-1">
                                <span className="text-gray-400">Conduce a:</span>
                                {linkedPers.length === 0 ? (
                                  <span className="text-gray-500 italic">Sin puntos</span>
                                ) : (
                                  linkedPers.map(({ pers, pts }) => (
                                    <span
                                      key={pers!.id}
                                      className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold text-[10px]"
                                    >
                                      {pers!.name} (+{pts} pts)
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 5: EDITOR DE PERSONALIDADES Y RESULTADOS
        =================================================================== */}
        {activeTab === 'personalities' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-[#1E1926] p-5 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">
                  Personalidades ({draftConfig.personalities.length})
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const newP: PersonalityResult = {
                      id: `pers-${Date.now()}`,
                      name: 'Nueva Personalidad MuUua!',
                      badgeText: 'PERSONALIDAD ESPECIAL',
                      tagline: 'Subtítulo dulce y memorable',
                      description: 'Descripción completa de esta personalidad artesanal.',
                      quote: '«Una frase que resume tu esencia.»',
                      primaryColor: '#FF85A1',
                      secondaryColor: '#FFF0F5',
                      accentColor: '#FDE047',
                      texture: 'creamy',
                      characteristics: ['Característica 1', 'Característica 2'],
                      recommendedIngredientIds: [],
                      matchingRules: { priority: draftConfig.personalities.length + 1 },
                    };
                    updateDraft((prev) => ({
                      ...prev,
                      personalities: [...prev.personalities, newP],
                    }));
                    setSelectedPersonalityId(newP.id);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-pink-500 text-[#14111A] text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear</span>
                </button>
              </div>

              <div className="space-y-2">
                {draftConfig.personalities.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersonalityId(p.id)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center gap-3 ${
                      selectedPersonalityId === p.id
                        ? 'bg-pink-500/20 border-pink-400'
                        : 'bg-[#14111A] border-white/10'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full shrink-0"
                      style={{ backgroundColor: p.primaryColor }}
                    />
                    <div>
                      <p className="font-bold text-sm">{p.name}</p>
                      <p className="text-[11px] text-gray-400 line-clamp-1">{p.tagline}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8">
              {(() => {
                const pers = draftConfig.personalities.find((p) => p.id === selectedPersonalityId);
                if (!pers) return <p className="text-gray-400">Selecciona una personalidad.</p>;

                const updatePers = (patch: Partial<PersonalityResult>) => {
                  updateDraft((prev) => ({
                    ...prev,
                    personalities: prev.personalities.map((item) =>
                      item.id === pers.id ? { ...item, ...patch } : item
                    ),
                  }));
                };

                return (
                  <div className="bg-[#1E1926] p-6 rounded-3xl border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-xl font-bold">Editando: {pers.name}</h3>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`¿Eliminar "${pers.name}"?`)) {
                            updateDraft((prev) => ({
                              ...prev,
                              personalities: prev.personalities.filter((p) => p.id !== pers.id),
                            }));
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Nombre de personalidad
                        </label>
                        <input
                          type="text"
                          value={pers.name}
                          onChange={(e) => updatePers({ name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Etiqueta / Badge
                        </label>
                        <input
                          type="text"
                          value={pers.badgeText}
                          onChange={(e) => updatePers({ badgeText: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Subtítulo / Tagline
                        </label>
                        <input
                          type="text"
                          value={pers.tagline}
                          onChange={(e) => updatePers({ tagline: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Frase representativa
                        </label>
                        <input
                          type="text"
                          value={pers.quote}
                          onChange={(e) => updatePers({ quote: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">
                        Descripción
                      </label>
                      <textarea
                        rows={3}
                        value={pers.description}
                        onChange={(e) => updatePers({ description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Color principal
                        </label>
                        <input
                          type="color"
                          value={pers.primaryColor}
                          onChange={(e) => updatePers({ primaryColor: e.target.value })}
                          className="w-full h-10 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Fondo de tarjeta
                        </label>
                        <input
                          type="color"
                          value={pers.secondaryColor}
                          onChange={(e) => updatePers({ secondaryColor: e.target.value })}
                          className="w-full h-10 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-1">
                          Color acento
                        </label>
                        <input
                          type="color"
                          value={pers.accentColor}
                          onChange={(e) => updatePers({ accentColor: e.target.value })}
                          className="w-full h-10 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">
                        Características (una por línea)
                      </label>
                      <textarea
                        rows={4}
                        value={pers.characteristics.join('\n')}
                        onChange={(e) =>
                          updatePers({
                            characteristics: e.target.value
                              .split('\n')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                      />
                    </div>

                    {/* Regla de combinación exacta de ingredientes */}
                    <div className="p-4 rounded-2xl bg-[#14111A] border border-white/10 space-y-2">
                      <span className="block text-xs font-bold text-pink-400">
                        Regla de combinación exacta (Opcional):
                      </span>
                      <p className="text-[11px] text-gray-400">
                        Si marcas ingredientes aquí, cualquier usuario que los reúna todos obtendrá
                        automáticamente esta personalidad.
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {draftConfig.ingredients.map((ing) => {
                          const req = pers.matchingRules?.requiredIngredientIds || [];
                          const isChecked = req.includes(ing.id);
                          return (
                            <button
                              key={ing.id}
                              type="button"
                              onClick={() => {
                                const nextReq = isChecked
                                  ? req.filter((id) => id !== ing.id)
                                  : [...req, ing.id];
                                updatePers({
                                  matchingRules: {
                                    ...pers.matchingRules,
                                    requiredIngredientIds: nextReq,
                                  },
                                });
                              }}
                              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                isChecked
                                  ? 'bg-pink-500 text-[#14111A] border-pink-400'
                                  : 'bg-white/5 border-white/10 text-gray-400'
                              }`}
                            >
                              {isChecked ? '✓ ' : '+ '}
                              {ing.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <MediaUploader
                      label="Ilustración personalizada del resultado (opcional — si se deja vacío muestra el vaso armado del usuario)"
                      value={pers.customImageUrl}
                      accept="image/*"
                      onChange={(url) => updatePers({ customImageUrl: url })}
                    />
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 6: EDITOR DE ANIMACIONES Y VIDEOS DE PREPARACIÓN
        =================================================================== */}
        {activeTab === 'animations' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#1E1926] p-6 rounded-3xl border border-white/10 space-y-5">
              <h2 className="font-display text-xl font-bold">
                Pantalla 4: Preparación y Mezcla del Yogurt
              </h2>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Tipo de contenido visual en la mezcla
                </label>
                <select
                  value={draftConfig.mixing.mediaType}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      mixing: { ...prev.mixing, mediaType: e.target.value as any },
                    }))
                  }
                  className="w-full px-3 py-2.5 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                >
                  <option value="procedural-animation">
                    Animación interactiva del vaso girando y mezclando capas
                  </option>
                  <option value="video">Video MP4 / WebM personalizado</option>
                  <option value="gif">GIF animado personalizado</option>
                </select>
              </div>

              {draftConfig.mixing.mediaType !== 'procedural-animation' && (
                <MediaUploader
                  label="Archivo de Video o GIF de preparación"
                  value={draftConfig.mixing.mediaUrl}
                  accept={draftConfig.mixing.mediaType === 'video' ? 'video/*' : 'image/gif,image/*'}
                  onChange={(url) =>
                    updateDraft((prev) => ({
                      ...prev,
                      mixing: { ...prev.mixing, mediaUrl: url },
                    }))
                  }
                />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Duración de la transición: {(draftConfig.mixing.durationMs / 1000).toFixed(1)}s
                  </label>
                  <input
                    type="range"
                    min={1500}
                    max={10000}
                    step={500}
                    value={draftConfig.mixing.durationMs}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        mixing: { ...prev.mixing, durationMs: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Color de fondo pantalla mezcla
                  </label>
                  <input
                    type="color"
                    value={draftConfig.mixing.backgroundColor}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        mixing: { ...prev.mixing, backgroundColor: e.target.value },
                      }))
                    }
                    className="w-full h-10 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  Mensajes secuenciales durante la mezcla (uno por línea)
                </label>
                <textarea
                  rows={4}
                  value={draftConfig.mixing.loadingMessages.join('\n')}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      mixing: {
                        ...prev.mixing,
                        loadingMessages: e.target.value
                          .split('\n')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                />
              </div>
            </div>

            <div className="lg:col-span-5">
              <div
                className="p-8 rounded-3xl border border-white/15 flex flex-col items-center justify-center min-h-[380px] text-center space-y-4"
                style={{ backgroundColor: draftConfig.mixing.backgroundColor }}
              >
                <span className="px-3 py-1 rounded-full bg-[#14111A] text-white text-xs font-bold">
                  Vista previa de mezcla
                </span>
                {draftConfig.mixing.mediaType === 'video' && draftConfig.mixing.mediaUrl ? (
                  <video
                    src={draftConfig.mixing.mediaUrl}
                    autoPlay
                    loop
                    muted
                    className="max-h-60 rounded-2xl border-2 border-[#2B1E2E]"
                  />
                ) : draftConfig.mixing.mediaType === 'gif' && draftConfig.mixing.mediaUrl ? (
                  <img
                    src={draftConfig.mixing.mediaUrl}
                    alt="GIF mezcla"
                    className="max-h-60 rounded-2xl border-2 border-[#2B1E2E]"
                  />
                ) : (
                  <YogurtCupRenderer
                    cup={draftConfig.cup}
                    ingredients={draftConfig.ingredients.slice(0, 4)}
                    textures={draftConfig.textures}
                    isMixing={true}
                  />
                )}
                <p className="font-display font-bold text-lg text-[#2B1E2E]">
                  {draftConfig.mixing.loadingMessages[0]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 7: DISEÑO GLOBAL, PALETAS, TIPOGRAFÍAS Y TEXTOS
        =================================================================== */}
        {activeTab === 'design' && (
          <div className="bg-[#1E1926] p-6 rounded-3xl border border-white/10 space-y-6">
            <h2 className="font-display text-xl font-bold">
              Identidad Visual, Colores, Tipografías y Textos de Bienvenida
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-pink-400 uppercase">Textos y Marca</h3>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Nombre de marca
                  </label>
                  <input
                    type="text"
                    value={draftConfig.theme.brandName}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, brandName: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                  />
                </div>
                <MediaUploader
                  label="Logo personalizado de MuUua! (PNG/SVG)"
                  value={draftConfig.theme.brandLogoUrl}
                  accept="image/*"
                  onChange={(url) =>
                    updateDraft((prev) => ({
                      ...prev,
                      theme: { ...prev.theme, brandLogoUrl: url },
                    }))
                  }
                />
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Título principal (Pantalla 1)
                  </label>
                  <input
                    type="text"
                    value={draftConfig.theme.welcomeTitle}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, welcomeTitle: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Introducción al test
                  </label>
                  <textarea
                    rows={3}
                    value={draftConfig.theme.welcomeSubtitle}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, welcomeSubtitle: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Texto del botón Comenzar
                  </label>
                  <input
                    type="text"
                    value={draftConfig.theme.startButtonText}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, startButtonText: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm text-sky-400 uppercase">
                  Paleta Pastel, Fuentes y Bordes
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      Color Primario
                    </label>
                    <input
                      type="color"
                      value={draftConfig.theme.primaryColor}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, primaryColor: e.target.value },
                        }))
                      }
                      className="w-full h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      Color Secundario
                    </label>
                    <input
                      type="color"
                      value={draftConfig.theme.secondaryColor}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, secondaryColor: e.target.value },
                        }))
                      }
                      className="w-full h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      Color Acento
                    </label>
                    <input
                      type="color"
                      value={draftConfig.theme.accentColor}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, accentColor: e.target.value },
                        }))
                      }
                      className="w-full h-10 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">
                      Fondo Base
                    </label>
                    <input
                      type="color"
                      value={draftConfig.theme.backgroundColor}
                      onChange={(e) =>
                        updateDraft((prev) => ({
                          ...prev,
                          theme: {
                            ...prev.theme,
                            backgroundColor: e.target.value,
                            backgroundGradient: e.target.value,
                          },
                        }))
                      }
                      className="w-full h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Tipografía de títulos
                  </label>
                  <select
                    value={draftConfig.theme.fontDisplay}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, fontDisplay: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                  >
                    <option value="Fredoka">Fredoka (Artesanal redondeada)</option>
                    <option value="Playfair Display">Playfair Display (Editorial)</option>
                    <option value="Courier Prime">Courier Prime (Retro Web 1.0)</option>
                    <option value="Space Mono">Space Mono (Pixel / Tech)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Redondez de tarjetas: {draftConfig.theme.borderRadius}px
                  </label>
                  <input
                    type="range"
                    min={8}
                    max={44}
                    value={draftConfig.theme.borderRadius}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, borderRadius: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">
                    Estilo de sombras
                  </label>
                  <select
                    value={draftConfig.theme.shadowStrength}
                    onChange={(e) =>
                      updateDraft((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, shadowStrength: e.target.value as any },
                      }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-[#14111A] border border-white/15 text-sm"
                  >
                    <option value="retro-hard">Retro Pop (Borde marcado)</option>
                    <option value="playful">Suave Pastel</option>
                    <option value="soft">Minimalista</option>
                    <option value="none">Sin sombra</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 8: HISTORIAL Y RECUPERACIÓN DE VERSIONES ANTERIORES
        =================================================================== */}
        {activeTab === 'versions' && (
          <div className="bg-[#1E1926] p-6 rounded-3xl border border-white/10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold">
                  Historial de Versiones Publicadas
                </h2>
                <p className="text-xs text-gray-400">
                  Restaura cualquier punto anterior si deseas revertir un experimento.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      '¿Restaurar toda la experiencia a los valores iniciales de fábrica de MuUua!?'
                    )
                  ) {
                    resetToFactoryDefault();
                    notify('Valores iniciales cargados en el borrador.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold"
              >
                Restaurar plantilla original de fábrica
              </button>
            </div>

            {versions.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">
                Aún no hay publicaciones registradas. Pulsa «Publicar en vivo» para crear tu primer
                punto de guardado histórico.
              </p>
            ) : (
              <div className="space-y-3">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-2xl bg-[#14111A] border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-bold text-sm">{v.label}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(v.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        restoreVersion(v);
                        notify('Versión cargada en el borrador. Revisa y pulsa Publicar.');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Cargar esta versión</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
