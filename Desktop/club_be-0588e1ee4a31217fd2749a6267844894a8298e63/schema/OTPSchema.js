const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
 otpMobile:{
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },

});


const otpModal = mongoose.model('otpModal', otpSchema);
module.exports = otpModal;
