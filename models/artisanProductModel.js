const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  category: String,
  stock: Number,
  image: String
}, { timestamps: true });

module.exports = mongoose.model('ArtisanProduct', productSchema);
