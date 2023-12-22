const express = require('express');
const userController = require('../controllers/users_controller');
const router = express.Router();

router.post('/users', userController.createUser);


module.exports = router;