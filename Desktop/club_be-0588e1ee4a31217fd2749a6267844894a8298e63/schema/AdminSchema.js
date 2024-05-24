const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
  

});


const AdminModal = mongoose.model('AdminModal', AdminSchema);
module.exports = AdminModal;
