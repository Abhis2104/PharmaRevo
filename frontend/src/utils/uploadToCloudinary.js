/**
 * Upload image to Cloudinary using unsigned upload preset
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - Returns the secure_url of uploaded image
 */
export const uploadToCloudinary = async (file) => {
  const CLOUD_NAME = 'dxgusi42e'; // Replace with your Cloudinary cloud name
  const UPLOAD_PRESET = 'pharmarevo_medicines'; // Replace with your unsigned upload preset
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};