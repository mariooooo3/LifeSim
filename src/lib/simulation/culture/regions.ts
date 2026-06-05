import type { WorldSeed } from "../worldSeed";





export type CultureRegion =
  | "japan"
  | "korea"
  | "china"
  | "nordic"
  | "germanic"
  | "romance_europe"
  | "eastern_europe"
  | "slavic"
  | "middle_east"
  | "gulf"
  | "south_asian"
  | "africa"
  | "latin_american"
  | "north_american"
  | "southeast_asian"
  | "anglophone";

export type CulturalTilt =
  | "default"
  | "boom"
  | "burnout"
  | "recession"
  | "renaissance"
  | "isolation";

export interface CulturalTraits {
  ambition: number;          
  nightlife: number;         
  loneliness: number;        
  romance: number;           
  creativity: number;        
  wealthPressure: number;    
  socialOpenness: number;    
  pace: number;              
  workIntensity: number;     
  artisticEnergy: number;    
  survivalPressure: number;  
  luxuryLifestyle: number;   
  socialMobility: number;    
}

export interface WorldCulture {
  region: CultureRegion;
  tilt: CulturalTilt;
  traits: CulturalTraits;
}




const BASE_TRAITS: Record<CultureRegion, CulturalTraits> = {
  japan: {
    ambition: 0.82, nightlife: 0.72, loneliness: 0.75, romance: 0.38,
    creativity: 0.70, wealthPressure: 0.68, socialOpenness: 0.35, pace: 0.88,
    workIntensity: 0.90, artisticEnergy: 0.74, survivalPressure: 0.45,
    luxuryLifestyle: 0.55, socialMobility: 0.45,
  },
  korea: {
    ambition: 0.88, nightlife: 0.76, loneliness: 0.70, romance: 0.52,
    creativity: 0.78, wealthPressure: 0.80, socialOpenness: 0.50, pace: 0.85,
    workIntensity: 0.88, artisticEnergy: 0.80, survivalPressure: 0.55,
    luxuryLifestyle: 0.68, socialMobility: 0.55,
  },
  china: {
    ambition: 0.86, nightlife: 0.58, loneliness: 0.55, romance: 0.42,
    creativity: 0.60, wealthPressure: 0.82, socialOpenness: 0.45, pace: 0.90,
    workIntensity: 0.86, artisticEnergy: 0.55, survivalPressure: 0.58,
    luxuryLifestyle: 0.70, socialMobility: 0.62,
  },
  nordic: {
    ambition: 0.55, nightlife: 0.42, loneliness: 0.60, romance: 0.45,
    creativity: 0.65, wealthPressure: 0.28, socialOpenness: 0.40, pace: 0.45,
    workIntensity: 0.55, artisticEnergy: 0.62, survivalPressure: 0.18,
    luxuryLifestyle: 0.28, socialMobility: 0.72,
  },
  germanic: {
    ambition: 0.68, nightlife: 0.55, loneliness: 0.48, romance: 0.40,
    creativity: 0.65, wealthPressure: 0.50, socialOpenness: 0.45, pace: 0.65,
    workIntensity: 0.72, artisticEnergy: 0.70, survivalPressure: 0.28,
    luxuryLifestyle: 0.45, socialMobility: 0.60,
  },
  romance_europe: {
    ambition: 0.60, nightlife: 0.75, loneliness: 0.38, romance: 0.78,
    creativity: 0.72, wealthPressure: 0.45, socialOpenness: 0.75, pace: 0.62,
    workIntensity: 0.55, artisticEnergy: 0.82, survivalPressure: 0.35,
    luxuryLifestyle: 0.60, socialMobility: 0.50,
  },
  eastern_europe: {
    ambition: 0.72, nightlife: 0.65, loneliness: 0.52, romance: 0.60,
    creativity: 0.62, wealthPressure: 0.65, socialOpenness: 0.62, pace: 0.68,
    workIntensity: 0.70, artisticEnergy: 0.58, survivalPressure: 0.58,
    luxuryLifestyle: 0.40, socialMobility: 0.52,
  },
  slavic: {
    ambition: 0.65, nightlife: 0.58, loneliness: 0.62, romance: 0.55,
    creativity: 0.60, wealthPressure: 0.62, socialOpenness: 0.48, pace: 0.62,
    workIntensity: 0.68, artisticEnergy: 0.55, survivalPressure: 0.65,
    luxuryLifestyle: 0.38, socialMobility: 0.42,
  },
  middle_east: {
    ambition: 0.72, nightlife: 0.45, loneliness: 0.40, romance: 0.50,
    creativity: 0.58, wealthPressure: 0.65, socialOpenness: 0.65, pace: 0.70,
    workIntensity: 0.72, artisticEnergy: 0.52, survivalPressure: 0.55,
    luxuryLifestyle: 0.52, socialMobility: 0.48,
  },
  gulf: {
    ambition: 0.78, nightlife: 0.38, loneliness: 0.50, romance: 0.30,
    creativity: 0.40, wealthPressure: 0.72, socialOpenness: 0.48, pace: 0.75,
    workIntensity: 0.78, artisticEnergy: 0.30, survivalPressure: 0.35,
    luxuryLifestyle: 0.90, socialMobility: 0.55,
  },
  south_asian: {
    ambition: 0.80, nightlife: 0.50, loneliness: 0.35, romance: 0.55,
    creativity: 0.68, wealthPressure: 0.75, socialOpenness: 0.72, pace: 0.78,
    workIntensity: 0.78, artisticEnergy: 0.65, survivalPressure: 0.72,
    luxuryLifestyle: 0.48, socialMobility: 0.55,
  },
  africa: {
    ambition: 0.75, nightlife: 0.68, loneliness: 0.28, romance: 0.65,
    creativity: 0.72, wealthPressure: 0.72, socialOpenness: 0.85, pace: 0.72,
    workIntensity: 0.74, artisticEnergy: 0.78, survivalPressure: 0.78,
    luxuryLifestyle: 0.42, socialMobility: 0.52,
  },
  latin_american: {
    ambition: 0.72, nightlife: 0.82, loneliness: 0.25, romance: 0.82,
    creativity: 0.75, wealthPressure: 0.65, socialOpenness: 0.88, pace: 0.72,
    workIntensity: 0.65, artisticEnergy: 0.80, survivalPressure: 0.62,
    luxuryLifestyle: 0.50, socialMobility: 0.48,
  },
  north_american: {
    ambition: 0.78, nightlife: 0.62, loneliness: 0.55, romance: 0.55,
    creativity: 0.62, wealthPressure: 0.75, socialOpenness: 0.65, pace: 0.78,
    workIntensity: 0.80, artisticEnergy: 0.65, survivalPressure: 0.55,
    luxuryLifestyle: 0.65, socialMobility: 0.60,
  },
  southeast_asian: {
    ambition: 0.78, nightlife: 0.72, loneliness: 0.30, romance: 0.62,
    creativity: 0.60, wealthPressure: 0.68, socialOpenness: 0.80, pace: 0.78,
    workIntensity: 0.78, artisticEnergy: 0.60, survivalPressure: 0.62,
    luxuryLifestyle: 0.55, socialMobility: 0.60,
  },
  anglophone: {
    ambition: 0.65, nightlife: 0.68, loneliness: 0.55, romance: 0.52,
    creativity: 0.62, wealthPressure: 0.62, socialOpenness: 0.58, pace: 0.70,
    workIntensity: 0.68, artisticEnergy: 0.65, survivalPressure: 0.42,
    luxuryLifestyle: 0.52, socialMobility: 0.55,
  },
};




