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
}

export const FLAVOURS: Flavour[] = [
  { id: 1,  name: "Double Apple",       category: "Classic",   intensity: "Medium", notes: ["Apple", "Anise", "Sweet"],              price: 12.99, stock: 47, color: "#e74c3c", emoji: "🍎" },
  { id: 2,  name: "Mint Glacier",       category: "Fresh",     intensity: "Strong", notes: ["Spearmint", "Ice", "Cool"],              price: 11.99, stock: 32, color: "#1abc9c", emoji: "🌿" },
  { id: 3,  name: "Mango Tango",        category: "Tropical",  intensity: "Medium", notes: ["Ripe Mango", "Citrus", "Sweet"],         price: 13.99, stock: 28, color: "#f39c12", emoji: "🥭" },
  { id: 4,  name: "Grape Royale",       category: "Classic",   intensity: "Medium", notes: ["Dark Grape", "Berry", "Rich"],           price: 12.99, stock: 41, color: "#9b59b6", emoji: "🍇" },
  { id: 5,  name: "Blueberry Burst",    category: "Fruity",    intensity: "Mild",   notes: ["Wild Blueberry", "Sweet", "Soft"],       price: 13.99, stock: 19, color: "#3498db", emoji: "🫐" },
  { id: 6,  name: "Watermelon Chill",   category: "Fresh",     intensity: "Mild",   notes: ["Watermelon", "Mint", "Juicy"],           price: 12.99, stock: 35, color: "#2ecc71", emoji: "🍉" },
  { id: 7,  name: "Lemon Mint",         category: "Fresh",     intensity: "Strong", notes: ["Lemon Zest", "Spearmint", "Sharp"],      price: 11.99, stock: 22, color: "#f1c40f", emoji: "🍋" },
  { id: 8,  name: "Peach Ice",          category: "Fruity",    intensity: "Mild",   notes: ["Peach", "Vanilla", "Cool"],              price: 13.99, stock: 15, color: "#e67e22", emoji: "🍑" },
  { id: 9,  name: "Pineapple Punch",    category: "Tropical",  intensity: "Medium", notes: ["Pineapple", "Citrus", "Tart"],           price: 13.99, stock: 8,  color: "#f9ca24", emoji: "🍍" },
  { id: 10, name: "Strawberry Dream",   category: "Fruity",    intensity: "Mild",   notes: ["Strawberry", "Cream", "Sweet"],          price: 12.99, stock: 31, color: "#ff6b9d", emoji: "🍓" },
  { id: 11, name: "Rose Garden",        category: "Floral",    intensity: "Mild",   notes: ["Rose Water", "Lychee", "Delicate"],      price: 14.99, stock: 12, color: "#fd79a8", emoji: "🌹" },
  { id: 12, name: "Coconut Coast",      category: "Tropical",  intensity: "Mild",   notes: ["Coconut", "Vanilla", "Creamy"],          price: 13.99, stock: 24, color: "#b2bec3", emoji: "🥥" },
  { id: 13, name: "Blue Mist",          category: "Mystery",   intensity: "Medium", notes: ["Blueberry", "Mint", "Mysterious"],       price: 15.99, stock: 18, color: "#74b9ff", emoji: "💙" },
  { id: 14, name: "Passion Fruit",      category: "Tropical",  intensity: "Medium", notes: ["Passion Fruit", "Guava", "Exotic"],      price: 14.99, stock: 9,  color: "#a29bfe", emoji: "🌺" },
  { id: 15, name: "Cola Freeze",        category: "Novelty",   intensity: "Medium", notes: ["Cola", "Ice", "Fizzy"],                  price: 12.99, stock: 26, color: "#4a4a4a", emoji: "🥤" },
  { id: 16, name: "Cherry Bomb",        category: "Fruity",    intensity: "Strong", notes: ["Black Cherry", "Sour", "Bold"],          price: 13.99, stock: 14, color: "#d63031", emoji: "🍒" },
  { id: 17, name: "Melon Mix",          category: "Fruity",    intensity: "Mild",   notes: ["Honeydew", "Cantaloupe", "Fresh"],       price: 12.99, stock: 33, color: "#00b894", emoji: "🍈" },
  { id: 18, name: "Iced Cappuccino",    category: "Novelty",   intensity: "Medium", notes: ["Coffee", "Milk", "Sweet"],               price: 14.99, stock: 7,  color: "#6c5ce7", emoji: "☕" },
  { id: 19, name: "Kiwi Breeze",        category: "Fresh",     intensity: "Medium", notes: ["Kiwi", "Mint", "Tart"],                  price: 13.99, stock: 21, color: "#55efc4", emoji: "🥝" },
  { id: 20, name: "Orange Creamsicle",  category: "Fruity",    intensity: "Mild",   notes: ["Orange", "Cream", "Nostalgic"],          price: 12.99, stock: 29, color: "#fd9644", emoji: "🍊" },
  { id: 21, name: "Spiced Chai",        category: "Specialty", intensity: "Strong", notes: ["Cardamom", "Cinnamon", "Warm"],          price: 15.99, stock: 11, color: "#e17055", emoji: "🫖" },
  { id: 22, name: "Lavender Haze",      category: "Floral",    intensity: "Mild",   notes: ["Lavender", "Honey", "Calm"],             price: 15.99, stock: 6,  color: "#b8a4ff", emoji: "💜" },
  { id: 23, name: "Tropical Storm",     category: "Tropical",  intensity: "Strong", notes: ["Mango", "Pineapple", "Mint", "Ice"],     price: 14.99, stock: 16, color: "#00cec9", emoji: "🌀" },
  { id: 24, name: "Bubblegum Pop",      category: "Novelty",   intensity: "Mild",   notes: ["Bubblegum", "Sweet", "Fun"],             price: 11.99, stock: 38, color: "#ff9ff3", emoji: "🫧" },
  { id: 25, name: "Midnight Blueberry", category: "Premium",   intensity: "Strong", notes: ["Dark Berry", "Anise", "Complex"],        price: 17.99, stock: 4,  color: "#5f27cd", emoji: "🌑" },
];

export const CATEGORIES = ["All", "Classic", "Fresh", "Fruity", "Tropical", "Floral", "Specialty", "Novelty", "Premium", "Mystery"] as const;

export function getStockStatus(stock: number) {
  if (stock === 0) return "out";
  if (stock < 5) return "critical";
  if (stock <= 20) return "low";
  return "normal";
}
