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
  scheduledDate: {
    type: Date
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
});

transactionSchema.pre('save', async function (next) {
  try {
    const currentDate = new Date();
    // Se a transação não está agendada, atualize o saldo do banco
    if (!this.scheduledDate || this.scheduledDate <= currentDate) {
      const Bank = require('../models/bank'); // Certifique-se de ajustar o caminho conforme necessário

      // Recuperar o banco associado à transação
      const bank = await Bank.findById(this.bankId);

      // Verificar se o banco existe
      if (bank) {
        // Atualizar o saldo com base no tipo de transação (income ou expense)
        if (this.income) {
          bank.balance += this.value;
        }else{
          bank.balance -= this.value;
        }

        // Salvar as alterações no banco
        await bank.save();
      }
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
    if (banco) {
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
      timestamp: { $gte: firstDay, $lte: lastDay },
      income: income
    });
    const helper = require('../helpers/transaction_helper');
    return helper.groupByKind(transactions);
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
      timestamp: { $gte: firstDay, $lte: lastDay },
      income: true
    });
    const expenses = await this.find({
      userId: user_id,
      timestamp: { $gte: firstDay, $lte: lastDay },
      income: false
    });

    const incomesSum = incomes.reduce((sum, transaction) => {
      return sum + transaction.value;
    }, 0);

    const expensesSum = expenses.reduce((sum, transaction) => {
      return sum - transaction.value;
    }, 0);
    
    const withdraw = incomesSum + expensesSum;
    return {incomes: incomesSum, expenses: expensesSum, withdraw: withdraw}
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    throw error;
  }
};

// export the model
module.exports = mongoose.model('Transaction', transactionSchema)