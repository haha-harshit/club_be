const mongoose = require('mongoose');

const feedSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
 userMobile:{
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },

});


const feedModal = mongoose.model('feedModal', feedSchema);
module.exports = feedModal;