const CITY_REGION: Record<string, CultureRegion> = {

  "c-tokyo": "japan", "c-osaka": "japan", "c-kyoto": "japan",
  "c-sapporo": "japan", "c-fukuoka": "japan",


  "c-seoul": "korea", "c-busan": "korea", "c-pyongyang": "korea",


  "c-beijing": "china", "c-shanghai": "china", "c-guangzhou": "china",
  "c-hongkong": "china", "c-taipei": "china", "c-shenzhen": "china",
  "c-chengdu": "china", "c-wuhan": "china", "c-chongqing": "china",
  "c-xian": "china", "c-nanjing": "china", "c-tianjin": "china",
  "c-ulaanbaatar": "china",


  "c-stockholm": "nordic", "c-oslo": "nordic", "c-copenhagen": "nordic",
  "c-helsinki": "nordic", "c-reykjavik": "nordic",


  "c-berlin": "germanic", "c-hamburg": "germanic", "c-munich": "germanic",
  "c-vienna": "germanic", "c-zurich": "germanic", "c-amsterdam": "germanic",
  "c-brussels": "germanic", "c-prague": "germanic", "c-budapest": "germanic",


  "c-paris": "romance_europe", "c-rome": "romance_europe", "c-milan": "romance_europe",
  "c-madrid": "romance_europe", "c-barcelona": "romance_europe",
  "c-lisbon": "romance_europe", "c-porto": "romance_europe",
  "c-athens": "romance_europe", "c-valletta": "romance_europe", "c-nicosia": "romance_europe",


  "c-warsaw": "eastern_europe", "c-bucharest": "eastern_europe",
  "c-cluj": "eastern_europe", "c-iasi": "eastern_europe", "c-timisoara": "eastern_europe",
  "c-kyiv": "eastern_europe",
  "c-tallinn": "eastern_europe", "c-riga": "eastern_europe", "c-vilnius": "eastern_europe",
  "c-belgrade": "eastern_europe", "c-zagreb": "eastern_europe", "c-sofia": "eastern_europe",
  "c-chisinau": "eastern_europe", "c-tbilisi": "eastern_europe",
  "c-yerevan": "eastern_europe", "c-baku": "eastern_europe",
  "c-minsk": "slavic",


  "c-moscow": "slavic", "c-stpetersburg": "slavic",


  "c-istanbul": "middle_east", "c-ankara": "middle_east",
  "c-tehran": "middle_east", "c-baghdad": "middle_east",
  "c-beirut": "middle_east", "c-amman": "middle_east",
  "c-telaviv": "middle_east", "c-damascus": "middle_east",
  "c-kabul": "middle_east",
  "c-cairo": "middle_east", "c-casablanca": "middle_east",
  "c-algiers": "middle_east", "c-tunis": "middle_east",
  "c-tripoli": "middle_east", "c-rabat": "middle_east",
  "c-khartoum": "middle_east",


  "c-dubai": "gulf", "c-abudhabi": "gulf", "c-doha": "gulf",
  "c-riyadh": "gulf", "c-jeddah": "gulf", "c-muscat": "gulf",
  "c-kuwait": "gulf", "c-manama": "gulf",


  "c-mumbai": "south_asian", "c-delhi": "south_asian", "c-bangalore": "south_asian",
  "c-kolkata": "south_asian", "c-chennai": "south_asian", "c-pune": "south_asian",
  "c-hyderabad": "south_asian", "c-ahmedabad": "south_asian",
  "c-karachi": "south_asian", "c-lahore": "south_asian", "c-islamabad": "south_asian",
  "c-dhaka": "south_asian", "c-chittagong": "south_asian",
  "c-colombo": "south_asian", "c-kathmandu": "south_asian",


  "c-singapore": "southeast_asian", "c-bangkok": "southeast_asian",
  "c-hcmc": "southeast_asian", "c-jakarta": "southeast_asian",
  "c-manila": "southeast_asian", "c-kualalumpur": "southeast_asian",
  "c-yangon": "southeast_asian", "c-hanoi": "southeast_asian",
  "c-phnompenh": "southeast_asian", "c-surabaya": "southeast_asian",
  "c-cebu": "southeast_asian", "c-chiangmai": "southeast_asian",
  "c-danang": "southeast_asian", "c-vientiane": "southeast_asian",
  "c-bandarwon": "southeast_asian", "c-dili": "southeast_asian",


  "c-lagos": "africa", "c-nairobi": "africa", "c-accra": "africa",
  "c-addisababa": "africa", "c-dakar": "africa", "c-abuja": "africa",
  "c-capetown": "africa", "c-johannesburg": "africa", "c-kinshasa": "africa",
  "c-kampala": "africa", "c-dar": "africa", "c-lusaka": "africa",
  "c-harare": "africa", "c-maputo": "africa", "c-luanda": "africa",
  "c-abidjan": "africa", "c-douala": "africa", "c-bamako": "africa",
  "c-conakry": "africa", "c-freetown": "africa", "c-monrovia": "africa",
  "c-antananarivo": "africa", "c-kigali": "africa", "c-bujumbura": "africa",


  "c-saopaulo": "latin_american", "c-rio": "latin_american",
  "c-buenosaires": "latin_american", "c-bogota": "latin_american",
  "c-lima": "latin_american", "c-santiago": "latin_american",
  "c-caracas": "latin_american", "c-medellin": "latin_american",
  "c-cali": "latin_american", "c-quito": "latin_american",
  "c-montevideo": "latin_american", "c-asuncion": "latin_american",
  "c-lapaz": "latin_american", "c-brasilia": "latin_american",
  "c-recife": "latin_american", "c-fortaleza": "latin_american",
  "c-salvador": "latin_american", "c-curitiba": "latin_american",
  "c-manaus": "latin_american", "c-cordoba": "latin_american",
  "c-mexicocity": "latin_american", "c-guadalajara": "latin_american",
  "c-monterrey": "latin_american", "c-havana": "latin_american",
  "c-sanjuan": "latin_american", "c-panama": "latin_american",
  "c-sanjose-cr": "latin_american", "c-guayaquil": "latin_american",
  "c-portoalegre": "latin_american",


  "c-newyork": "north_american", "c-losangeles": "north_american",
  "c-chicago": "north_american", "c-houston": "north_american",
  "c-phoenix": "north_american", "c-philadelphia": "north_american",
  "c-sanantonio": "north_american", "c-sandiego": "north_american",
  "c-dallas": "north_american", "c-sanjose": "north_american",
  "c-austin": "north_american", "c-seattle": "north_american",
  "c-denver": "north_american", "c-boston": "north_american",
  "c-miami": "north_american", "c-lasvegas": "north_american",
  "c-portland": "north_american", "c-atlanta": "north_american",
  "c-toronto": "north_american", "c-vancouver": "north_american",
  "c-montreal": "north_american", "c-calgary": "north_american",
  "c-ottawa": "north_american", "c-edmonton": "north_american",
  "c-winnipeg": "north_american",


  "c-london": "anglophone", "c-dublin": "anglophone",
  "c-edinburgh": "anglophone", "c-manchester": "anglophone",
  "c-birmingham": "anglophone", "c-glasgow": "anglophone",
  "c-bristol": "anglophone", "c-cardiff": "anglophone",
  "c-sydney": "anglophone", "c-melbourne": "anglophone",
  "c-brisbane": "anglophone", "c-perth": "anglophone",
  "c-auckland": "anglophone", "c-wellington": "anglophone",
};




