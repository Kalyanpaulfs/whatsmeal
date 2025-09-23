import type { MenuCategory } from '../types/menu';

export const menuCategories: MenuCategory[] = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    description: 'Start your day with our delicious morning delights',
    icon: '🌅',
    availableHours: {
      start: '07:00',
      end: '11:00',
    },
    isActive: true,
  },
  {
    id: 'lunch',
    name: 'Lunch',
    description: 'Hearty meals to fuel your afternoon',
    icon: '🍽️',
    availableHours: {
      start: '11:00',
      end: '16:00',
    },
    isActive: true,
  },
  {
    id: 'dinner',
    name: 'Dinner',
    description: 'Perfect end to your day with our exquisite dinner options',
    icon: '🌙',
    availableHours: {
      start: '16:00',
      end: '23:00',
    },
    isActive: true,
  },
  {
    id: 'starters',
    name: 'Starters & Appetizers',
    description: 'Perfect beginning to your culinary journey',
    icon: '🥗',
    isActive: true,
  },
  {
    id: 'main-course',
    name: 'Main Course',
    description: 'Our signature dishes that define our culinary excellence',
    icon: '🍖',
    isActive: true,
  },
  {
    id: 'beverages',
    name: 'Beverages',
    description: 'Refreshing drinks to complement your meal',
    icon: '🥤',
    isActive: true,
  },
  {
    id: 'desserts',
    name: 'Desserts',
    description: 'Sweet endings to satisfy your sweet tooth',
    icon: '🍰',
    isActive: true,
  },
  {
    id: 'chefs-special',
    name: "Chef's Special",
    description: 'Exclusive creations by our master chefs',
    icon: '👨‍🍳',
    isActive: true,
  },
];
