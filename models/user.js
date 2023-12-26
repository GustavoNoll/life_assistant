const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  externalId : {
    type: String,
    required: true
  },
  shipments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Shipment'
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
