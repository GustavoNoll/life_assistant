const Bank = require('../models/bank');
const Transaction = require('../models/transaction');

exports.getUserExpensesMonthly = (req, res, next) => {
  const date = req.query.date;
  const userId = req.query.userId;
  const month = req.query.month;
  const year = req.query.year;
  const limit = req.query.limit || 50;
  let parsedDate = new Date();
  if (date){
    parsedDate = new Date(date)
  }
  
  Transaction.searchByMonthYear(userId, month || (parsedDate.getMonth() + 1),
    year || parsedDate.getFullYear())
    .then((transactions) => {
      res.status(201).json({
        status: 'success',
        message: 'Despesas no mes ' + (String(parsedDate.getMonth() + 1)) + '/'+ String(parsedDate.getFullYear()),
        transactions: transactions.slice(0,limit)
      });
    })
    .catch((error) => {
      console.error('Erro ao buscar transações:', error);
    });
}

exports.getUserIncomesMonthly = (req, res, next) => {
  const date = req.query.date;
  const userId = req.query.userId;
  const month = req.query.month;
  const year = req.query.year;
  const limit = req.query.limit || 50;
  let parsedDate = new Date();
  if (date){
    parsedDate = new Date(date)
  }
  Transaction.searchByMonthYear(userId, month || (parsedDate.getMonth() + 1),
    year || parsedDate.getFullYear(), true)
    .then((transactions) => {
      res.status(201).json({
        status: 'success',
        message: 'Receitas no mes ' + (String(parsedDate.getMonth() + 1)) + '/'+ String(parsedDate.getFullYear()),
        transactions: transactions.slice(0, limit)
      });
    })
    .catch((error) => {
      console.error('Erro ao buscar transações:', error);
    });
}

exports.getUserWithdraw = (req, res, next) => {
  const date = req.query.date;
  const userId = req.query.userId;
  const month = req.query.month;
  const year = req.query.year;

  let parsedDate = new Date();
  if (date){
    parsedDate = new Date(date)
  }
  Transaction.withdrawByMonthYear(userId, month || (parsedDate.getMonth() + 1),
    year || parsedDate.getFullYear())
  .then((data) => {
    data["message"] = "Balanço em " + (String(month || (parsedDate.getMonth() + 1))) + '/'+ String(year || parsedDate.getFullYear())
    data["status"] = 'success'
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
      status: 'success',
      message: 'Users banks finded',
      banks: banks
    });
  })
  .catch((err) => {
    res.status(500).json({
      status: 'error',
      message: err,
      banks: null
    });
  });

}