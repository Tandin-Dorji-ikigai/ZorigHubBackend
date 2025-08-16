const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);
router.get('/wallet/:walletAddress', UserController.getUserByWalletAddress);
router.get('/cid/:CID', UserController.getUserByCID);
// router.get('/role/artisans', UserController.getArtisans);
// router.get('/role/buyers', UserController.getBuyers);
// router.get('/role/admins', UserController.getAdmins);

// router.put('/:id/photo', UserController.uploadUserPhoto, UserController.updateUserPhoto);

module.exports = router;

