import React from 'react';
import { CupSettings, Ingredient, TextureDefinition } from '../../types/experience';

interface YogurtCupRendererProps {
  cup: CupSettings;
  ingredients: Ingredient[];
  textures: TextureDefinition[];
  isMixing?: boolean;
  swirlIntensity?: number;
  className?: string;
}

/**
 * Componente ilustrador dinámico del vaso de yogurt MuUua!.
 * Renderiza capas orgánicas onduladas, texturas configurables, partículas de fruta/toppings,
 * cuchara artesanal, etiqueta y stickers personalizables en tiempo real.
 */
export const YogurtCupRenderer: React.FC<YogurtCupRendererProps> = ({
  cup,
  ingredients,
  textures,
  isMixing = false,
  swirlIntensity = 6,
  className = '',
}) => {
  const orderedIngredients = [...ingredients].sort((a, b) => a.layerOrder - b.layerOrder);

  // Calcular porcentaje total acumulado para escalar suavemente dentro del vaso
  const rawTotalHeight = orderedIngredients.reduce((acc, item) => acc + item.heightPercentage, 0);
  const scaleFactor = rawTotalHeight > 92 ? 92 / rawTotalHeight : 1;

  const getCupClipRadius = () => {
    switch (cup.shape) {
      case 'tall-parfait':
        return '18px 18px 46px 46px';
      case 'artisan-tub':
        return '14px 14px 24px 24px';
      case 'retro-cup':
        return '8px 8px 34px 34px';
      case 'classic-jar':
      default:
        return '28px 28px 44px 44px';
    }
  };

  const renderParticleShape = (ing: Ingredient, idx: number) => {
    const left = ((idx * 37 + 13) % 76) + 12;
    const top = ((idx * 29 + 17) % 64) + 18;
    const size = ing.particleSize || 10;

    if (ing.imageUrl) {
      return (
        <img
          key={idx}
          src={ing.imageUrl}
          alt={ing.name}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size * 1.8}px`,
            height: `${size * 1.8}px`,
          }}
          className="absolute object-contain pointer-events-none drop-shadow-sm animate-float"
        />
      );
    }

    switch (ing.floatingIcon) {
      case 'strawberry':
        return (
          <svg
            key={idx}
            viewBox="0 0 24 24"
            style={{ left: `${left}%`, top: `${top}%`, width: size + 4, height: size + 4 }}
            className="absolute pointer-events-none"
          >
            <path
              d="M12 21 C7 17, 4 12, 6 7 C8 4, 16 4, 18 7 C20 12, 17 17, 12 21 Z"
              fill={ing.secondaryColor || '#E11D48'}
            />
            <path d="M8 6 L12 3 L16 6" fill="#22C55E" />
            <circle cx="10" cy="11" r="0.8" fill="#FEF08A" />
            <circle cx="14" cy="12" r="0.8" fill="#FEF08A" />
            <circle cx="12" cy="15" r="0.8" fill="#FEF08A" />
          </svg>
        );
      case 'blueberry':
        return (
          <div
            key={idx}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              backgroundColor: ing.secondaryColor || '#3730A3',
            }}
            className="absolute rounded-full border border-white/40 shadow-inner pointer-events-none"
          />
        );
      case 'grain':
        return (
          <div
            key={idx}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size * 1.2,
              height: size * 0.7,
              backgroundColor: ing.secondaryColor || '#92400E',
              transform: `rotate(${idx * 45}deg)`,
            }}
            className="absolute rounded-sm opacity-85 pointer-events-none"
          />
        );
      default:
        return (
          <div
            key={idx}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size * 0.85,
              height: size * 0.85,
              backgroundColor: ing.secondaryColor || '#FFFFFF',
            }}
            className="absolute rounded-full opacity-60 pointer-events-none"
          />
        );
    }
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{
        width: `${cup.width + 60}px`,
        height: `${cup.height + 75}px`,
      }}
    >
      {/* Cuchara artesanal sobresaliendo por arriba */}
      {cup.showSpoon && (
        <div
          className="absolute top-1 right-12 z-0 transition-transform duration-500"
          style={{
            transform: isMixing
              ? `rotate(${18 + swirlIntensity}deg) translateY(8px)`
              : 'rotate(16deg)',
          }}
        >
          <div
            className="w-5 h-32 rounded-t-full border-[3px]"
            style={{
              backgroundColor: cup.spoonColor,
              borderColor: cup.borderColor,
            }}
          />
        </div>
      )}

      {/* Borde superior del frasco/vaso */}
      <div
        className="relative z-20 -mb-2 shadow-sm"
        style={{
          width: `${cup.width + 14}px`,
          height: cup.rimStyle === 'flat' ? '14px' : '20px',
          backgroundColor: '#FFFFFF',
          border: `${cup.borderWidth}px solid ${cup.borderColor}`,
          borderRadius: cup.rimStyle === 'rounded' ? '9999px' : '8px',
        }}
      />

      {/* Cuerpo principal del vaso de cristal / envase */}
      <div
        className={`relative z-10 overflow-hidden flex flex-col-reverse transition-all duration-500 ${
          isMixing ? 'animate-swirl' : ''
        }`}
        style={{
          width: `${cup.width}px`,
          height: `${cup.height}px`,
          borderRadius: getCupClipRadius(),
          border: `${cup.borderWidth}px solid ${cup.borderColor}`,
          backgroundColor: cup.glassColor,
          boxShadow: '0 14px 28px -8px rgba(43, 30, 46, 0.18)',
        }}
      >
        {/* Fondo translúcido del vidrio */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: cup.glassColor, opacity: cup.glassOpacity }}
        />

        {/* Mensaje cuando aún está vacío */}
        {orderedIngredients.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center opacity-50">
            <span className="text-xs font-bold uppercase tracking-widest">Vaso Listo</span>
            <span className="text-xs mt-1">Elige tu primera respuesta para comenzar la mezcla</span>
          </div>
        )}

        {/* Capas apiladas de ingredientes */}
        {orderedIngredients.map((ing, layerIndex) => {
          const texDef = textures.find((t) => t.id === ing.texture);
          const effectiveHeight = Math.max(10, ing.heightPercentage * scaleFactor);

          return (
            <div
              key={`${ing.id}-${layerIndex}`}
              className={`relative w-full transition-all duration-700 ease-out animate-pour ${
                isMixing ? 'blur-[1px] scale-105' : ''
              }`}
              style={{
                height: `${effectiveHeight}%`,
                backgroundColor: ing.color,
                opacity: ing.opacity,
                borderTop: '2px solid rgba(255,255,255,0.45)',
              }}
            >
              {/* Patrón de textura configurado */}
              {texDef && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: texDef.cssPattern,
                    backgroundSize:
                      ing.texture === 'crunchy'
                        ? '14px 14px'
                        : ing.texture === 'foamy'
                        ? '10px 10px'
                        : '22px 22px',
                    opacity: texDef.opacity,
                    filter: texDef.blur ? `blur(${texDef.blur}px)` : undefined,
                  }}
                />
              )}

              {/* Onda superior orgánica entre capas */}
              <svg
                viewBox="0 0 200 18"
                preserveAspectRatio="none"
                className="absolute -top-3 left-0 w-full h-3.5 pointer-events-none"
              >
                <path
                  d="M0,18 L0,9 Q25,0 50,9 T100,9 T150,9 T200,9 L200,18 Z"
                  fill={ing.color}
                />
              </svg>

              {/* Partículas ilustradas o imágenes subidas del ingrediente */}
              {Array.from({ length: Math.min(ing.particleCount || 0, 18) }).map((_, pIdx) =>
                renderParticleShape(ing, pIdx)
              )}
            </div>
          );
        })}

        {/* Efecto remolino cuando está en pantalla de mezcla */}
        {isMixing && (
          <div
            className="absolute inset-0 z-30 pointer-events-none animate-spin"
            style={{
              animationDuration: '1.8s',
              background:
                'conic-gradient(from 0deg, rgba(255,255,255,0.45), transparent 40%, rgba(255,107,157,0.35), transparent 85%)',
            }}
          />
        )}

        {/* Etiqueta central de marca MuUua! */}
        {cup.showLabel && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 px-3.5 py-1.5 rounded-2xl border-2 text-center shadow-sm pointer-events-none"
            style={{
              backgroundColor: cup.labelBgColor,
              color: cup.labelTextColor,
              borderColor: cup.borderColor,
            }}
          >
            <p className="font-display font-bold text-xs tracking-wide whitespace-nowrap">
              {cup.labelText}
            </p>
          </div>
        )}

        {/* Imagen overlay personalizada del vaso si la administradora subió una */}
        {cup.customCupOverlayUrl && (
          <img
            src={cup.customCupOverlayUrl}
            alt="Overlay vaso"
            className="absolute inset-0 w-full h-full object-contain z-30 pointer-events-none"
          />
        )}

        {/* Brillo lateral de cristal */}
        <div className="absolute top-3 bottom-4 left-3 w-2.5 rounded-full bg-white/45 pointer-events-none z-30" />
      </div>

      {/* Decoraciones y stickers flotantes alrededor/encima del vaso */}
      {cup.decorations
        .filter((d) => d.visible)
        .map((dec) => (
          <div
            key={dec.id}
            style={{
              left: `${dec.x}%`,
              top: `${dec.y}%`,
              transform: `translate(-50%, -50%) scale(${dec.scale}) rotate(${dec.rotation}deg)`,
              backgroundColor: dec.type === 'sparkle' ? 'transparent' : dec.color,
              borderColor: cup.borderColor,
            }}
            className={`absolute z-30 pointer-events-none ${
              dec.type === 'sparkle'
                ? 'text-2xl font-bold drop-shadow'
                : 'px-2.5 py-1 rounded-full border-2 text-[10px] font-display font-bold text-[#2B1E2E] shadow-[2px_2px_0px_#2B1E2E]'
            }`}
          >
            {dec.imageUrl ? (
              <img src={dec.imageUrl} alt={dec.label} className="w-10 h-10 object-contain" />
            ) : (
              dec.label
            )}
          </div>
        ))}
    </div>
  );
};
