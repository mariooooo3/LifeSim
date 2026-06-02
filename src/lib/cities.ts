import { buildWorldSeed } from "./simulation/worldSeed";

export interface City {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export interface CityTexture {
  climate: string;
  economy: string;
  culture: string;
  density: "Sparse" | "Moderate" | "Dense";
  seed: string;
}

export const CITIES: City[] = [
  // Europe
  { id: "c-stockholm",   name: "Stockholm",        country: "Sweden",           lat:  59.3,  lng:  18.1  },
  { id: "c-london",      name: "London",            country: "United Kingdom",   lat:  51.5,  lng:  -0.1  },
  { id: "c-paris",       name: "Paris",             country: "France",           lat:  48.9,  lng:   2.3  },
  { id: "c-berlin",      name: "Berlin",            country: "Germany",          lat:  52.5,  lng:  13.4  },
  { id: "c-madrid",      name: "Madrid",            country: "Spain",            lat:  40.4,  lng:  -3.7  },
  { id: "c-rome",        name: "Rome",              country: "Italy",            lat:  41.9,  lng:  12.5  },
  { id: "c-athens",      name: "Athens",            country: "Greece",           lat:  37.9,  lng:  23.7  },
  { id: "c-amsterdam",   name: "Amsterdam",         country: "Netherlands",      lat:  52.4,  lng:   4.9  },
  { id: "c-vienna",      name: "Vienna",            country: "Austria",          lat:  48.2,  lng:  16.4  },
  { id: "c-prague",      name: "Prague",            country: "Czech Republic",   lat:  50.1,  lng:  14.4  },
  { id: "c-warsaw",      name: "Warsaw",            country: "Poland",           lat:  52.2,  lng:  21.0  },
  { id: "c-lisbon",      name: "Lisbon",            country: "Portugal",         lat:  38.7,  lng:  -9.1  },
  { id: "c-copenhagen",  name: "Copenhagen",        country: "Denmark",          lat:  55.7,  lng:  12.6  },
  { id: "c-helsinki",    name: "Helsinki",          country: "Finland",          lat:  60.2,  lng:  25.0  },
  { id: "c-oslo",        name: "Oslo",              country: "Norway",           lat:  59.9,  lng:  10.8  },
  { id: "c-dublin",      name: "Dublin",            country: "Ireland",          lat:  53.3,  lng:  -6.3  },
  { id: "c-brussels",    name: "Brussels",          country: "Belgium",          lat:  50.8,  lng:   4.4  },
  { id: "c-zurich",      name: "Zurich",            country: "Switzerland",      lat:  47.4,  lng:   8.5  },
  { id: "c-budapest",    name: "Budapest",          country: "Hungary",          lat:  47.5,  lng:  19.1  },
  { id: "c-bucharest",   name: "Bucharest",         country: "Romania",          lat:  44.4,  lng:  26.1  },
  { id: "c-kyiv",        name: "Kyiv",              country: "Ukraine",          lat:  50.5,  lng:  30.5  },
  { id: "c-reykjavik",   name: "Reykjavik",         country: "Iceland",          lat:  64.1,  lng: -21.9  },
  { id: "c-tallinn",     name: "Tallinn",           country: "Estonia",          lat:  59.4,  lng:  24.7  },
  { id: "c-riga",        name: "Riga",              country: "Latvia",           lat:  56.9,  lng:  24.1  },
  { id: "c-vilnius",     name: "Vilnius",           country: "Lithuania",        lat:  54.7,  lng:  25.3  },
  { id: "c-belgrade",    name: "Belgrade",          country: "Serbia",           lat:  44.8,  lng:  20.5  },
  { id: "c-zagreb",      name: "Zagreb",            country: "Croatia",          lat:  45.8,  lng:  16.0  },
  { id: "c-tbilisi",     name: "Tbilisi",           country: "Georgia",          lat:  41.7,  lng:  44.8  },
  { id: "c-milan",       name: "Milan",             country: "Italy",            lat:  45.5,  lng:   9.2  },
  { id: "c-barcelona",   name: "Barcelona",         country: "Spain",            lat:  41.4,  lng:   2.2  },
  { id: "c-porto",       name: "Porto",             country: "Portugal",         lat:  41.2,  lng:  -8.6  },
  { id: "c-munich",      name: "Munich",            country: "Germany",          lat:  48.1,  lng:  11.6  },
  { id: "c-hamburg",     name: "Hamburg",           country: "Germany",          lat:  53.6,  lng:  10.0  },
  { id: "c-valletta",    name: "Valletta",          country: "Malta",            lat:  35.9,  lng:  14.5  },
  { id: "c-nicosia",     name: "Nicosia",           country: "Cyprus",           lat:  35.2,  lng:  33.4  },
  { id: "c-baku",        name: "Baku",              country: "Azerbaijan",       lat:  40.4,  lng:  49.9  },
  { id: "c-yerevan",     name: "Yerevan",           country: "Armenia",          lat:  40.2,  lng:  44.5  },
  { id: "c-minsk",       name: "Minsk",             country: "Belarus",          lat:  53.9,  lng:  27.6  },
  { id: "c-chisinau",    name: "Chișinău",          country: "Moldova",          lat:  47.0,  lng:  28.9  },
  { id: "c-sofia",       name: "Sofia",             country: "Bulgaria",         lat:  42.7,  lng:  23.3  },

  // Middle East
  { id: "c-dubai",       name: "Dubai",             country: "UAE",              lat:  25.2,  lng:  55.3  },
  { id: "c-istanbul",    name: "Istanbul",          country: "Turkey",           lat:  41.0,  lng:  28.9  },
  { id: "c-tehran",      name: "Tehran",            country: "Iran",             lat:  35.7,  lng:  51.4  },
  { id: "c-baghdad",     name: "Baghdad",           country: "Iraq",             lat:  33.3,  lng:  44.4  },
  { id: "c-riyadh",      name: "Riyadh",            country: "Saudi Arabia",     lat:  24.7,  lng:  46.7  },
  { id: "c-beirut",      name: "Beirut",            country: "Lebanon",          lat:  33.9,  lng:  35.5  },
  { id: "c-amman",       name: "Amman",             country: "Jordan",           lat:  31.9,  lng:  35.9  },
  { id: "c-telaviv",     name: "Tel Aviv",          country: "Israel",           lat:  32.1,  lng:  34.8  },
  { id: "c-muscat",      name: "Muscat",            country: "Oman",             lat:  23.6,  lng:  58.6  },
  { id: "c-doha",        name: "Doha",              country: "Qatar",            lat:  25.3,  lng:  51.5  },
  { id: "c-ankara",      name: "Ankara",            country: "Turkey",           lat:  39.9,  lng:  32.9  },
  { id: "c-abudhabi",    name: "Abu Dhabi",         country: "UAE",              lat:  24.5,  lng:  54.4  },
  { id: "c-jeddah",      name: "Jeddah",            country: "Saudi Arabia",     lat:  21.5,  lng:  39.2  },
  { id: "c-kabul",       name: "Kabul",             country: "Afghanistan",      lat:  34.5,  lng:  69.2  },
  { id: "c-damascus",    name: "Damascus",          country: "Syria",            lat:  33.5,  lng:  36.3  },

  // South Asia
  { id: "c-mumbai",      name: "Mumbai",            country: "India",            lat:  19.1,  lng:  72.9  },
  { id: "c-delhi",       name: "Delhi",             country: "India",            lat:  28.7,  lng:  77.1  },
  { id: "c-bangalore",   name: "Bangalore",         country: "India",            lat:  13.0,  lng:  77.6  },
  { id: "c-kolkata",     name: "Kolkata",           country: "India",            lat:  22.6,  lng:  88.4  },
  { id: "c-chennai",     name: "Chennai",           country: "India",            lat:  13.1,  lng:  80.3  },
  { id: "c-karachi",     name: "Karachi",           country: "Pakistan",         lat:  24.9,  lng:  67.0  },
  { id: "c-lahore",      name: "Lahore",            country: "Pakistan",         lat:  31.5,  lng:  74.3  },
  { id: "c-dhaka",       name: "Dhaka",             country: "Bangladesh",       lat:  23.8,  lng:  90.4  },
  { id: "c-colombo",     name: "Colombo",           country: "Sri Lanka",        lat:   6.9,  lng:  79.9  },
  { id: "c-kathmandu",   name: "Kathmandu",         country: "Nepal",            lat:  27.7,  lng:  85.3  },
  { id: "c-pune",        name: "Pune",              country: "India",            lat:  18.5,  lng:  73.9  },
  { id: "c-hyderabad",   name: "Hyderabad",         country: "India",            lat:  17.4,  lng:  78.5  },
  { id: "c-islamabad",   name: "Islamabad",         country: "Pakistan",         lat:  33.7,  lng:  73.1  },
  { id: "c-ahmedabad",   name: "Ahmedabad",         country: "India",            lat:  23.0,  lng:  72.6  },
  { id: "c-chittagong",  name: "Chittagong",        country: "Bangladesh",       lat:  22.4,  lng:  91.8  },

  // East Asia
  { id: "c-tokyo",       name: "Tokyo",             country: "Japan",            lat:  35.7,  lng: 139.7  },
  { id: "c-beijing",     name: "Beijing",           country: "China",            lat:  39.9,  lng: 116.4  },
  { id: "c-shanghai",    name: "Shanghai",          country: "China",            lat:  31.2,  lng: 121.5  },
  { id: "c-guangzhou",   name: "Guangzhou",         country: "China",            lat:  23.1,  lng: 113.3  },
  { id: "c-seoul",       name: "Seoul",             country: "South Korea",      lat:  37.6,  lng: 127.0  },
  { id: "c-hongkong",    name: "Hong Kong",         country: "China",            lat:  22.3,  lng: 114.2  },
  { id: "c-taipei",      name: "Taipei",            country: "Taiwan",           lat:  25.0,  lng: 121.5  },
  { id: "c-osaka",       name: "Osaka",             country: "Japan",            lat:  34.7,  lng: 135.5  },
  { id: "c-shenzhen",    name: "Shenzhen",          country: "China",            lat:  22.5,  lng: 114.1  },
  { id: "c-chengdu",     name: "Chengdu",           country: "China",            lat:  30.7,  lng: 104.1  },
  { id: "c-busan",       name: "Busan",             country: "South Korea",      lat:  35.1,  lng: 129.0  },
  { id: "c-ulaanbaatar", name: "Ulaanbaatar",       country: "Mongolia",         lat:  47.9,  lng: 106.9  },
  { id: "c-kyoto",       name: "Kyoto",             country: "Japan",            lat:  35.0,  lng: 135.8  },
  { id: "c-wuhan",       name: "Wuhan",             country: "China",            lat:  30.6,  lng: 114.3  },
  { id: "c-chongqing",   name: "Chongqing",         country: "China",            lat:  29.6,  lng: 106.5  },
  { id: "c-xian",        name: "Xi'an",             country: "China",            lat:  34.3,  lng: 108.9  },
  { id: "c-sapporo",     name: "Sapporo",           country: "Japan",            lat:  43.1,  lng: 141.4  },
  { id: "c-fukuoka",     name: "Fukuoka",           country: "Japan",            lat:  33.6,  lng: 130.4  },
  { id: "c-nanjing",     name: "Nanjing",           country: "China",            lat:  32.1,  lng: 118.8  },
  { id: "c-tianjin",     name: "Tianjin",           country: "China",            lat:  39.1,  lng: 117.2  },
  { id: "c-pyongyang",   name: "Pyongyang",         country: "North Korea",      lat:  39.0,  lng: 125.7  },

  // Southeast Asia
  { id: "c-singapore",   name: "Singapore",         country: "Singapore",        lat:   1.4,  lng: 103.8  },
  { id: "c-bangkok",     name: "Bangkok",           country: "Thailand",         lat:  13.8,  lng: 100.5  },
  { id: "c-hcmc",        name: "Ho Chi Minh City",  country: "Vietnam",          lat:  10.8,  lng: 106.7  },
  { id: "c-jakarta",     name: "Jakarta",           country: "Indonesia",        lat:  -6.2,  lng: 106.8  },
  { id: "c-manila",      name: "Manila",            country: "Philippines",      lat:  14.6,  lng: 121.0  },
  { id: "c-kualalumpur", name: "Kuala Lumpur",      country: "Malaysia",         lat:   3.1,  lng: 101.7  },
  { id: "c-yangon",      name: "Yangon",            country: "Myanmar",          lat:  16.9,  lng:  96.2  },
  { id: "c-hanoi",       name: "Hanoi",             country: "Vietnam",          lat:  21.0,  lng: 105.8  },
  { id: "c-phnompenh",   name: "Phnom Penh",        country: "Cambodia",         lat:  11.6,  lng: 104.9  },
  { id: "c-surabaya",    name: "Surabaya",          country: "Indonesia",        lat:  -7.2,  lng: 112.7  },
  { id: "c-cebu",        name: "Cebu",              country: "Philippines",      lat:  10.3,  lng: 123.9  },
  { id: "c-chiangmai",   name: "Chiang Mai",        country: "Thailand",         lat:  18.8,  lng:  99.0  },
  { id: "c-danang",      name: "Da Nang",           country: "Vietnam",          lat:  16.1,  lng: 108.2  },
  { id: "c-vientiane",   name: "Vientiane",         country: "Laos",             lat:  18.0,  lng: 102.6  },
  { id: "c-bandarwon",   name: "Bandar Seri Begawan", country: "Brunei",         lat:   4.9,  lng: 114.9  },
  { id: "c-dili",        name: "Dili",              country: "Timor-Leste",      lat:  -8.6,  lng: 125.6  },

  // Central Asia & Russia
  { id: "c-moscow",      name: "Moscow",            country: "Russia",           lat:  55.8,  lng:  37.6  },
  { id: "c-stpetersburg",name: "Saint Petersburg",  country: "Russia",           lat:  59.9,  lng:  30.3  },
  { id: "c-almaty",      name: "Almaty",            country: "Kazakhstan",       lat:  43.3,  lng:  76.9  },
  { id: "c-tashkent",    name: "Tashkent",          country: "Uzbekistan",       lat:  41.3,  lng:  69.3  },
  { id: "c-bishkek",     name: "Bishkek",           country: "Kyrgyzstan",       lat:  42.9,  lng:  74.6  },
  { id: "c-novosibirsk", name: "Novosibirsk",       country: "Russia",           lat:  55.0,  lng:  82.9  },
  { id: "c-yekaterinburg",name:"Yekaterinburg",     country: "Russia",           lat:  56.8,  lng:  60.6  },
  { id: "c-astana",      name: "Astana",            country: "Kazakhstan",       lat:  51.2,  lng:  71.4  },
  { id: "c-dushanbe",    name: "Dushanbe",          country: "Tajikistan",       lat:  38.6,  lng:  68.8  },
  { id: "c-ashgabat",    name: "Ashgabat",          country: "Turkmenistan",     lat:  37.9,  lng:  58.4  },
  { id: "c-samarkand",   name: "Samarkand",         country: "Uzbekistan",       lat:  39.6,  lng:  67.0  },
  { id: "c-vladivostok", name: "Vladivostok",       country: "Russia",           lat:  43.1,  lng: 131.9  },
  { id: "c-irkutsk",     name: "Irkutsk",           country: "Russia",           lat:  52.3,  lng: 104.3  },

  // Africa
  { id: "c-lagos",       name: "Lagos",             country: "Nigeria",          lat:   6.5,  lng:   3.4  },
  { id: "c-cairo",       name: "Cairo",             country: "Egypt",            lat:  30.0,  lng:  31.2  },
  { id: "c-nairobi",     name: "Nairobi",           country: "Kenya",            lat:  -1.3,  lng:  36.8  },
  { id: "c-johannesburg",name: "Johannesburg",      country: "South Africa",     lat: -26.2,  lng:  28.0  },
  { id: "c-capetown",    name: "Cape Town",         country: "South Africa",     lat: -33.9,  lng:  18.4  },
  { id: "c-casablanca",  name: "Casablanca",        country: "Morocco",          lat:  33.6,  lng:  -7.6  },
  { id: "c-addisababa",  name: "Addis Ababa",       country: "Ethiopia",         lat:   9.0,  lng:  38.7  },
  { id: "c-accra",       name: "Accra",             country: "Ghana",            lat:   5.6,  lng:  -0.2  },
  { id: "c-dakar",       name: "Dakar",             country: "Senegal",          lat:  14.7,  lng: -17.5  },
  { id: "c-kinshasa",    name: "Kinshasa",          country: "DR Congo",         lat:  -4.3,  lng:  15.3  },
  { id: "c-abidjan",     name: "Abidjan",           country: "Ivory Coast",      lat:   5.4,  lng:  -4.0  },
  { id: "c-khartoum",    name: "Khartoum",          country: "Sudan",            lat:  15.6,  lng:  32.5  },
  { id: "c-daressalaam", name: "Dar es Salaam",     country: "Tanzania",         lat:  -6.8,  lng:  39.3  },
  { id: "c-kampala",     name: "Kampala",           country: "Uganda",           lat:   0.3,  lng:  32.6  },
  { id: "c-harare",      name: "Harare",            country: "Zimbabwe",         lat: -17.8,  lng:  31.0  },
  { id: "c-lusaka",      name: "Lusaka",            country: "Zambia",           lat: -15.4,  lng:  28.3  },
  { id: "c-luanda",      name: "Luanda",            country: "Angola",           lat:  -8.8,  lng:  13.2  },
  { id: "c-maputo",      name: "Maputo",            country: "Mozambique",       lat: -25.9,  lng:  32.6  },
  { id: "c-tunis",       name: "Tunis",             country: "Tunisia",          lat:  36.8,  lng:  10.2  },
  { id: "c-algiers",     name: "Algiers",           country: "Algeria",          lat:  36.7,  lng:   3.1  },
  { id: "c-kigali",      name: "Kigali",            country: "Rwanda",           lat:  -1.9,  lng:  30.1  },
  { id: "c-douala",      name: "Douala",            country: "Cameroon",         lat:   4.1,  lng:   9.7  },
  { id: "c-bamako",      name: "Bamako",            country: "Mali",             lat:  12.7,  lng:  -8.0  },
  { id: "c-abuja",       name: "Abuja",             country: "Nigeria",          lat:   9.1,  lng:   7.5  },
  { id: "c-windhoek",    name: "Windhoek",          country: "Namibia",          lat: -22.6,  lng:  17.1  },
  { id: "c-antananarivo",name: "Antananarivo",      country: "Madagascar",       lat: -18.9,  lng:  47.5  },
  { id: "c-portlouis",   name: "Port Louis",        country: "Mauritius",        lat: -20.2,  lng:  57.5  },
  { id: "c-tripoli",     name: "Tripoli",           country: "Libya",            lat:  32.9,  lng:  13.2  },
  { id: "c-mogadishu",   name: "Mogadishu",         country: "Somalia",          lat:   2.0,  lng:  45.3  },
  { id: "c-conakry",     name: "Conakry",           country: "Guinea",           lat:   9.5,  lng: -13.7  },
  { id: "c-freetown",    name: "Freetown",          country: "Sierra Leone",     lat:   8.5,  lng: -13.2  },
  { id: "c-niamey",      name: "Niamey",            country: "Niger",            lat:  13.5,  lng:   2.1  },

  // North America
  { id: "c-newyork",     name: "New York",          country: "USA",              lat:  40.7,  lng: -74.0  },
  { id: "c-losangeles",  name: "Los Angeles",       country: "USA",              lat:  34.1,  lng:-118.2  },
  { id: "c-chicago",     name: "Chicago",           country: "USA",              lat:  41.9,  lng: -87.6  },
  { id: "c-houston",     name: "Houston",           country: "USA",              lat:  29.8,  lng: -95.4  },
  { id: "c-miami",       name: "Miami",             country: "USA",              lat:  25.8,  lng: -80.2  },
  { id: "c-seattle",     name: "Seattle",           country: "USA",              lat:  47.6,  lng:-122.3  },
  { id: "c-boston",      name: "Boston",            country: "USA",              lat:  42.4,  lng: -71.1  },
  { id: "c-sanfrancisco",name: "San Francisco",     country: "USA",              lat:  37.8,  lng:-122.4  },
  { id: "c-toronto",     name: "Toronto",           country: "Canada",           lat:  43.7,  lng: -79.4  },
  { id: "c-montreal",    name: "Montréal",          country: "Canada",           lat:  45.5,  lng: -73.6  },
  { id: "c-vancouver",   name: "Vancouver",         country: "Canada",           lat:  49.3,  lng:-123.1  },
  { id: "c-mexicocity",  name: "Mexico City",       country: "Mexico",           lat:  19.4,  lng: -99.1  },
  { id: "c-guadalajara", name: "Guadalajara",       country: "Mexico",           lat:  20.7,  lng:-103.3  },
  { id: "c-denver",      name: "Denver",            country: "USA",              lat:  39.7,  lng:-104.9  },
  { id: "c-atlanta",     name: "Atlanta",           country: "USA",              lat:  33.7,  lng: -84.4  },
  { id: "c-washingtondc",name: "Washington D.C.",   country: "USA",              lat:  38.9,  lng: -77.0  },
  { id: "c-dallas",      name: "Dallas",            country: "USA",              lat:  32.8,  lng: -96.8  },
  { id: "c-phoenix",     name: "Phoenix",           country: "USA",              lat:  33.4,  lng:-112.1  },
  { id: "c-portland",    name: "Portland",          country: "USA",              lat:  45.5,  lng:-122.7  },
  { id: "c-minneapolis", name: "Minneapolis",       country: "USA",              lat:  45.0,  lng: -93.3  },
  { id: "c-neworleans",  name: "New Orleans",       country: "USA",              lat:  30.0,  lng: -90.1  },
  { id: "c-havana",      name: "Havana",            country: "Cuba",             lat:  23.1,  lng: -82.4  },
  { id: "c-sanjose",     name: "San José",          country: "Costa Rica",       lat:   9.9,  lng: -84.1  },
  { id: "c-calgary",     name: "Calgary",           country: "Canada",           lat:  51.0,  lng:-114.1  },
  { id: "c-santiagochile", name: "Santiago",        country: "Chile",            lat: -33.5,  lng: -70.7  },

  // South America
  { id: "c-saopaulo",    name: "São Paulo",         country: "Brazil",           lat: -23.5,  lng: -46.6  },
  { id: "c-riodejaneiro",name: "Rio de Janeiro",    country: "Brazil",           lat: -22.9,  lng: -43.2  },
  { id: "c-buenosaires", name: "Buenos Aires",      country: "Argentina",        lat: -34.6,  lng: -58.4  },
  { id: "c-lima",        name: "Lima",              country: "Peru",             lat: -12.0,  lng: -77.0  },
  { id: "c-bogota",      name: "Bogotá",            country: "Colombia",         lat:   4.7,  lng: -74.1  },
  { id: "c-medellin",    name: "Medellín",          country: "Colombia",         lat:   6.3,  lng: -75.6  },
  { id: "c-quito",       name: "Quito",             country: "Ecuador",          lat:  -0.2,  lng: -78.5  },
  { id: "c-montevideo",  name: "Montevideo",        country: "Uruguay",          lat: -34.9,  lng: -56.2  },
  { id: "c-lapaz",       name: "La Paz",            country: "Bolivia",          lat: -16.5,  lng: -68.2  },
  { id: "c-asuncion",    name: "Asunción",          country: "Paraguay",         lat: -25.3,  lng: -57.6  },
  { id: "c-caracas",     name: "Caracas",           country: "Venezuela",        lat:  10.5,  lng: -66.9  },
  { id: "c-recife",      name: "Recife",            country: "Brazil",           lat:  -8.1,  lng: -34.9  },
  { id: "c-brasilia",    name: "Brasília",          country: "Brazil",           lat: -15.8,  lng: -47.9  },
  { id: "c-guayaquil",   name: "Guayaquil",         country: "Ecuador",          lat:  -2.2,  lng: -79.9  },
  { id: "c-puntaarenas", name: "Punta Arenas",      country: "Chile",            lat: -53.2,  lng: -70.9  },

  // Oceania
  { id: "c-sydney",      name: "Sydney",            country: "Australia",        lat: -33.9,  lng: 151.2  },
  { id: "c-melbourne",   name: "Melbourne",         country: "Australia",        lat: -37.8,  lng: 145.0  },
  { id: "c-brisbane",    name: "Brisbane",          country: "Australia",        lat: -27.5,  lng: 153.0  },
  { id: "c-perth",       name: "Perth",             country: "Australia",        lat: -31.9,  lng: 115.9  },
  { id: "c-auckland",    name: "Auckland",          country: "New Zealand",      lat: -36.9,  lng: 174.8  },
  { id: "c-wellington",  name: "Wellington",        country: "New Zealand",      lat: -41.3,  lng: 174.8  },
  { id: "c-adelaide",    name: "Adelaide",          country: "Australia",        lat: -34.9,  lng: 138.6  },
  { id: "c-christchurch",name: "Christchurch",      country: "New Zealand",      lat: -43.5,  lng: 172.6  },
  { id: "c-suva",        name: "Suva",              country: "Fiji",             lat: -18.1,  lng: 178.4  },
  { id: "c-portmoresby", name: "Port Moresby",      country: "Papua New Guinea", lat:  -9.4,  lng: 147.2  },
  { id: "c-noumea",      name: "Nouméa",            country: "New Caledonia",    lat: -22.3,  lng: 166.5  },

  // Edge of the world
  { id: "c-longyear",    name: "Longyearbyen",      country: "Norway (Svalbard)",lat:  78.2,  lng:  15.6  },
  { id: "c-anchorage",   name: "Anchorage",         country: "USA (Alaska)",     lat:  61.2,  lng:-149.9  },

  // ---------------------------------------------------------------------------
  // EXPANSION — compact format helper (id auto-derived below, explicit here)

  // Europe — UK
  { id: "c-manchester",   name: "Manchester",       country: "United Kingdom", lat:  53.5, lng:  -2.2 },
  { id: "c-birmingham",   name: "Birmingham",       country: "United Kingdom", lat:  52.5, lng:  -1.9 },
  { id: "c-glasgow",      name: "Glasgow",          country: "United Kingdom", lat:  55.9, lng:  -4.3 },
  { id: "c-edinburgh",    name: "Edinburgh",        country: "United Kingdom", lat:  55.9, lng:  -3.2 },
  { id: "c-liverpool",    name: "Liverpool",        country: "United Kingdom", lat:  53.4, lng:  -3.0 },
  { id: "c-bristol",      name: "Bristol",          country: "United Kingdom", lat:  51.5, lng:  -2.6 },
  { id: "c-leeds",        name: "Leeds",            country: "United Kingdom", lat:  53.8, lng:  -1.5 },
  { id: "c-sheffield",    name: "Sheffield",        country: "United Kingdom", lat:  53.4, lng:  -1.5 },
  { id: "c-cardiff",      name: "Cardiff",          country: "United Kingdom", lat:  51.5, lng:  -3.2 },
  { id: "c-belfast",      name: "Belfast",          country: "United Kingdom", lat:  54.6, lng:  -5.9 },

  // Europe — France
  { id: "c-toulouse",     name: "Toulouse",         country: "France",         lat:  43.6, lng:   1.4 },
  { id: "c-bordeaux",     name: "Bordeaux",         country: "France",         lat:  44.8, lng:  -0.6 },
  { id: "c-lyon",         name: "Lyon",             country: "France",         lat:  45.7, lng:   4.8 },
  { id: "c-nice",         name: "Nice",             country: "France",         lat:  43.7, lng:   7.3 },
  { id: "c-marseille",    name: "Marseille",        country: "France",         lat:  43.3, lng:   5.4 },
  { id: "c-strasbourg",   name: "Strasbourg",       country: "France",         lat:  48.6, lng:   7.8 },
  { id: "c-nantes",       name: "Nantes",           country: "France",         lat:  47.2, lng:  -1.6 },
  { id: "c-lille",        name: "Lille",            country: "France",         lat:  50.6, lng:   3.1 },
  { id: "c-montpellier",  name: "Montpellier",      country: "France",         lat:  43.6, lng:   3.9 },

  // Europe — Germany
  { id: "c-frankfurt",    name: "Frankfurt",        country: "Germany",        lat:  50.1, lng:   8.7 },
  { id: "c-stuttgart",    name: "Stuttgart",        country: "Germany",        lat:  48.8, lng:   9.2 },
  { id: "c-cologne",      name: "Cologne",          country: "Germany",        lat:  50.9, lng:   6.9 },
  { id: "c-dusseldorf",   name: "Düsseldorf",       country: "Germany",        lat:  51.2, lng:   6.8 },
  { id: "c-bremen",       name: "Bremen",           country: "Germany",        lat:  53.1, lng:   8.8 },
  { id: "c-dresden",      name: "Dresden",          country: "Germany",        lat:  51.1, lng:  13.7 },
  { id: "c-leipzig",      name: "Leipzig",          country: "Germany",        lat:  51.3, lng:  12.4 },
  { id: "c-nuremberg",    name: "Nuremberg",        country: "Germany",        lat:  49.5, lng:  11.1 },
  { id: "c-hannover",     name: "Hannover",         country: "Germany",        lat:  52.4, lng:   9.7 },

  // Europe — Italy
  { id: "c-naples",       name: "Naples",           country: "Italy",          lat:  40.8, lng:  14.3 },
  { id: "c-turin",        name: "Turin",            country: "Italy",          lat:  45.1, lng:   7.7 },
  { id: "c-florence",     name: "Florence",         country: "Italy",          lat:  43.8, lng:  11.2 },
  { id: "c-venice",       name: "Venice",           country: "Italy",          lat:  45.4, lng:  12.3 },
  { id: "c-bologna",      name: "Bologna",          country: "Italy",          lat:  44.5, lng:  11.3 },
  { id: "c-genoa",        name: "Genoa",            country: "Italy",          lat:  44.4, lng:   8.9 },
  { id: "c-palermo",      name: "Palermo",          country: "Italy",          lat:  38.1, lng:  13.4 },
  { id: "c-catania",      name: "Catania",          country: "Italy",          lat:  37.5, lng:  15.1 },
  { id: "c-verona",       name: "Verona",           country: "Italy",          lat:  45.4, lng:  11.0 },

  // Europe — Spain
  { id: "c-seville",      name: "Seville",          country: "Spain",          lat:  37.4, lng:  -5.9 },
  { id: "c-valencia",     name: "Valencia",         country: "Spain",          lat:  39.5, lng:  -0.4 },
  { id: "c-bilbao",       name: "Bilbao",           country: "Spain",          lat:  43.3, lng:  -2.9 },
  { id: "c-malaga",       name: "Málaga",           country: "Spain",          lat:  36.7, lng:  -4.4 },
  { id: "c-zaragoza",     name: "Zaragoza",         country: "Spain",          lat:  41.7, lng:  -0.9 },
  { id: "c-granada",      name: "Granada",          country: "Spain",          lat:  37.2, lng:  -3.6 },
  { id: "c-alicante",     name: "Alicante",         country: "Spain",          lat:  38.3, lng:  -0.5 },

  // Europe — Switzerland
  { id: "c-geneva",       name: "Geneva",           country: "Switzerland",    lat:  46.2, lng:   6.1 },
  { id: "c-bern",         name: "Bern",             country: "Switzerland",    lat:  46.9, lng:   7.4 },
  { id: "c-basel",        name: "Basel",            country: "Switzerland",    lat:  47.6, lng:   7.6 },

  // Europe — Netherlands
  { id: "c-rotterdam",    name: "Rotterdam",        country: "Netherlands",    lat:  51.9, lng:   4.5 },
  { id: "c-thehague",     name: "The Hague",        country: "Netherlands",    lat:  52.1, lng:   4.3 },
  { id: "c-utrecht",      name: "Utrecht",          country: "Netherlands",    lat:  52.1, lng:   5.1 },

  // Europe — Belgium
  { id: "c-antwerp",      name: "Antwerp",          country: "Belgium",        lat:  51.2, lng:   4.4 },
  { id: "c-ghent",        name: "Ghent",            country: "Belgium",        lat:  51.1, lng:   3.7 },

  // Europe — Scandinavia
  { id: "c-gothenburg",   name: "Gothenburg",       country: "Sweden",         lat:  57.7, lng:  12.0 },
  { id: "c-malmo",        name: "Malmö",            country: "Sweden",         lat:  55.6, lng:  13.0 },
  { id: "c-bergen",       name: "Bergen",           country: "Norway",         lat:  60.4, lng:   5.3 },
  { id: "c-trondheim",    name: "Trondheim",        country: "Norway",         lat:  63.4, lng:  10.4 },
  { id: "c-tampere",      name: "Tampere",          country: "Finland",        lat:  61.5, lng:  23.8 },
  { id: "c-turku",        name: "Turku",            country: "Finland",        lat:  60.5, lng:  22.3 },
  { id: "c-aarhus",       name: "Aarhus",           country: "Denmark",        lat:  56.2, lng:  10.2 },
  { id: "c-odense",       name: "Odense",           country: "Denmark",        lat:  55.4, lng:  10.4 },
  { id: "c-linkoping",    name: "Linköping",        country: "Sweden",         lat:  58.4, lng:  15.6 },

  // Europe — Poland
  { id: "c-krakow",       name: "Kraków",           country: "Poland",         lat:  50.1, lng:  20.0 },
  { id: "c-lodz",         name: "Łódź",             country: "Poland",         lat:  51.8, lng:  19.5 },
  { id: "c-wroclaw",      name: "Wrocław",          country: "Poland",         lat:  51.1, lng:  17.0 },
  { id: "c-poznan",       name: "Poznań",           country: "Poland",         lat:  52.4, lng:  17.0 },
  { id: "c-gdansk",       name: "Gdańsk",           country: "Poland",         lat:  54.4, lng:  18.6 },
  { id: "c-katowice",     name: "Katowice",         country: "Poland",         lat:  50.3, lng:  19.0 },

  // Europe — Balkans & Eastern
  { id: "c-split",        name: "Split",            country: "Croatia",        lat:  43.5, lng:  16.4 },
  { id: "c-sarajevo",     name: "Sarajevo",         country: "Bosnia",         lat:  43.8, lng:  18.4 },
  { id: "c-skopje",       name: "Skopje",           country: "North Macedonia",lat:  42.0, lng:  21.4 },
  { id: "c-tirana",       name: "Tirana",           country: "Albania",        lat:  41.3, lng:  19.8 },
  { id: "c-podgorica",    name: "Podgorica",        country: "Montenegro",     lat:  42.4, lng:  19.3 },
  { id: "c-pristina",     name: "Pristina",         country: "Kosovo",         lat:  42.7, lng:  21.2 },
  { id: "c-bratislava",   name: "Bratislava",       country: "Slovakia",       lat:  48.1, lng:  17.1 },
  { id: "c-brno",         name: "Brno",             country: "Czech Republic", lat:  49.2, lng:  16.6 },
  { id: "c-debrecen",     name: "Debrecen",         country: "Hungary",        lat:  47.5, lng:  21.6 },
  { id: "c-cluj",         name: "Cluj-Napoca",      country: "Romania",        lat:  46.8, lng:  23.6 },
  { id: "c-iasi",         name: "Iași",             country: "Romania",        lat:  47.2, lng:  27.6 },
  { id: "c-timisoara",    name: "Timișoara",        country: "Romania",        lat:  45.8, lng:  21.2 },
  { id: "c-novisad",      name: "Novi Sad",         country: "Serbia",         lat:  45.3, lng:  19.8 },
  { id: "c-thessaloniki", name: "Thessaloniki",     country: "Greece",         lat:  40.6, lng:  23.0 },
  { id: "c-patras",       name: "Patras",           country: "Greece",         lat:  38.2, lng:  21.7 },
  { id: "c-luxembourg",   name: "Luxembourg City",  country: "Luxembourg",     lat:  49.6, lng:   6.1 },
  { id: "c-andorra",      name: "Andorra la Vella", country: "Andorra",        lat:  42.5, lng:   1.5 },
  { id: "c-monaco",       name: "Monaco",           country: "Monaco",         lat:  43.7, lng:   7.4 },

  // Middle East — additions
  { id: "c-izmir",        name: "İzmir",            country: "Turkey",         lat:  38.4, lng:  27.1 },
  { id: "c-bursa",        name: "Bursa",            country: "Turkey",         lat:  40.2, lng:  29.1 },
  { id: "c-antalya",      name: "Antalya",          country: "Turkey",         lat:  36.9, lng:  30.7 },
  { id: "c-isfahan",      name: "Isfahan",          country: "Iran",           lat:  32.7, lng:  51.7 },
  { id: "c-mashhad",      name: "Mashhad",          country: "Iran",           lat:  36.3, lng:  59.6 },
  { id: "c-shiraz",       name: "Shiraz",           country: "Iran",           lat:  29.6, lng:  52.5 },
  { id: "c-tabriz",       name: "Tabriz",           country: "Iran",           lat:  38.1, lng:  46.3 },
  { id: "c-jerusalem",    name: "Jerusalem",        country: "Israel",         lat:  31.8, lng:  35.2 },
  { id: "c-haifa",        name: "Haifa",            country: "Israel",         lat:  32.8, lng:  35.0 },
  { id: "c-basra",        name: "Basra",            country: "Iraq",           lat:  30.5, lng:  47.8 },
  { id: "c-mosul",        name: "Mosul",            country: "Iraq",           lat:  36.3, lng:  43.1 },
  { id: "c-erbil",        name: "Erbil",            country: "Iraq",           lat:  36.2, lng:  44.0 },
  { id: "c-aleppo",       name: "Aleppo",           country: "Syria",          lat:  36.2, lng:  37.2 },
  { id: "c-aden",         name: "Aden",             country: "Yemen",          lat:  12.8, lng:  45.0 },
  { id: "c-salalah",      name: "Salalah",          country: "Oman",           lat:  17.0, lng:  54.1 },

  // South Asia — additions
  { id: "c-jaipur",       name: "Jaipur",           country: "India",          lat:  26.9, lng:  75.8 },
  { id: "c-surat",        name: "Surat",            country: "India",          lat:  21.2, lng:  72.8 },
  { id: "c-lucknow",      name: "Lucknow",          country: "India",          lat:  26.9, lng:  80.9 },
  { id: "c-nagpur",       name: "Nagpur",           country: "India",          lat:  21.1, lng:  79.1 },
  { id: "c-indore",       name: "Indore",           country: "India",          lat:  22.7, lng:  75.9 },
  { id: "c-bhopal",       name: "Bhopal",           country: "India",          lat:  23.3, lng:  77.4 },
  { id: "c-kochi",        name: "Kochi",            country: "India",          lat:   9.9, lng:  76.3 },
  { id: "c-coimbatore",   name: "Coimbatore",       country: "India",          lat:  11.0, lng:  77.0 },
  { id: "c-visakhapatnam",name: "Visakhapatnam",    country: "India",          lat:  17.7, lng:  83.3 },
  { id: "c-vadodara",     name: "Vadodara",         country: "India",          lat:  22.3, lng:  73.2 },
  { id: "c-agra",         name: "Agra",             country: "India",          lat:  27.2, lng:  78.0 },
  { id: "c-varanasi",     name: "Varanasi",         country: "India",          lat:  25.3, lng:  83.0 },
  { id: "c-kanpur",       name: "Kanpur",           country: "India",          lat:  26.5, lng:  80.3 },
  { id: "c-patna",        name: "Patna",            country: "India",          lat:  25.6, lng:  85.1 },
  { id: "c-ranchi",       name: "Ranchi",           country: "India",          lat:  23.4, lng:  85.3 },
  { id: "c-thiruvananthapuram", name: "Thiruvananthapuram", country: "India",  lat:   8.5, lng:  76.9 },
  { id: "c-faisalabad",   name: "Faisalabad",       country: "Pakistan",       lat:  31.4, lng:  73.1 },
  { id: "c-multan",       name: "Multan",           country: "Pakistan",       lat:  30.2, lng:  71.5 },
  { id: "c-peshawar",     name: "Peshawar",         country: "Pakistan",       lat:  34.0, lng:  71.6 },
  { id: "c-quetta",       name: "Quetta",           country: "Pakistan",       lat:  30.2, lng:  67.0 },
  { id: "c-rajshahi",     name: "Rajshahi",         country: "Bangladesh",     lat:  24.4, lng:  88.6 },
  { id: "c-khulna",       name: "Khulna",           country: "Bangladesh",     lat:  22.8, lng:  89.6 },
  { id: "c-kandy",        name: "Kandy",            country: "Sri Lanka",      lat:   7.3, lng:  80.6 },
  { id: "c-pokhara",      name: "Pokhara",          country: "Nepal",          lat:  28.2, lng:  84.0 },

  // East Asia — additions
  { id: "c-yokohama",     name: "Yokohama",         country: "Japan",          lat:  35.4, lng: 139.6 },
  { id: "c-nagoya",       name: "Nagoya",           country: "Japan",          lat:  35.2, lng: 136.9 },
  { id: "c-hiroshima",    name: "Hiroshima",        country: "Japan",          lat:  34.4, lng: 132.5 },
  { id: "c-sendai",       name: "Sendai",           country: "Japan",          lat:  38.3, lng: 141.0 },
  { id: "c-kobe",         name: "Kobe",             country: "Japan",          lat:  34.7, lng: 135.2 },
  { id: "c-kawasaki",     name: "Kawasaki",         country: "Japan",          lat:  35.5, lng: 139.7 },
  { id: "c-naha",         name: "Naha",             country: "Japan",          lat:  26.2, lng: 127.7 },
  { id: "c-incheon",      name: "Incheon",          country: "South Korea",    lat:  37.5, lng: 126.7 },
  { id: "c-daegu",        name: "Daegu",            country: "South Korea",    lat:  35.9, lng: 128.6 },
  { id: "c-daejeon",      name: "Daejeon",          country: "South Korea",    lat:  36.4, lng: 127.4 },
  { id: "c-harbin",       name: "Harbin",           country: "China",          lat:  45.8, lng: 126.5 },
  { id: "c-changsha",     name: "Changsha",         country: "China",          lat:  28.2, lng: 113.0 },
  { id: "c-kunming",      name: "Kunming",          country: "China",          lat:  25.0, lng: 102.7 },
  { id: "c-zhengzhou",    name: "Zhengzhou",        country: "China",          lat:  34.8, lng: 113.6 },
  { id: "c-hangzhou",     name: "Hangzhou",         country: "China",          lat:  30.3, lng: 120.2 },
  { id: "c-qingdao",      name: "Qingdao",          country: "China",          lat:  36.1, lng: 120.4 },
  { id: "c-jinan",        name: "Jinan",            country: "China",          lat:  36.7, lng: 117.0 },
  { id: "c-urumqi",       name: "Ürümqi",           country: "China",          lat:  43.8, lng:  87.6 },
  { id: "c-dalian",       name: "Dalian",           country: "China",          lat:  38.9, lng: 121.6 },
  { id: "c-fuzhou",       name: "Fuzhou",           country: "China",          lat:  26.1, lng: 119.3 },
  { id: "c-hefei",        name: "Hefei",            country: "China",          lat:  31.9, lng: 117.3 },
  { id: "c-lhasa",        name: "Lhasa",            country: "China (Tibet)",  lat:  29.7, lng:  91.1 },
  { id: "c-lanzhouCity",  name: "Lanzhou",          country: "China",          lat:  36.1, lng: 103.8 },
  { id: "c-macau",        name: "Macau",            country: "China",          lat:  22.2, lng: 113.5 },

  // Southeast Asia — additions
  { id: "c-medan",        name: "Medan",            country: "Indonesia",      lat:   3.6, lng:  98.7 },
  { id: "c-bandung",      name: "Bandung",          country: "Indonesia",      lat:  -6.9, lng: 107.6 },
  { id: "c-semarang",     name: "Semarang",         country: "Indonesia",      lat:  -7.0, lng: 110.4 },
  { id: "c-makassar",     name: "Makassar",         country: "Indonesia",      lat:  -5.1, lng: 119.4 },
  { id: "c-palembang",    name: "Palembang",        country: "Indonesia",      lat:  -3.0, lng: 104.8 },
  { id: "c-quezon",       name: "Quezon City",      country: "Philippines",    lat:  14.7, lng: 121.1 },
  { id: "c-davao",        name: "Davao",            country: "Philippines",    lat:   7.1, lng: 125.6 },
  { id: "c-mandalay",     name: "Mandalay",         country: "Myanmar",        lat:  22.0, lng:  96.1 },
  { id: "c-batam",        name: "Batam",            country: "Indonesia",      lat:   1.1, lng: 104.0 },
  { id: "c-hue",          name: "Hué",              country: "Vietnam",        lat:  16.5, lng: 107.6 },
  { id: "c-nhatrang",     name: "Nha Trang",        country: "Vietnam",        lat:  12.2, lng: 109.2 },
  { id: "c-siemsreap",    name: "Siem Reap",        country: "Cambodia",       lat:  13.4, lng: 103.9 },
  { id: "c-luangprabang", name: "Luang Prabang",    country: "Laos",           lat:  19.9, lng: 102.1 },
  { id: "c-kotakinabalu", name: "Kota Kinabalu",    country: "Malaysia",       lat:   5.9, lng: 116.1 },
  { id: "c-penang",       name: "Penang",           country: "Malaysia",       lat:   5.4, lng: 100.3 },

  // Central Asia — additions
  { id: "c-kazan",        name: "Kazan",            country: "Russia",         lat:  55.8, lng:  49.1 },
  { id: "c-nizhnynovg",   name: "Nizhny Novgorod",  country: "Russia",         lat:  56.3, lng:  44.0 },
  { id: "c-samara",       name: "Samara",           country: "Russia",         lat:  53.2, lng:  50.2 },
  { id: "c-omsk",         name: "Omsk",             country: "Russia",         lat:  55.0, lng:  73.4 },
  { id: "c-krasnoyarsk",  name: "Krasnoyarsk",      country: "Russia",         lat:  56.0, lng:  92.8 },
  { id: "c-chelyabinsk",  name: "Chelyabinsk",      country: "Russia",         lat:  55.2, lng:  61.4 },
  { id: "c-ufa",          name: "Ufa",              country: "Russia",         lat:  54.7, lng:  56.0 },
  { id: "c-perm",         name: "Perm",             country: "Russia",         lat:  58.0, lng:  56.3 },
  { id: "c-volgograd",    name: "Volgograd",        country: "Russia",         lat:  48.7, lng:  44.5 },
  { id: "c-rostov",       name: "Rostov-on-Don",    country: "Russia",         lat:  47.2, lng:  39.7 },
  { id: "c-krasnodar",    name: "Krasnodar",        country: "Russia",         lat:  45.1, lng:  38.9 },
  { id: "c-namangan",     name: "Namangan",         country: "Uzbekistan",     lat:  41.0, lng:  71.7 },
  { id: "c-andijan",      name: "Andijan",          country: "Uzbekistan",     lat:  40.8, lng:  72.3 },
  { id: "c-shymkent",     name: "Shymkent",         country: "Kazakhstan",     lat:  42.3, lng:  69.6 },

  // Africa — additions
  { id: "c-kano",         name: "Kano",             country: "Nigeria",        lat:  12.0, lng:   8.5 },
  { id: "c-ibadan",       name: "Ibadan",           country: "Nigeria",        lat:   7.4, lng:   3.9 },
  { id: "c-portharcourt", name: "Port Harcourt",    country: "Nigeria",        lat:   4.8, lng:   7.1 },
  { id: "c-enugu",        name: "Enugu",            country: "Nigeria",        lat:   6.4, lng:   7.5 },
  { id: "c-alexandria",   name: "Alexandria",       country: "Egypt",          lat:  31.2, lng:  29.9 },
  { id: "c-giza",         name: "Giza",             country: "Egypt",          lat:  30.0, lng:  31.2 },
  { id: "c-luxor",        name: "Luxor",            country: "Egypt",          lat:  25.7, lng:  32.6 },
  { id: "c-marrakech",    name: "Marrakech",        country: "Morocco",        lat:  31.6, lng:  -8.0 },
  { id: "c-fez",          name: "Fez",              country: "Morocco",        lat:  34.0, lng:  -5.0 },
  { id: "c-tangier",      name: "Tangier",          country: "Morocco",        lat:  35.8, lng:  -5.8 },
  { id: "c-rabat",        name: "Rabat",            country: "Morocco",        lat:  34.0, lng:  -6.8 },
  { id: "c-agadir",       name: "Agadir",           country: "Morocco",        lat:  30.4, lng:  -9.6 },
  { id: "c-durban",       name: "Durban",           country: "South Africa",   lat: -29.9, lng:  31.0 },
  { id: "c-pretoria",     name: "Pretoria",         country: "South Africa",   lat: -25.7, lng:  28.2 },
  { id: "c-portelizabeth",name: "Port Elizabeth",   country: "South Africa",   lat: -33.9, lng:  25.6 },
  { id: "c-bloemfontein", name: "Bloemfontein",     country: "South Africa",   lat: -29.1, lng:  26.2 },
  { id: "c-kumasi",       name: "Kumasi",           country: "Ghana",          lat:   6.7, lng:  -1.6 },
  { id: "c-mombasa",      name: "Mombasa",          country: "Kenya",          lat:  -4.1, lng:  39.7 },
  { id: "c-nakuru",       name: "Nakuru",           country: "Kenya",          lat:  -0.3, lng:  36.1 },
  { id: "c-mwanza",       name: "Mwanza",           country: "Tanzania",       lat:  -2.5, lng:  32.9 },
  { id: "c-arusha",       name: "Arusha",           country: "Tanzania",       lat:  -3.4, lng:  36.7 },
  { id: "c-dodoma",       name: "Dodoma",           country: "Tanzania",       lat:  -6.2, lng:  35.7 },
  { id: "c-zanzibar",     name: "Zanzibar City",    country: "Tanzania",       lat:  -6.2, lng:  39.2 },
  { id: "c-lubumbashi",   name: "Lubumbashi",       country: "DR Congo",       lat: -11.7, lng:  27.5 },
  { id: "c-diresawa",     name: "Dire Dawa",        country: "Ethiopia",       lat:   9.6, lng:  41.9 },
  { id: "c-mekelle",      name: "Mekelle",          country: "Ethiopia",       lat:  13.5, lng:  39.5 },
  { id: "c-omdurman",     name: "Omdurman",         country: "Sudan",          lat:  15.6, lng:  32.5 },
  { id: "c-lome",         name: "Lomé",             country: "Togo",           lat:   6.1, lng:   1.2 },
  { id: "c-cotonou",      name: "Cotonou",          country: "Benin",          lat:   6.4, lng:   2.4 },
  { id: "c-abuja2",       name: "Abuja",            country: "Nigeria",        lat:   9.1, lng:   7.5 },
  { id: "c-yaounde",      name: "Yaoundé",          country: "Cameroon",       lat:   3.9, lng:  11.5 },
  { id: "c-bulawayo",     name: "Bulawayo",         country: "Zimbabwe",       lat: -20.2, lng:  28.6 },
  { id: "c-blantyre",     name: "Blantyre",         country: "Malawi",         lat: -15.8, lng:  35.0 },
  { id: "c-lilongwe",     name: "Lilongwe",         country: "Malawi",         lat: -14.0, lng:  33.8 },
  { id: "c-beira",        name: "Beira",            country: "Mozambique",     lat: -19.8, lng:  34.8 },
  { id: "c-djibouti",     name: "Djibouti",         country: "Djibouti",       lat:  11.6, lng:  43.1 },
  { id: "c-asmara",       name: "Asmara",           country: "Eritrea",        lat:  15.3, lng:  38.9 },
  { id: "c-juba",         name: "Juba",             country: "South Sudan",    lat:   4.9, lng:  31.6 },
  { id: "c-ouagadougou",  name: "Ouagadougou",      country: "Burkina Faso",   lat:  12.4, lng:  -1.5 },
  { id: "c-nouakchott",   name: "Nouakchott",       country: "Mauritania",     lat:  18.1, lng: -15.9 },
  { id: "c-banjul",       name: "Banjul",           country: "Gambia",         lat:  13.5, lng: -16.6 },
  { id: "c-bissau",       name: "Bissau",           country: "Guinea-Bissau",  lat:  11.9, lng: -15.6 },
  { id: "c-praia",        name: "Praia",            country: "Cape Verde",     lat:  14.9, lng: -23.5 },
  { id: "c-saoTome",      name: "São Tomé",         country: "São Tomé & P.",  lat:   0.3, lng:   6.7 },
  { id: "c-libreville",   name: "Libreville",       country: "Gabon",          lat:   0.4, lng:   9.5 },
  { id: "c-brazzaville",  name: "Brazzaville",      country: "Republic of Congo", lat: -4.3, lng: 15.3 },

  // North America — additions
  { id: "c-nashville",    name: "Nashville",        country: "USA",            lat:  36.2, lng: -86.8 },
  { id: "c-baltimore",    name: "Baltimore",        country: "USA",            lat:  39.3, lng: -76.6 },
  { id: "c-saltlakecity", name: "Salt Lake City",   country: "USA",            lat:  40.8, lng:-111.9 },
  { id: "c-kansascity",   name: "Kansas City",      country: "USA",            lat:  39.1, lng: -94.6 },
  { id: "c-stlouis",      name: "St. Louis",        country: "USA",            lat:  38.6, lng: -90.2 },
  { id: "c-pittsburgh",   name: "Pittsburgh",       country: "USA",            lat:  40.4, lng: -80.0 },
  { id: "c-austin",       name: "Austin",           country: "USA",            lat:  30.3, lng: -97.7 },
  { id: "c-raleigh",      name: "Raleigh",          country: "USA",            lat:  35.8, lng: -78.6 },
  { id: "c-tampa",        name: "Tampa",            country: "USA",            lat:  27.9, lng: -82.5 },
  { id: "c-orlando",      name: "Orlando",          country: "USA",            lat:  28.5, lng: -81.4 },
  { id: "c-memphis",      name: "Memphis",          country: "USA",            lat:  35.1, lng: -90.1 },
  { id: "c-sanantonio",   name: "San Antonio",      country: "USA",            lat:  29.4, lng: -98.5 },
  { id: "c-indianapolis", name: "Indianapolis",     country: "USA",            lat:  39.8, lng: -86.2 },
  { id: "c-sacramento",   name: "Sacramento",       country: "USA",            lat:  38.6, lng:-121.5 },
  { id: "c-columbus",     name: "Columbus",         country: "USA",            lat:  40.0, lng: -82.9 },
  { id: "c-charlotte",    name: "Charlotte",        country: "USA",            lat:  35.2, lng: -80.8 },
  { id: "c-detroit",      name: "Detroit",          country: "USA",            lat:  42.3, lng: -83.0 },
  { id: "c-oklahomacity", name: "Oklahoma City",    country: "USA",            lat:  35.5, lng: -97.5 },
  { id: "c-honolulu",     name: "Honolulu",         country: "USA (Hawaii)",   lat:  21.3, lng:-157.8 },
  { id: "c-ottawa",       name: "Ottawa",           country: "Canada",         lat:  45.4, lng: -75.7 },
  { id: "c-edmonton",     name: "Edmonton",         country: "Canada",         lat:  53.5, lng:-113.5 },
  { id: "c-winnipeg",     name: "Winnipeg",         country: "Canada",         lat:  49.9, lng: -97.1 },
  { id: "c-quebeccity",   name: "Québec City",      country: "Canada",         lat:  46.8, lng: -71.2 },
  { id: "c-monterrey",    name: "Monterrey",        country: "Mexico",         lat:  25.7, lng:-100.3 },
  { id: "c-tijuana",      name: "Tijuana",          country: "Mexico",         lat:  32.5, lng:-117.0 },
  { id: "c-puebla",       name: "Puebla",           country: "Mexico",         lat:  19.0, lng: -98.2 },
  { id: "c-merida",       name: "Mérida",           country: "Mexico",         lat:  21.0, lng: -89.6 },
  { id: "c-cancun",       name: "Cancún",           country: "Mexico",         lat:  21.2, lng: -86.8 },
  { id: "c-guatemalacity",name: "Guatemala City",   country: "Guatemala",      lat:  14.6, lng: -90.5 },
  { id: "c-tegucigalpa",  name: "Tegucigalpa",      country: "Honduras",       lat:  14.1, lng: -87.2 },
  { id: "c-managua",      name: "Managua",          country: "Nicaragua",      lat:  12.1, lng: -86.3 },
  { id: "c-panamacity",   name: "Panama City",      country: "Panama",         lat:   8.9, lng: -79.5 },
  { id: "c-sansalvador",  name: "San Salvador",     country: "El Salvador",    lat:  13.7, lng: -89.2 },
  { id: "c-santodomingo", name: "Santo Domingo",    country: "Dom. Republic",  lat:  18.5, lng: -70.0 },
  { id: "c-portauprince", name: "Port-au-Prince",   country: "Haiti",          lat:  18.5, lng: -72.3 },
  { id: "c-kingston",     name: "Kingston",         country: "Jamaica",        lat:  18.0, lng: -76.8 },
  { id: "c-sanjuan",      name: "San Juan",         country: "Puerto Rico",    lat:  18.5, lng: -66.1 },
  { id: "c-nassau",       name: "Nassau",           country: "Bahamas",        lat:  25.1, lng: -77.3 },
  { id: "c-georgetowngy", name: "Georgetown",       country: "Guyana",         lat:   6.8, lng: -58.2 },
  { id: "c-paramaribo",   name: "Paramaribo",       country: "Suriname",       lat:   5.9, lng: -55.2 },
  { id: "c-bridgetown",   name: "Bridgetown",       country: "Barbados",       lat:  13.1, lng: -59.6 },
  { id: "c-portofspain",  name: "Port of Spain",    country: "Trinidad",       lat:  10.7, lng: -61.5 },

  // South America — additions
  { id: "c-salvador",     name: "Salvador",         country: "Brazil",         lat: -12.9, lng: -38.5 },
  { id: "c-fortaleza",    name: "Fortaleza",        country: "Brazil",         lat:  -3.7, lng: -38.5 },
  { id: "c-manaus",       name: "Manaus",           country: "Brazil",         lat:  -3.1, lng: -60.0 },
  { id: "c-belem",        name: "Belém",            country: "Brazil",         lat:  -1.5, lng: -48.5 },
  { id: "c-curitiba",     name: "Curitiba",         country: "Brazil",         lat: -25.4, lng: -49.3 },
  { id: "c-portoalegre",  name: "Porto Alegre",     country: "Brazil",         lat: -30.0, lng: -51.2 },
  { id: "c-goiania",      name: "Goiânia",          country: "Brazil",         lat: -16.7, lng: -49.3 },
  { id: "c-belohorizonte",name: "Belo Horizonte",   country: "Brazil",         lat: -19.9, lng: -43.9 },
  { id: "c-cordoba",      name: "Córdoba",          country: "Argentina",      lat: -31.4, lng: -64.2 },
  { id: "c-rosario",      name: "Rosario",          country: "Argentina",      lat: -32.9, lng: -60.7 },
  { id: "c-mendoza",      name: "Mendoza",          country: "Argentina",      lat: -32.9, lng: -68.8 },
  { id: "c-tucuman",      name: "Tucumán",          country: "Argentina",      lat: -26.8, lng: -65.2 },
  { id: "c-cali",         name: "Cali",             country: "Colombia",       lat:   3.4, lng: -76.5 },
  { id: "c-barranquilla", name: "Barranquilla",     country: "Colombia",       lat:  11.0, lng: -74.8 },
  { id: "c-cartagena",    name: "Cartagena",        country: "Colombia",       lat:  10.4, lng: -75.5 },
  { id: "c-maracaibo",    name: "Maracaibo",        country: "Venezuela",      lat:  10.6, lng: -71.6 },
  { id: "c-valenciaVE",   name: "Valencia",         country: "Venezuela",      lat:  10.2, lng: -68.0 },
  { id: "c-arequipa",     name: "Arequipa",         country: "Peru",           lat: -16.4, lng: -71.5 },
  { id: "c-trujilloPE",   name: "Trujillo",         country: "Peru",           lat:  -8.1, lng: -79.0 },
  { id: "c-valparaiso",   name: "Valparaíso",       country: "Chile",          lat: -33.0, lng: -71.6 },
  { id: "c-concepcion",   name: "Concepción",       country: "Chile",          lat: -36.8, lng: -73.0 },
  { id: "c-santacruz",    name: "Santa Cruz",       country: "Bolivia",        lat: -17.8, lng: -63.2 },
  { id: "c-cochabamba",   name: "Cochabamba",       country: "Bolivia",        lat: -17.4, lng: -66.2 },
  { id: "c-cuencaEC",     name: "Cuenca",           country: "Ecuador",        lat:  -2.9, lng: -79.0 },
  { id: "c-cayenne",      name: "Cayenne",          country: "French Guiana",  lat:   4.9, lng: -52.3 },

  // Oceania — additions
  { id: "c-goldcoast",    name: "Gold Coast",       country: "Australia",      lat: -28.0, lng: 153.4 },
  { id: "c-canberra",     name: "Canberra",         country: "Australia",      lat: -35.3, lng: 149.1 },
  { id: "c-hobart",       name: "Hobart",           country: "Australia",      lat: -42.9, lng: 147.3 },
  { id: "c-darwin",       name: "Darwin",           country: "Australia",      lat: -12.5, lng: 130.8 },
  { id: "c-townsville",   name: "Townsville",       country: "Australia",      lat: -19.3, lng: 146.8 },
  { id: "c-cairns",       name: "Cairns",           country: "Australia",      lat: -16.9, lng: 145.8 },
  { id: "c-newcastle",    name: "Newcastle",        country: "Australia",      lat: -32.9, lng: 151.8 },
  { id: "c-hamilton",     name: "Hamilton",         country: "New Zealand",    lat: -37.8, lng: 175.3 },
  { id: "c-tauranga",     name: "Tauranga",         country: "New Zealand",    lat: -37.7, lng: 176.2 },
  { id: "c-dunedin",      name: "Dunedin",          country: "New Zealand",    lat: -45.9, lng: 170.5 },
  { id: "c-papeete",      name: "Papeete",          country: "French Polynesia",lat:-17.5, lng:-149.6 },
  { id: "c-nadi",         name: "Nadi",             country: "Fiji",           lat: -17.8, lng: 177.4 },
  { id: "c-apia",         name: "Apia",             country: "Samoa",          lat: -13.8, lng:-171.8 },
  { id: "c-portvila",     name: "Port Vila",        country: "Vanuatu",        lat: -17.7, lng: 168.3 },
];

// ---------------------------------------------------------------------------
// Search

// Normalize: strip diacritics so "Iasi" matches "Iași", "Malmo" matches "Malmö", etc.
function normalize(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

// Pre-compute normalized names for performance
const _normalized = CITIES.map((city) => ({
  city,
  n: normalize(city.name),
  c: normalize(city.country),
}));

export function searchCities(query: string, limit = 8): City[] {
  const q = normalize(query.trim());
  if (q.length < 1) return [];
  return _normalized
    .map(({ city, n, c }) => {
      let score = 0;
      if (n === q)              score = 100;
      else if (n.startsWith(q)) score = 80;
      else if (n.includes(q))   score = 60;
      else if (c.startsWith(q)) score = 40;
      else if (c.includes(q))   score = 20;
      return { city, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.city.name.localeCompare(b.city.name))
    .slice(0, limit)
    .map((r) => r.city);
}

export function getCityById(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

// ---------------------------------------------------------------------------
// Texture derivation — entirely from worldSeed, no hard-coded labels per city

function climateFor(lat: number): string {
  const a = Math.abs(lat);
  if (a > 66) return "Polar / subarctic";
  if (a > 55) return "Cool maritime";
  if (a > 45) return "Temperate";
  if (a > 35) return "Warm temperate";
  if (a > 23) return "Subtropical";
  if (a > 10) return "Tropical seasonal";
  return "Tropical equatorial";
}

function economyFor(ep: number, wc: number): string {
  if (ep > 0.72) return wc > 0.6 ? "High-pressure, finance" : "Expensive, fragmented";
  if (ep > 0.55) return wc > 0.6 ? "Growth-driven" : "Mixed, service";
  if (ep > 0.38) return wc > 0.5 ? "Work-centred" : "Balanced, varied";
  if (ep > 0.2)  return "Informal, communal";
  return "Emerging, mobile";
}

function cultureFor(si: number, pol: number): string {
  if (si > 0.72) return pol > 0.5 ? "Dense, expressive" : "Communal, vibrant";
  if (si > 0.50) return pol > 0.5 ? "Sociable, fast-paced" : "Warm, layered";
  if (si > 0.30) return pol > 0.5 ? "Measured, reserved" : "Quiet, traditional";
  return "Sparse, introspective";
}

function densityFor(pol: number): "Sparse" | "Moderate" | "Dense" {
  if (pol > 0.62) return "Dense";
  if (pol > 0.34) return "Moderate";
  return "Sparse";
}

export function deriveCityTexture(city: City): CityTexture {
  const ws = buildWorldSeed(city.id, city.lat, city.lng);
  const hexTag = city.id.slice(2, 5).toUpperCase();
  const seedStr = `0x${(ws.seed >>> 0).toString(16).toUpperCase().slice(0, 4)}-${hexTag}`;
  return {
    climate: climateFor(city.lat),
    economy: economyFor(ws.economicPressure, ws.workCulture),
    culture: cultureFor(ws.socialIntensity, ws.paceOfLife),
    density: densityFor(ws.paceOfLife),
    seed: seedStr,
  };
}

// ---------------------------------------------------------------------------
// Local time — approximate from longitude (±30min accuracy, enough for feel)

export function cityLocalTime(lng: number): string {
  const offsetH = Math.round(lng / 15);
  const now     = new Date();
  const localMs = now.getTime() + (offsetH - now.getTimezoneOffset() / 60) * 3600_000;
  const local   = new Date(localMs);
  const h   = local.getHours();
  const m   = local.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export function cityTimeOfDay(lng: number): "night" | "evening" | "morning" | "day" {
  const offsetH = Math.round(lng / 15);
  const now     = new Date();
  const localH  = (now.getUTCHours() + offsetH + 24) % 24;
  if (localH >= 22 || localH < 5)  return "night";
  if (localH >= 18)                 return "evening";
  if (localH < 10)                  return "morning";
  return "day";
}

// ---------------------------------------------------------------------------
// Featured suggestions — one per major region, shown when search is empty

export const FEATURED_CITIES: City[] = [
  CITIES.find((c) => c.id === "c-iasi")!,
  CITIES.find((c) => c.id === "c-tokyo")!,
  CITIES.find((c) => c.id === "c-newyork")!,
  CITIES.find((c) => c.id === "c-saopaulo")!,
  CITIES.find((c) => c.id === "c-london")!,
  CITIES.find((c) => c.id === "c-mumbai")!,
  CITIES.find((c) => c.id === "c-cairo")!,
  CITIES.find((c) => c.id === "c-sydney")!,
];
