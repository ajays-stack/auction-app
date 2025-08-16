


// backend/src/routes/auctions.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const AuctionService = require('../services/auctionService');
const { Auction, User, Bid, CounterOffer } = require('../models');

const router = express.Router();

// Create auction
router.post('/', authenticateToken, [
  body('title').notEmpty().trim(),
  body('description').optional().trim(),
  body('startingPrice').isFloat({ min: 0 }),
  body('bidIncrement').isFloat({ min: 0.01 }),
  body('goLiveAt').isISO8601(),
  body('duration').isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const auctionData = {
      ...req.body,
      sellerId: req.user.id
    };

    const auction = await AuctionService.createAuction(auctionData);
    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all active auctions
router.get('/', async (req, res) => {
  try {
    const auctions = await AuctionService.getActiveAuctions();
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get auction by ID
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findByPk(req.params.id, {
      include: [
        { model: User, as: 'seller', attributes: ['id', 'username', 'firstName', 'lastName'] },
        { model: User, as: 'winner', attributes: ['id', 'username', 'firstName', 'lastName'] }
      ]
    });

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    res.json(auction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's auctions
router.get('/user/my-auctions', authenticateToken, async (req, res) => {
  try {
    const auctions = await AuctionService.getUserAuctions(req.user.id);
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle seller decision
router.post('/:id/seller-decision', authenticateToken, [
  body('decision').isIn(['accepted', 'rejected', 'counter_offer']),
  body('counterOffer').optional().isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { decision, counterOffer } = req.body;
    const result = await AuctionService.handleSellerDecision(
      req.params.id,
      req.user.id,
      decision,
      counterOffer
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Handle counter offer response
router.post('/counter-offers/:id/respond', authenticateToken, [
  body('response').isIn(['accepted', 'rejected']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { response } = req.body;
    const counterOffer = await CounterOffer.findOne({
      where: { id: req.params.id, buyerId: req.user.id },
      include: [{ model: Auction, as: 'auction' }]
    });

    if (!counterOffer || counterOffer.status !== 'pending') {
      return res.status(404).json({ error: 'Counter offer not found or already responded' });
    }

    await counterOffer.update({ status: response });

    if (response === 'accepted') {
      await counterOffer.auction.update({
        status: 'sold',
        finalPrice: counterOffer.counterOfferAmount
      });
    } else {
      await counterOffer.auction.update({ status: 'cancelled' });
    }

    res.json({ counterOffer, response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;