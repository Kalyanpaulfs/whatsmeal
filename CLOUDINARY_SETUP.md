# 🚀 Cloudinary Setup for Restaurant Menu

## ✅ Your Cloudinary Account Details
- **Cloud Name**: `djvyx2kt5`
- **API Key**: `253e12fc07563c7ef008f62ff13b76`
- **Folder**: `food-order` (already created)

## 🔧 Step 1: Create Upload Preset

### 1.1 Go to Cloudinary Dashboard
1. Open [console.cloudinary.com](https://console.cloudinary.com)
2. Make sure you're in the correct environment: **DJ djvyx2kt5**

### 1.2 Create Upload Preset
1. Go to **Settings** → **Upload** (in the left sidebar)
2. Scroll down to **Upload presets** section
3. Click **Add upload preset**
4. Fill in the details:
   - **Preset name**: `restaurant-menu`
   - **Signing Mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `food-order`
   - **Transformations**: `w_800,h_600,c_fill,q_auto,f_auto`
   - **Format**: `auto`
   - **Quality**: `auto`

### 1.3 Save the Preset
1. Click **Save** to create the preset
2. The preset is now ready for use

## 🎯 Step 2: Test the Integration

### 2.1 Test Image Upload
1. Go to your admin panel: `http://localhost:5173/admin`
2. Login with your Firebase credentials
3. Navigate to **Menu Management** tab
4. Click **Add Dish**
5. Try uploading an image - it should work!

### 2.2 Verify Upload
1. Go back to Cloudinary Dashboard
2. Check the `food-order` folder
3. You should see the uploaded image there

## 🔍 Step 3: Troubleshooting

### If Upload Fails:
1. **Check Preset Name**: Make sure it's exactly `restaurant-menu`
2. **Check Folder**: Ensure it's `food-order`
3. **Check Signing Mode**: Must be `Unsigned`
4. **Check Console**: Look for error messages in browser console

### Common Issues:
- **CORS Error**: Make sure the preset is set to `Unsigned`
- **403 Forbidden**: Check the preset name and folder
- **Image Not Appearing**: Check the folder in Cloudinary dashboard

## 🎉 Success!

Once the upload preset is created, your restaurant menu system will be fully functional with:
- ✅ **Image Upload**: Direct upload from admin panel
- ✅ **Image Optimization**: Automatic resizing and compression
- ✅ **Organized Storage**: Images stored in `food-order` folder
- ✅ **Real-time Updates**: Changes appear instantly on customer site

## 📱 Next Steps

1. **Create Upload Preset** (follow steps above)
2. **Test Image Upload** in admin panel
3. **Add Sample Dishes** with images
4. **Verify Real-time Updates** on customer site

Your Cloudinary integration is now ready! 🚀
