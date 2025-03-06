import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';


dotenv.config();


console.log('Cloudinary Config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Found' : 'Missing',
    api_key: process.env.CLOUDINARY_API_KEY ? 'Found' : 'Missing',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'Found' : 'Missing'
});

const isCloudinaryConfigured = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('Cloudinary configured successfully');
} else {
    console.warn('Cloudinary credentials not found. Image upload functionality will be disabled.');
    console.warn('Please check your .env file for CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
}

export const isEnabled = isCloudinaryConfigured;
export default cloudinary; 