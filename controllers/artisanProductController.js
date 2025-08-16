const Product = require('../models/artisanProductModel');

exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = new Product(productData);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const { id } = req.params;

    console.log("🛠️ Updating product with ID:", id);

    const product = await Product.findById(id);
    if (!product) {
      console.log("❌ No product found for that ID.");
      return res.status(404).json({ error: 'Product not found' });
    }

    product.name = name;
    product.price = price;
    product.description = description;

    await product.save();

    console.log("✅ Product updated:", product);
    res.json(product);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: 'Server error during update' });
  }
};


// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.sendStatus(204); // No Content
  } catch (error) {
    console.error("❌ Delete error:", error);
    res.status(500).json({ error: "Server error during delete" });
  }
};