function regionFromCoords(lat: number, lng: number): CultureRegion {

  if (lat >= 30 && lat <= 46 && lng >= 129 && lng <= 146) return "japan";

  if (lat >= 33 && lat <= 39 && lng >= 124 && lng <= 130) return "korea";

  if (lat >= 18 && lat <= 55 && lng >= 73 && lng <= 135) return "china";

  if (lat >= 54 && lng >= -25 && lng <= 32) return "nordic";

  if (lat >= 49 && lat <= 60 && lng >= -11 && lng <= 2) return "anglophone";

  if (lat >= 45 && lat <= 56 && lng >= 2 && lng <= 20) return "germanic";

  if (lat >= 35 && lat <= 50 && lng >= -10 && lng <= 22) return "romance_europe";

  if (lat >= 44 && lat <= 56 && lng >= 20 && lng <= 42) return "eastern_europe";

  if (lat >= 50 && lng >= 28 && lng <= 180) return "slavic";

  if (lat >= 20 && lat <= 32 && lng >= 44 && lng <= 60) return "gulf";

  if (lat >= 15 && lat <= 43 && lng >= -6 && lng <= 65) return "middle_east";

  if (lat >= 5 && lat <= 35 && lng >= 60 && lng <= 92) return "south_asian";

  if (lat >= -10 && lat <= 28 && lng >= 92 && lng <= 130) return "southeast_asian";

  if (lat >= -35 && lat <= 18 && lng >= -20 && lng <= 52) return "africa";

  if (lat >= -56 && lat <= 25 && lng >= -82 && lng <= -34) return "latin_american";

  if (lat >= 24 && lat <= 72 && lng >= -170 && lng <= -52) return "north_american";

  if (lat <= -10 && lng >= 110) return "anglophone";
  return "anglophone";
}

