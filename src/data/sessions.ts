export interface SessionTier {
  id: string;
  name: string;
  tagline: string;
  duration: string;
  people: number | string;
  equipment: string[];
  price: number;
  popular: boolean;
  color: string;
  isCustom?: boolean;
}

export const SESSIONS: SessionTier[] = [
  { id: "solo",      name: "Solo Session",     tagline: "Just you and the smoke.",                   duration: "1 hour",   people: 1,        equipment: ["1x Premium Hookah", "1x Personal Mouthpiece", "1x Coal Set", "Choice of 1 Flavour"],                                                                      price: 29.99,   popular: false, color: "#636e72" },
  { id: "duo",       name: "Duo Session",      tagline: "Double the hose. Double the vibe.",          duration: "1.5 hrs",  people: 2,        equipment: ["1x Premium Hookah", "2x Personal Mouthpieces", "2x Coal Sets", "Choice of 2 Flavours"],                                                                   price: 49.99,   popular: false, color: "#00b894" },
  { id: "squad",     name: "Squad Session",    tagline: "The full crew. The full experience.",        duration: "2 hours",  people: 4,        equipment: ["2x Premium Hookahs", "4x Personal Mouthpieces", "3x Coal Sets", "Choice of 3 Flavours"],                                                                  price: 89.99,   popular: true,  color: "#00f5d4" },
  { id: "vip",       name: "VIP Experience",   tagline: "Gold setup. Private setting. No compromises.", duration: "3 hours",  people: 6,      equipment: ["2x Luxury Hookahs", "6x Personal Mouthpieces", "Premium Coal Service", "Up to 4 Flavours", "Dedicated Host", "Snack Platter"],                          price: 179.99,  popular: false, color: "#ffd700" },
  { id: "rooftop",   name: "Rooftop Package",  tagline: "Elevated. Literally.",                       duration: "4 hours",  people: 10,       equipment: ["3x Luxury Hookahs", "10x Mouthpieces", "Full Coal Service", "5 Flavours", "2x Hosts", "Catering Setup", "Ambient Lighting"],                            price: 349.99,  popular: false, color: "#9d4edd" },
  { id: "corporate", name: "Corporate Event",  tagline: "Team sessions, elevated atmosphere.",        duration: "5 hours",  people: 20,       equipment: ["5x Premium Hookahs", "20x Mouthpieces", "Full Coal Service", "6 Flavours", "3x Hosts", "Setup + Teardown"],                                             price: 699.99,  popular: false, color: "#0984e3" },
  { id: "wedding",   name: "Wedding / Event",  tagline: "Make your night unforgettable.",             duration: "6 hours",  people: 50,       equipment: ["10x Luxury Hookahs", "50x Mouthpieces", "Full Coal Team", "8 Flavours", "5x Hosts", "Full Setup", "Branded Mouthpieces", "Photo Backdrop"],              price: 1499.99, popular: false, color: "#e84393" },
  { id: "custom",    name: "Custom Build",     tagline: "You design it. We deliver it.",              duration: "custom",   people: "custom", equipment: [],                                                                                                                                                           price: 0,       popular: false, color: "#ff6b35", isCustom: true },
];

export const CUSTOM_PRICING = {
  base: 15.00,
  perHookah: 18.00,
  perPerson: 4.50,
  perFlavour: 8.00,
  extraHour: 12.00,
  hostPerHour: 25.00,
  cateringPerPerson: 3.50,
  delivery: 15.00,
};
