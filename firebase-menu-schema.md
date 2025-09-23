# Firebase Menu Data Structure

## Collections Structure

### 1. Menu Sections Collection: `menuSections`
```javascript
{
  "breakfast": {
    "id": "breakfast",
    "name": "Breakfast",
    "description": "Start your day with our delicious breakfast options",
    "icon": "sunrise", // or icon name
    "order": 1,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "lunch": {
    "id": "lunch", 
    "name": "Lunch",
    "description": "Hearty lunch options to fuel your afternoon",
    "icon": "utensils",
    "order": 2,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
  // ... other sections
}
```

### 2. Dishes Collection: `dishes`
```javascript
{
  "dish_001": {
    "id": "dish_001",
    "name": "Classic Pancakes",
    "description": "Fluffy pancakes served with maple syrup and butter",
    "price": 299,
    "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/pancakes.jpg",
    "imagePublicId": "pancakes", // Cloudinary public ID
    "sectionId": "breakfast",
    "isAvailable": true,
    "isPopular": false,
    "isVegetarian": true,
    "isVegan": false,
    "isSpicy": false,
    "allergens": ["gluten", "dairy"],
    "preparationTime": 15, // minutes
    "calories": 350,
    "rating": 4.5,
    "order": 1, // order within section
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "dish_002": {
    "id": "dish_002",
    "name": "Chicken Burger",
    "description": "Juicy chicken patty with fresh vegetables and special sauce",
    "price": 450,
    "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/chicken-burger.jpg",
    "imagePublicId": "chicken-burger",
    "sectionId": "lunch",
    "isAvailable": true,
    "isPopular": true,
    "isVegetarian": false,
    "isVegan": false,
    "isSpicy": false,
    "allergens": ["gluten"],
    "preparationTime": 20,
    "calories": 520,
    "rating": 4.8,
    "order": 1,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
  // ... other dishes
}
```

## Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Menu sections - public read, admin write
    match /menuSections/{sectionId} {
      allow read: if true;
      allow write: if true; // For now, allow all writes
    }
    
    // Dishes - public read, admin write
    match /dishes/{dishId} {
      allow read: if true;
      allow write: if true; // For now, allow all writes
    }
    
    // Restaurant status - public read, admin write
    match /restaurant/status {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## TypeScript Interfaces

```typescript
export interface MenuSection {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  imagePublicId: string;
  sectionId: string;
  isAvailable: boolean;
  isPopular: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isSpicy: boolean;
  allergens: string[];
  preparationTime: number;
  calories: number;
  rating: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

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
```
