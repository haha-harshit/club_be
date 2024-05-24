
const express = require('express');
const router = express.Router();

const userModal = require('../../schema/UserSchema');
const  otpModal = require('../../schema/OTPSchema')
//send otp by mobile 
const twilio = require('twilio');
const unirest = require('unirest');
const accountSid = 'AC13b9ae29adf907af144647cd01002ee2';
const authToken = '35175b59658900cc1f25c5cffe61f73d';
const twilioClient = twilio(accountSid, authToken);

// Generate a random 4-digit OTP new changes
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}
 //fast 2 sms otp sending 
 router.post('/send-otp-mobile', async (req, res) => {
  const { to } = req.body;
  if (!to) {
      return res.status(400).json({ error: 'Missing "to" field in the request body' });
  }

  try {
      // Check if the user exists in userModal
      const existingUser = await userModal.findOne({ userMobile: to.replace("+91", "") });

      // If the user does not exist, save the user to userModal
      if (!existingUser) {
          const newUser = new userModal({ userMobile: to.replace("+91", "") });
          await newUser.save();
      }

      // Generate OTP
      const otp = generateOTP();

      // Prepare the request to Fast2SMS
      var req = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");

      req.query({
          "authorization": "piRbQlw576Oxqj4s0BVytkXWNEJZm28GdeK39rATHuIChvLMfD6X2oMdYC7bnFpc5tAQm9H4KawlyIzj", // Replace YOUR_API_KEY with your actual Fast2SMS API key
          "variables_values": otp,
          "route": "otp",
          "numbers": to.replace("+91", "")
      });

      req.headers({
          "cache-control": "no-cache"
      });

      // Send OTP using Fast2SMS
      req.end(function (response) {
          if (response.error) {
              console.error(`Error sending OTP to ${to}: ${response.error}`);
              return res.status(500).json({ error: 'Failed to send OTP', success: false });
          }

          // Save OTP status to otpModal
          const saveOtpStatus = new otpModal({ otp, otpMobile: to });
          saveOtpStatus.save();

          res.json({ message: 'OTP sent successfully', success: true });
      });
  } catch (error) {
      console.error(`Error in /send-otp-mobile route: ${error}`);
      res.status(500).json({ error: 'Failed to send OTP', success: false });
  }
});


router.post('/send-payment-mobile', async (req, res) => {
  const { to,link } = req.body;

  if (!to) {
    return res.status(400).json({ error: 'Missing "to" field in the request body' });
  }

  try {
    // Check if the user exists in userModal
    const existingUser = await userModal.findOne({ userMobile:  to });
    // If the user does not exist, save the user to userModal
    if (!existingUser) {
      const newUser = new userModal({ userMobile: to });
      await newUser.save();
    }

    // Generate OTP
    const message = `Welcome to Club Nights. Kindly Pay your amount to play a song. This is the payment link ${link}`;

    // Send OTP
    await twilioClient.messages.create({
      body: message,
      messagingServiceSid: 'MGc57451b1eee410a2a2ecd808321cf70b',
      to:"+91"+ to
    });

    res.json({ message: 'pay link sent successfully', success: true });
  } catch (error) {
    console.error(`Error sending pay link to ${to}: ${error}`);
    res.json({ error: 'Failed to send link', success: false });
  }
});







// verify otp 
 
router.post('/verify-otp',async(req,res)=>{
  const {otpMobile,otp} = req.body;
  const latestData = await otpModal.findOne({ otpMobile }, {}, { sort: { date: -1 } });
      if(latestData.otp === otp){
        res.send({status : true})
      }
      else{
        res.send({status : false})

      }
})


module.exports = router;