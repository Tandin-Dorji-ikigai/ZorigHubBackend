const express = require('express');
const router = express.Router();
const metadataController = require('../controllers/metadataController');

// GET all metadata
router.get('/', metadataController.getAllMetadata);

// GET metadata by ID
router.get('/:id', metadataController.getMetadataById);

// POST create new metadata
router.post('/', metadataController.createMetadata);

// PUT update metadata by ID
router.put('/:id', metadataController.updateMetadata);

// DELETE metadata by ID
router.delete('/:id', metadataController.deleteMetadata);

module.exports = router;
