const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// single
router.post('/ipfs', uploadController.upload.single('file'), uploadController.pinToIPFS);

// batch (<= 4 images)
router.post('/ipfs/batch', uploadController.uploadMany.array('files', 4), uploadController.pinToIPFSMany);

module.exports = router;
