// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

router.get('/', UserController.getAllUsers);
router.get('/cid/:CID', UserController.getUserByCID);        
router.patch('/cid/:CID', UserController.updateUserByCID);    

router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);                
router.patch('/:id', UserController.patchUser);         
router.delete('/:id', UserController.deleteUser);

module.exports = router;
