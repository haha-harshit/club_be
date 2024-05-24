const express = require('express');
const router = express.Router();
const PaymentModal = require('../../schema/PaymentSchema'); // Update the path accordingly
const DJPortalModal = require('../../schema/DJPortalSchema');
const DJModal = require('../../schema/DJSchema');
const clubModal = require('../../schema/ClubOwnerSchema');
const userModal = require('../../schema/UserSchema');

// API to create a payment
router.post('/createPayment', async (req, res) => {
  try {
    const existingPayment = await PaymentModal.findOne({ transactionId: req.body.transactionId });

    if (existingPayment) {
      return res.json({ message: 'Duplicate transaction ID', success: false });
    }


    // const DJPortalStartTimeing = await DJPortalModal.findById(req.body.djId).sort({date : -1})

    const payment = new PaymentModal(req.body);
    await payment.save();

    res.status(201).json({ message: 'Payment created successfully', success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// API to get all payments
router.get('/getAllPayments', async (req, res) => {
  try {
    const payments = await PaymentModal.find();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to get payment details by payment ID
router.get('/getPaymentById/:paymentId', async (req, res) => {
  try {
    const payment = await PaymentModal.findById(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to update payment details by payment ID
router.put('/updatePayment/:paymentId', async (req, res) => {
  try {
    const updatedPayment = await PaymentModal.findByIdAndUpdate(
      req.params.paymentId,
      req.body,
      { new: true }
    );
    if (!updatedPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json({ message: 'Payment updated successfully', payment: updatedPayment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API to delete payment by payment ID
router.delete('/deletePayment/:paymentId', async (req, res) => {
  try {
    const deletedPayment = await PaymentModal.findByIdAndDelete(req.params.paymentId);
    if (!deletedPayment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json({ message: 'Payment deleted successfully', payment: deletedPayment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add more APIs based on your requirements
router.put('/updatePaymentStatusByTransactionId/:transactionId', async (req, res) => {
  try {
    const updatedPayment = await PaymentModal.findOneAndUpdate(
      { transactionId: req.params.transactionId },
      { $set: { paymentstatus: true } },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: 'Payment not found', success: false });
    }

    res.status(200).json({ message: 'Payment status updated successfully', success: true });
  } catch (error) {
    res.status(500).json({ error: error.message, success: false });
  }
});
// Route to get total payment
router.get('/gethomescreendata', async (req, res) => {
  try {
    // Find all payments with paymentstatus true
    const payments = await PaymentModal.find({ paymentstatus: true });

    // Calculate total payment
    const totalPayment = payments.reduce((total, payment) => total + payment.SongReqList.reduce((acc, song) => acc + song.bookingPrice, 0), 0);
    const totalDJs = await DJModal.countDocuments();
    const totalClubs = await clubModal.countDocuments();
    const totalUsers = await userModal.countDocuments(); 
    res.json({ totalPayment,totalClubs,totalUsers,totalDJs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define a route to get all payments by userMobile
router.get('/paymentsbyuser/:userMobile', async (req, res) => {
  try {
    const userMobile = req.params.userMobile;

    // Use Mongoose to find payments based on userMobile
    const payments = await PaymentModal.find({ 'SongReqList.userMobile': userMobile });

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: 'No payments found for the given userMobile' });
    }

    // Return the payments as JSON response
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
module.exports = router;
