// Menu Section Interface
export interface MenuSection {
  id: string;
  name: string;
  description: string;
  icon?: string; // Made optional
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Legacy properties for backward compatibility
  category?: MenuCategory;
  dishes?: Dish[];
}

// Dish Interface
export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  imagePublicId?: string; // Optional for backward compatibility
  sectionId?: string; // Optional for backward compatibility
  isAvailable: boolean;
  isPopular?: boolean; // Optional for backward compatibility
  isVegetarian: boolean;
  isVegan: boolean;
  isSpicy?: boolean; // Optional for backward compatibility
  allergens?: string[]; // Optional for backward compatibility
  preparationTime: number;
  calories?: number; // Optional for backward compatibility
  rating?: number; // Optional for backward compatibility
  order?: number; // Optional for backward compatibility
  createdAt?: string; // Optional for backward compatibility
  updatedAt?: string; // Optional for backward compatibility
  // Legacy properties for backward compatibility
  category?: MenuCategory;
  ingredients?: string[];
  nutritionInfo?: {
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

// Form Data Interface for Dish Creation/Editing
export interface DishFormData {
  name: string;
  description: string;
  price: number;
  image?: File;
  sectionId: string;
  isAvailable: boolean;
  isPopular: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isSpicy: boolean;
  allergens: string[];
  preparationTime: number;
  calories: number;
}

// Form Data Interface for Section Creation/Editing
export interface SectionFormData {
  name: string;
  description: string;
  isActive: boolean;
}

// Menu Store State Interface
export interface MenuState {
  sections: MenuSection[];
  dishes: Dish[];
  isLoading: boolean;
  error: string | null;
  
  // Legacy properties for backward compatibility
  categories: MenuCategory[];
  filteredDishes: Dish[];
  
  // Actions
  fetchSections: () => Promise<void>;
  fetchDishes: () => Promise<void>;
  addSection: (sectionData: SectionFormData) => Promise<void>;
  updateSection: (sectionId: string, sectionData: Partial<SectionFormData>) => Promise<void>;
  deleteSection: (sectionId: string) => Promise<void>;
  addDish: (dishData: DishFormData) => Promise<void>;
  updateDish: (dishId: string, dishData: Partial<DishFormData>) => Promise<void>;
  deleteDish: (dishId: string) => Promise<void>;
  toggleDishAvailability: (dishId: string) => Promise<void>;
  
  // Legacy actions
  setCategories: (categories: MenuCategory[]) => void;
  setDishes: (dishes: Dish[]) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  getMenuSections: () => MenuSection[];
  
  // Getters
  getDishesBySection: (sectionId: string) => Dish[];
  getSectionById: (sectionId: string) => MenuSection | undefined;
  getDishById: (dishId: string) => Dish | undefined;
}

// Allergen Options
export const ALLERGEN_OPTIONS = [
  'gluten',
  'dairy',
  'eggs',
  'nuts',
  'peanuts',
  'soy',
  'fish',
  'shellfish',
  'sesame',
  'sulfites',
] as const;

export type Allergen = typeof ALLERGEN_OPTIONS[number];

// Icon Options for Sections
export const SECTION_ICON_OPTIONS = [
  'sunrise', // breakfast
  'utensils', // lunch
  'moon', // dinner
  'coffee', // beverages
  'ice-cream', // desserts
  'star', // chef's special
  'leaf', // vegetarian
  'flame', // spicy
  'heart', // healthy
  'gift', // special offers
] as const;

export type SectionIcon = typeof SECTION_ICON_OPTIONS[number];

// Legacy MenuCategory type for backward compatibility
export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  isActive?: boolean;
  availableHours?: {
    start: string;
    end: string;
  };
}