export type Mood = "calm" | "focused" | "stressed" | "content" | "restless" | "hopeful";

export interface NpcSummary {
  id: string;
  name: string;
  role: string;
  initials: string;
  mood: Mood;
  currentAction: string;
  stress: number;
  money: number;
  recentEvent: string;
  relationshipHint: string;
  hue: number;
}

export const MOOD_LABEL: Record<Mood, string> = {
  calm: "Calm",
  focused: "Focused",
  stressed: "Stressed",
  content: "Content",
  restless: "Restless",
  hopeful: "Hopeful",
};

export const MOOD_TOKEN: Record<Mood, string> = {
  calm: "var(--calm)",
  focused: "var(--calm)",
  stressed: "var(--stress)",
  content: "var(--grow)",
  restless: "var(--warm)",
  hopeful: "var(--grow)",
};

export const npcs: NpcSummary[] = [
  { id: "n1", name: "Sarah Lin", role: "Architect", initials: "SL", mood: "focused", currentAction: "Drafting late at the studio", stress: 62, money: 58, recentEvent: "Stayed late at work", relationshipHint: "Drifting from Mike", hue: 220 },
  { id: "n2", name: "Mike Alvarez", role: "Bartender", initials: "MA", mood: "restless", currentAction: "Walking home along 5th", stress: 48, money: 32, recentEvent: "Missed an opportunity", relationshipHint: "Thinking of Sarah", hue: 30 },
  { id: "n3", name: "Yuki Tanaka", role: "Researcher", initials: "YT", mood: "content", currentAction: "Reading in the park", stress: 18, money: 64, recentEvent: "Finished a long paper", relationshipHint: "New friend: Iris", hue: 150 },
  { id: "n4", name: "Iris Bauer", role: "Florist", initials: "IB", mood: "hopeful", currentAction: "Closing the shop", stress: 22, money: 41, recentEvent: "Festival boosted sales", relationshipHint: "Met Yuki today", hue: 130 },
  { id: "n5", name: "Daniel Okafor", role: "Teacher", initials: "DO", mood: "calm", currentAction: "Grading papers at home", stress: 30, money: 47, recentEvent: "Quiet evening", relationshipHint: "Calls his sister", hue: 200 },
  { id: "n6", name: "Maya Holm", role: "Founder", initials: "MH", mood: "stressed", currentAction: "On a long call with investors", stress: 84, money: 71, recentEvent: "Round delayed a week", relationshipHint: "Avoiding partner", hue: 10 },
  { id: "n7", name: "Theo Nakai", role: "Musician", initials: "TN", mood: "hopeful", currentAction: "Rehearsing in the basement", stress: 35, money: 28, recentEvent: "Got a small gig", relationshipHint: "Crush on Iris", hue: 280 },
  { id: "n8", name: "Lena Cole", role: "Nurse", initials: "LC", mood: "focused", currentAction: "Night shift, ward C", stress: 70, money: 53, recentEvent: "Long shift overrun", relationshipHint: "Texts Daniel often", hue: 190 },
];

export interface FeedEvent {
  id: string;
  time: string;
  text: string;
  kind: "social" | "work" | "world" | "mood";
}

export const feed: FeedEvent[] = [
  { id: "e1", time: "14:32", text: "Sarah stayed late at work", kind: "work" },
  { id: "e2", time: "14:28", text: "Festival increased social activity in the Old Quarter", kind: "world" },
  { id: "e3", time: "14:21", text: "Mike missed an opportunity at the bar", kind: "work" },
  { id: "e4", time: "14:15", text: "Iris and Yuki crossed paths in the park", kind: "social" },
  { id: "e5", time: "14:09", text: "Light rain began over the district", kind: "world" },
  { id: "e6", time: "14:02", text: "Maya's stress reached a new high", kind: "mood" },
  { id: "e7", time: "13:54", text: "Theo received a message from a venue", kind: "social" },
  { id: "e8", time: "13:47", text: "Lena began her shift at the hospital", kind: "work" },
];

