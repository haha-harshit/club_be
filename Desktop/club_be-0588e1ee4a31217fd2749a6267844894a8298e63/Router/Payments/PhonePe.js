const crypto = require('crypto');
const axios = require('axios');
const dotenv = require('dotenv');
const paymentModal = require('../../schema/PaymentSchema');
const DJPortalModal = require('../../schema/DJPortalSchema');
const userModal = require('../../schema/UserSchema');
const { v4: uuidv4 } = require('uuid'); //Importing uuidv4 for generating unique identifiers
const paymentWaitingModal = require('../../schema/PaymentWaitingSchema');

// Load environment variables from .env file
dotenv.config();
const salt_key = process.env.SALT_KEY;
const merchant_id = process.env.MERCHANT_ID;
const newPayment = async (req, res) => {
  try {
    const merchantTransactionId = req.body.transactionId;
    const data = {
      merchantId: 'PGTESTPAYUAT',
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.body.MUID,
      name: req.body.name,
      amount: req.body.amount * 100,
      redirectUrl: `https://club-be.onrender.com/pay/status/${merchantTransactionId}`,
      redirectMode: 'POST',
      mobileNumber: req.body.number,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString('base64');
    const keyIndex = 1;
    const string =
      payloadMain + '/pg/v1/pay' + '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;

    const prod_URL = 'https://api.phonepe.com/apis/hermes/pg/v1/pay';
    const fake_url =
      'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';
    const options = {
      method: 'POST',
      url: fake_url,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    axios
      .request(options)
      .then(function (response) {
        // console.log(response.data)
        // console.log(response.data.data.instrumentResponse.redirectInfo.url);
        res.json({
          redirectTo: response.data.data.instrumentResponse.redirectInfo.url,
        });

        // res.redirect(response.data.data.instrumentResponse.redirectInfo.url)
      })
      .catch(function (error) {
        console.error(error);
      });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

// const checkStatus = async(req, res) => {
//     const merchantTransactionId = req.params['txnId'] ;
//     const merchantId = "PGTESTPAYUAT"
//     const keyIndex = 1;
//     const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
//     const sha256 = crypto.createHash('sha256').update(string).digest('hex');
//     const checksum = sha256 + "###" + keyIndex;
//    const options = {
//     method: 'GET',
//     url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
//     headers: {
//     accept: 'application/json',
//     'Content-Type': 'application/json',
//     'X-VERIFY': checksum,
//     'X-MERCHANT-ID': `${merchantId}`
//     }
//     };
//    // CHECK PAYMENT STATUS
//     axios.request(options).then(async(response) => {

//     if (response.data.success === true) {
//         const existingPayment = await paymentModal.findOne({ transactionId: merchantTransactionId, paymentstatus: true });

//         if (existingPayment) {
//             return res.redirect('https://clubnights.fun/recent-transactions');

//             // Payment has already been processed, no need to repeat the process
//             // return res.status(200).json({ message: 'Payment already processed', success: true });
//         }

//     try {
//         const updatedPayment = await paymentModal.findOneAndUpdate(
//           { transactionId: merchantTransactionId },
//           { $set: { paymentstatus: true } },
//           { new: true }
//         );

//         if (!updatedPayment) {
//           return res.status(404).json({ message: 'Payment not found', success: false });
//         }

//         const lastDJ = await DJPortalModal
//         .findOne({ DJId: updatedPayment.djId })
//         .sort({ date: -1 });

//       if (!lastDJ) {
//         return res.status(404).json({ error: 'DJ not found' });
//       }

// lastDJ.AcceptedSongs.push({
//     songname: updatedPayment.SongReqList[0].songname,
//     announcement: updatedPayment.SongReqList[0].announcement,
//     songlink: updatedPayment.SongReqList[0].songlink,
//     optionalurl: updatedPayment.SongReqList[0].optionalurl,
//     bookingPrice: updatedPayment.SongReqList[0].bookingPrice,
//     userMobile: updatedPayment.SongReqList[0].userMobile,
//   });

//       // Save the updated DJ document
//       const updatedDJ = await lastDJ.save();

//     // Find the user by mobile number
//     const user = await userModal.findOne({ userMobile : updatedPayment.SongReqList[0].userMobile });

//     if (!user) {
//     //   return res.status(404).json({ error: 'User not found' });
//       return res.redirect('https://clubnights.fun/recent-transactions');

//     }

//     // Add the amount to totalPayments
//     user.totalPayments += updatedPayment.SongReqList[0].bookingPrice;

//     // Save the updated user
//     await user.save();
//     //   return res.status(200).json({ message: 'Payment Success & Song Accepted' });
//       return res.redirect('https://clubnights.fun/recent-transactions');

//       } catch (error) {
//         res.status(500).json({ error: error.message, success: false });
//       }

//     }
//      else {

//     return res.status(400).send({success: false, message:"Payment Failure"});
//     }
//     })
//     .catch((err) => {
//     console.error(err);
//     res.status(500).send({msg: err.message});
//     });
//    };

const checkStatus = async (req, res) => {
  try {
    const merchantTransactionId = req.params['txnId'];
    const merchantId = 'PGTESTPAYUAT';
    const keyIndex = 1;
    const string =
      `/pg/v1/status/${merchantId}/${merchantTransactionId}` +
      '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;

    const options = {
      method: 'GET',
      url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': `${merchantId}`,
      },
    };

    // Check payment status
    const response = await axios.request(options);

    if (response.data.success === true) {
      // Check if payment already processed
      const existingPayment = await paymentWaitingModal
        .findOne({
          'SongReqList.transactionId': merchantTransactionId,
        })
        .sort({ date: -1 });
      const filterExist = existingPayment.SongReqList.filter(
        (item) => item.transactionId === merchantTransactionId
      );

      if (filterExist[0].paymentWaitingstatus === true) {
        // console.log(filterExist);
        console.log('Exist pay');
        return res.redirect('https://club-be.onrender.com/recent-transactions');
      }
      // Update payment status and sort by date descending
      const updatedPayment = await paymentWaitingModal
        .findOneAndUpdate(
          { 'SongReqList.transactionId': merchantTransactionId },
          { $set: { 'SongReqList.$.paymentWaitingstatus': true } },
          { new: true }
        )
        .sort({ date: -1 });
      const getDetails = await paymentWaitingModal
        .findOne({ 'SongReqList.transactionId': merchantTransactionId })
        .sort({ date: -1 });
      const filteredSongReqList = getDetails.SongReqList.filter(
        (item) => item.transactionId === merchantTransactionId
      );

      //    console.log(filteredSongReqList);
      console.log(filteredSongReqList[0].djId);
      if (!updatedPayment) {
        console.log('not found pay');

        return res
          .status(404)
          .json({ message: 'Payment not found', success: false });
      }

      // Find the last DJ
      const lastDJ = await DJPortalModal.findOne({
        DJId: filteredSongReqList[0].djId,
      }).sort({ date: -1 });

      if (!lastDJ) {
        return res.status(404).json({ error: 'DJ not found' });
      }

      // Check if the same song link with the same mobile number already exists
      const existingSong = lastDJ.AcceptedSongs.find(
        (song) =>
          song.songlink === filteredSongReqList[0].songlink &&
          song.userMobile === filteredSongReqList[0].userMobile
      );

      if (existingSong) {
        // If the same song link with the same mobile number already exists, do not save to the database
        console.log(existingSong, 'ext');
        return res.redirect(
          `https://club-be.onrender.com/confirmed-list/${filteredSongReqList[0].djId}`
        );
      }

      // Push accepted song to AcceptedSongs array
      lastDJ.AcceptedSongs.push({
        songname: filteredSongReqList[0].songname,
        announcement: filteredSongReqList[0].announcement,
        songlink: filteredSongReqList[0].songlink,
        optionalurl: filteredSongReqList[0].optionalurl,
        bookingPrice: filteredSongReqList[0].bookingPrice,
        userMobile: filteredSongReqList[0].userMobile,
      });

      // Save the updated DJ document
      await lastDJ.save();

      // Find the user by mobile number
      const user = await userModal.findOne({
        userMobile: filteredSongReqList[0].userMobile,
      });

      if (!user) {
        console.log('no user ');

        return res.redirect('https://club-be.onrender.com/recent-transactions');
      }

      // Add the amount to totalPayments
      user.totalPayments += filteredSongReqList[0].bookingPrice;

      // Save the updated user
      await user.save();
      console.log('done pay');

      return res.redirect(
        `https://club-be.onrender.com/confirmed-list/${filteredSongReqList[0].djId}`
      );
    } else {
      return res.redirect(`https://club-be.onrender.com/failed`);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message, success: false });
  }
};

// const checkStatus = async (req, res) => {
//     try {
//         const merchantTransactionId = req.params['txnId'];
//         const merchantId = "PGTESTPAYUAT";
//         const keyIndex = 1;
//         const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
//         const sha256 = crypto.createHash('sha256').update(string).digest('hex');
//         const checksum = sha256 + "###" + keyIndex;

//         const options = {
//             method: 'GET',
//             url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
//             headers: {
//                 accept: 'application/json',
//                 'Content-Type': 'application/json',
//                 'X-VERIFY': checksum,
//                 'X-MERCHANT-ID': `${merchantId}`
//             }
//         };

//         // Check payment status
//         const response = await axios.request(options);

//         if (response.data.success === true) {
//             // Check if payment already processed
//             const existingPayment = await paymentWaitingModal.findOne({
//                 'SongReqList.transactionId': merchantTransactionId,
//                 'SongReqList.paymentWaitingstatus': true
//             }).sort({date : -1});

//             if (existingPayment) {
//                 console.log("Exist pay");
//                 return res.redirect('https://clubnights.fun/recent-transactions');
//             }

//             // Update payment status and sort by date descending
//             const updatedPayment = await paymentWaitingModal.findOneAndUpdate(
//                 {'SongReqList.transactionId': merchantTransactionId },
//                 { $set: { 'SongReqList.$.paymentWaitingstatus': true } },
//                 { new: true }
//             ).sort({date: -1});

//             console.log(updatedPayment);
//             if (!updatedPayment) {
//                 console.log("not found pay");
//                 return res.status(404).json({ message: 'Payment not found', success: false });
//             }

//             // Find the last DJ
//             const lastDJ = await DJPortalModal.findOne({ DJId: updatedPayment.djId }).sort({ date: -1 });

//             if (!lastDJ) {
//                 return res.status(404).json({ error: 'DJ not found' });
//             }

//             // Iterate through each song in the updated payment
//             for (const song of updatedPayment.SongReqList) {
//                 // Check if the same song link with the same mobile number already exists
//                 const existingSong = lastDJ.AcceptedSongs.find(existingSong =>
//                     existingSong.songlink === song.songlink &&
//                     existingSong.userMobile === song.userMobile &&
//                     existingSong.transactionId === song.transactionId
//                 );

//                 if (existingSong) {
//                     // If the same song link with the same mobile number already exists, redirect
//                     console.log(existingSong, "ext");
//                     return res.redirect(`https://clubnights.fun/confirmed-list/${updatedPayment.djId}`);
//                 } else {
//                     // Push accepted song to AcceptedSongs array
//                     lastDJ.AcceptedSongs.push({
//                         songname: song.songname,
//                         announcement: song.announcement,
//                         songlink: song.songlink,
//                         optionalurl: song.optionalurl,
//                         bookingPrice: song.bookingPrice,
//                         userMobile: song.userMobile,
//                     });
//                 }
//             }

//             // Save the updated DJ document
//             await lastDJ.save();

//             // Find the user by mobile number
//             const user = await userModal.findOne({ userMobile: updatedPayment.SongReqList[0].userMobile });

//             if (!user) {
//                 console.log("no user ");
//                 return res.redirect('https://clubnights.fun/recent-transactions');
//             }

//             // Add the amount to totalPayments
//             user.totalPayments += updatedPayment.SongReqList[0].bookingPrice;

//             // Save the updated user
//             await user.save();
//             console.log("done pay");

//             return res.redirect(`https://clubnights.fun/confirmed-list/${updatedPayment.djId}`);
//         } else {
//             return res.redirect(`https://clubnights.fun/failed`);
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ error: error.message, success: false });
//     }
// };

module.exports = {
  newPayment,
  checkStatus,
};
