const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const BidService = require('../services/bidService');
const NotificationService = require('../services/notificationService');

const router = express.Router();

// Place a bid
router.post('/', authenticateToken, [
  body('auctionId').isUUID(),
  body('amount').isFloat({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { auctionId, amount } = req.body;
    const bidData = await BidService.placeBid(auctionId, req.user.id, amount);

    // Send real-time notifications
    const io = req.app.get('io');
    await NotificationService.sendBidNotification(io, auctionId, bidData);

    res.status(201).json(bidData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get auction bids
router.get('/auction/:auctionId', async (req, res) => {
  try {
    const bids = await BidService.getAuctionBids(req.params.auctionId);
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current highest bid
router.get('/auction/:auctionId/highest', async (req, res) => {
  try {
    const highestBid = await BidService.getCurrentHighestBid(req.params.auctionId);
    res.json(highestBid);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;