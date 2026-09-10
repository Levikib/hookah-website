export interface ServiceTier {
  id: string;
  name: string;
  tagline: string;
  vibe: string;
  included: string[];
  startingPrice: number;
  priceEstimated: boolean;
  popular: boolean;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  emoji: string;
  isCustom?: boolean;
}

// NOTE: startingPrice values are placeholder estimates (priceEstimated: true)
// pending real pricing from Smokers Vine. Included items are drawn directly
// from the client's own flyer copy ("well organized and exquisite shisha
// services... best shisha servers, all shisha accessories, flavors & logistics").
export const SERVICES: ServiceTier[] = [
  {
    id: "birthday",
    name: "Birthday",
    tagline: "Make the candles the second-best part of the night.",
    vibe: "A full hookah setup that turns any birthday into an event.",
    included: ["Shisha server on-site", "All accessories provided", "Flavours of your choice", "Coals + logistics handled"],
    startingPrice: 6000,
    priceEstimated: true,
    popular: true,
    color: "#e11d2e",
    gradientFrom: "#7f1d1d",
    gradientTo: "#1a0505",
    emoji: "🎂",
  },
  {
    id: "wedding",
    name: "Wedding After-Party",
    tagline: "Keep the celebration going long after the vows.",
    vibe: "Premium hookah bar setup for the after-party crowd.",
    included: ["Multiple hookah setups", "Dedicated servers", "Premium flavour selection", "Full setup + logistics"],
    startingPrice: 15000,
    priceEstimated: true,
    popular: false,
    color: "#f59e0b",
    gradientFrom: "#78350f",
    gradientTo: "#1a0f02",
    emoji: "💍",
  },
  {
    id: "corporate",
    name: "Corporate Event",
    tagline: "Team culture, redefined — not the usual boardroom dinner.",
    vibe: "Professional, well-organized hookah service for company events.",
    included: ["Professional servers", "Full accessory set", "Flavour variety", "On-time setup + teardown"],
    startingPrice: 12000,
    priceEstimated: true,
    popular: false,
    color: "#22d3ee",
    gradientFrom: "#0e3a44",
    gradientTo: "#04141a",
    emoji: "🏢",
  },
  {
    id: "house-party",
    name: "House Party",
    tagline: "We bring the whole setup — you bring the crowd.",
    vibe: "Casual, easy hookah service delivered straight to your house.",
    included: ["Hookah pot(s) of choice", "Flavours + coals", "Boda boda delivery", "Setup guidance"],
    startingPrice: 4000,
    priceEstimated: true,
    popular: false,
    color: "#a855f7",
    gradientFrom: "#3b0764",
    gradientTo: "#0f0320",
    emoji: "🏠",
  },
  {
    id: "club",
    name: "Clubs & Lounges",
    tagline: "Ongoing supply and service for venues that never stop.",
    vibe: "Recurring flavour + coal supply and service for clubs and lounges.",
    included: ["Recurring flavour supply", "Coal restocking", "On-call servers", "Bulk pricing available"],
    startingPrice: 0,
    priceEstimated: true,
    popular: false,
    color: "#f43f5e",
    gradientFrom: "#4c0519",
    gradientTo: "#12030a",
    emoji: "🎧",
  },
  {
    id: "custom",
    name: "Something Else",
    tagline: "Not on the list? We got you covered.",
    vibe: "Tell us what you're planning and we'll build a setup around it.",
    included: [],
    startingPrice: 0,
    priceEstimated: true,
    popular: false,
    color: "#ff6b35",
    gradientFrom: "#7c2d12",
    gradientTo: "#1c0a03",
    emoji: "✨",
    isCustom: true,
  },
];
