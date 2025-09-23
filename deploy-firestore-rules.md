# Deploy Firestore Security Rules

To fix the Firebase permissions error, you need to deploy the security rules to your Firebase project.

## Option 1: Using Firebase CLI (Recommended)

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**:
   ```bash
   firebase init firestore
   ```
   - Select your existing project: `food-order-restaurant-3da72`
   - Choose to use the existing `firestore.rules` file
   - Choose to use the existing `firestore.indexes.json` file

4. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Option 2: Using Firebase Console (Quick Fix)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `food-order-restaurant-3da72`
3. Go to **Firestore Database** → **Rules**
4. Replace the existing rules with the content from `firestore.rules`
5. Click **Publish**

## Option 3: Temporary Fix (For Testing)

If you want to test immediately without deploying rules, you can temporarily disable security rules:

1. Go to Firebase Console → Firestore Database → Rules
2. Change the rules to:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
3. Click **Publish**

⚠️ **Warning**: Option 3 makes your database completely public. Only use for testing!

## After Deploying Rules

Once the rules are deployed, the restaurant status system will work with:
- ✅ Real-time updates across all devices
- ✅ Global synchronization
- ✅ No more permission errors
- ✅ Proper security for production use

## Test the Fix

1. Open the admin panel: `http://localhost:5173/admin`
2. Try changing the restaurant status
3. Check the browser console - the permission errors should be gone
4. Open the customer site: `http://localhost:5173/`
5. Verify that status changes appear in real-time
