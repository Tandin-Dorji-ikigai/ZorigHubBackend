const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'Artisan', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },

    quantity: { type: Number, default: 1, min: 1 },
    totalAmount: { type: Number, required: true, min: 0 },

    status: {
        type: String,
        enum: ['pending', 'delivered', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
