export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

export async function compressImage(file) {
    try {
        // Convert the file to base64
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

        // Create an image element
        const img = new Image();
        await new Promise((resolve) => {
            img.onload = resolve;
            img.src = base64;
        });

        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions (max 800px width/height while maintaining aspect ratio)
        let width = img.width;
        let height = img.height;
        const maxSize = 800;

        if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
        } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with reduced quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

        return compressedBase64;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
}