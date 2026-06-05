export type ProfessionArchetypeId =
  | "student"
  | "junior_dev"
  | "designer"
  | "artist"
  | "freelancer"
  | "office_worker"
  | "service_worker"
  | "healthcare"
  | "education"
  | "hospitality"
  | "blue_collar"
  | "unemployed";

export type ProfessionDomain =
  | "tech"
  | "art_media"
  | "business"
  | "service"
  | "education"
  | "health"
  | "hospitality"
  | "manual"
  | "other";

export interface ProfessionSuggestion {
  id: string;
  label: string;
  archetype: ProfessionArchetypeId;
  domain: ProfessionDomain;
}

export const DOMAIN_META: Record<ProfessionDomain, { label: string; tagline: string }> = {
  tech:        { label: "Technology",   tagline: "You build things that didn't exist before" },
  art_media:   { label: "Art & Media",  tagline: "You make the world more interesting" },
  business:    { label: "Business",     tagline: "You move between people and ideas" },
  service:     { label: "Service",      tagline: "You're there when others need something" },
  education:   { label: "Education",    tagline: "You shape how others see the world" },
  health:      { label: "Healthcare",   tagline: "You keep people going" },
  hospitality: { label: "Hospitality",  tagline: "You create the moments people remember" },
  manual:      { label: "Trades",       tagline: "You make things that last" },
  other:       { label: "Other",        tagline: "You're writing your own story" },
};

export const PROFESSION_DOMAINS = Object.keys(DOMAIN_META) as ProfessionDomain[];

export const DOMAIN_DEFAULT_ARCHETYPE: Record<ProfessionDomain, ProfessionArchetypeId> = {
  tech:        "junior_dev",
  art_media:   "artist",
  business:    "office_worker",
  service:     "service_worker",
  education:   "education",
  health:      "healthcare",
  hospitality: "hospitality",
  manual:      "blue_collar",
  other:       "freelancer",
};

const SUGGESTIONS: ProfessionSuggestion[] = [

  { id: "jr-dev",        label: "Junior Software Developer",  archetype: "junior_dev",    domain: "tech" },
  { id: "qa",            label: "QA Tester",                  archetype: "junior_dev",    domain: "tech" },
  { id: "it-support",    label: "IT Support Specialist",      archetype: "office_worker", domain: "tech" },
  { id: "data-analyst",  label: "Data Analyst",               archetype: "office_worker", domain: "tech" },
  { id: "ux-designer",   label: "UX Designer",                archetype: "designer",      domain: "tech" },
  { id: "product-mgr",   label: "Product Manager",            archetype: "office_worker", domain: "tech" },
  { id: "devops",        label: "DevOps Engineer",            archetype: "junior_dev",    domain: "tech" },

  { id: "graphic-des",   label: "Graphic Designer",           archetype: "designer",      domain: "art_media" },
  { id: "video-editor",  label: "Video Editor",               archetype: "artist",        domain: "art_media" },
  { id: "tattoo",        label: "Tattoo Artist",              archetype: "artist",        domain: "art_media" },
  { id: "photographer",  label: "Photographer",               archetype: "artist",        domain: "art_media" },
  { id: "illustrator",   label: "Illustrator",                archetype: "artist",        domain: "art_media" },
  { id: "music-prod",    label: "Music Producer",             archetype: "artist",        domain: "art_media" },
  { id: "content-cre",   label: "Content Creator",            archetype: "freelancer",    domain: "art_media" },

  { id: "marketing",     label: "Marketing Specialist",       archetype: "office_worker", domain: "business" },
  { id: "sales-rep",     label: "Sales Representative",       archetype: "office_worker", domain: "business" },
  { id: "accountant",    label: "Accountant",                 archetype: "office_worker", domain: "business" },
  { id: "hr",            label: "HR Coordinator",             archetype: "office_worker", domain: "business" },
  { id: "biz-analyst",   label: "Business Analyst",           archetype: "office_worker", domain: "business" },
  { id: "project-mgr",   label: "Project Manager",            archetype: "office_worker", domain: "business" },

  { id: "retail",        label: "Retail Sales Associate",     archetype: "service_worker", domain: "service" },
  { id: "cust-support",  label: "Customer Support Agent",     archetype: "service_worker", domain: "service" },
  { id: "security",      label: "Security Guard",             archetype: "service_worker", domain: "service" },
  { id: "delivery",      label: "Delivery Driver",            archetype: "service_worker", domain: "service" },
  { id: "cleaner",       label: "Cleaner",                    archetype: "service_worker", domain: "service" },
  { id: "postal",        label: "Postal Worker",              archetype: "service_worker", domain: "service" },

  { id: "teacher",       label: "School Teacher",             archetype: "education",     domain: "education" },
  { id: "lecturer",      label: "University Lecturer",        archetype: "education",     domain: "education" },
  { id: "tutor",         label: "Private Tutor",              archetype: "education",     domain: "education" },
  { id: "ta",            label: "Teaching Assistant",         archetype: "education",     domain: "education" },
  { id: "librarian",     label: "Librarian",                  archetype: "education",     domain: "education" },
  { id: "counselor",     label: "School Counselor",           archetype: "education",     domain: "education" },

  { id: "nurse",         label: "Nurse",                      archetype: "healthcare",    domain: "health" },
  { id: "paramedic",     label: "Paramedic",                  archetype: "healthcare",    domain: "health" },
  { id: "physio",        label: "Physiotherapist",            archetype: "healthcare",    domain: "health" },
  { id: "med-asst",      label: "Medical Assistant",          archetype: "healthcare",    domain: "health" },
  { id: "pharmacist",    label: "Pharmacist",                 archetype: "healthcare",    domain: "health" },
  { id: "social-work",   label: "Social Worker",              archetype: "healthcare",    domain: "health" },

  { id: "barista",       label: "Barista",                    archetype: "hospitality",   domain: "hospitality" },
  { id: "waiter",        label: "Waiter",                     archetype: "hospitality",   domain: "hospitality" },
  { id: "bartender",     label: "Bartender",                  archetype: "hospitality",   domain: "hospitality" },
  { id: "hotel-rec",     label: "Hotel Receptionist",         archetype: "hospitality",   domain: "hospitality" },
  { id: "chef",          label: "Chef",                       archetype: "hospitality",   domain: "hospitality" },
  { id: "event-staff",   label: "Event Staff",                archetype: "hospitality",   domain: "hospitality" },

  { id: "electrician",   label: "Electrician",                archetype: "blue_collar",   domain: "manual" },
  { id: "plumber",       label: "Plumber",                    archetype: "blue_collar",   domain: "manual" },
  { id: "construction",  label: "Construction Worker",        archetype: "blue_collar",   domain: "manual" },
  { id: "mechanic",      label: "Mechanic",                   archetype: "blue_collar",   domain: "manual" },
  { id: "carpenter",     label: "Carpenter",                  archetype: "blue_collar",   domain: "manual" },
  { id: "factory",       label: "Factory Worker",             archetype: "blue_collar",   domain: "manual" },

  { id: "freelancer",    label: "Freelancer",                 archetype: "freelancer",    domain: "other" },
  { id: "student",       label: "Student",                    archetype: "student",       domain: "other" },
  { id: "musician",      label: "Musician",                   archetype: "artist",        domain: "other" },
  { id: "dj",            label: "DJ",                         archetype: "artist",        domain: "other" },
  { id: "influencer",    label: "Influencer",                 archetype: "freelancer",    domain: "other" },
  { id: "athlete",       label: "Athlete",                    archetype: "freelancer",    domain: "other" },
  { id: "writer",        label: "Writer",                     archetype: "artist",        domain: "other" },
  { id: "unemployed",    label: "Between jobs",               archetype: "unemployed",    domain: "other" },
];

