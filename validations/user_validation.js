const mongoose = require('mongoose');
const User = require('../models/user');
// Função para validar se uma string é um ObjectId válido
exports.validateUserId = async (externalId) => {
  if (!externalId) {
    throw new Error('Invalid user ID format.');
  } else {
    try {
      const user = await User.findOne({ externalId: externalId });
      if (!user) {
        throw new Error('External ID dont match.');
      }
    } catch (error) {
      throw error; // Rejeitar o erro para ser tratado externamente
    }
  }
};