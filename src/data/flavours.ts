export interface Flavour {
  id: number;
  name: string;
  category: string;
  intensity: "Mild" | "Medium" | "Strong";
  notes: string[];
  price: number;
  stock: number;
  color: string;
  emoji: string;
  description: string;
  pairsWith: string[];
}

export const FLAVOURS: Flavour[] = [
  // ── Classic (6) ──────────────────────────────────────────────────────────
  { id: 1,  name: "Double Apple",      category: "Classic",   intensity: "Medium", notes: ["Apple", "Anise", "Sweet"],           price: 1699, stock: 47, color: "#e74c3c", emoji: "🍎", description: "The original crowd-pleaser. Crisp apple sweetness balanced with a subtle anise backbone — a timeless hookah staple.", pairsWith: ["Mint Glacier", "Grape Royale"] },
  { id: 2,  name: "Grape Royale",      category: "Classic",   intensity: "Medium", notes: ["Dark Grape", "Berry", "Rich"],        price: 1699, stock: 41, color: "#9b59b6", emoji: "🍇", description: "Deep, sun-ripened grape with rich berry undertones. Bold, luxurious, and incredibly smooth.", pairsWith: ["Double Apple", "Rose Garden"] },
  { id: 3,  name: "Shisha Classic",    category: "Classic",   intensity: "Mild",   notes: ["Tobacco", "Molasses", "Earthy"],      price: 1499, stock: 38, color: "#8B6914", emoji: "🌾", description: "Pure traditional shisha character. Earthy molasses warmth that brings you back to the old-school lounge.", pairsWith: ["Spiced Chai", "Iced Cappuccino"] },
  { id: 4,  name: "Two Kings",         category: "Classic",   intensity: "Strong", notes: ["Apple", "Grape", "Spice"],            price: 1899, stock: 22, color: "#c0392b", emoji: "👑", description: "Apple and grape collide with a spiced finish. The royal blend for those who want both worlds.", pairsWith: ["Mint Glacier", "Midnight Blueberry"] },
  { id: 5,  name: "Dark Rose",         category: "Classic",   intensity: "Medium", notes: ["Rose", "Grape", "Floral"],            price: 1999, stock: 17, color: "#922B3E", emoji: "🥀", description: "An elegant fusion of dark grape and rose petals — romantic, complex, unforgettable.", pairsWith: ["Lavender Haze", "Rose Garden"] },
  { id: 6,  name: "Golden Era",        category: "Classic",   intensity: "Strong", notes: ["Honey", "Tobacco", "Vanilla"],        price: 2099, stock: 9,  color: "#D4A017", emoji: "✨", description: "A throwback to golden-age hookah culture. Honey and vanilla over a warm tobacco base.", pairsWith: ["Spiced Chai", "Iced Cappuccino"] },

  // ── Fresh (6) ─────────────────────────────────────────────────────────────
  { id: 7,  name: "Mint Glacier",      category: "Fresh",     intensity: "Strong", notes: ["Spearmint", "Ice", "Cool"],           price: 1499, stock: 32, color: "#1abc9c", emoji: "🌿", description: "Arctic-grade spearmint with an ice-cold finish. Clears the palate and electrifies every breath.", pairsWith: ["Double Apple", "Watermelon Chill"] },
  { id: 8,  name: "Watermelon Chill",  category: "Fresh",     intensity: "Mild",   notes: ["Watermelon", "Mint", "Juicy"],        price: 1699, stock: 35, color: "#2ecc71", emoji: "🍉", description: "Juicy watermelon soaked in cool mint mist. The ultimate summer session blend.", pairsWith: ["Mint Glacier", "Kiwi Breeze"] },
  { id: 9,  name: "Lemon Mint",        category: "Fresh",     intensity: "Strong", notes: ["Lemon Zest", "Spearmint", "Sharp"],   price: 1499, stock: 22, color: "#f1c40f", emoji: "🍋", description: "Electric lemon zest fused with sharp spearmint. Wakes you up like nothing else.", pairsWith: ["Kiwi Breeze", "Mint Glacier"] },
  { id: 10, name: "Kiwi Breeze",       category: "Fresh",     intensity: "Medium", notes: ["Kiwi", "Mint", "Tart"],               price: 1799, stock: 21, color: "#55efc4", emoji: "🥝", description: "Tart kiwi brightened with a mint breeze. Refreshing, exotic, completely addictive.", pairsWith: ["Watermelon Chill", "Lemon Mint"] },
  { id: 11, name: "Arctic Blast",      category: "Fresh",     intensity: "Strong", notes: ["Peppermint", "Menthol", "Ice"],       price: 1699, stock: 14, color: "#00d2ff", emoji: "❄️", description: "Maximum menthol intensity. Not for the faint-hearted — a full Arctic whiteout.", pairsWith: ["Mint Glacier", "Lemon Mint"] },
  { id: 12, name: "Cucumber Lime",     category: "Fresh",     intensity: "Mild",   notes: ["Cucumber", "Lime", "Crisp"],          price: 1799, stock: 29, color: "#badc58", emoji: "🥒", description: "Spa-cool cucumber with a lime twist. Sophisticated, clean, surprisingly addictive.", pairsWith: ["Watermelon Chill", "Mint Glacier"] },

  // ── Fruity (6) ────────────────────────────────────────────────────────────
  { id: 13, name: "Blueberry Burst",   category: "Fruity",    intensity: "Mild",   notes: ["Wild Blueberry", "Sweet", "Soft"],    price: 1799, stock: 19, color: "#3498db", emoji: "🫐", description: "Wild blueberries picked at peak sweetness. Soft, round, and endlessly smooth.", pairsWith: ["Peach Ice", "Strawberry Dream"] },
  { id: 14, name: "Peach Ice",         category: "Fruity",    intensity: "Mild",   notes: ["Peach", "Vanilla", "Cool"],           price: 1799, stock: 15, color: "#e67e22", emoji: "🍑", description: "Ripe white peach with a vanilla cloud and cool exhale. Dessert in a bowl.", pairsWith: ["Strawberry Dream", "Orange Creamsicle"] },
  { id: 15, name: "Strawberry Dream",  category: "Fruity",    intensity: "Mild",   notes: ["Strawberry", "Cream", "Sweet"],       price: 1699, stock: 31, color: "#ff6b9d", emoji: "🍓", description: "Sun-kissed strawberries swirled in fresh cream. Dreamy, delicate, irresistible.", pairsWith: ["Blueberry Burst", "Peach Ice"] },
  { id: 16, name: "Cherry Bomb",       category: "Fruity",    intensity: "Strong", notes: ["Black Cherry", "Sour", "Bold"],       price: 1799, stock: 14, color: "#d63031", emoji: "🍒", description: "Dark black cherry with a sour edge and a bold punch. Dramatic, loud, memorable.", pairsWith: ["Grape Royale", "Midnight Blueberry"] },
  { id: 17, name: "Melon Mix",         category: "Fruity",    intensity: "Mild",   notes: ["Honeydew", "Cantaloupe", "Fresh"],    price: 1699, stock: 33, color: "#00b894", emoji: "🍈", description: "Honeydew and cantaloupe in perfect harmony. Light, refreshing, endlessly sessionable.", pairsWith: ["Watermelon Chill", "Peach Ice"] },
  { id: 18, name: "Orange Creamsicle", category: "Fruity",    intensity: "Mild",   notes: ["Orange", "Cream", "Nostalgic"],       price: 1699, stock: 29, color: "#fd9644", emoji: "🍊", description: "That childhood ice cream bar — orange zest wrapped in silky cream. Pure nostalgia.", pairsWith: ["Strawberry Dream", "Peach Ice"] },

  // ── Tropical (6) ──────────────────────────────────────────────────────────
  { id: 19, name: "Mango Tango",       category: "Tropical",  intensity: "Medium", notes: ["Ripe Mango", "Citrus", "Sweet"],      price: 1799, stock: 28, color: "#f39c12", emoji: "🥭", description: "Alphonso mango at full ripeness with a citrus kick. The tropical centerpiece.", pairsWith: ["Pineapple Punch", "Tropical Storm"] },
  { id: 20, name: "Pineapple Punch",   category: "Tropical",  intensity: "Medium", notes: ["Pineapple", "Citrus", "Tart"],        price: 1799, stock: 8,  color: "#f9ca24", emoji: "🍍", description: "Golden pineapple with tart citrus edges. Punchy, bright, tropical energy.", pairsWith: ["Mango Tango", "Coconut Coast"] },
  { id: 21, name: "Coconut Coast",     category: "Tropical",  intensity: "Mild",   notes: ["Coconut", "Vanilla", "Creamy"],       price: 1799, stock: 24, color: "#dfe6e9", emoji: "🥥", description: "Toasted coconut wrapped in vanilla warmth. Like lying on a beach with nowhere to be.", pairsWith: ["Pineapple Punch", "Passion Fruit"] },
  { id: 22, name: "Passion Fruit",     category: "Tropical",  intensity: "Medium", notes: ["Passion Fruit", "Guava", "Exotic"],   price: 1999, stock: 9,  color: "#a29bfe", emoji: "🌺", description: "Intense passion fruit and guava — exotic, complex, and completely transportive.", pairsWith: ["Mango Tango", "Tropical Storm"] },
  { id: 23, name: "Tropical Storm",    category: "Tropical",  intensity: "Strong", notes: ["Mango", "Pineapple", "Mint", "Ice"],  price: 1999, stock: 16, color: "#00cec9", emoji: "🌀", description: "A full tropical assault — mango, pineapple, and mint with an icy finish. Chaotic and perfect.", pairsWith: ["Mango Tango", "Arctic Blast"] },
  { id: 24, name: "Papaya Sunrise",    category: "Tropical",  intensity: "Mild",   notes: ["Papaya", "Lime", "Honey"],            price: 1799, stock: 20, color: "#FF7043", emoji: "🌅", description: "Soft papaya with lime brightness and honey sweetness. A gentle tropical morning.", pairsWith: ["Coconut Coast", "Passion Fruit"] },

  // ── Floral + Specialty (6) ────────────────────────────────────────────────
  { id: 25, name: "Rose Garden",       category: "Floral",    intensity: "Mild",   notes: ["Rose Water", "Lychee", "Delicate"],   price: 1999, stock: 12, color: "#fd79a8", emoji: "🌹", description: "Persian rose water and lychee — delicate, feminine, hauntingly beautiful.", pairsWith: ["Lavender Haze", "Dark Rose"] },
  { id: 26, name: "Lavender Haze",     category: "Floral",    intensity: "Mild",   notes: ["Lavender", "Honey", "Calm"],          price: 2099, stock: 6,  color: "#b8a4ff", emoji: "💜", description: "True lavender with a honey finish. Deeply calming — the meditation blend.", pairsWith: ["Rose Garden", "Jasmine Pearl"] },
  { id: 27, name: "Jasmine Pearl",     category: "Floral",    intensity: "Mild",   notes: ["Jasmine", "Green Tea", "Soft"],       price: 2099, stock: 10, color: "#FFFDE7", emoji: "🤍", description: "Delicate jasmine and green tea — like a Japanese tea ceremony in smoke form.", pairsWith: ["Lavender Haze", "Rose Garden"] },
  { id: 28, name: "Spiced Chai",       category: "Specialty", intensity: "Strong", notes: ["Cardamom", "Cinnamon", "Warm"],       price: 2099, stock: 11, color: "#e17055", emoji: "🫖", description: "Street-stall masala chai — cardamom, cinnamon, ginger and clove in perfect heat.", pairsWith: ["Golden Era", "Iced Cappuccino"] },
  { id: 29, name: "Iced Cappuccino",   category: "Specialty", intensity: "Medium", notes: ["Coffee", "Milk", "Sweet"],            price: 1999, stock: 7,  color: "#6c5ce7", emoji: "☕", description: "A double shot over ice with sweet cream. For the hookah lover who also needs caffeine.", pairsWith: ["Spiced Chai", "Golden Era"] },
  { id: 30, name: "Cardamom Dream",    category: "Specialty", intensity: "Medium", notes: ["Cardamom", "Rose", "Honey"],          price: 2199, stock: 8,  color: "#C39BD3", emoji: "🌙", description: "Middle Eastern cardamom with rose and raw honey. Slow, meditative, deeply aromatic.", pairsWith: ["Spiced Chai", "Rose Garden"] },

  // ── Novelty + Premium + Mystery (6) ───────────────────────────────────────
  { id: 31, name: "Cola Freeze",       category: "Novelty",   intensity: "Medium", notes: ["Cola", "Ice", "Fizzy"],               price: 1699, stock: 26, color: "#4a4a4a", emoji: "🥤", description: "A fizzy cola with an icy finish. Playful, unexpected, and dangerously sessionable.", pairsWith: ["Bubblegum Pop", "Mint Glacier"] },
  { id: 32, name: "Bubblegum Pop",     category: "Novelty",   intensity: "Mild",   notes: ["Bubblegum", "Sweet", "Fun"],          price: 1499, stock: 38, color: "#ff9ff3", emoji: "🫧", description: "Childhood nostalgia in every pull. Pink bubblegum sweetness — pure fun, zero apology.", pairsWith: ["Cola Freeze", "Strawberry Dream"] },
  { id: 33, name: "Cotton Candy",      category: "Novelty",   intensity: "Mild",   notes: ["Spun Sugar", "Vanilla", "Airy"],      price: 1499, stock: 31, color: "#F8BBD0", emoji: "🍭", description: "Carnival vibes — light spun sugar with a vanilla whisper. Airy and surprisingly delicate.", pairsWith: ["Bubblegum Pop", "Strawberry Dream"] },
  { id: 34, name: "Blue Mist",         category: "Mystery",   intensity: "Medium", notes: ["Blueberry", "Mint", "Unknown"],       price: 2099, stock: 18, color: "#74b9ff", emoji: "💙", description: "Nobody fully agrees on what's in Blue Mist. Blueberry, mint, something else. That's the point.", pairsWith: ["Midnight Blueberry", "Arctic Blast"] },
  { id: 35, name: "Phantom",           category: "Mystery",   intensity: "Strong", notes: ["Unknown", "Complex", "Evolving"],     price: 2399, stock: 5,  color: "#636e72", emoji: "👻", description: "Changes on every exhale. One pull it's citrus, the next it's floral, the next it's spice.", pairsWith: ["Blue Mist", "Midnight Blueberry"] },
  { id: 36, name: "Midnight Blueberry",category: "Premium",   intensity: "Strong", notes: ["Dark Berry", "Anise", "Complex"],     price: 2399, stock: 4,  color: "#5f27cd", emoji: "🌑", description: "The crown jewel. Dark berry, anise, and a complex finish that lingers for minutes. Reserve this for the right night.", pairsWith: ["Cherry Bomb", "Phantom"] },
];

export const CATEGORIES = [
  "All", "Classic", "Fresh", "Fruity", "Tropical",
  "Floral", "Specialty", "Novelty", "Mystery", "Premium"
] as const;

export type Category = typeof CATEGORIES[number];

export function getStockStatus(stock: number) {
  if (stock === 0) return "out";
  if (stock < 5)  return "critical";
  if (stock <= 15) return "low";
  return "normal";
}
