const Bank = require('../models/bank');
const Transaction = require('../models/transaction');
//transaction
exports.createTransaction = (req, res, next) => {
  const name = req.body.name;
  const value = req.body.value;
  const income = req.body.income;
  const kind = req.body.kind;
  const user  = req.body.userId;
  const bank = req.body.bankId;
  const scheduledDate = req.body.scheduledDate;
  const transaction = new Transaction({
    name: name,
    value: value,
    income: income,
    kind: kind,
    userId: user,
    bankId: bank,
    scheduledDate: scheduledDate,
  });
  transaction
  .save()
  .then(transactionSaved => {
    res.status(201).json({
      status: 200,
      message: 'Transaction created successfully!',
      transaction: transactionSaved
    });
  })
  .catch(err => res.status(500).json({err}));
}

exports.deleteTransaction = (req, res, next) => {
  try {
    const transactionId = req.body.transaction_id;

    // Encontre e remova a transação por ID
    Transaction.findOne({_id: transactionId})
    .then((transaction) => {
      if (!transaction) {
        return res.status(404).json({ mensagem: 'Transação não encontrada' });
      }
      transaction.deleteOne().then(
        () => {res.status(200).json({ mensagem: 'Transação removida com sucesso', transaction: transaction });}
      )
    })
  } catch (error) {
    console.error('Erro ao remover transação:', error);
    res.status(500).json({ mensagem: 'Erro interno do servidor' });
  }
};


exports.createBank = (req, res, next) => {
  const name = req.body.name;
  const balance = req.body.balance;
  const user = req.body.userId;
  const bank = new Bank({
    name: name,
    balance: balance,
    userId: user,
  });
  bank
  .save()
  .then(bankSaved => {
    res.status(201).json({
      message: 'Bank created successfully!',
      bank: bankSaved
    });
  })
  .catch(err => res.status(500).json({err}));
}


// gets
exports.getBank = (req, res, next) => {
  const bankId = req.body.bankId;
  Bank.findById(bankId).then((bank) => {
    res.status(201).json({
      message: 'Bank finded',
      bank: bank
    });
  })
  .catch((err) => {
    res.status(500).json({
      message: err,
      bank: null
    });
  });
}

