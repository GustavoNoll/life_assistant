// Função para validar se uma string é alfanumérica
function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}

const mongoose = require('mongoose');
// Função para validar se uma string é um ObjectId válido
function isValidObjectId(str) {
  return mongoose.Types.ObjectId.isValid(str);
}

// Função para validar o formato de shipment_number
function validateShipmentNumber(shipmentNumber) {
  if (!shipmentNumber || !isAlphanumeric(shipmentNumber)) {
    throw new Error('Invalid shipment_number format.');
  }
}

// Função para validar o formato de userId
function validateUserId(userId) {
  if (!userId || !isValidObjectId(userId)) {
    throw new Error('Invalid user ID format.');
  }
}


module.exports = {
  isAlphanumeric,
  isValidObjectId,
  validateShipmentNumber,
  validateUserId,
};