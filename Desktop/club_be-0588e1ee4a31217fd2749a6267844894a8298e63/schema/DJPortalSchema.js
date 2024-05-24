const mongoose = require('mongoose'), Schema = mongoose.Schema ;
const DJPortalSchema = new mongoose.Schema({

DJId: [{ type: Schema.Types.ObjectId, ref: 'DJModal' }],

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

 
}],
  AcceptedSongs: [{
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
    bookingPrice: {
      type: Number,
      required: true
  
    },
    
    userMobile:{
      type: String,

    }
  }],

  DJPortalStartTimeing: {
    type: String,
    required: true,
  },
  TotalSongs :{
    type: Number,
    required: true,
  },
  price :{
    type: Number,
    required: true,
  },
  DJPortalEndTiming:{
    type: String,
  },
 
  date: {
    type: Date,
    default: Date.now,
  },


  
});


const DJPortalModal = mongoose.model('DJPortalModal', DJPortalSchema);
module.exports = DJPortalModal;
