const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    imageUrl: { type: String, default: "https://placeholder.com" }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
