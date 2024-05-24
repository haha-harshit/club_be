const express = require('express');
const AdminModal = require('../../schema/AdminSchema');
const clubModal = require('../../schema/ClubOwnerSchema');
const router = express.Router();
const jwt = require('jsonwebtoken')
// Endpoint to handle the creation of a new admin
router.post('/admins', async (req, res) => {
  try {
    // Assuming the request body contains the username and password
    const { username, password } = req.body;

    // Create a new admin instance
    const newAdmin = new AdminModal({
      username,
      password,
    });

    // Save the new admin to the database
    const savedAdmin = await newAdmin.save();

    res.status(201).json(savedAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user exists
    const user = await AdminModal.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const pass = await AdminModal.findOne({username});
    

    if (pass.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If credentials are valid, create and send a token
    const token = jwt.sign({ userId: user._id }, 'yourSecretKey', { expiresIn: '1h' }); // Replace 'yourSecretKey' with a secret key for JWT

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/updateVerification/:clubId', async (req, res) => {
  try {
    // Check if the request is coming from an authorized admin
    const { username, password } = req.body;
    const admin = await AdminModal.findOne({ username, password });

    if (!admin) {
      return res.json({ message: 'Unauthorized access' });
    }

    // Assuming that the clubId is passed as a parameter in the route
    const clubId = req.params.clubId;

    // Find the club by clubId
    const club = await clubModal.findById(clubId);

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if the generated clubId already exists
    let newClubId;
    do {
      newClubId = Math.floor(10000000 + Math.random() * 90000000);
    } while (await clubModal.exists({ clubId: newClubId }));

    // Update the verification status
    club.isVerified = true;

    // Assign the new unique clubId
    club.clubId = newClubId;

    // Save the updated club information
    await club.save();

    res.status(200).json({ message: 'Club verification updated successfully', club });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