export function getCultureRegion(cityId: string, lat = 0, lng = 0): CultureRegion {
  return CITY_REGION[cityId] ?? regionFromCoords(lat, lng);
}




function seedChannel(base: number, offset: number): number {
  return ((base * (offset | 1)) >>> 0) / 0xffffffff;
}

function deriveTilt(seed: number): CulturalTilt {
  const v = seedChannel(seed, 173);
  if (v < 0.11) return "burnout";
  if (v < 0.22) return "recession";
  if (v < 0.32) return "isolation";
  if (v < 0.48) return "renaissance";
  if (v < 0.65) return "boom";
  return "default"; 
}


const TILT_DELTA: Record<CulturalTilt, Partial<CulturalTraits>> = {
  default:     {},
  boom:        { ambition: +0.12, socialOpenness: +0.10, pace: +0.08, luxuryLifestyle: +0.15, survivalPressure: -0.14 },
  burnout:     { workIntensity: +0.14, loneliness: +0.20, survivalPressure: +0.14, pace: +0.10, socialOpenness: -0.14, romance: -0.08 },
  recession:   { survivalPressure: +0.22, wealthPressure: +0.16, loneliness: +0.12, luxuryLifestyle: -0.20, ambition: +0.08 },
  renaissance: { creativity: +0.18, artisticEnergy: +0.20, romance: +0.10, nightlife: +0.10, loneliness: -0.10 },
  isolation:   { loneliness: +0.24, socialOpenness: -0.20, pace: -0.08, creativity: +0.08, survivalPressure: +0.08 },
};

