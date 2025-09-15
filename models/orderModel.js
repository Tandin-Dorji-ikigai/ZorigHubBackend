const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderItemSchema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'Artisan', required: true }, // snapshot seller
    quantity: { type: Number, min: 1, required: true },
    price: { type: Number, min: 0, required: true },  // snapshot unit price
    subtotal: { type: Number, min: 0, required: true }   // price * quantity
}, { _id: false });

const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, min: 0, required: true },

    // Make transaction optional so you can attach it after payment is created
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },

    status: {
        type: String,
        enum: ['pending', 'paid', 'delivered', 'cancelled', 'failed'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
