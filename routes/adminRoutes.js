const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');

router.get('/', AdminController.getAllAdmins);
router.get('/:id', AdminController.getAdminById);
router.post('/', AdminController.createAdmin);
router.put('/:id', AdminController.updateAdmin);
router.delete('/:id', AdminController.deleteAdmin);
router.get('/wallet/:walletAddress', AdminController.getAdminByWalletAddress);
router.post('/login', AdminController.loginAdmin);
module.exports = router;