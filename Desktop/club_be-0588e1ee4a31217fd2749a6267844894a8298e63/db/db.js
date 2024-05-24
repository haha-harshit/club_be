const mongoose = require('mongoose');
require('dotenv').config();

const db = process.env.DB || '';

mongoose
  .connect(db)
  .then(() => {
    console.log('Connection Success');
  })
  .catch((err) => {
    console.log('Connection Error');
  });
