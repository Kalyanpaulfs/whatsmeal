import { create } from 'zustand';
import { MenuService } from '../services/menuService';
import type { Dish, DishFormData, SectionFormData, MenuState, MenuCategory } from '../types/menu';

export const useMenuStore = create<MenuState>()((set, get) => ({
  sections: [],
  dishes: [],
  isLoading: false,
  error: null,
  
  // Legacy properties for backward compatibility
  categories: [],
  filteredDishes: [],

  // Fetch sections
  fetchSections: async () => {
    set({ isLoading: true, error: null });
    try {
      const sections = await MenuService.getSections();
      set({ sections, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch sections',
        isLoading: false 
      });
    }
  },

  // Fetch dishes
  fetchDishes: async () => {
    set({ isLoading: true, error: null });
    try {
      const dishes = await MenuService.getDishes();
      set({ dishes, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch dishes',
        isLoading: false 
      });
    }
  },

  // Add section
  addSection: async (sectionData: SectionFormData) => {
    console.log('Store: Adding section with data:', sectionData);
    set({ isLoading: true, error: null });
    try {
      const sectionId = await MenuService.addSection(sectionData);
      console.log('Store: Section added with ID:', sectionId);
      // Refresh sections
      await get().fetchSections();
      console.log('Store: Sections refreshed');
    } catch (error: any) {
      console.error('Store: Error adding section:', error);
      set({ 
        error: error.message || 'Failed to add section',
        isLoading: false 
      });
      throw error;
    }
  },

  // Update section
  updateSection: async (sectionId: string, sectionData: Partial<SectionFormData>) => {
    set({ isLoading: true, error: null });
    try {
      await MenuService.updateSection(sectionId, sectionData);
      // Refresh sections
      await get().fetchSections();
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update section',
        isLoading: false 
      });
      throw error;
    }
  },

  // Delete section
  deleteSection: async (sectionId: string) => {
    set({ isLoading: true, error: null });
    try {
      await MenuService.deleteSection(sectionId);
      // Refresh sections and dishes
      await Promise.all([get().fetchSections(), get().fetchDishes()]);
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete section',
        isLoading: false 
      });
      throw error;
    }
  },

  // Add dish
  addDish: async (dishData: DishFormData) => {
    console.log('Store: Adding dish with data:', dishData);
    set({ isLoading: true, error: null });
    try {
      const dishId = await MenuService.addDish(dishData);
      console.log('Store: Dish added with ID:', dishId);
      // Refresh dishes
      await get().fetchDishes();
      console.log('Store: Dishes refreshed');
    } catch (error: any) {
      console.error('Store: Error adding dish:', error);
      set({ 
        error: error.message || 'Failed to add dish',
        isLoading: false 
      });
      throw error;
    }
  },

  // Update dish
  updateDish: async (dishId: string, dishData: Partial<DishFormData>) => {
    set({ isLoading: true, error: null });
    try {
      await MenuService.updateDish(dishId, dishData);
      // Refresh dishes
      await get().fetchDishes();
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update dish',
        isLoading: false 
      });
      throw error;
    }
  },

  // Delete dish
  deleteDish: async (dishId: string) => {
    set({ isLoading: true, error: null });
    try {
      await MenuService.deleteDish(dishId);
      // Refresh dishes
      await get().fetchDishes();
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete dish',
        isLoading: false 
      });
      throw error;
    }
  },

  // Toggle dish availability
  toggleDishAvailability: async (dishId: string) => {
    set({ isLoading: true, error: null });
    try {
      await MenuService.toggleDishAvailability(dishId);
      // Refresh dishes
      await get().fetchDishes();
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to toggle dish availability',
        isLoading: false 
      });
      throw error;
    }
  },

  // Get dishes by section
  getDishesBySection: (sectionId: string) => {
    const { dishes } = get();
    return dishes.filter(dish => dish.sectionId === sectionId);
  },

  // Get section by ID
  getSectionById: (sectionId: string) => {
    const { sections } = get();
    return sections.find(section => section.id === sectionId);
  },

  // Get dish by ID
  getDishById: (dishId: string) => {
    const { dishes } = get();
    return dishes.find(dish => dish.id === dishId);
  },

  // Legacy methods for backward compatibility
  setCategories: (categories: MenuCategory[]) => {
    set({ categories });
  },

  setDishes: (dishes: Dish[]) => {
    set({ dishes });
  },

  setSelectedCategory: (_categoryId: string | null) => {
    // This will be handled by the useMenu hook
  },

  setSearchQuery: (_query: string) => {
    // This will be handled by the useMenu hook
  },

  getMenuSections: () => {
    const { sections, dishes } = get();
    return sections.map(section => ({
      ...section,
      dishes: dishes.filter(dish => dish.sectionId === section.id)
    }));
  },
}));