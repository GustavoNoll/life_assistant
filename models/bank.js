const mongoose = require('mongoose');// import mongoose
// extract the schema from that mongoose object
const Schema = mongoose.Schema;
// create a new post schema
const bankSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
});
// export the model
module.exports = mongoose.model('Bank', bankSchema)