// controllers/transactionController.js
const Bank = require('../models/bank');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const { validateUserId } = require('../validations/user_validation');


exports.getUserTransactions = async (req, res, next) => {
  const externalId = req.query.userId;
  const limit = req.query.limit || 50;

  try {
    await validateUserId(externalId);
    const user = await User.findOne({ externalId: externalId });

    const transactions = await Transaction.userTransactions(user._id,limit);
    res.status(201).json({
      status: 'success',
      message: `Transações`,
      transactions: transactions,
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserExpensesMonthly = async (req, res, next) => {
  const externalId = req.query.userId;
  const month = req.query.month;
  const year = req.query.year;
  const limit = req.query.limit || 50;

  try {
    await validateUserId(externalId);
    const user = await User.findOne({ externalId: externalId });

    const parsedDate = new Date();
    const transactions = await Transaction.searchByMonthYear(user._id, month || (parsedDate.getMonth() + 1), year || parsedDate.getFullYear());
    
    res.status(201).json({
      status: 'success',
      message: `Despesas no mês ${String(parsedDate.getMonth() + 1)}/${String(parsedDate.getFullYear())}`,
      transactions: transactions.slice(0, limit),
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserIncomesMonthly = async (req, res, next) => {
  const externalId = req.query.userId;
  const month = req.query.month;
  const year = req.query.year;
  const limit = req.query.limit || 50;

  try {
    await validateUserId(externalId);
    const user = await User.findOne({ externalId: externalId });
    const parsedDate = new Date();
    const transactions = await Transaction.searchByMonthYear(user._id, month || (parsedDate.getMonth() + 1), year || parsedDate.getFullYear(), true);
    
    res.status(201).json({
      status: 'success',
      message: `Receitas no mês ${String(parsedDate.getMonth() + 1)}/${String(parsedDate.getFullYear())}`,
      transactions: transactions.slice(0, limit),
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserWithdraw = async (req, res, next) => {
  const externalId = req.query.userId;
  const month = req.query.month;
  const year = req.query.year;

  try {
    await validateUserId(externalId);
    const user = await User.findOne({ externalId: externalId });
    const parsedDate = new Date();
    const data = await Transaction.withdrawByMonthYear(user._id, month || (parsedDate.getMonth() + 1), year || parsedDate.getFullYear());

    data.message = `Balanço em ${String(month || (parsedDate.getMonth() + 1))}/${String(year || parsedDate.getFullYear())}`;
    data.status = 'success';

    res.status(201).json(data);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUserBanks = async (req, res, next) => {
  const externalId = req.query.userId;

  try {
    await validateUserId(externalId);
    const user = await User.findOne({ externalId: externalId });
    const banks = await Bank.find({ userId: user._id });

    res.status(201).json({
      status: 'success',
      message: 'Bancos do usuário encontrados',
      banks: banks,
    });
  } catch (error) {
    console.error('Erro ao buscar bancos do usuário:', error);
    res.status(500).json({ error: error.message });
  }
};
