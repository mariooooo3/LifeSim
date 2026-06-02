// Core simulation engine
export * from "./types";
export * from "./constants";
export * from "./balancing";
export * from "./randomness";

// World generation
export * from "./worldSeed";
export * from "./world/index";

// NPC lifecycle
export * from "./npcFactory";
export * from "./needs";
export * from "./stress";
export * from "./relationships";
export * from "./consequences";
export * from "./opportunities";

// Decision making
export * from "./actionWeights";
export * from "./scoring";
export * from "./utilityAI";
export * from "./probabilities";

// Orchestration
export * from "./tick";
export * from "./storyteller";
export * from "./eventBuilder";
export * from "./narrator";

// Tooling (debug, sandbox, testing — not bundled in prod unless tree-shaken out)
export * from "./debug/index";
export * from "./sandbox/index";
export * from "./testing/index";
