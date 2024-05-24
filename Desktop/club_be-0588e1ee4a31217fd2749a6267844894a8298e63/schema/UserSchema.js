const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

 userMobile:{
    type: String,
    required: true,
  },

   
  totalPayments:{
    type: Number,
    default : 0  
  },
   
  date: {
    type: Date,
    default: Date.now,
  },

});


const userModal = mongoose.model('userModal', userSchema);
module.exports = userModal;