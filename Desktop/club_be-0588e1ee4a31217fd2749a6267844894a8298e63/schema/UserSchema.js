const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  UserName: {
    type: String,
    required: true,
  },

  UserNumber: {
    type: String,
    required: true,
  },

  payments: [
    {
      transactionsId: { type: String },
      MUID: { type: String },
      songLink: { type: String },
      bookingPrice: { type: String },
      isSuccess: { type: Boolean, default: false },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
});

const UserModal = mongoose.model('UserModal', UserSchema);
module.exports = UserModal;
