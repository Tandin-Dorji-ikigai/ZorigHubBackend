// models/transactionModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const refundSchema = new Schema(
    {
        amount: { type: Number, required: true, min: 0 },
        reason: { type: String },
        note: { type: String },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const transactionSchema = new Schema(
    {
        // Parties
        buyer: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true, index: true },
        seller: { type: Schema.Types.ObjectId, ref: 'Artisan', required: true, index: true },

        // Link back to the order this transaction is for
        order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },

        // Money
        amount: { type: Number, required: true, min: 0 },        // charged/captured amount
        currency: { type: String, default: 'BTN', uppercase: true },// e.g., BTN (Ngultrum)

        // Status & lifecycle
        status: {
            type: String,
            enum: ['pending', 'authorized', 'captured', 'failed', 'refunded', 'cancelled'],
            default: 'pending',
            index: true,
        },
        authorizedAt: Date,
        capturedAt: Date,
        failedAt: Date,
        refundedAt: Date,

        // Payment rails (non-onchain)
        method: { type: String, default: 'other' },   // e.g. 'card', 'bank', 'mobile', 'cod', ...
        provider: { type: String },                     // e.g. 'Stripe', 'BankTransfer', etc.
        providerTxnId: { type: String, index: true },   // gateway reference/PSP id (NOT a txHash)

        // Optional breakdown (useful for reporting)
        breakdown: {
            subtotal: { type: Number, min: 0 },
            tax: { type: Number, min: 0 },
            shipping: { type: Number, min: 0 },
            discount: { type: Number, min: 0 },
            fees: { type: Number, min: 0 },
        },
        netAmount: { type: Number, min: 0 }, // amount minus fees/discounts etc (optional, compute if you like)

        // Idempotency (avoid duplicate charges on retries)
        idempotencyKey: { type: String, unique: true, sparse: true, index: true },

        // Refunds (partial or full)
        refunds: [refundSchema],

        // Misc
        notes: String,
        metadata: Schema.Types.Mixed, // or: Map<String, String>
    },
    { timestamps: true } // adds createdAt & updatedAt
);

// Helpful compound index for common queries
transactionSchema.index({ seller: 1, createdAt: -1 });
transactionSchema.index({ buyer: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
