const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const metadataSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    category: { type: String },
    artisanName: { type: String },
    artisanId: { type: Schema.Types.ObjectId, ref: 'Artisan' }
}, { timestamps: true });

module.exports = mongoose.model('Metadata', metadataSchema);