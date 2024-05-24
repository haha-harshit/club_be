const express = require('express');
const DJModal = require('../../schema/DJSchema');
const router = express.Router();
const schedule = require('node-schedule');
// Route to get all DJ entries
router.get('/djs', async (req, res) => {
  try {
    const allDJs = await DJModal.find();
    res.json(allDJs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// DELETE DJ by DjNumber
router.delete('/deletedj/:djNumber', async (req, res) => {
  const djNumber = req.params.djNumber;

  try {
    // Find the DJ by DjNumber
    const djToDelete = await DJModal.findOne({ DjNumber: djNumber });

    if (!djToDelete) {
      return res.status(404).json({ message: 'DJ not found' });
    }

    // Delete the DJ
    await djToDelete.deleteOne(); // or djToDelete.remove();

    return res.json({ message: 'DJ deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route for DJ login
router.post('/login', async (req, res) => {
  const { DjNumber, Djpassword } = req.body;

  try {
    // Find DJ by DjNumber
    const dj = await DJModal.findOne({ DjNumber });
    // If DJ is not found
    if (!dj) {
      return res.json({ error: 'DJ not found', success: false });
    }

    // Check if the  is password correct
    if (dj.Djpassword !== Djpassword) {
      return res.json({ error: 'Invalid password', success: false });
    }

    // Set the DJ as live
    await dj.save();

    // You may want to send only specific information back to the client
    const { _id, DjName, DJEmail, statusLive, date } = dj;

    // Respond with the DJ information
    res.json({
      success: true,
      _id,
      DjName,
      DJEmail,
      statusLive,
      date,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route to get DJ data by ClubID
router.get('/getdjbyclub/:clubId', async (req, res) => {
  try {
    const clubId = req.params.clubId;

    // Find DJs by ClubID
    const djs = await DJModal.find({ ClubID: clubId });

    if (!djs || djs.length === 0) {
      return res
        .status(404)
        .json({ message: 'No DJs found for the given ClubID' });
    }

    res.status(200).json(djs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update statusLive
router.put('/updateStatus/:id', async (req, res) => {
  const { id } = req.params;
  const { statusLive } = req.body;

  try {
    const dj = await DJModal.findByIdAndUpdate(
      id,
      { $set: { statusLive } },
      { new: true }
    );

    if (!dj) {
      return res.status(404).json({ msg: 'DJ not found' });
    }

    return res.json(dj);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

router.get('/checkDJModalStatus/:clubId', async (req, res) => {
  try {
    const clubId = req.params.clubId;

    // Check if any DJModal is open for the specified ClubID
    const isOpen = await DJModal.exists({ ClubID: clubId, statusLive: true });

    res.json({ isOpen });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;
