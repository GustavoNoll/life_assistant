const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
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
