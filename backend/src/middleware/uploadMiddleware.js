import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

// Configure multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 1024 // 1MB
    }
});

// Middleware for handling upload errors
export const handleUpload = (req, res, next) => {
    const uploadSingle = upload.single('profilePic');

    uploadSingle(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    ok: false,
                    error: 'File size is too large. Maximum size is 1MB'
                });
            }
            return res.status(400).json({
                ok: false,
                error: err.message
            });
        } else if (err) {
            return res.status(400).json({
                ok: false,
                error: err.message
            });
        }
        next();
    });
}; 