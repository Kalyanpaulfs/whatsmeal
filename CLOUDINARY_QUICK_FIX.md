# ☁️ Cloudinary Quick Fix

## ❌ Current Error
```
Transformation parameter is not allowed when using unsigned upload. Only upload_preset, callback, public_id, folder, asset_folder, tags, context, metadata, face_coordinates, custom_coordinates, source, filename_override, manifest_transformation, manifest_json, template, template_vars, regions, public_id_prefix upload parameters are allowed., Upload preset must be specified when using unsigned upload
```

## ✅ Quick Fix

### Option 1: Create Upload Preset (Recommended)
1. Go to [Cloudinary Console](https://console.cloudinary.com)
2. Go to **Settings** → **Upload**
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: `restaurant-menu`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `food-order`
   - **Transformations**: `w_800,h_600,c_fill,q_auto,f_auto`
5. Click **Save**

### Option 2: Test Without Image (Temporary)
The app will now work without images if upload fails. You can:
1. **Add dishes without images** for now
2. **Fix Cloudinary later** when you have time
3. **Images will show as "No Image"** placeholder

## 🎯 What This Fixes
- ✅ Removes transformation parameters from upload
- ✅ Uses proper unsigned upload format
- ✅ Allows dishes to be created even if image upload fails
- ✅ Shows "No Image" placeholder for dishes without images

## 🧪 Test Now
1. **Refresh your browser** (Ctrl+F5)
2. **Try adding a dish** (with or without image)
3. **Check console** for success messages

The admin panel should work now! 🚀
