import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImage = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: 'chat_app_avatars',
            width: 500,
            height: 500,
            crop: 'fill',
            quality: 'auto'
        });
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading to cloudinary:', error);
        throw new Error('Error uploading image');
    }
}; 