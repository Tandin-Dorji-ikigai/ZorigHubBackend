const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

router.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/signup.html"));
});
router.get("/ndi", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/ndiLogin.html"));
});


// Serve Add Product page without .html extension
router.get('/artisans/products', (req, res) => {
  res.sendFile(path.join(__dirname, '../protected/artisans/products.html'));
});
router.get('/artisans/index', (req, res) => {
  res.sendFile(path.join(__dirname, '../protected/artisans/index.html'));
});
router.get('/artisans/orders', (req, res) => {
  res.sendFile(path.join(__dirname, '../protected/artisans/orders.html'));
});
router.get('/artisans/earnings', (req, res) => {
  res.sendFile(path.join(__dirname, '../protected/artisans/earnings.html'));
});
router.get('/artisans/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../protected/artisans/profile.html'));
});


//artisan logout
router.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'))
});
module.exports = router;
