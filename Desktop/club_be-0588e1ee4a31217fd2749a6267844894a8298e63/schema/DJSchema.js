const mongoose = require('mongoose');

const DJSchema = new mongoose.Schema({
  DjName: {
    type: String,
    required: true,
  },
  ClubID: {
    type: String,
    required: true,
  },
  DjNumber: {
    type: String,
    required: true,
  },
  Djpassword: {
    type: String,
    required: true,
  },
 DJEmail:{
    type: String,
  },
  statusLive:{
    type:Boolean,
    default : false
  },
  portalCloseTime:{
   type : String
  },
  date: {
    type: Date,
    default: Date.now,
  },
});


const DJModal = mongoose.model('DJModal', DJSchema);
module.exports = DJModal;
