const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  clubName: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  clubAccountNumber: {
    type: Number,
    required: true,
  },
  clubAccountIFSC: {
    type: String,
    required: true,
  },
 clubEmail:{
    type: String,
    required: true,
  },
  clubMobile:{
    type: String,
    required: true,

  },
  clubImage :{
    type: String,
  },
  clubUPIID :{
    type: String,
    // required: true
  },
    password:{
      type: String,
      required: true
    },
   isVerified:{
    type: Boolean,
    default:false
  },

  clubId:{
    type: Number,
    // unique: true,
  },
  djId: {
    type: [String],
},

totalEarnings:{
type:Number,
default:0
},

  date: {
    type: Date,
    default: Date.now,
  },
  
  

});


const clubModal = mongoose.model('clubModal', clubSchema);
module.exports = clubModal;
