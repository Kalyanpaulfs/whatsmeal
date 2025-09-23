// Cloudinary configuration
export const CLOUDINARY_CONFIG = {
  cloudName: 'djvyx2kt5', // Your Cloudinary cloud name from the console
  uploadPreset: 'restaurant-menu', // Upload preset for restaurant menu
  apiKey: '253e12fc07563c7ef008f62ff13b76', // Your API key from the console
};

// Cloudinary upload function
export const uploadImageToCloudinary = async (file: File): Promise<{
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}> => {
  try {
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // Try with upload preset first
    if (CLOUDINARY_CONFIG.uploadPreset) {
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    }
    
    // Add folder for organization
    formData.append('folder', 'food-order');
    
    // Note: Transformations should be set in the upload preset, not here
    // for unsigned uploads

    console.log('Uploading to Cloudinary with preset:', CLOUDINARY_CONFIG.uploadPreset);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    console.log('Cloudinary response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary error response:', errorText);
      
      // If preset fails, try without preset
      if (CLOUDINARY_CONFIG.uploadPreset && response.status === 400) {
        console.log('Trying upload without preset...');
        return await uploadImageToCloudinaryWithoutPreset(file);
      }
      
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Cloudinary upload success:', data);
    
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
};

// Fallback upload function without preset
const uploadImageToCloudinaryWithoutPreset = async (file: File): Promise<{
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'food-order');

    console.log('Uploading to Cloudinary without preset...');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Cloudinary upload success (no preset):', data);
    
    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error (no preset):', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
};

// Delete image from Cloudinary
export const deleteImageFromCloudinary = async (publicId: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
    formData.append('api_key', CLOUDINARY_CONFIG.apiKey);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message || 'Delete failed',
    };
  }
};

// Get optimized image URL with transformations
export const getOptimizedImageUrl = (
  publicId: string,
  width: number = 400,
  height: number = 300,
  quality: string = 'auto'
): string => {
  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/w_${width},h_${height},c_fill,q_${quality},f_auto/${publicId}`;
};