export function getSuggestionsByDomain(domain: ProfessionDomain): ProfessionSuggestion[] {
  return SUGGESTIONS.filter((s) => s.domain === domain);
}

export function derivePlayerArchetypeImpact(archetype: ProfessionArchetypeId): {
  baseSalaryTilt: number;
  workScheduleType: "office" | "service" | "creative" | "student" | "flexible";
  stressBaseline: number;
} {
  switch (archetype) {
    case "student":       return { baseSalaryTilt: -0.5,  workScheduleType: "student",  stressBaseline: 0.10 };
    case "junior_dev":    return { baseSalaryTilt: +0.2,  workScheduleType: "office",   stressBaseline: 0.15 };
    case "designer":      return { baseSalaryTilt: +0.1,  workScheduleType: "creative", stressBaseline: 0.12 };
    case "artist":        return { baseSalaryTilt: -0.3,  workScheduleType: "creative", stressBaseline: 0.18 };
    case "freelancer":    return { baseSalaryTilt:  0.0,  workScheduleType: "flexible", stressBaseline: 0.20 };
    case "office_worker": return { baseSalaryTilt:  0.0,  workScheduleType: "office",   stressBaseline: 0.12 };
    case "service_worker":return { baseSalaryTilt: -0.2,  workScheduleType: "service",  stressBaseline: 0.15 };
    case "healthcare":    return { baseSalaryTilt: +0.15, workScheduleType: "service",  stressBaseline: 0.20 };
    case "education":     return { baseSalaryTilt: -0.1,  workScheduleType: "office",   stressBaseline: 0.12 };
    case "hospitality":   return { baseSalaryTilt: -0.15, workScheduleType: "service",  stressBaseline: 0.18 };
    case "blue_collar":   return { baseSalaryTilt: -0.05, workScheduleType: "office",   stressBaseline: 0.14 };
    case "unemployed":    return { baseSalaryTilt: -1.0,  workScheduleType: "flexible", stressBaseline: 0.30 };
  }
}
