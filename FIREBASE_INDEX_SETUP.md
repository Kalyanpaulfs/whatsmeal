# 🔥 Firebase Index Setup

## ❌ Current Error
```
The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/food-order-restaurant-3da72/firestore/indexes?create_composite=...
```

## ✅ Quick Fix

### Option 1: Use the Direct Link (Fastest)
1. **Click this link**: https://console.firebase.google.com/v1/r/project/food-order-restaurant-3da72/firestore/indexes?create_composite=Clpwcm9qZWN0cy9mb29kLW9yZGVyLXJlc3RhdXJhbnQtM2RhNzIvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2Rpc2hlcy9pbmRleGVzL18QARoNCglzZWN0aW9uSWQQAR0JCgVvcmRlchABGgwKCF9fbmFtZV9fEAE
2. **Click "Create Index"** button
3. **Wait 2-3 minutes** for the index to build
4. **Refresh your admin panel** and try adding a dish again

### Option 2: Manual Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `food-order-restaurant-3da72`
3. Go to **Firestore Database** → **Indexes**
4. Click **Create Index**
5. Set up the composite index:
   - **Collection ID**: `dishes`
   - **Fields**:
     - `sectionId` (Ascending)
     - `order` (Ascending)
     - `__name__` (Ascending)
6. Click **Create**

## 🎯 What This Fixes
- ✅ Allows querying dishes by section and order
- ✅ Enables proper sorting of dishes
- ✅ Fixes the "index required" error

## ⏱️ Timeline
- **Index Creation**: 2-3 minutes
- **Testing**: Immediately after creation

Your admin panel will work perfectly once the index is created! 🚀
