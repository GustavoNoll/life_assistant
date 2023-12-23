const mongoose = require('mongoose');// import mongoose
// extract the schema from that mongoose object
const Schema = mongoose.Schema;
// create a new post schema
const shipmentSchema = new Schema({
  shipmentNumber: {
    type: String,
    required: true,
    unique: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  }
});

shipmentSchema.pre('save', async function (next) {
  try {
    this.shipmentNumber = this.shipmentNumber.toUpperCase();
    // Continue com a operação de salvamento da transação
    next();
  } catch (error) {
    next(error);
  }
});
shipmentSchema.statics.url = "http://websro.correios.com.br/sro_bin/txect01$.QueryList?P_ITEMCODE=&P_LINGUA=001&P_TESTE=&P_TIPO=001&P_COD_UNI="
// export the model
module.exports = mongoose.model('Shipment', shipmentSchema);