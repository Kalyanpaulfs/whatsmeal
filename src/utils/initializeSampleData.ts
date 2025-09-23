import { MenuService } from '../services/menuService';

export const initializeSampleData = async () => {
  try {
    console.log('Initializing sample data...');
    
    // Sample sections
    const sampleSections = [
      {
        name: 'Breakfast',
        description: 'Start your day with our delicious morning delights',
        isActive: true,
      },
      {
        name: 'Lunch',
        description: 'Hearty meals to fuel your afternoon',
        isActive: true,
      },
      {
        name: 'Dinner',
        description: 'Perfect end to your day with our exquisite dinner options',
        isActive: true,
      },
      {
        name: 'Beverages',
        description: 'Refreshing drinks to complement your meal',
        isActive: true,
      },
      {
        name: 'Desserts',
        description: 'Sweet endings to satisfy your sweet tooth',
        isActive: true,
      },
    ];

    // Add sections
    const sectionIds: string[] = [];
    for (const section of sampleSections) {
      try {
        const sectionId = await MenuService.addSection(section);
        sectionIds.push(sectionId);
        console.log(`Added section: ${section.name} (${sectionId})`);
      } catch (error) {
        console.error(`Failed to add section ${section.name}:`, error);
      }
    }

    // Sample dishes
    const sampleDishes = [
      {
        name: 'Classic Pancakes',
        description: 'Fluffy pancakes served with maple syrup and butter',
        price: 12.99,
        sectionId: sectionIds[0], // Breakfast
        isAvailable: true,
        isPopular: true,
        isVegetarian: true,
        isVegan: false,
        isSpicy: false,
        allergens: ['gluten', 'dairy', 'eggs'],
        preparationTime: 15,
        calories: 350,
      },
      {
        name: 'Grilled Chicken Sandwich',
        description: 'Tender grilled chicken breast with lettuce, tomato, and mayo',
        price: 16.99,
        sectionId: sectionIds[1], // Lunch
        isAvailable: true,
        isPopular: true,
        isVegetarian: false,
        isVegan: false,
        isSpicy: false,
        allergens: ['gluten'],
        preparationTime: 20,
        calories: 450,
      },
      {
        name: 'Beef Steak',
        description: 'Premium beef steak cooked to perfection',
        price: 28.99,
        sectionId: sectionIds[2], // Dinner
        isAvailable: true,
        isPopular: true,
        isVegetarian: false,
        isVegan: false,
        isSpicy: false,
        allergens: [],
        preparationTime: 25,
        calories: 600,
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 4.99,
        sectionId: sectionIds[3], // Beverages
        isAvailable: true,
        isPopular: false,
        isVegetarian: true,
        isVegan: true,
        isSpicy: false,
        allergens: [],
        preparationTime: 5,
        calories: 120,
      },
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with chocolate frosting',
        price: 8.99,
        sectionId: sectionIds[4], // Desserts
        isAvailable: true,
        isPopular: true,
        isVegetarian: true,
        isVegan: false,
        isSpicy: false,
        allergens: ['gluten', 'dairy', 'eggs'],
        preparationTime: 10,
        calories: 400,
      },
    ];

    // Add dishes
    for (const dish of sampleDishes) {
      try {
        const dishId = await MenuService.addDish(dish);
        console.log(`Added dish: ${dish.name} (${dishId})`);
      } catch (error) {
        console.error(`Failed to add dish ${dish.name}:`, error);
      }
    }

    console.log('Sample data initialization completed!');
    return true;
  } catch (error) {
    console.error('Failed to initialize sample data:', error);
    return false;
  }
};
