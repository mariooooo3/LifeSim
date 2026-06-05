import type { CultureRegion } from "./regions";






type NamePool = { first: string[]; last: string[] };




const POOLS: Record<string, NamePool> = {
  japan: {
    first: ["Hana", "Yuki", "Akira", "Sora", "Kenji", "Mio", "Takeshi", "Nana",
            "Ren", "Ayaka", "Shin", "Kana", "Daiki", "Misaki", "Haruto",
            "Yuna", "Riku", "Asahi", "Emiko", "Naoki"],
    last:  ["Tanaka", "Sato", "Suzuki", "Ito", "Nakamura", "Kobayashi", "Kato",
            "Yamamoto", "Watanabe", "Abe", "Okamoto", "Nakai", "Fujita", "Kimura", "Hayashi"],
  },
  korea: {
    first: ["Jisu", "Minjun", "Sooyeon", "Hyunjin", "Yuna", "Taewon", "Seol",
            "Junho", "Hayeon", "Jiyeon", "Minseok", "Areum", "Jihoon", "Dayeon",
            "Soyeon", "Yeonwoo", "Jaehyun", "Donghyun", "Minji", "Taehun"],
    last:  ["Kim", "Lee", "Park", "Choi", "Jung", "Han", "Lim", "Oh", "Seo", "Yoon",
            "Shin", "Kwon", "Hong", "Jang", "Cho"],
  },
  china: {
    first: ["Wei", "Jia", "Min", "Feng", "Qian", "Xin", "Lei", "Yan", "Hao", "Chen",
            "Ling", "Kai", "Mei", "Jun", "Xiao", "Yue", "Zhen", "Hong", "Peng", "Yu"],
    last:  ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao", "Wu",
            "Zhou", "Sun", "Xu", "Zhu", "Lin", "Ma"],
  },
  nordic: {
    first: ["Astrid", "Erik", "Maja", "Lars", "Sigrid", "Björn", "Freya", "Mattias",
            "Ingrid", "Nils", "Elsa", "Sven", "Karin", "Tuuli", "Magnus",
            "Ida", "Oskar", "Frida", "Anders", "Lilja"],
    last:  ["Andersen", "Berg", "Carlsson", "Dahl", "Eriksen", "Lindberg", "Nielsen",
            "Svensson", "Johansson", "Hansen", "Larsen", "Pedersen", "Holm", "Strand", "Lund"],
  },
  germanic: {
    first: ["Klaus", "Lena", "Friedrich", "Sophie", "Hans", "Anna", "Tobias", "Maria",
            "Felix", "Julia", "Stefan", "Katharina", "Emma", "Markus", "Sarah",
            "Benedikt", "Laura", "Fabian", "Clara", "Lukas"],
    last:  ["Müller", "Schneider", "Fischer", "Weber", "Bauer", "Hoffmann", "Koch",
            "Richter", "Wagner", "Becker", "Schulz", "Meyer", "Lehmann", "König", "Zimmermann"],
  },
  french: {
    first: ["Camille", "Hugo", "Léa", "Antoine", "Chloé", "Pierre", "Inès", "Louis",
            "Manon", "Julien", "Emma", "Nicolas", "Sarah", "Baptiste", "Alice",
            "Théo", "Lucie", "Maxime", "Zoé", "Clément"],
    last:  ["Dubois", "Martin", "Bernard", "Leroy", "Moreau", "Simon", "Laurent",
            "Lefebvre", "Roux", "David", "Bertrand", "Thomas", "Robert", "Richard", "Petit"],
  },
  italian: {
    first: ["Marco", "Sofia", "Luca", "Elena", "Alessandro", "Giulia", "Lorenzo",
            "Chiara", "Matteo", "Francesca", "Andrea", "Valentina", "Federico",
            "Aurora", "Simone", "Beatrice", "Davide", "Sara", "Riccardo", "Elisa"],
    last:  ["Rossi", "Ferrari", "Russo", "Bianchi", "Esposito", "Romano", "Colombo",
            "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Costa"],
  },
  iberian: {
    first: ["Carlos", "Lucía", "Miguel", "Ana", "Alejandro", "Carmen", "Pablo",
            "María", "Javier", "Elena", "David", "Isabel", "Sergio", "Alba",
            "Daniel", "Sofía", "Adrián", "Laura", "Jorge", "Marta"],
    last:  ["García", "Martínez", "López", "Sánchez", "González", "Rodríguez",
            "Fernández", "Torres", "Ramírez", "Flores", "Díaz", "Reyes", "Morales", "Cruz", "Silva"],
  },
  eastern_europe: {
    first: ["Aleksei", "Katerina", "Dmitri", "Natalya", "Pavel", "Anya", "Mikhail",
            "Olga", "Vasyl", "Iryna", "Radovan", "Milena", "Bogdan", "Zuzanna",
            "Tomáš", "Klára", "Andrzej", "Monika", "Vlad", "Elena"],
    last:  ["Nowak", "Kovač", "Popescu", "Ivanov", "Horváth", "Novák", "Petrović",
            "Kovalenko", "Kowalski", "Szabó", "Müller", "Bogdanov", "Ionescu", "Popa", "Stoian"],
  },
  slavic: {
    first: ["Aleksei", "Natasha", "Dmitri", "Olga", "Mikhail", "Irina", "Pavel",
            "Tatiana", "Sergei", "Yelena", "Andrei", "Anastasia", "Nikolai",
            "Katya", "Vladimir", "Lara", "Igor", "Sonya", "Maxim", "Dasha"],
    last:  ["Ivanov", "Smirnov", "Kuznetsov", "Popov", "Sokolov", "Lebedev",
            "Kozlov", "Novikov", "Morozov", "Petrov", "Volkov", "Soloviev", "Vasiliev", "Fedorov", "Orlov"],
  },
  middle_east: {
    first: ["Omar", "Layla", "Ahmad", "Fatima", "Khalid", "Sara", "Yusuf", "Noor",
            "Hassan", "Mariam", "Tariq", "Hana", "Karim", "Rania", "Ziad",
            "Yasmine", "Faisal", "Dina", "Bilal", "Leila"],
    last:  ["Al-Hassan", "Khalil", "Rahman", "Al-Rashid", "Mansour", "Al-Sayed",
            "Ibrahim", "Nasser", "Al-Amin", "Qasem", "Saleh", "Al-Farsi", "Hamdan", "Yousef", "Al-Jabri"],
  },
  gulf: {
    first: ["Mohammed", "Fatima", "Abdullah", "Aisha", "Sultan", "Maryam", "Khalid",
            "Noura", "Ahmad", "Hessa", "Saif", "Reem", "Rashid", "Shamma",
            "Hamdan", "Maitha", "Faisal", "Latifa", "Mansoor", "Shamsa"],
    last:  ["Al-Maktoum", "Al-Saud", "Al-Thani", "Al-Nahyan", "Al-Sabah", "Al-Farsi",
            "Al-Rashidi", "Al-Dosari", "Al-Harbi", "Al-Otaibi", "Al-Qahtani", "Al-Shammari", "Al-Ghamdi", "Al-Mutairi", "Al-Zahrani"],
  },
  south_asian: {
    first: ["Priya", "Arjun", "Aisha", "Rahul", "Meera", "Kabir", "Nisha", "Rohan",
            "Divya", "Vikram", "Ananya", "Kunal", "Pooja", "Rajan", "Shreya",
            "Aditya", "Kavya", "Mihir", "Zara", "Farhan"],
    last:  ["Sharma", "Patel", "Singh", "Kumar", "Gupta", "Verma", "Reddy", "Rao",
            "Mehta", "Bose", "Khan", "Iyer", "Nair", "Pillai", "Acharya"],
  },
  africa: {
    first: ["Kofi", "Amara", "Kwame", "Fatou", "Emeka", "Adaeze", "Seun", "Ngozi",
            "Jabari", "Amani", "Chidi", "Zainab", "Abebe", "Thandie", "Wanjiru",
            "Osei", "Zawadi", "Taiwo", "Kehinde", "Ife"],
    last:  ["Okonkwo", "Mensah", "Diallo", "Okafor", "Ndlovu", "Abara", "Kamara",
            "Mwangi", "Dlamini", "Asante", "Nwosu", "Boateng", "Traore", "Eze", "Adeyemi"],
  },
  latin_american: {
    first: ["Santiago", "Valentina", "Mateo", "Camila", "Diego", "Isabella", "Sebastián",
            "Sofía", "Emilio", "Gabriela", "Andrés", "Catalina", "Nicolás", "Verónica",
            "Rodrigo", "Fernanda", "Tomás", "Mariana", "Javier", "Daniela"],
    last:  ["García", "Rodríguez", "Martínez", "López", "González", "Hernández",
            "Pérez", "Sánchez", "Ramirez", "Torres", "Flores", "Rivera", "Cruz", "Morales", "Reyes"],
  },
  north_american: {
    first: ["Jordan", "Taylor", "Marcus", "Ashley", "Tyler", "Melissa", "Brandon",
            "Kayla", "Derek", "Amanda", "Ryan", "Jessica", "Kevin", "Lauren",
            "Jason", "Rachel", "Sean", "Brittany", "Kyle", "Amber"],
    last:  ["Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson", "Moore",
            "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson"],
  },
  southeast_asian: {
    first: ["Arif", "Sari", "Bintang", "Thanh", "Mai", "Budi", "Rina", "Nuan",
            "Kanya", "Putri", "Anh", "Dewi", "Reza", "Nurul", "Pham",
            "Chanda", "Wira", "Linh", "Suporn", "Yanti"],
    last:  ["Nguyen", "Tan", "Lim", "Santoso", "Reyes", "Pham", "Kaur", "Cruz",
            "Bui", "Ho", "Tran", "Suksawat", "Wijaya", "Dela Cruz", "Santos"],
  },
  anglophone: {
    first: ["James", "Emma", "Oliver", "Charlotte", "William", "Sophia", "Ethan",
            "Ava", "Benjamin", "Isabella", "Lucas", "Mia", "Henry", "Amelia",
            "Alexander", "Harper", "Daniel", "Evelyn", "Matthew", "Grace"],
    last:  ["Smith", "Jones", "Williams", "Brown", "Taylor", "Davies", "Evans",
            "Wilson", "Thomas", "Roberts", "Johnson", "Walker", "Wright", "Thompson", "Robinson"],
  },
  romanian: {
    first: ["Ana", "Andrei", "Maria", "Alexandru", "Elena", "Mihai", "Ioana",
            "Cristian", "Cristina", "Ionuț", "Roxana", "Bogdan", "Andreea",
            "Radu", "Alina", "Vlad", "Mădălina", "Florin", "Diana", "Marius"],
    last:  ["Popescu", "Ionescu", "Popa", "Matei", "Stoica", "Dumitru", "Florescu",
            "Rusu", "Niculescu", "Munteanu", "Dima", "Rotaru", "Tudor", "Ciobanu", "Preda"],
  },
};


