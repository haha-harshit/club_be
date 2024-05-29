const express = require('express');
const { checkStatus, newPayment } = require('./PhonePe');

const router = express();

router.post('/payment', newPayment);
router.post('/status/:txnId', checkStatus);

module.exports = router;
