// routes/googleAuth.js
const express = require('express');
const googleController = require('../controllers/google/googleController');

const router = express.Router();

router.get('/google/start', googleController.startGoogleAuth);
router.get('/google/success', googleController.googleAuthSuccess);
router.get('/google/fail', googleController.googleAuthFail);

router.get('/user', googleController.getUser);
router.get('/me', googleController.getMe);

module.exports = router;
