const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Cloudinary Credentials Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer ke sath Cloudinary connect karna
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'smit-hackathon-products', // Cloudinary par is naam ka folder banega
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Sirf pictures allow hain
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
