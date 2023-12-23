const mongoose = require('mongoose');
// Função para validar se uma string é um ObjectId válido
function isValidObjectId(str) {
  return mongoose.Types.ObjectId.isValid(str);
}
exports.validateUserId = (userId) => {
  if (!userId || !isValidObjectId(userId)) {
    throw new Error('Invalid user ID format.');
  }
};