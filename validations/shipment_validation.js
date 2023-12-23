// Função para validar se uma string é alfanumérica
function isAlphanumeric(str) {
  return /^[a-zA-Z0-9]+$/.test(str);
}
// Função para validar o formato de shipmentNumber
exports.validateShipmentNumber = (shipmentNumber) => {
  if (!shipmentNumber || !isAlphanumeric(shipmentNumber)) {
    throw new Error('Invalid shipmentNumber format.');
  }
}