// controllers/transactionController.js
const Bank = require('../models/bank');
const Transaction = require('../models/transaction');
const { validateUserId } = require('../validations/user_validation');


exports.getUserTransactions = async (req, res, next) => {
  const userId = req.query.userId;
  const limit = req.query.limit || 50;

  try {
    validateUserId(userId);

    const transactions = await Transaction.userTransactions(userId,limit);
    res.status(201).json({
      status: 'success',
      message: `Transações`,
      transactions: transactions,
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error });
  }
};

exports.getUserExpensesMonthly = async (req, res, next) => {
  const userId = req.query.userId;
  const month = req.query.month;
  const year = req.query.year;
  const limit = req.query.limit || 50;

  try {
    validateUserId(userId);

    const parsedDate = new Date();
    const transactions = await Transaction.searchByMonthYear(userId, month || (parsedDate.getMonth() + 1), year || parsedDate.getFullYear());
    
    res.status(201).json({
      status: 'success',
      message: `Despesas no mês ${String(parsedDate.getMonth() + 1)}/${String(parsedDate.getFullYear())}`,
      transactions: transactions.slice(0, limit),
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error });
  }
};

exports.getUserIncomesMonthly = async (req, res, next) => {
  const userId = req.query.userId;
  const month = req.query.month;
  const year = req.query.year;
  const limit = req.query.limit || 50;

  try {
    validateUserId(userId);

    const parsedDate = new Date();
    const transactions = await Transaction.searchByMonthYear(userId, month || (parsedDate.getMonth() + 1), year || parsedDate.getFullYear(), true);
    
    res.status(201).json({
      status: 'success',
      message: `Receitas no mês ${String(parsedDate.getMonth() + 1)}/${String(parsedDate.getFullYear())}`,
      transactions: transactions.slice(0, limit),
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error });
  }
};

exports.getUserWithdraw = async (req, res, next) => {
  const userId = req.query.userId;
  const month = req.query.month;
  const year = req.query.year;

  try {
    validateUserId(userId);

    const parsedDate = new Date();
    const data = await Transaction.withdrawByMonthYear(userId, month || (parsedDate.getMonth() + 1), year || parsedDate.getFullYear());

    data.message = `Balanço em ${String(month || (parsedDate.getMonth() + 1))}/${String(year || parsedDate.getFullYear())}`;
    data.status = 'success';

    res.status(201).json(data);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error });
  }
};

exports.getAllUserBanks = async (req, res, next) => {
  const userId = req.query.userId;

  try {
    validateUserId(userId);

    const banks = await Bank.find({ userId: userId });

    res.status(201).json({
      status: 'success',
      message: 'Bancos do usuário encontrados',
      banks: banks,
    });
  } catch (error) {
    console.error('Erro ao buscar bancos do usuário:', error);
    res.status(500).json({ error });
  }
};
