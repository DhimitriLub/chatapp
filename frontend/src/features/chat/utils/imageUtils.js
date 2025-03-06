import imageCompression from 'browser-image-compression';

export const compressImage = async (file) => {
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true
    };

    try {
        const compressedFile = await imageCompression(file, options);
        return await convertToBase64(compressedFile);
    } catch (error) {
        console.error("Error compressing image:", error);
        throw error;
    }
};

export const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}; 