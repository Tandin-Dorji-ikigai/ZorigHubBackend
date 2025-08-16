const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Artisan', required: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    soldCount: { type: Number, default: 0 }, // Number of times this product has been sold
    stockQuantity: Number,
    images: [String],
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    image: { type: String, required: true } // URL to the product's main image stored in AWS S3
});

module.exports = mongoose.model('Product', productSchema);