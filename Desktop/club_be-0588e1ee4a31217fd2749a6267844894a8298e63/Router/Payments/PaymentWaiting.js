// routes/paymentWaitingRoutes.js

const express = require('express');
const paymentWaitingModal = require('../../schema/PaymentWaitingSchema');
const axios = require('axios');
const router = express.Router();

const twilio = require('twilio');
const accountSid = 'AC13b9ae29adf907af144647cd01002ee2';
const authToken = '35175b59658900cc1f25c5cffe61f73d';
const twilioClient = twilio(accountSid, authToken);

router.post('/create-payment-waiting', async (req, res) => {
  try {
    const {
      SongReqList,
      djID,
      paymentWaitingStartTimeing,
      paymentWaitingEndTiming,
    } = req.body;

    // Send immediate response with success true
    res
      .status(200)
      .json({
        success: true,
        message: 'Payment waiting entry creation initiated.',
      });

    // Perform processing asynchronously
    await processPaymentWaitingEntry(
      SongReqList,
      djID,
      paymentWaitingStartTimeing,
      paymentWaitingEndTiming
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

async function processPaymentWaitingEntry(
  SongReqList,
  djID,
  paymentWaitingStartTimeing,
  paymentWaitingEndTiming
) {
  try {
    const processedData = await Promise.all(
      SongReqList.map(async (songReq) => {
        const {
          songname,
          songlink,
          optionalurl,
          announcement,
          bookingPrice,
          userMobile,
        } = songReq;

        const MUID = 'MUID' + userMobile;
        const TUID = djID + 'TUID' + userMobile;

        const additionalDataPromise = axios.post(
          'https://club-be.onrender.com/pay/payment',
          {
            MUID: MUID,
            transactionId: TUID,
            name: 'User' + userMobile,
            amount: bookingPrice,
            mobileNumber: userMobile,
          }
        );

        const redirectURIPromise = additionalDataPromise.then(
          (response) => response.data.redirectTo
        );

        const additionalData = await additionalDataPromise;
        const redirectURI = await redirectURIPromise;

        if (!userMobile) {
          console.log('no mobile found');
          // return res.status(400).json({ error: 'Missing "to" field in the request body' });
        } else {
          try {
            const message = `Welcome to Club Nights. Kindly Pay your amount to play a song. This is the payment link ${redirectURI}`;

            // Send msg
            await twilioClient.messages.create({
              body: message,
              messagingServiceSid: 'MGc57451b1eee410a2a2ecd808321cf70b',
              to: '+91' + userMobile,
            });

            console.log({
              message: 'pay link sent successfully',
              success: true,
            });
          } catch (error) {
            console.error(`Error sending pay link to ${to}: ${error}`);
            // res.json({ error: 'Failed to send link', success: false });
          }
        }

        const finalData = {
          songname,
          songlink,
          optionalurl,
          announcement,
          bookingPrice,
          userMobile,
          MUID: MUID,
          transactionId: TUID,
          djId: djID,
          paymentWaitingLink: redirectURI,
        };

        return finalData;
      })
    );

    await paymentWaitingModal.create({
      SongReqList: processedData,
      paymentWaitingStartTimeing,
      paymentWaitingEndTiming,
      djId: djID,
    });
  } catch (error) {
    console.error('Error processing payment waiting entry:', error);
    // Handle error here, you might want to log it or handle it differently
  }
}

router.post('/saveLatestToAccepted', async (req, res) => {
  try {
    // Fetch the latest paymentWaitingData based on djId and sorted by date
    const paymentWaitingData = await paymentWaitingModal
      .findOne({ djId: req.body.djId })
      .sort({ date: -1 });

    // Fetch the latest DJPortalModal based on djId and sorted by date
    const djPortal = await DJPortalModal.findOne({ DJId: req.body.djId }).sort({
      date: -1,
    });

    // Check if both documents exist
    if (!paymentWaitingData || !djPortal) {
      return res.status(404).json({ message: 'No data found' });
    }

    // Extract accepted songs from paymentWaitingData
    const acceptedSongs = paymentWaitingData.SongReqList.filter(
      (song) => song.paymentWaitingstatus === true
    );

    // Add accepted songs to DJPortalModal
    djPortal.AcceptedSongs.push(...acceptedSongs);

    // Save to database
    const savedData = await djPortal.save();

    // Set paymentWaitingstatus to false for accepted songs in paymentWaitingModal
    paymentWaitingData.SongReqList.forEach((song) => {
      if (song.paymentWaitingstatus === true) {
        song.paymentWaitingstatus = false;
      }
    });
    await paymentWaitingData.save();

    res.status(200).json(savedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/get-payment-timings/:djId', async (req, res) => {
  try {
    const { djId } = req.params;

    // Find the last document in the database based on the provided djId
    const lastPaymentData = await paymentWaitingModal
      .findOne({ djId })
      .sort({ date: -1 });

    if (!lastPaymentData) {
      return res
        .status(404)
        .json({ message: 'No payment data found for the provided DJ ID' });
    }

    // Extract paymentWaitingStartTimeing and paymentWaitingEndTiming from the last document
    const { paymentWaitingStartTimeing, paymentWaitingEndTiming } =
      lastPaymentData;

    res
      .status(200)
      .json({ paymentWaitingStartTimeing, paymentWaitingEndTiming });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API to get payment waiting details by phone number
router.get('/payment-waiting/:djId/:userMobile', async (req, res) => {
  const { djId, userMobile } = req.params;
  try {
    const userData = await paymentWaitingModal
      .findOne({
        'SongReqList.userMobile': userMobile,
        'SongReqList.djId': djId,
      })
      .sort({ date: -1 }); // Sort by date in descending order (latest first)
    if (!userData) {
      return res.status(404).json({ message: 'User data not found' });
    }
    // Extracting only relevant SongReqList for the user and dj
    const userSongReqList = userData.SongReqList.filter(
      (song) => song.userMobile === userMobile && song.djId.toString() === djId
    );
    return res.send({
      userSongReqList,
      date: userData.paymentWaitingEndTiming,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/songs/:userMobile', async (req, res) => {
  const { userMobile } = req.params;

  try {
    // Aggregation pipeline to filter and project only the matched songs
    const matchedSongs = await paymentWaitingModal.aggregate([
      // Match documents where any song in SongReqList has the provided userMobile
      {
        $match: {
          'SongReqList.userMobile': userMobile,
        },
      },
      // Unwind SongReqList array to flatten the structure
      { $unwind: '$SongReqList' },
      // Match the specific song with the provided userMobile
      {
        $match: {
          'SongReqList.userMobile': userMobile,
        },
      },
      // Project to include only the matched song
      {
        $project: {
          _id: 0, // Exclude _id field
          SongReqList: 1, // Include only the SongReqList
        },
      },
    ]);

    return res.send({ matchedSongs });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/payfind/:txind', async (req, res) => {
  const { txind } = req.params;

  try {
    // Find documents in the paymentWaitingModal collection with the provided userMobile
    const existingPayment = await paymentWaitingModal
      .findOne({
        'SongReqList.transactionId': txind,
        'SongReqList.paymentWaitingstatus': false,
      })
      .sort({ date: -1 });

    res.json(existingPayment);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
