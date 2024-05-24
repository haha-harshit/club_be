
const express = require('express');
const router = express.Router();
const ClubModal = require('../../schema/ClubOwnerSchema');
const DJModal = require('../../schema/DJSchema');


router.post('/addclubs', async (req, res) => {
    try {
      const { clubMobile, clubEmail } = req.body;
  
      // Check if clubMobile or clubEmail already exist
      const existingClubMobile = await ClubModal.findOne({ clubMobile });
      const existingClubEmail = await ClubModal.findOne({ clubEmail });
  
      if (existingClubMobile || existingClubEmail) {
        // Club with the provided mobile or email already exists
        return res.json({ error: 'Club with the provided mobile or email already exists',success:false });
      }
  
      // Create a new club if no existing club with the provided mobile or email
      const newClub = await ClubModal.create(req.body);
      res.status(201).json({newClub,success:true});
    } catch (error) {
      console.log(error);
      res.status(400).json({ error: error.message,success:null });
    }
  });
// Get all clubs
router.get('/getclubs', async (req, res) => {
  try {
    const clubs = await ClubModal.find();
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific club by ID
router.get('/getoneclubs/:id', async (req, res) => {
  try {
    const club = await ClubModal.findById(req.params.id);
    if (club) {
      res.json(club);
    } else {
      res.status(404).json({ message: 'Club not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a club by ID
router.put('/updclubs/:id', async (req, res) => {
  try {
    const updatedClub = await ClubModal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedClub) {
      res.json(updatedClub);
    } else {
      res.status(404).json({ message: 'Club not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a club by ID
router.delete('/delclubs/:id', async (req, res) => {
  try {
    const deletedClub = await ClubModal.findByIdAndDelete(req.params.id);
    if (deletedClub) {
      res.json({ message: 'Club deleted successfully' });
    } else {
      res.status(404).json({ message: 'Club not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify or Unverify a Club by ID
// Verify or Unverify a Club by ID
router.put('/verify/:id', async (req, res) => {
  const { id } = req.params;
  const { isVerified } = req.body;

  try {
    // Find the club by ID
    let club = await ClubModal.findById(id);

    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    // Check if clubId is not present in the request body
    if (club.clubId === undefined) {
      // Create a new clubId if clubId is not provided
      club.clubId = Date.now().toString().slice(0, 5) + club.clubMobile.toString().slice(5, 10);
    }

    // Update the verification status and optionally update other fields if needed
    club.set({
      isVerified
      // Add other fields here if needed
    });

    await club.save();

    res.status(200).json(club);
  } catch (error) {
    console.error('Error verifying/unverifying club:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update Club Verification status by Club ID
router.put('/updateVerification/:clubId', async (req, res) => {
  try {
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




// Route to check if a club is verified by its ID
router.get('/check-verification/:clubEmail', async (req, res) => {
    const { clubEmail } = req.params;
  
    try {
      // Find the club by ID
      const club = await ClubModal.findOne({clubEmail});
  
      // Check if the club exists
      if (!club) {
        return res.json({ message: 'Club not found' });
      }
  
         res.json({ isVerified : club.isVerified,clubId:club._id});
     
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
// Login route
router.post('/login', async (req, res) => {
    const { clubIdOrEmail, password } = req.body;
  
    try {
      // Check if the input is an email or clubId
      const isEmail = clubIdOrEmail.includes('@');
      let query;
  
      if (isEmail) {
        query = { clubEmail: clubIdOrEmail };
      } else {
        query = { clubId: clubIdOrEmail };
      }
  
      // Find the club in the database
      const club = await ClubModal.findOne(query);
  
      // Check if the club exists and if the password is correct
      if (club && club.password === password) {
        // Check if the club is verified
     console.log(club.isVerified);
        if (club.isVerified=== false) {
          return res.json({ message: 'Club is not verified' ,success:false});
        }
        else
        return res.status(200).json({ message: 'Login successful',club,success:true });
      } else {
        return res.json({ message: 'Invalid credentials' ,success:false});
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });


  // Create a route to add a DJ to the club
router.post('/adddjbyclub', async (req, res) => {
    try {
      // Extract data from the request body
      const { DjName, ClubID, DjNumber, Djpassword, clubEmail } = req.body;
  
      // Create a new DJ instance
      const newDj = new DJModal({
        DjName,
        ClubID,
        DjNumber,
        Djpassword,
        clubEmail,
      });
  
      // Save the DJ to the database
      await newDj.save();
  
      // Respond with success and a message
      res.json({ success: true, message: 'DJ added successfully' });
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });

  // Define a route to fetch all data by ClubID
  router.get('/djData/:clubId', async (req, res) => {
  const clubId = req.params.clubId;

  try {
    // Find all DJs with the specified ClubID0
    const DJs = await DJModal.find({ ClubID: clubId });

    // Check if any DJs were found
    if (DJs.length === 0) {
      return res.json({ message: 'No DJs found for the provided ClubID',success:false });
    }

    // Return the found DJs
    res.json({alldj:DJs , success:true});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// DELETE route to delete a DJ by ID
router.delete('deleteDj/:clubId/:id', async (req, res) => {
  try {
    const djId = req.params.id;
    const clubId = req.params.clubId;
    // Check if the DJ with the given ID exists
    const existingDJ = await DJModal.findById(djId);
    if (!existingDJ) {
      return res.json({ error: 'DJ not found' ,success:false});
    }
       
    if(clubId == existingDJ.ClubID){
         // If the DJ exists, delete it
          await DJModal.findByIdAndDelete(djId);

         res.json({ message: 'DJ deleted successfully',success:true });
       }
       else{
        res.json({ message: 'You are not the Club Admin',success:false });

       }
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error',success:false });
  }
});

//get all dj names 
router.get('/api/getallclubs', async (req, res) => {
  try {
    // Fetch all DJs from the database
    const allClubs = await ClubModal.find({}, 'clubId _id clubName');

    // If there are no DJs, return an empty array
    if (!allClubs || allClubs.length === 0) {
      return res.status(404).json({ message: 'No Clubs found.' });
    }

    // Map the result to include only clubId, id, and djName
    const mappedDJs = allClubs.map((club) => ({
      clubId: club.clubId,
      id: club._id,
      clubName: club.clubName,
    }));

    res.status(200).json(mappedDJs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;
