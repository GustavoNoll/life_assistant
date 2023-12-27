const Bank = require('../models/bank');
const Transaction = require('../models/transaction');
const User = require('../models/user');
const mongoose = require('mongoose')
const { validateUserId } = require('../validations/user_validation');
//transaction
exports.createTransaction = async (req, res, next) => {
  try {
    const name = req.body.name;
    const value = req.body.value;
    const income = req.body.income;
    const kind = req.body.kind;
    const externalId = req.body.userId;
    const bank = req.body.bankId;
    const isParcel = req.body.isParcel || false;
    const totalParcels = req.body.currentParcel || 1;
    const [year, month, day] = req.body.scheduledDate.split('-');
    const currentDateTime = new Date()
    const scheduledDate = new Date(year, month - 1, day, currentDateTime.getHours(), currentDateTime.getMinutes());
    const isPaid = req.body.isPaid || false;

    const user = await User.findOne({ externalId: externalId });
    // Se for uma transação parcelada, criar várias transações
    if (isParcel) {
      const parcelId = new mongoose.Types.ObjectId();
      const timestamp = new Date();

      for (let currentParcel = 1; currentParcel <= totalParcels; currentParcel++) {
        const monthOffset = scheduledDate.getMonth() + currentParcel - 1;
        const scheduledDateForParcel = new Date(scheduledDate);
        scheduledDateForParcel.setMonth(monthOffset, scheduledDate.getDate());
        const transaction = new Transaction({
          name: name,
          value: value / totalParcels,
          income: income,
          kind: kind,
          userId: user._id,
          bankId: bank,
          isParcel: true,
          currentParcel: currentParcel,
          parcelId: parcelId,
          timestamp: timestamp,
          scheduledDate: scheduledDateForParcel,
          isPaid: currentParcel == 1 ? isPaid : false,
        });

        await transaction.save();
      }

      res.status(201).json({
        status: 'success',
        message: 'Transaction parcels created successfully!',
      });
    } else {
      // Se não for uma transação parcelada, criar uma única transação
      const transaction = new Transaction({
        name: name,
        value: value,
        income: income,
        kind: kind,
        userId: user._id,
        bankId: bank,
        timestamp: new Date(),
        scheduledDate: scheduledDate,
        isPaid: isPaid,
      });
      await transaction.save();

      res.status(201).json({
        status: 'success',
        message: 'Transaction created successfully!',
      });
    }
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ status: 'error', message: err.message });
  }
};

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


// Adicione esta função ao seu código
exports.confirmPay = (req, res, next) => {
  try {
    const transactionId = req.body.transactionId;

    // Encontre a transação por ID
    Transaction.findById(transactionId)
      .then((transaction) => {
        if (!transaction) {
          return res.status(404).json({ status: 'error', message: 'Transação não encontrada' });
        }

        // Defina isPaid como true
        transaction.isPaid = true;
        
        transaction.save().then(() => {
          res.status(200).json({
            status: 'success',
            message: 'Pagamento confirmado com sucesso',
          });
        });
      })
      .catch((error) => {
        res.status(500).json({ status: 'error', message: error.message });
      });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

