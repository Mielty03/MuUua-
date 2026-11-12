import { AnswerOption, ExperienceConfig, Ingredient, PersonalityResult } from '../types/experience';

export interface QuizCalculationResult {
  personality: PersonalityResult;
  accumulatedIngredients: Ingredient[];
  allSelectedOptions: AnswerOption[];
  scores: Record<string, number>;
}

/**
 * Motor lógico separado de la interfaz:
 * Calcula ingredientes acumulados, capas del vaso y personalidad ganadora según reglas configurables.
 */
export function calculateYogurtOutcome(
  config: ExperienceConfig,
  selectedOptionsByQuestion: Record<string, AnswerOption>
): QuizCalculationResult {
  const selectedOptions = Object.values(selectedOptionsByQuestion);
  const scores: Record<string, number> = {};
  const ingredientIdSet = new Set<string>();

  // Inicializar puntuaciones
  config.personalities.forEach((p) => {
    scores[p.id] = 0;
  });

  // Acumular ingredientes y puntos por cada respuesta
  selectedOptions.forEach((opt) => {
    opt.ingredientIds.forEach((ingId) => ingredientIdSet.add(ingId));
    Object.entries(opt.personalityScores || {}).forEach(([persId, pts]) => {
      scores[persId] = (scores[persId] || 0) + Number(pts || 0);
    });
  });

  // Resolver objetos de ingredientes ordenados por capa
  const accumulatedIngredients = Array.from(ingredientIdSet)
    .map((id) => config.ingredients.find((ing) => ing.id === id))
    .filter((ing): ing is Ingredient => Boolean(ing))
    .sort((a, b) => a.layerOrder - b.layerOrder);

  // 1. Verificar si alguna personalidad tiene reglas de combinación obligatoria que coincidan
  const sortedPersonalities = [...config.personalities].sort(
    (a, b) => (a.matchingRules?.priority ?? 99) - (b.matchingRules?.priority ?? 99)
  );

  for (const pers of sortedPersonalities) {
    const reqIngs = pers.matchingRules?.requiredIngredientIds;
    if (reqIngs && reqIngs.length > 0) {
      const hasAllRequired = reqIngs.every((reqId) => ingredientIdSet.has(reqId));
      if (hasAllRequired) {
        return {
          personality: pers,
          accumulatedIngredients:
            accumulatedIngredients.length > 0
              ? accumulatedIngredients
              : getFallbackIngredients(config, pers),
          allSelectedOptions: selectedOptions,
          scores,
        };
      }
    }
  }

  // 2. Seleccionar por mayor puntaje acumulado
  let winner = sortedPersonalities[0] || config.personalities[0];
  let highestScore = -Infinity;

  sortedPersonalities.forEach((pers) => {
    const sc = scores[pers.id] ?? 0;
    const minReq = pers.matchingRules?.minScore ?? 0;
    if (sc >= minReq && sc > highestScore) {
      highestScore = sc;
      winner = pers;
    }
  });

  return {
    personality: winner,
    accumulatedIngredients:
      accumulatedIngredients.length > 0
        ? accumulatedIngredients
        : getFallbackIngredients(config, winner),
    allSelectedOptions: selectedOptions,
    scores,
  };
}

function getFallbackIngredients(config: ExperienceConfig, pers: PersonalityResult): Ingredient[] {
  return pers.recommendedIngredientIds
    .map((id) => config.ingredients.find((i) => i.id === id))
    .filter((i): i is Ingredient => Boolean(i))
    .sort((a, b) => a.layerOrder - b.layerOrder);
}
