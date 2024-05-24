const express = require('express');
const feedModal = require('../../schema/FeedSchema');
const router = express.Router();

// Route to get all feeds
router.get('/feeds', async (req, res) => {
  try {
    const feeds = await feedModal.find();
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to create a new feed
router.post('/feeds', async (req, res) => {
  const feed = new feedModal({
    message: req.body.message,
    userMobile: req.body.userMobile,
  });

  try {
    const newFeed = await feed.save();
    res.send({success : true});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route to get a specific feed by ID
router.get('/feeds/:id', getFeed, (req, res) => {
  res.json(res.feed);
});

// Middleware function to get feed by ID
async function getFeed(req, res, next) {
  let feed;
  try {
    feed = await feedModal.findById(req.params.id);
    if (feed == null) {
      return res.status(404).json({ message: 'Feed not found' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.feed = feed;
  next();
}

// Route to update a specific feed by ID
router.patch('/feeds/:id', getFeed, async (req, res) => {
  if (req.body.message != null) {
    res.feed.message = req.body.message;
  }
  if (req.body.userMobile != null) {
    res.feed.userMobile = req.body.userMobile;
  }
  try {
    const updatedFeed = await res.feed.save();
    res.json(updatedFeed);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route to delete a specific feed by ID
router.delete('/feeds/:id', getFeed, async (req, res) => {
  try {
    await res.feed.remove();
    res.json({ message: 'Feed deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
