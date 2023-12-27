const Bank = require('../models/bank');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const { validateUserId } = require('../validations/user_validation');
//transaction
exports.createTransaction = async (req, res, next) => {
  const name = req.body.name;
  const value = req.body.value;
  const income = req.body.income;
  const kind = req.body.kind;
  const externalId  = req.body.userId;
  const bank = req.body.bankId;
  const user = await User.findOne({ externalId: externalId });
  const transaction = new Transaction({
    name: name,
    value: value,
    income: income,
    kind: kind,
    userId: user._id,
    bankId: bank,
    timestamp: new Date()
  });
  transaction
  .save()
  .then(transactionSaved => {
    res.status(201).json({
      status: 'success',
      message: 'Transaction created successfully!',
      transaction: transactionSaved
    });
  })
  .catch(err => res.status(500).json({status: 'error', message: err.message}));
}

exports.deleteTransaction = (req, res, next) => {
  try {
    const transactionId = req.query.transactionId;
    // Encontre e remova a transação por ID
    Transaction.findById(transactionId)
    .then((transaction) => {
      if (!transaction) {
        return res.status(404).json({ mensagem: 'Transação não encontrada' });
      }
      transaction.deleteOne().then(
        () => {res.status(200).json({ 
          status: 'success',
          message: 'Transação removida com sucesso',});}
      )
    })
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};


exports.createBank = async(req, res, next) => {
  const name = req.body.name;
  const balance = req.body.balance;
  const externalId = req.body.userId;
  try {
    await validateUserId(externalId);
    const user = await User.findOne({ externalId: externalId });
    const bank = new Bank({
      name: name,
      balance: balance,
      userId: user._id,
    });
    bank
    .save()
    .then(bankSaved => {
      res.status(201).json({
        message: 'Bank created successfully!',
        bank: bankSaved,
        status: 'success',
      });
    })
    .catch(err => res.status(500).json({err}));
  }catch(error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}


// gets
exports.getBank = (req, res, next) => {
  const bankId = req.body.bankId;
  Bank.findById(bankId).then((bank) => {
    res.status(201).json({
      status: 'success',
      message: 'Bank finded',
      bank: bank
    });
  })
  .catch((err) => {
    res.status(500).json({
      status: 'error',
      message: err.menssage,
    });
  });
}