const REGION_POOL: Record<CultureRegion, string> = {
  japan:          "japan",
  korea:          "korea",
  china:          "china",
  nordic:         "nordic",
  germanic:       "germanic",
  romance_europe: "french",       
  eastern_europe: "eastern_europe",
  slavic:         "slavic",
  middle_east:    "middle_east",
  gulf:           "gulf",
  south_asian:    "south_asian",
  africa:         "africa",
  latin_american: "latin_american",
  north_american: "north_american",
  southeast_asian:"southeast_asian",
  anglophone:     "anglophone",
};


const CITY_POOL_OVERRIDE: Record<string, string> = {

  "c-paris": "french",

  "c-rome": "italian", "c-milan": "italian",

  "c-madrid": "iberian", "c-barcelona": "iberian",
  "c-lisbon": "iberian", "c-porto": "iberian",

  "c-berlin": "germanic", "c-hamburg": "germanic", "c-munich": "germanic",
  "c-vienna": "germanic", "c-zurich": "germanic",

  "c-amsterdam": "germanic",

  "c-bucharest": "romanian",
  "c-cluj":      "romanian",
  "c-iasi":      "romanian",
  "c-timisoara": "romanian",
};




function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed >>> 0;
  for (let i = out.length - 1; i > 0; i--) {
    s = ((s * 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface GeneratedName {
  name: string;
  initials: string;
}

export function pickNames(
  region: CultureRegion,
  cityId: string,
  worldSeed: number,
  count: number,
): GeneratedName[] {
  const poolKey = CITY_POOL_OVERRIDE[cityId] ?? REGION_POOL[region];
  const pool    = POOLS[poolKey] ?? POOLS.anglophone;

  const firsts = seededShuffle(pool.first, worldSeed ^ 0xdeadbeef).slice(0, count);
  const lasts  = seededShuffle(pool.last,  worldSeed ^ 0xc0ffee01).slice(0, count);

  return firsts.map((first, i) => {
    const last = lasts[i % lasts.length];
    return {
      name:     `${first} ${last}`,
      initials: `${first[0]}${last[0]}`,
    };
  });
}
