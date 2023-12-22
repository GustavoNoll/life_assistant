const express = require('express');
const financesController = require('../controllers/finances_controller');
const userFinanceController = require('../controllers/users_finances_controller');
const router = express.Router();

router.post('/transactions', financesController.createTransaction);
router.delete('/transactions', financesController.deleteTransaction);



router.post('/banks', financesController.createBank)
router.get('/banks', financesController.getBank)

router.get('/user_banks', userFinanceController.getAllUserBanks)
router.get('/user_expenses', userFinanceController.getUserExpensesMonthly)
router.get('/user_incomes', userFinanceController.getUserIncomesMonthly)
router.get('/user_withdraw', userFinanceController.getUserWithdraw)
module.exports = router;