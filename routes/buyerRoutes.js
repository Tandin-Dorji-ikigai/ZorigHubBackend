const express = require('express');
const router = express.Router();
const BuyerController = require('../controllers/buyerController');

router.get('/', BuyerController.getAllBuyers);
router.get('/:id', BuyerController.getBuyerById);
router.post('/', BuyerController.createBuyer);
router.put('/:id', BuyerController.updateBuyer);
router.delete('/:id', BuyerController.deleteBuyer);
router.get('/wallet/:walletAddress', BuyerController.getBuyerByWalletAddress);
router.get('/email/:email', BuyerController.getBuyerByEmail);
router.put('/update-wallet/:id', BuyerController.updateBuyerWallet);

module.exports = router;