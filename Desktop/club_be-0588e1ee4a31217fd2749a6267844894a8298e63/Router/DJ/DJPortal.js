const express = require('express');
const DJPortalModal = require('../../schema/DJPortalSchema');
const axios = require('axios');
const DJModal = require('../../schema/DJSchema');
const router = express.Router();

// POST endpoint to create a new DJ portal entry
router.post('/start', async (req, res) => {
  try {
    const { DJId, DJPortalStartTimeing, TotalSongs, price, DJPortalEndTiming } =
      req.body;
    await axios
      .put(`http://localhost:5000/dj/updateStatus/${DJId}`, {
        statusLive: true,
      })
      .then(async (resp) => {
        if (resp) {
          // Create a new DJPortalModal instance
          const newDJPortal = new DJPortalModal({
            DJId,
            DJPortalStartTimeing,
            TotalSongs,
            price,
            DJPortalEndTiming,
          });

          // Save the new DJ portal entry to the database
          const savedDJPortal = await newDJPortal.save();

          res.status(201).json(savedDJPortal);
        } else {
          res.status(500).json({ message: 'Status not live Server Error' });
        }
      })
      .catch((err) => {
        res.status(500).json({ message: 'Internal Server Error' });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update DJ status to live
//     const resp = await axios.put(`http://localhost:5000/dj/updateStatus/${DJId}`, { statusLive: true });

//     if (resp.status !== 200) {
//       return res.status(500).json({ message: 'Failed to update DJ status to live' });
//     }

//     // Create a new DJPortalModal instance
//     const newDJPortal = new DJPortalModal({
//       DJId,
//       DJPortalStartTimeing,
//       TotalSongs,
//       price,
//       DJPortalEndTiming,
//     });

//     const savedDJPortal = await newDJPortal.save();

//     const dj = await DJModal.findByIdAndUpdate(DJId, { $set: { statusLive: true } }, { new: true });

//     if (!dj) {
//       console.log(DJId, DJPortalStartTimeing, TotalSongs, price, DJPortalEndTiming);
//       return res.status(404).json({ msg: 'DJ not found' });
//     }

//     res.status(201).json(savedDJPortal);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// Route to get all DJPortalModals
router.get('/getall', async (req, res) => {
  try {
    const djPortals = await DJPortalModal.find();
    res.json(djPortals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get a specific DJPortalModal by ID
router.get('/getone/:id', async (req, res) => {
  try {
    const djPortal = await DJPortalModal.findById(req.params.id);
    if (!djPortal) {
      return res.status(404).json({ message: 'DJPortalModal not found' });
    }
    res.json(djPortal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to save AcceptedSongs
router.post('/saveAcceptedSongs/:djId', async (req, res) => {
  const { djId } = req.params;
  const { acceptedSongs } = req.body;

  try {
    const djPortal = await DJPortalModal.findOne({ DJId: djId }).sort({
      date: -1,
    });

    if (!djPortal) {
      return res.status(404).json({ error: 'DJ Portal not found' });
    }

    djPortal.AcceptedSongs.push(...acceptedSongs);
    await djPortal.save();

    return res
      .status(200)
      .json({ message: 'AcceptedSongs saved successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET route to fetch the latest accepted songs by DJ ID
router.get('/final-accepted-songs/:djId', async (req, res) => {
  try {
    const djId = req.params.djId;
    const latestPortal = await DJPortalModal.findOne({ DJId: djId }).sort({
      date: -1,
    });

    if (!latestPortal) {
      return res.status(404).json({ message: 'DJ portal not found' });
    }

    res.status(200).json({ acceptedSongs: latestPortal.AcceptedSongs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// API endpoint to find the last saved collection by DJId and return AcceptedSongs by userMobile
router.get('/accepted-songs/:DJId/:userMobile', async (req, res) => {
  try {
    const { DJId, userMobile } = req.params;
    const djPortal = await DJPortalModal.findOne({ DJId }).sort({ date: -1 });

    if (!djPortal) {
      return res
        .status(404)
        .json({ message: 'No DJ Portal found for the provided DJId' });
    }

    const acceptedSongs = djPortal.AcceptedSongs.filter(
      (song) => song.userMobile === userMobile
    );
    res.json(acceptedSongs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Route to save SongReqList
router.post('/saveselectedsongs/:djId', async (req, res) => {
  const { djId } = req.params;
  const { SongReqList } = req.body;

  try {
    const djPortal = await DJPortalModal.findOne({ DJId: djId }).sort({
      date: -1,
    });

    if (!djPortal) {
      return res.status(404).json({ error: 'DJ Portal not found' });
    }

    djPortal.SongReqList.push(...SongReqList);
    djPortal.updateBookingPrice();
    await djPortal.save();

    return res
      .status(200)
      .json({ message: 'Selected Songs saved successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define the route to get the latest SongReqList by DJId
router.get('/latestSongReqList/:djId', async (req, res) => {
  try {
    const { djId } = req.params;
    const latestDJPortal = await DJPortalModal.findOne({ DJId: djId }).sort({
      date: -1,
    });

    if (!latestDJPortal) {
      return res
        .status(404)
        .json({ message: 'No DJ Portal found for the specified DJId' });
    }

    const latestSongReqList = latestDJPortal.SongReqList;
    const date = latestDJPortal.DJPortalEndTiming;
    res.json({ songs: latestSongReqList, timer: date });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Define the route to get the latest SongReqList by DJId
router.get('/getlatestportal/:djId', async (req, res) => {
  try {
    const { djId } = req.params;
    const latestDJPortal = await DJPortalModal.findOne({ DJId: djId }).sort({
      date: -1,
    });

    if (!latestDJPortal) {
      return res
        .status(404)
        .json({ message: 'No DJ Portal found for the specified DJId' });
    }

    res.json({ latestPortal: latestDJPortal });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
