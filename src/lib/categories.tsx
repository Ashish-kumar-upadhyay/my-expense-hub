import {
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Plus,
  Film,
  FileText,
  MoreHorizontal,
  Briefcase,
  Coffee,
  Plane,
  Heart,
  ShoppingCart,
  Wallet,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

export type CategoryId =
  | "food"
  | "dining"
  | "technology"
  | "shopping"
  | "travel"
  | "rent"
  | "health"
  | "leisure"
  | "bills"
  | "other"
  | "income";

export interface CategoryDef {
  id: CategoryId;
  name: string;
  icon: LucideIcon;
  color: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "food", name: "Food", icon: Utensils, color: "#c44d3d" },
  { id: "dining", name: "Dining", icon: Utensils, color: "#c44d3d" },
  { id: "technology", name: "Technology", icon: ShoppingBag, color: "#1b2a4e" },
  { id: "shopping", name: "Shopping", icon: ShoppingBag, color: "#1b2a4e" },
  { id: "travel", name: "Travel", icon: Plane, color: "#5a8a5c" },
  { id: "rent", name: "Rent", icon: Home, color: "#6b4423" },
  { id: "health", name: "Health", icon: Heart, color: "#c9a84c" },
  { id: "leisure", name: "Leisure", icon: Film, color: "#7d5fa3" },
  { id: "bills", name: "Bills", icon: FileText, color: "#3a6f8a" },
  { id: "other", name: "Other", icon: MoreHorizontal, color: "#8a8a8a" },
  { id: "income", name: "Income", icon: Wallet, color: "#1f7a4d" },
];

export const FILTER_CATEGORIES = ["all", "dining", "travel", "rent", "bills", "technology", "health"] as const;

export function getCategory(id: string): CategoryDef {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

// extra icons used in transactions list (re-export for other components)
export { Utensils, ShoppingBag, Car, Briefcase, Coffee, Plus, Smartphone };