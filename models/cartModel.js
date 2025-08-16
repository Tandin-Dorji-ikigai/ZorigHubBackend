const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    items: [
        {
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, default: 1, min: 1 },
            price: { type: Number, required: true }
        }
    ]
});

cartSchema.methods.addItem = function (productId, quantity, price) {
    const existingItem = this.items.find(item => item.productId.equals(productId));
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        this.items.push({ productId, quantity, price });
    }
    return this.save();
};


module.exports = mongoose.model('Cart', cartSchema);