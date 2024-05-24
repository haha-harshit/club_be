const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  mobileNumber: {
    type: String,
    required: true,
  },

  MUID: {
    type: String,
    required: true,
  },

  transactionId: {
    type: String,
    required: true,
  },

  djId: {
    type: mongoose.Schema.Types.ObjectId, // Change the type to ObjectId
    ref: 'DJModal', // Reference the djModal model
    required: true,
  },

  SongReqList: [
    {
      songname: {
        type: String,
        required: true,
      },
      songlink: {
        type: String,
      },
      optionalurl: {
        type: String,
      },
      announcement: {
        type: String,
      },
      bookingPrice: {
        type: Number,
        required: true,
      },

      userMobile: {
        type: String,
        required: true,
      },
    },
  ],
  DJPortalStartTimeing: {
    type: String,
  },
  paymentstatus: {
    type: Boolean,
    default: false,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const paymentModal = mongoose.model('paymentModal', paymentSchema);
module.exports = paymentModal;
