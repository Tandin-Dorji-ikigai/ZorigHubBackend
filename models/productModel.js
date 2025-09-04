const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Artisan', required: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    soldCount: { type: Number, default: 0 },
    stockQuantity: Number,
    featured: { type: Boolean, default: false },
    images: [String],
    createdAt: { type: Date, default: Date.now },

    image: { type: String, required: true }
});

module.exports = mongoose.model('Product', productSchema);