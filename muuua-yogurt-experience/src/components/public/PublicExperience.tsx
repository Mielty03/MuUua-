import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RefreshCw,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useExperience } from '../../context/ExperienceContext';
import { calculateYogurtOutcome } from '../../services/quizEngine';
import { AnswerOption, ExperienceConfig } from '../../types/experience';
import { BrandLogo } from '../yogurt/BrandLogo';
import { YogurtCupRenderer } from '../yogurt/YogurtCupRenderer';

type ScreenStep = 'welcome' | 'quiz' | 'mixing' | 'result';

interface PublicExperienceProps {
  /** Permite pasar el borrador cuando se usa en modo vista previa desde el panel admin */
  overrideConfig?: ExperienceConfig;
  isPreviewMode?: boolean;
}

export const PublicExperience: React.FC<PublicExperienceProps> = ({
  overrideConfig,
  isPreviewMode = false,
}) => {
  const { publishedConfig, loading } = useExperience();
  const config = overrideConfig || publishedConfig;

  const [step, setStep] = useState<ScreenStep>('welcome');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerOption>>({});
  const [mixProgress, setMixProgress] = useState(0);
  const [mixMsgIndex, setMixMsgIndex] = useState(0);
  const [shareFeedback, setShareFeedback] = useState(false);

  const sortedQuestions = useMemo(
    () => [...config.questions].sort((a, b) => a.order - b.order),
    [config.questions]
  );

  // Ingredientes acumulados en tiempo real a medida que responde
  const liveIngredients = useMemo(() => {
    const ids = new Set<string>();
    Object.values(answers).forEach((opt) => {
      opt.ingredientIds.forEach((id) => ids.add(id));
    });
    return Array.from(ids)
      .map((id) => config.ingredients.find((i) => i.id === id))
      .filter((i): i is NonNullable<typeof i> => Boolean(i));
  }, [answers, config.ingredients]);

  // Resultado calculado al completar el test
  const outcome = useMemo(
    () => calculateYogurtOutcome(config, answers),
    [config, answers]
  );

  // Control de animación de la Pantalla 4: Preparación y Mezcla
  useEffect(() => {
    if (step !== 'mixing') return;

    const totalMs = Math.max(1500, config.mixing.durationMs || 4000);
    const intervalMs = 80;
    const increment = (intervalMs / totalMs) * 100;
    setMixProgress(0);
    setMixMsgIndex(0);

    const timer = setInterval(() => {
      setMixProgress((prev) => {
        const next = prev + increment;
        const msgs = config.mixing.loadingMessages;
        if (msgs.length > 0) {
          const idx = Math.min(msgs.length - 1, Math.floor((next / 100) * msgs.length));
          setMixMsgIndex(idx);
        }
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setStep('result'), 250);
          return 100;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [step, config.mixing]);

  if (loading && !overrideConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="animate-bounce font-display text-2xl text-[#2B1E2E]">
          Preparando la cocina artesanal de MuUua!...
        </div>
      </div>
    );
  }

  const theme = config.theme;

  const getButtonRadius = () => {
    if (theme.buttonStyle === 'pill') return '9999px';
    if (theme.buttonStyle === 'retro-box') return '10px';
    return `${Math.min(theme.borderRadius, 20)}px`;
  };

  const getCardShadow = () => {
    switch (theme.shadowStrength) {
      case 'none':
        return 'none';
      case 'soft':
        return '0 12px 30px -10px rgba(43, 30, 46, 0.12)';
      case 'playful':
        return '0 16px 35px -8px rgba(255, 107, 157, 0.25)';
      case 'retro-hard':
      default:
        return '6px 6px 0px #2B1E2E';
    }
  };

  const handleSelectOption = (questionId: string, option: AnswerOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < sortedQuestions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setStep('mixing');
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentQuestionIdx(0);
    setStep('welcome');
  };

  const handleShare = async () => {
    const text = `¡Mi personalidad en ${theme.brandName} es "${outcome.personality.name}"! ${outcome.personality.quote}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${theme.brandName} Test`, text, url: window.location.href });
        return;
      } catch {
        // fallback clipboard
      }
    }
    await navigator.clipboard.writeText(`${text} ${window.location.href}`);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2600);
  };

  // Tinte dinámico de fondo según la última respuesta elegida
  const currentQuestion = sortedQuestions[currentQuestionIdx];
  const currentSelectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;
  const dynamicBg =
    step === 'quiz' && currentSelectedOption?.visualOverrides?.backgroundTint
      ? currentSelectedOption.visualOverrides.backgroundTint
      : undefined;

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden flex flex-col justify-between transition-colors duration-700"
      style={{
        background: dynamicBg || theme.backgroundGradient || theme.backgroundColor,
        color: theme.textColor,
      }}
    >
      {/* Blobs orgánicos decorativos */}
      {theme.decorativeFloatingBlobs && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div
            className="absolute -top-24 -left-20 w-80 h-80 rounded-full opacity-35 blur-3xl animate-blob"
            style={{ backgroundColor: theme.primaryColor }}
          />
          <div
            className="absolute top-1/3 -right-24 w-96 h-96 rounded-full opacity-35 blur-3xl animate-blob"
            style={{ backgroundColor: theme.secondaryColor, animationDelay: '2s' }}
          />
          <div
            className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full opacity-40 blur-3xl animate-blob"
            style={{ backgroundColor: theme.accentColor, animationDelay: '4s' }}
          />
        </div>
      )}

      {/* Barra superior minimalista */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-5 pt-6 pb-2 flex items-center justify-between">
        <button
          onClick={handleRestart}
          className="focus:outline-none"
          title="Volver al inicio"
        >
          <BrandLogo
            logoUrl={theme.brandLogoUrl}
            brandName={theme.brandName}
            primaryColor={theme.primaryColor}
            accentColor={theme.accentColor}
            size="sm"
          />
        </button>

        {step === 'quiz' && sortedQuestions.length > 0 && (
          <div className="flex items-center gap-3 bg-white/85 backdrop-blur px-4 py-2 rounded-full border-2 border-[#2B1E2E] shadow-[3px_3px_0px_#2B1E2E]">
            <span className="text-xs font-bold tracking-wider uppercase">
              Pregunta {currentQuestionIdx + 1} / {sortedQuestions.length}
            </span>
            <div className="w-24 sm:w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden border border-[#2B1E2E]">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${((currentQuestionIdx + 1) / sortedQuestions.length) * 100}%`,
                  backgroundColor: theme.primaryColor,
                }}
              />
            </div>
          </div>
        )}

        {isPreviewMode && (
          <span className="px-3 py-1 rounded-full bg-amber-300 border-2 border-[#2B1E2E] text-xs font-bold">
            MODO VISTA PREVIA
          </span>
        )}
      </header>

      {/* CONTENIDO PRINCIPAL POR PANTALLA */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6">
        {/* ============================================================
            PANTALLA 1: BIENVENIDA
        ============================================================ */}
        {step === 'welcome' && (
          <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-[#2B1E2E] text-xs font-bold tracking-widest uppercase shadow-[3px_3px_0px_#2B1E2E]"
                style={{ backgroundColor: theme.accentColor }}
              >
                <Sparkles className="w-4 h-4" />
                <span>{theme.welcomeBadge}</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08]">
                {theme.welcomeTitle}
              </h1>

              <p className="text-base sm:text-lg md:text-xl opacity-85 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                {theme.welcomeSubtitle}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => {
                    if (sortedQuestions.length > 0) {
                      setCurrentQuestionIdx(0);
                      setStep('quiz');
                    }
                  }}
                  style={{
                    backgroundColor: theme.primaryColor,
                    borderRadius: getButtonRadius(),
                    boxShadow: '5px 5px 0px #2B1E2E',
                  }}
                  className="px-8 py-4 border-[3px] border-[#2B1E2E] font-display font-bold text-lg sm:text-xl text-[#2B1E2E] flex items-center gap-3 transition-transform hover:-translate-y-1 active:translate-y-0"
                >
                  <span>{theme.startButtonText}</span>
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Ilustración de bienvenida o vaso muestra */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                className="p-6 border-[3px] border-[#2B1E2E] relative"
                style={{
                  backgroundColor: theme.cardBackgroundColor,
                  borderRadius: `${theme.borderRadius}px`,
                  boxShadow: getCardShadow(),
                }}
              >
                {theme.welcomeHeroImageUrl ? (
                  <img
                    src={theme.welcomeHeroImageUrl}
                    alt="MuUua! Yogurt Artesanal"
                    className="w-64 h-72 object-contain mx-auto animate-float"
                  />
                ) : (
                  <YogurtCupRenderer
                    cup={config.cup}
                    ingredients={config.ingredients.slice(0, 4)}
                    textures={config.textures}
                    className="animate-float"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            PANTALLAS 2 & 3: TEST + CONSTRUCCIÓN PROGRESIVA DEL VASO
        ============================================================ */}
        {step === 'quiz' && currentQuestion && (
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Columna Izquierda/Superior: Vaso que se llena en vivo */}
            <div className="lg:col-span-5 flex flex-col items-center order-2 lg:order-1">
              <div
                className="w-full max-w-sm p-6 border-[3px] border-[#2B1E2E] flex flex-col items-center"
                style={{
                  backgroundColor: theme.cardBackgroundColor,
                  borderRadius: `${theme.borderRadius}px`,
                  boxShadow: getCardShadow(),
                }}
              >
                <span className="text-xs font-bold uppercase tracking-widest opacity-65 mb-2">
                  Tu mezcla en vivo
                </span>

                <YogurtCupRenderer
                  cup={config.cup}
                  ingredients={liveIngredients}
                  textures={config.textures}
                />

                {/* Chips de ingredientes añadidos */}
                <div className="mt-4 w-full">
                  <p className="text-xs font-bold text-center opacity-70 mb-2">
                    Ingredientes en tu vaso ({liveIngredients.length}):
                  </p>
                  <div className="flex flex-wrap justify-center gap-1.5 min-h-[28px]">
                    {liveIngredients.length === 0 ? (
                      <span className="text-xs italic opacity-50">Aún sin ingredientes...</span>
                    ) : (
                      liveIngredients.map((ing) => (
                        <span
                          key={ing.id}
                          style={{ backgroundColor: ing.color }}
                          className="px-2.5 py-0.5 rounded-full border border-[#2B1E2E] text-[11px] font-bold text-[#2B1E2E]"
                        >
                          {ing.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Pregunta actual y tarjetas de respuesta */}
            <div className="lg:col-span-7 space-y-5 order-1 lg:order-2">
              <div
                className="p-6 sm:p-8 border-[3px] border-[#2B1E2E]"
                style={{
                  backgroundColor: theme.cardBackgroundColor,
                  borderRadius: `${theme.borderRadius}px`,
                  boxShadow: getCardShadow(),
                }}
              >
                <span
                  className="inline-block px-3 py-1 rounded-full border-2 border-[#2B1E2E] text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ backgroundColor: theme.accentColor }}
                >
                  {currentQuestion.stepLabel}
                </span>

                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                  {currentQuestion.title}
                </h2>
                {currentQuestion.subtitle && (
                  <p className="text-sm sm:text-base opacity-75 mt-1 font-medium">
                    {currentQuestion.subtitle}
                  </p>
                )}

                {/* Opciones de respuesta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = currentSelectedOption?.id === opt.id;
                    const optIngredients = opt.ingredientIds
                      .map((id) => config.ingredients.find((i) => i.id === id))
                      .filter(Boolean);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(currentQuestion.id, opt)}
                        style={{
                          borderRadius: `${Math.max(14, theme.borderRadius - 8)}px`,
                          backgroundColor: isSelected ? `${opt.accentColor}33` : '#FFFFFF',
                          borderColor: '#2B1E2E',
                          boxShadow: isSelected ? `4px 4px 0px #2B1E2E` : '2px 2px 0px #2B1E2E',
                        }}
                        className={`text-left p-4 border-[2.5px] transition-all flex flex-col justify-between gap-3 ${
                          isSelected ? '-translate-y-0.5' : 'hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            {opt.imageUrl ? (
                              <img
                                src={opt.imageUrl}
                                alt={opt.text}
                                className="w-11 h-11 rounded-xl object-cover border border-[#2B1E2E] shrink-0"
                              />
                            ) : (
                              <span
                                className="w-5 h-5 rounded-full border-2 border-[#2B1E2E] shrink-0 mt-0.5"
                                style={{ backgroundColor: opt.accentColor }}
                              />
                            )}
                            <span className="font-display font-semibold text-base leading-snug">
                              {opt.text}
                            </span>
                          </div>
                          {isSelected && (
                            <span
                              className="w-6 h-6 rounded-full border-2 border-[#2B1E2E] flex items-center justify-center shrink-0"
                              style={{ backgroundColor: opt.accentColor }}
                            >
                              <Check className="w-3.5 h-3.5 text-[#2B1E2E]" />
                            </span>
                          )}
                        </div>

                        {opt.subtext && (
                          <p className="text-xs opacity-75 leading-relaxed">{opt.subtext}</p>
                        )}

                        {optIngredients.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1 border-t border-black/10">
                            {optIngredients.map((ing) => (
                              <span
                                key={ing!.id}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/5"
                              >
                                + {ing!.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Navegación del cuestionario */}
                <div className="mt-7 pt-4 border-t-2 border-dashed border-black/15 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentQuestionIdx > 0) {
                        setCurrentQuestionIdx((prev) => prev - 1);
                      } else {
                        setStep('welcome');
                      }
                    }}
                    className="px-4 py-2.5 rounded-full border-2 border-[#2B1E2E] font-bold text-sm flex items-center gap-2 bg-white hover:bg-gray-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <button
                    type="button"
                    disabled={!currentSelectedOption}
                    onClick={handleNext}
                    style={{
                      backgroundColor: currentSelectedOption ? theme.primaryColor : '#E5E7EB',
                      borderRadius: getButtonRadius(),
                    }}
                    className="px-7 py-3 border-[2.5px] border-[#2B1E2E] font-display font-bold text-base flex items-center gap-2 shadow-[4px_4px_0px_#2B1E2E] disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    <span>
                      {currentQuestionIdx === sortedQuestions.length - 1
                        ? '¡Mezclar mi yogurt!'
                        : 'Siguiente'}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            PANTALLA 4: PREPARACIÓN Y MEZCLA (Configurable desde Admin)
        ============================================================ */}
        {step === 'mixing' && (
          <div
            className="w-full max-w-2xl p-8 border-[3px] border-[#2B1E2E] text-center space-y-6"
            style={{
              backgroundColor: config.mixing.backgroundColor || theme.cardBackgroundColor,
              borderRadius: `${theme.borderRadius}px`,
              boxShadow: getCardShadow(),
            }}
          >
            <span
              className="inline-block px-4 py-1 rounded-full border-2 border-[#2B1E2E] text-xs font-bold uppercase tracking-widest"
              style={{ backgroundColor: theme.accentColor }}
            >
              Preparando tu fórmula artesanal
            </span>

            {/* Contenido visual configurable: Video, GIF o Animación Procedural del Vaso */}
            <div className="flex justify-center items-center py-2">
              {config.mixing.mediaType === 'video' && config.mixing.mediaUrl ? (
                <video
                  src={config.mixing.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full max-h-80 rounded-2xl border-[3px] border-[#2B1E2E] object-cover"
                />
              ) : config.mixing.mediaType === 'gif' && config.mixing.mediaUrl ? (
                <img
                  src={config.mixing.mediaUrl}
                  alt="Mezclando yogurt"
                  className="w-full max-h-80 rounded-2xl border-[3px] border-[#2B1E2E] object-contain bg-white"
                />
              ) : (
                <YogurtCupRenderer
                  cup={config.cup}
                  ingredients={outcome.accumulatedIngredients}
                  textures={config.textures}
                  isMixing={true}
                  swirlIntensity={config.mixing.swirlIntensity}
                />
              )}
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold animate-pulse">
              {config.mixing.loadingMessages[mixMsgIndex] || 'Mezclando tus ingredientes...'}
            </h2>

            {config.mixing.showProgressBar && (
              <div className="w-full max-w-md mx-auto h-5 bg-white rounded-full border-[2.5px] border-[#2B1E2E] overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${Math.min(100, mixProgress)}%`,
                    backgroundColor: config.mixing.accentColor || theme.primaryColor,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            PANTALLA 5: RESULTADO FINAL DE PERSONALIDAD
        ============================================================ */}
        {step === 'result' && outcome.personality && (
          <div className="w-full max-w-5xl">
            <div
              className="p-6 sm:p-10 border-[3px] border-[#2B1E2E] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              style={{
                backgroundColor: outcome.personality.secondaryColor || theme.cardBackgroundColor,
                borderRadius: `${theme.borderRadius}px`,
                boxShadow: getCardShadow(),
              }}
            >
              {/* Ilustración del yogurt final o imagen de personalidad */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="p-6 bg-white rounded-3xl border-[3px] border-[#2B1E2E] shadow-[5px_5px_0px_#2B1E2E] flex flex-col items-center">
                  {outcome.personality.customImageUrl ? (
                    <img
                      src={outcome.personality.customImageUrl}
                      alt={outcome.personality.name}
                      className="w-60 h-72 object-contain animate-float"
                    />
                  ) : (
                    <YogurtCupRenderer
                      cup={config.cup}
                      ingredients={outcome.accumulatedIngredients}
                      textures={config.textures}
                      className="animate-float"
                    />
                  )}
                </div>

                {/* Lista de ingredientes que representan al usuario */}
                <div className="mt-5 w-full text-center">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                    Tu mezcla personalizada lleva:
                  </span>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {outcome.accumulatedIngredients.map((ing) => (
                      <span
                        key={ing.id}
                        style={{ backgroundColor: ing.color }}
                        className="px-3 py-1 rounded-full border-2 border-[#2B1E2E] text-xs font-bold text-[#2B1E2E]"
                      >
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ficha narrativa de personalidad */}
              <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
                <div
                  className="inline-block px-4 py-1.5 rounded-full border-2 border-[#2B1E2E] text-xs font-bold uppercase tracking-widest"
                  style={{ backgroundColor: outcome.personality.accentColor }}
                >
                  {outcome.personality.badgeText || 'TU RESULTADO MuUua!'}
                </div>

                <div>
                  <h2 className="font-display text-4xl sm:text-5xl font-bold">
                    {outcome.personality.name}
                  </h2>
                  <p className="font-display text-lg sm:text-xl font-medium opacity-80 mt-1">
                    {outcome.personality.tagline}
                  </p>
                </div>

                <p className="text-base sm:text-lg leading-relaxed bg-white/80 p-4 rounded-2xl border-2 border-[#2B1E2E]">
                  {outcome.personality.description}
                </p>

                {/* Frase representativa */}
                <blockquote
                  className="p-4 rounded-2xl border-2 border-[#2B1E2E] font-display italic text-lg font-semibold"
                  style={{ backgroundColor: `${outcome.personality.primaryColor}35` }}
                >
                  {outcome.personality.quote}
                </blockquote>

                {/* Características principales */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2.5">
                    Características principales:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {outcome.personality.characteristics.map((trait, idx) => (
                      <div
                        key={idx}
                        className="px-3.5 py-2 rounded-xl bg-white border-2 border-[#2B1E2E] text-sm font-bold flex items-center gap-2"
                      >
                        <span
                          className="w-3 h-3 rounded-full border border-[#2B1E2E] shrink-0"
                          style={{ backgroundColor: outcome.personality.primaryColor }}
                        />
                        <span>{trait}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <button
                    type="button"
                    onClick={handleRestart}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: getButtonRadius(),
                    }}
                    className="px-6 py-3.5 border-[2.5px] border-[#2B1E2E] font-display font-bold text-base flex items-center gap-2 shadow-[4px_4px_0px_#2B1E2E] hover:-translate-y-0.5 transition-transform"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>{theme.retakeButtonText}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    style={{
                      backgroundColor: outcome.personality.primaryColor,
                      borderRadius: getButtonRadius(),
                    }}
                    className="px-6 py-3.5 border-[2.5px] border-[#2B1E2E] font-display font-bold text-base flex items-center gap-2 shadow-[4px_4px_0px_#2B1E2E] hover:-translate-y-0.5 transition-transform"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>{shareFeedback ? '¡Copiado para compartir!' : theme.shareButtonText}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pie de página limpio sin ningún enlace ni rastro administrativo */}
      <footer className="relative z-10 py-4 text-center text-xs font-semibold opacity-60">
        {theme.brandName} · Yogurt Artesanal &amp; Personalidad
      </footer>
    </div>
  );
};
