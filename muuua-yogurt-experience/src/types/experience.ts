export type TextureType =
  | 'creamy'
  | 'crunchy'
  | 'liquid'
  | 'gelatinous'
  | 'foamy'
  | 'swirl'
  | string;

export interface TextureDefinition {
  id: TextureType;
  name: string;
  description: string;
  cssPattern: string;
  opacity: number;
  blur: number;
  overlayColor: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: 'base' | 'fruit' | 'topping' | 'drizzle' | 'magic';
  color: string;
  secondaryColor: string;
  texture: TextureType;
  layerOrder: number; // 1 = fondo, 5 = tope
  heightPercentage: number; // altura visual que ocupa en el vaso
  opacity: number;
  description: string;
  imageUrl?: string; // URL o base64 de ilustración/foto
  floatingIcon?: string; // SVG key o símbolo visual
  animation: 'none' | 'pour' | 'float' | 'pulse' | 'swirl';
  particleCount: number;
  particleSize: number;
}

export interface AnswerOption {
  id: string;
  text: string;
  subtext?: string;
  imageUrl?: string;
  accentColor: string;
  ingredientIds: string[]; // Ingredientes que añade al vaso
  personalityScores: Record<string, number>; // Puntos hacia personalidades
  visualOverrides?: {
    cupTint?: string;
    backgroundTint?: string;
    stickerText?: string;
  };
}

export interface Question {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  stepLabel: string;
  layout: 'grid-2' | 'grid-4' | 'cards';
  options: AnswerOption[];
}

export interface PersonalityResult {
  id: string;
  name: string;
  tagline: string;
  description: string;
  quote: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  texture: TextureType;
  characteristics: string[];
  recommendedIngredientIds: string[];
  customImageUrl?: string; // Ilustración personalizada opcional del resultado
  badgeText: string;
  matchingRules: {
    minScore?: number;
    requiredIngredientIds?: string[]; // Regla opcional: si el usuario eligió estos ingredientes, fuerza este resultado
    priority: number;
  };
}

export interface CupDecoration {
  id: string;
  type: 'sticker' | 'label' | 'straw' | 'sparkle' | 'custom-image';
  label: string;
  color: string;
  x: number; // porcentaje 0-100
  y: number; // porcentaje 0-100
  scale: number;
  rotation: number;
  imageUrl?: string;
  visible: boolean;
}

export interface CupSettings {
  shape: 'classic-jar' | 'tall-parfait' | 'artisan-tub' | 'retro-cup';
  width: number; // px
  height: number; // px
  glassColor: string;
  glassOpacity: number;
  borderColor: string;
  borderWidth: number;
  rimStyle: 'rounded' | 'flat' | 'wavy';
  showSpoon: boolean;
  spoonColor: string;
  showLabel: boolean;
  labelText: string;
  labelBgColor: string;
  labelTextColor: string;
  customCupOverlayUrl?: string;
  decorations: CupDecoration[];
}

export interface MixingScreenSettings {
  mediaType: 'procedural-animation' | 'video' | 'gif';
  mediaUrl: string;
  durationMs: number;
  loadingMessages: string[];
  backgroundColor: string;
  accentColor: string;
  swirlIntensity: number;
  showProgressBar: boolean;
  soundEffectEnabled: boolean;
}

export interface ThemeSettings {
  brandName: string;
  brandLogoUrl: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  welcomeBadge: string;
  startButtonText: string;
  retakeButtonText: string;
  shareButtonText: string;
  fontDisplay: string;
  fontBody: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  backgroundGradient: string;
  cardBackgroundColor: string;
  textColor: string;
  borderRadius: number;
  shadowStrength: 'none' | 'soft' | 'playful' | 'retro-hard';
  buttonStyle: 'pill' | 'rounded' | 'retro-box';
  decorativeFloatingBlobs: boolean;
  welcomeHeroImageUrl?: string;
}

export interface ExperienceConfig {
  versionName: string;
  lastUpdated: string;
  theme: ThemeSettings;
  cup: CupSettings;
  mixing: MixingScreenSettings;
  textures: TextureDefinition[];
  ingredients: Ingredient[];
  questions: Question[];
  personalities: PersonalityResult[];
}

export interface VersionSnapshot {
  id: string;
  label: string;
  created_at: string;
  payload: ExperienceConfig;
}