function applyTilt(base: CulturalTraits, tilt: CulturalTilt): CulturalTraits {
  const d = TILT_DELTA[tilt];
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return {
    ambition:         clamp(base.ambition         + (d.ambition         ?? 0)),
    nightlife:        clamp(base.nightlife        + (d.nightlife        ?? 0)),
    loneliness:       clamp(base.loneliness       + (d.loneliness       ?? 0)),
    romance:          clamp(base.romance          + (d.romance          ?? 0)),
    creativity:       clamp(base.creativity       + (d.creativity       ?? 0)),
    wealthPressure:   clamp(base.wealthPressure   + (d.wealthPressure   ?? 0)),
    socialOpenness:   clamp(base.socialOpenness   + (d.socialOpenness   ?? 0)),
    pace:             clamp(base.pace             + (d.pace             ?? 0)),
    workIntensity:    clamp(base.workIntensity    + (d.workIntensity    ?? 0)),
    artisticEnergy:   clamp(base.artisticEnergy   + (d.artisticEnergy   ?? 0)),
    survivalPressure: clamp(base.survivalPressure + (d.survivalPressure ?? 0)),
    luxuryLifestyle:  clamp(base.luxuryLifestyle  + (d.luxuryLifestyle  ?? 0)),
    socialMobility:   clamp(base.socialMobility   + (d.socialMobility   ?? 0)),
  };
}





const CITY_TRAIT_DELTA: Record<string, Partial<CulturalTraits>> = {





  "c-bucharest": {
    ambition:         +0.10,
    nightlife:        +0.12,
    wealthPressure:   +0.08,
    pace:             +0.10,
    survivalPressure: +0.07,
    socialMobility:   +0.05,
  },


  "c-cluj": {
    creativity:       +0.15,
    artisticEnergy:   +0.14,
    socialMobility:   +0.15,
    socialOpenness:   +0.08,
    survivalPressure: -0.10,
    wealthPressure:   -0.08,
  },


  "c-iasi": {
    artisticEnergy:   +0.10,
    creativity:       +0.08,
    nightlife:        +0.06,
    pace:             -0.10,
    survivalPressure: +0.10,
    wealthPressure:   +0.08,
    socialMobility:   -0.05,
  },


  "c-timisoara": {
    socialOpenness:   +0.14,
    romance:          +0.10,
    artisticEnergy:   +0.12,
    loneliness:       -0.08,
    survivalPressure: -0.08,
    pace:             -0.05,
  },
};

function applyCityDelta(traits: CulturalTraits, cityId: string): CulturalTraits {
  const d = CITY_TRAIT_DELTA[cityId];
  if (!d) return traits;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  return {
    ambition:         clamp(traits.ambition         + (d.ambition         ?? 0)),
    nightlife:        clamp(traits.nightlife        + (d.nightlife        ?? 0)),
    loneliness:       clamp(traits.loneliness       + (d.loneliness       ?? 0)),
    romance:          clamp(traits.romance          + (d.romance          ?? 0)),
    creativity:       clamp(traits.creativity       + (d.creativity       ?? 0)),
    wealthPressure:   clamp(traits.wealthPressure   + (d.wealthPressure   ?? 0)),
    socialOpenness:   clamp(traits.socialOpenness   + (d.socialOpenness   ?? 0)),
    pace:             clamp(traits.pace             + (d.pace             ?? 0)),
    workIntensity:    clamp(traits.workIntensity    + (d.workIntensity    ?? 0)),
    artisticEnergy:   clamp(traits.artisticEnergy   + (d.artisticEnergy   ?? 0)),
    survivalPressure: clamp(traits.survivalPressure + (d.survivalPressure ?? 0)),
    luxuryLifestyle:  clamp(traits.luxuryLifestyle  + (d.luxuryLifestyle  ?? 0)),
    socialMobility:   clamp(traits.socialMobility   + (d.socialMobility   ?? 0)),
  };
}




export function deriveCulture(world: WorldSeed): WorldCulture {
  const region = getCultureRegion(world.regionId, world.lat, world.lng);
  const tilt   = deriveTilt(world.seed);

  const afterTilt  = applyTilt(BASE_TRAITS[region], tilt);
  const traits     = applyCityDelta(afterTilt, world.regionId);
  return { region, tilt, traits };
}

export type { CulturalTraits as CultureTraits };