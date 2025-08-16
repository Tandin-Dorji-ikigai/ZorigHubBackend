const express = require('express');
const router = express.Router();
const authorizeRole = require('../middleware/authorizeRole');

// Assumes req.user is already populated by prior middleware
router.get('/protected/admins/index', authorizeRole(['admin']), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/protected/admins/index.html'));
});

router.get('/protected/artisans/index', authorizeRole(['artisan']), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/protected/artisans/index.html'));
});

router.get('/protected/buyers/index', authorizeRole(['buyer']), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/protected/buyers/index.html'));
});

module.exports = router;
