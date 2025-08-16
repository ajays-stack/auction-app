const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Auction, User, Bid } = require('../models');
const AuctionService = require('../services/auctionService');

const router = express.Router();

// Get all auctions (admin)
router.get('/auctions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const auctions = await Auction.findAll({
      include: [
        { model: User, as: 'seller', attributes: ['id', 'username', 'firstName', 'lastName'] },
        { model: User, as: 'winner', attributes: ['id', 'username', 'firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually start auction
router.post('/auctions/:id/start', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const auction = await AuctionService.activateAuction(req.params.id);
    res.json(auction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually end auction
router.post('/auctions/:id/end', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await AuctionService.endAuction(req.params.id);
    
    // Send notifications
    const io = req.app.get('io');
    await NotificationService.sendAuctionEndNotification(io, result);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [totalAuctions, activeAuctions, totalUsers, totalBids] = await Promise.all([
      Auction.count(),
      Auction.count({ where: { status: 'active' } }),
      User.count(),
      Bid.count()
    ]);

    res.json({
      totalAuctions,
      activeAuctions,
      totalUsers,
      totalBids
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;