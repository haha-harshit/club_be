const mongoose = require('mongoose');

const paymentWaitingSchema = new mongoose.Schema({


SongReqList:[{
 
  songname: {
    type: String,
    required: true,

  },
  songlink: {
    type: String,
  },
  optionalurl:{
    type: String,

  },
  announcement:{
    type: String,

  },
  bookingPrice: {
    type: Number,
    required: true

  },
  
  userMobile:{
    type: String,
    required: true

  },
  
MUID:{
  type: String,
      },

      transactionId:{
  type: String,
},


djId :{
  
  type: mongoose.Schema.Types.ObjectId, // Change the type to ObjectId
      ref: 'DJModal', // Reference the djModal model
      required: true,

},


paymentWaitingstatus:{
    type: Boolean,
     default:false
},
paymentWaitingLink :{
  type: String,

}
 
}],

paymentWaitingStartTimeing:{
  type: String,

},


paymentWaitingEndTiming:{
  type: String,
},


djId :{
  
    type: mongoose.Schema.Types.ObjectId, // Change the type to ObjectId
        ref: 'DJModal', // Reference the djModal model
        required: true,
  
  },
  
  date: {
    type: Date,
    default: Date.now,
  },

});


const paymentWaitingModal = mongoose.model('paymentWaitingModal', paymentWaitingSchema);
module.exports = paymentWaitingModal;
