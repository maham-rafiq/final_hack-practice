const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { protect, adminOnly } = require('../Middleware/authMiddleware');
const upload = require('../config/cloudinary'); // 🖼️ Upload Middleware Import kiya

// 1. CREATE: Product with Image (🔒 Only Admin can upload file)
// 'image' frontend ke input file ka name attribute hoga
router.post('/add', protect, adminOnly, upload.single('image'), async (req, res) => {
    try {
        const { title, price, description } = req.body;

        // Check karna ke file computer se select hui hai ya nahi
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a product image!" });
        }

        const newProduct = new Product({
            title,
            price,
            description,
            imageUrl: req.file.path // 🎯 Cloudinary se mila hua secure image link yahan save hoga
        });

        const savedProduct = await newProduct.save();
        res.status(201).json({ message: "Product with image added successfully!", savedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error adding product", error: error.message });
    }
});

// 2. READ: Fetch all products (🌍 Public)
router.get('/all', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products", error: error.message });
    }
});
// 4. UPDATE: Product details aur image ko badalne ke liye (🔒 Only Admin)
router.put('/update/:id', protect, adminOnly, upload.single('image'), async (req, res) => {
    try {
        const { title, price, description } = req.body;
        let updateData = { title, price, description };

        // Agar user ne nayi image select ki hai, toh uska naya Cloudinary path add karein
        if (req.file) {
            updateData.imageUrl = req.file.path;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true } // Taake updated data response mein wapas mile
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product updated successfully!", updatedProduct });
    } catch (error) {
        res.status(500).json({ message: "Error updating product", error: error.message });
    }
});

// 3. DELETE: Remove product (🔒 Only Admin)
router.delete('/delete/:id', protect, adminOnly, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product", error: error.message });
    }
});

module.exports = router;
