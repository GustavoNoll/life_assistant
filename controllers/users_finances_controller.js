const Bank = require('../models/bank');
const Transaction = require('../models/transaction');

exports.getUserExpensesMonthly = (req, res, next) => {
  const date = req.query.date;
  const userId = req.query.userId;
  let parsedDate = new Date();
  if (date){
    parsedDate = new Date(date)
  }
  Transaction.searchByMonthYear(userId, parsedDate.getMonth() + 1, parsedDate.getFullYear())
    .then((transactions) => {
      res.status(201).json({
        message: 'Despesas no mes ' + (String(parsedDate.getMonth() + 1)) + '/'+ String(parsedDate.getFullYear()),
        transactions: transactions
      });
    })
    .catch((error) => {
      console.error('Erro ao buscar transações:', error);
    });
}

exports.getUserIncomesMonthly = (req, res, next) => {
  const date = req.query.date;
  const userId = req.query.userId;
  let parsedDate = new Date();
  if (date){
    parsedDate = new Date(date)
  }
  Transaction.searchByMonthYear(userId, parsedDate.getMonth() + 1, parsedDate.getFullYear(), true)
    .then((transactions) => {
      res.status(201).json({
        message: 'Receitas no mes ' + (String(parsedDate.getMonth() + 1)) + '/'+ String(parsedDate.getFullYear()),
        transactions: transactions
      });
    })
    .catch((error) => {
      console.error('Erro ao buscar transações:', error);
    });
}

exports.getUserWithdraw = (req, res, next) => {
  const date = req.query.date;
  const userId = req.query.userId;
  let parsedDate = new Date();
  if (date){
    parsedDate = new Date(date)
  }
  Transaction.withdrawByMonthYear(userId, parsedDate.getMonth() + 1, parsedDate.getFullYear())
  .then((data) => {
    data["message"] = "Balanço em " + (String(parsedDate.getMonth() + 1)) + '/'+ String(parsedDate.getFullYear())
    res.status(201).json(data);
  })
  .catch((error) => {
    console.error('Erro ao buscar transações:', error);
  });
}
exports.getAllUserBanks = (req, res, next) => {
  const userId = req.query.userId;
  Bank.find({userId: userId}).then((banks) => {
    res.status(201).json({
      message: 'Users banks finded',
      banks: banks
    });
  })
  .catch((err) => {
    res.status(500).json({
      message: err,
      banks: null
    });
  });

}