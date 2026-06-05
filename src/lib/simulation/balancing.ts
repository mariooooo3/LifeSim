export const STAT_MIN = 0;
export const STAT_MAX = 100;

export const INERTIA_BONUS = 6;   
export const SCORE_RANDOM_MIN = -5;
export const SCORE_RANDOM_MAX = 5;

export const NEED_DECAY_PER_TICK = {
  money: 0.2,
  energy: 1.1,
  social: 0.6,
  fun: 0.8,
} as const;

export const ACTION_IMPACT = {
  sleep:     { money: -0.1, energy: 26, social: -0.5, fun: 3,  stress: -18 },
  work:      { money: 12,   energy: -14, social: -3,   fun: -5, stress: 8  }, 
  eat:       { money: -3,   energy: 9,   social: 1,    fun: 4,  stress: -5  },
  socialize: { money: -2,   energy: -5,  social: 20,   fun: 12, stress: -10 },
  relax:     { money: -1,   energy: 7,   social: 3,    fun: 15, stress: -14 },
} as const;

export const STRESS_WEIGHTS = {
  lowMoney: 0.16,
  debt: 0.25,
  exhaustion: 0.2,
  missedOpportunity: 0.15,
  isolation: 0.14,
} as const;

export const PHASE_ACTION_BONUS = {
  morning: { sleep: -8, work: 10, eat: 6, socialize: 0, relax: -3 },
  afternoon: { sleep: -4, work: 8, eat: 4, socialize: 2, relax: 1 },
  evening: { sleep: 3, work: -2, eat: 5, socialize: 8, relax: 7 },
  night: { sleep: 14, work: -8, eat: 2, socialize: 2, relax: 5 },
} as const;

export const UTILITY_WEIGHT_COEFFICIENTS = {
  sleep: {
    lowEnergy: 0.75,
    stress: 0.2,
    lowResilience: 0.05,
  },
  work: {
    lowNeedMoney: 0.45,
    debtBonus: 20,
    workOpportunity: 0.8,
    ambition: 0.25,
    discipline: 0.25,
    stressPenalty: 0.15,
  },
  eat: {
    lowEnergy: 0.25,
    lowFun: 0.1,
  },
  socialize: {
    lowSocial: 0.65,
    socialOpportunity: 0.7,
    sociability: 0.3,
    relationship: 0.15,
    stressPenalty: 0.12,
  },
  relax: {
    stress: 0.45,
    lowFun: 0.5,
    leisureOpportunity: 0.5,
    ambitionPenalty: 0.1,
  },
} as const;

export const VALIDATION_THRESHOLDS = {
  highStress: 80,
  lowEnergy: 20,
  lowSocial: 20,
  lowActionDiversity: 0.35,
  highBurnoutRate: 0.4,
  lowOpportunityAcceptance: 0.1,
} as const;
