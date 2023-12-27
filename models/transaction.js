const mongoose = require('mongoose');// import mongoose
// extract the schema from that mongoose object
const Schema = mongoose.Schema;
// create a new post schema
const transactionSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true
  },
  income: {
    type: Boolean,
    required: true
  },
  kind: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now()
  },
  bankId: {
    type: Schema.Types.ObjectId,
    ref: 'Bank',
    required: true
  },
  isParcel: {
    type: Boolean,
    default: false,
  },
  currentParcel: {
    type: Number,
    default: 1,
  },
  parcelId: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction',
  },
  scheduledDate: {
    type: Date,
    default: new Date(),
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
});

transactionSchema.pre('save', async function (next) {
  try {
    const currentDate = new Date();
    const Bank = require('../models/bank'); // Certifique-se de ajustar o caminho conforme necessário

    // Recuperar o banco associado à transação
    const bank = await Bank.findById(this.bankId);

    // Verificar se o banco existe
    if (bank && this.isPaid) {
      // Atualizar o saldo com base no tipo de transação (income ou expense)
      if (this.income) {
        bank.balance += this.value;
      }else{
        bank.balance -= this.value;
      }

      // Salvar as alterações no banco
      await bank.save();
    }
    

    // Continue com a operação de salvamento da transação
    next();
  } catch (error) {
    next(error);
  }
});

transactionSchema.pre('deleteOne', { document: true,query: false }, async function (next) {
  try {
    const Bank = require('../models/bank');
    const banco = await Bank.findById(this.bankId);
    if (banco && this.isPaid) {
      if (this.income) {
        banco.balance -= this.value;
      } else {
        banco.balance += this.value;
      }

      await banco.save();
    }

    next();
  } catch (error) {
    next(error);
  }
});

transactionSchema.statics.searchByMonthYear = async function (user_id, month, year, income = false) {
  try {
    const firstDay = new Date(year, month - 1, 1); // Mês é baseado em zero no JavaScript
    const lastDay = new Date(year, month, 0, 23, 59, 59); // Último dia do mês

    const transactions = await this.find({
      userId: user_id,
      scheduledDate: { $gte: firstDay, $lte: lastDay },
      income: income
    }).sort({ timestamp: -1 });
    return transactions;
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
};

transactionSchema.statics.userTransactions = async function (user_id, month, year) {
  try {
    let firstDay, lastDay
    if (month && year) {
      firstDay = new Date(year , (month - 1), 1);
      lastDay = new Date(year , (month), 0, 23, 59, 59);
    }else {
      const currentDate = new Date();
      firstDay = new Date(currentDate.getFullYear() , currentDate.getMonth(), 1);
      lastDay = new Date(currentDate.getFullYear() , (currentDate.getMonth() + 1), 0, 23, 59, 59);
    }
  
    const transactions = await this.find({
      userId: user_id,
      scheduledDate: { $gte: firstDay, $lte: lastDay },
    }).sort({ timestamp: -1 });

    const formattedTransactions = transactions.map(transaction => {
      const scheduledDate = transaction.scheduledDate
      console.log(scheduledDate);
      const formattedTimestamp = scheduledDate.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      return {
        ...transaction._doc,
        scheduledDate: formattedTimestamp,
      };
    });

    return formattedTransactions;
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
};

transactionSchema.statics.withdrawByMonthYear = async function (user_id, month, year) {
  try {
    const firstDay = new Date(year, month - 1, 1); // Mês é baseado em zero no JavaScript
    const lastDay = new Date(year, month, 0, 23, 59, 59); // Último dia do mês

    const incomes = await this.find({
      userId: user_id,
      scheduledDate: { $gte: firstDay, $lte: lastDay },
      income: true,
      isPaid: true
    });
    const expenses = await this.find({
      userId: user_id,
      scheduledDate: { $gte: firstDay, $lte: lastDay },
      income: false,
      isPaid: true
    });

    const incomesSum = incomes.reduce((sum, transaction) => {
      return sum + transaction.value;
    }, 0);

    const expensesSum = expenses.reduce((sum, transaction) => {
      return sum - transaction.value;
    }, 0);
    
    const withdraw = incomesSum + expensesSum;
    return {incomes: incomesSum, expenses: expensesSum, withdraw: withdraw} //nextincomes next expenses next withdraw
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
};

// export the model
module.exports = mongoose.model('Transaction', transactionSchema)