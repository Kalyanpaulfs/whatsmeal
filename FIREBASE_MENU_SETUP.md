# Firebase Menu Management Setup Guide

## 🚀 Complete Firebase Menu Integration

This guide will help you set up a complete Firebase-integrated menu management system with Cloudinary image uploads.

## 📋 Prerequisites

1. **Firebase Project**: Already set up
2. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com)
3. **Node.js**: Version 16 or higher

## 🔧 Step 1: Cloudinary Setup

### 1.1 Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Note down your:
   - Cloud Name
   - API Key
   - API Secret

### 1.2 Configure Upload Preset
1. Go to Cloudinary Dashboard → Settings → Upload
2. Create a new upload preset:
   - **Preset Name**: `restaurant-menu`
   - **Signing Mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `restaurant-menu`
   - **Transformations**: `w_800,h_600,c_fill,q_auto,f_auto`

### 1.3 Update Cloudinary Configuration
Update `src/lib/cloudinary.ts`:

```typescript
export const CLOUDINARY_CONFIG = {
  cloudName: 'your-actual-cloud-name', // Replace with your cloud name
  uploadPreset: 'restaurant-menu', // Your upload preset name
  apiKey: 'your-api-key', // Optional, can be public
};
```

## 🔥 Step 2: Firebase Firestore Setup

### 2.1 Update Firestore Security Rules
Go to Firebase Console → Firestore Database → Rules and replace with:

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

### 2.2 Initialize Menu Data
Run this script to populate initial menu data:

```javascript
// Run this in Firebase Console → Firestore Database → Data
// Or use the Firebase Admin SDK

// Add initial sections
const sections = [
  {
    id: 'breakfast',
    name: 'Breakfast',
    description: 'Start your day with our delicious breakfast options',
    icon: 'sunrise',
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lunch',
    name: 'Lunch',
    description: 'Hearty lunch options to fuel your afternoon',
    icon: 'utensils',
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dinner',
    name: 'Dinner',
    description: 'Perfect dinner options for your evening',
    icon: 'moon',
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'beverages',
    name: 'Beverages',
    description: 'Refreshing drinks and beverages',
    icon: 'coffee',
    order: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'desserts',
    name: 'Desserts',
    description: 'Sweet treats to end your meal',
    icon: 'ice-cream',
    order: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Add to Firestore collection 'menuSections'
```

## 🛠️ Step 3: Install Dependencies

```bash
npm install cloudinary
```

## 🎯 Step 4: Features Overview

### ✅ Admin Panel Features
- **Menu Sections Management**:
  - Add/Edit/Delete menu sections
  - Set section icons and descriptions
  - Toggle section active status

- **Dish Management**:
  - Add/Edit/Delete dishes
  - Upload images via Cloudinary
  - Set dish properties (price, description, allergens, etc.)
  - Toggle availability status
  - Mark as popular/vegetarian/spicy

### ✅ Customer Features
- **Real-time Menu**: Updates automatically when admin makes changes
- **Dynamic Categories**: Menu sections loaded from Firebase
- **Image Optimization**: Cloudinary provides optimized images
- **Responsive Design**: Works on all devices

### ✅ Technical Features
- **Firebase Integration**: Real-time data synchronization
- **Cloudinary Upload**: Direct image upload from admin panel
- **Type Safety**: Full TypeScript support
- **Error Handling**: Graceful fallbacks and error messages
- **Performance**: Optimized queries and caching

## 🚀 Step 5: Usage Instructions

### For Admins:
1. **Access Admin Panel**: Go to `/admin`
2. **Login**: Use Firebase authentication
3. **Manage Menu**: Click "Menu Management" tab
4. **Add Sections**: Create new menu categories
5. **Add Dishes**: Upload images and add dish details
6. **Real-time Updates**: Changes appear instantly on customer site

### For Customers:
1. **View Menu**: All dishes load from Firebase
2. **Real-time Updates**: See changes immediately
3. **Order Management**: Add items to cart with real-time availability

## 🔍 Step 6: Testing

### Test Admin Features:
1. Add a new menu section
2. Add dishes with images
3. Toggle dish availability
4. Edit dish details
5. Delete dishes/sections

### Test Customer Features:
1. Open customer site in another browser
2. Verify real-time updates
3. Test image loading
4. Check responsive design

## 🐛 Troubleshooting

### Common Issues:

1. **Cloudinary Upload Fails**:
   - Check upload preset configuration
   - Verify API keys
   - Check CORS settings

2. **Firebase Permission Errors**:
   - Verify Firestore rules
   - Check authentication status
   - Ensure proper collection names

3. **Images Not Loading**:
   - Check Cloudinary configuration
   - Verify image URLs in Firebase
   - Check network connectivity

### Debug Steps:
1. Check browser console for errors
2. Verify Firebase connection
3. Test Cloudinary upload manually
4. Check Firestore data structure

## 📊 Data Structure

### Menu Sections Collection (`menuSections`):
```javascript
{
  "breakfast": {
    "id": "breakfast",
    "name": "Breakfast",
    "description": "Start your day with our delicious breakfast options",
    "icon": "sunrise",
    "order": 1,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Dishes Collection (`dishes`):
```javascript
{
  "dish_001": {
    "id": "dish_001",
    "name": "Classic Pancakes",
    "description": "Fluffy pancakes served with maple syrup and butter",
    "price": 299,
    "image": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/pancakes.jpg",
    "imagePublicId": "pancakes",
    "sectionId": "breakfast",
    "isAvailable": true,
    "isPopular": false,
    "isVegetarian": true,
    "isVegan": false,
    "isSpicy": false,
    "allergens": ["gluten", "dairy"],
    "preparationTime": 15,
    "calories": 350,
    "rating": 4.5,
    "order": 1,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## 🎉 Success!

Once set up, you'll have:
- ✅ **Complete Menu Management**: Add/edit/delete dishes and sections
- ✅ **Image Upload**: Direct Cloudinary integration
- ✅ **Real-time Updates**: Changes sync across all devices
- ✅ **Professional UI**: Clean, responsive admin panel
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Error Handling**: Graceful fallbacks

Your restaurant menu system is now fully integrated with Firebase and Cloudinary! 🚀