export interface Region {
  id: string;
  name: string;
  subtitle: string;       
  lat: number;
  lng: number;
  climate: string;
  economy: string;
  culture: string;
  density: "Sparse" | "Moderate" | "Dense";
  seed: string;
}

export const regions: Region[] = [
  { id: "r-nweu", name: "Coastal North", subtitle: "Northern Europe",  lat: 59.3, lng: 18.1,  climate: "Cool maritime",  economy: "Service & tech",   culture: "Quiet, civic",       density: "Moderate", seed: "0xA9F2-NEU" },
  { id: "r-med",  name: "Inner Mediterranean", subtitle: "Southern Europe", lat: 41.9, lng: 12.5, climate: "Warm temperate", economy: "Mixed trade",    culture: "Outdoor, social",    density: "Dense",    seed: "0x71C4-MED" },
  { id: "r-wafr", name: "Atlantic Coast", subtitle: "West Africa",      lat: 6.5,  lng: 3.4,   climate: "Tropical humid", economy: "Informal & growth", culture: "Communal, musical", density: "Dense",    seed: "0xE38A-WAF" },
  { id: "r-eafr", name: "Highland Plateau", subtitle: "East Africa",    lat: -1.3, lng: 36.8,  climate: "Highland mild",  economy: "Agrarian & mobile", culture: "Pastoral, devout",  density: "Moderate", seed: "0x2D6E-EAF" },
  { id: "r-me",   name: "Desert Crossing", subtitle: "Middle East",     lat: 25.3, lng: 51.5,  climate: "Hot arid",       economy: "Resource & trade", culture: "Familial, formal",   density: "Dense",    seed: "0x5B11-MEA" },
  { id: "r-sa",   name: "Monsoon Belt", subtitle: "South Asia",         lat: 19.1, lng: 72.9,  climate: "Tropical monsoon", economy: "Dense informal",  culture: "Layered, vibrant",   density: "Dense",    seed: "0x9C42-SAS" },
  { id: "r-ea",   name: "Eastern Megacity", subtitle: "East Asia",      lat: 35.7, lng: 139.7, climate: "Humid temperate", economy: "Industrial post",  culture: "Disciplined, dense", density: "Dense",    seed: "0x4F08-EAS" },
  { id: "r-sea",  name: "Equatorial Strait", subtitle: "Southeast Asia", lat: 1.4, lng: 103.8,  climate: "Tropical wet",   economy: "Trade hub",        culture: "Plural, port",       density: "Dense",    seed: "0xBE77-SEA" },
  { id: "r-oce",  name: "Southern Coast", subtitle: "Oceania",          lat: -33.9, lng: 151.2, climate: "Mild temperate", economy: "Service & resource", culture: "Outdoor, casual",  density: "Moderate", seed: "0x3A55-OCE" },
  { id: "r-nae",  name: "Northeast Corridor", subtitle: "North America (East)", lat: 40.7, lng: -74.0, climate: "Humid continental", economy: "Finance & media", culture: "Ambitious, fast", density: "Dense", seed: "0x77D1-NAE" },
  { id: "r-naw",  name: "Pacific Coast", subtitle: "North America (West)", lat: 37.8, lng: -122.4, climate: "Mediterranean", economy: "Tech & creative", culture: "Casual, transient",   density: "Moderate", seed: "0x12C9-NAW" },
  { id: "r-sa1",  name: "Southern Cone", subtitle: "South America",     lat: -34.6, lng: -58.4, climate: "Humid subtropical", economy: "Mixed urban",  culture: "Expressive, late-night", density: "Dense", seed: "0x6E20-SAM" },
  { id: "r-and",  name: "Andean Plateau", subtitle: "Andes",            lat: -16.5, lng: -68.2, climate: "Highland cool",  economy: "Resource & informal", culture: "Traditional, devout", density: "Moderate", seed: "0xCC4B-AND" },
  { id: "r-nor",  name: "Arctic Edge", subtitle: "Far North",           lat: 69.6, lng: 18.9,   climate: "Subpolar",       economy: "Resource & remote", culture: "Sparse, hardy",     density: "Sparse",   seed: "0x0F19-ARC" },
];
