const express = require('express');
const cors = require('cors');
const http = require('http');
const PORT = process.env.PORT || 5000;
require('./db/db');
require('dotenv').config();

const clubRouter = require('./Router/Club/club'); // Assuming these are Express routers
const adminRouter = require('./Router/Admin/Admin');
const djRouter = require('./Router/DJ/DJ');
const djPortal = require('./Router/DJ/DJPortal');
const otpRouter = require('./Router/Otp/Otp');
const paymentRouter = require('./Router/Payments/PaymentRouter');
const userRouter = require('./Router/User/User');
const waitPayRouter = require('./Router/Payments/PaymentWaiting');
const clubPay = require('./Router/Payments/ClubPay');
const feedRouter = require('./Router/Admin/Feed');

let app = express();
app.use(express.json());
app.use(cors());

// Middleware to set CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Mount the routers
app.use('/club', clubRouter);
app.use('/admin', adminRouter);
app.use('/otpservices', adminRouter);
app.use('/dj', djRouter);
app.use('/djportal', djPortal);
app.use('/otp', otpRouter);
app.use('/pay', paymentRouter);
app.use('/user', userRouter);
app.use('/waitpay', waitPayRouter);

//our db payment routers
app.use('/clubpay', clubPay);
app.use('/feed', feedRouter);

app.get('/', (req, res) => {
  res.send('Hello to ClubNights_DEVS');
});

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`App listening at ${PORT}`);
});
