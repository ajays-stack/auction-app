const { Auction, User, Bid } = require('../models');
const redis = require('../config/redis');
const { Op } = require('sequelize');

class AuctionService {
  static async createAuction(auctionData) {
    const auction = await Auction.create(auctionData);
    
    // Schedule auction to go live
    const timeUntilLive = new Date(auction.goLiveAt) - new Date();
    if (timeUntilLive > 0) {
      setTimeout(() => {
        this.activateAuction(auction.id);
      }, timeUntilLive);
    }

    // Schedule auction to end
    const timeUntilEnd = new Date(auction.endAt) - new Date();
    if (timeUntilEnd > 0) {
      setTimeout(() => {
        this.endAuction(auction.id);
      }, timeUntilEnd);
    }

    return auction;
  }

  static async activateAuction(auctionId) {
    await Auction.update(
      { status: 'active' },
      { where: { id: auctionId } }
    );

    // Initialize Redis cache
    const auction = await Auction.findByPk(auctionId);
    if (auction) {
      await redis.setex(`auction:${auctionId}:highest_bid`, 3600, auction.startingPrice);
      await redis.setex(`auction:${auctionId}:status`, 3600, 'active');
    }

    return auction;
  }

  static async endAuction(auctionId) {
    const auction = await Auction.findByPk(auctionId, {
      include: [
        { model: User, as: 'seller' },
        { model: Bid, as: 'bids', include: [{ model: User, as: 'bidder' }] }
      ]
    });

    if (!auction) return;

    // Get highest bid
    const highestBid = await Bid.findOne({
      where: { auctionId, isWinning: true },
      include: [{ model: User, as: 'bidder' }],
      order: [['amount', 'DESC']]
    });

    // Only end the auction if it's currently active
    if (auction.status === 'active') {
      await auction.update({
        status: 'ended',
        winnerId: highestBid ? highestBid.bidderId : null,
        finalPrice: highestBid ? highestBid.amount : null,
        sellerDecision: 'pending'  // Reset seller decision when auction ends
      });
    }

    // Clean up Redis
    await redis.del(`auction:${auctionId}:highest_bid`);
    await redis.del(`auction:${auctionId}:highest_bidder`);
    await redis.del(`auction:${auctionId}:status`);

    return { auction, highestBid };
  }

  static async getActiveAuctions() {
    return await Auction.findAll({
      where: {
        status: 'active',
        endAt: { [Op.gt]: new Date() }
      },
      include: [
        { model: User, as: 'seller', attributes: ['id', 'username', 'firstName', 'lastName'] }
      ],
      order: [['goLiveAt', 'ASC']]
    });
  }

  static async getUserAuctions(userId) {
    return await Auction.findAll({
      where: { sellerId: userId },
      include: [
        { model: User, as: 'winner', attributes: ['id', 'username', 'firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  static async handleSellerDecision(auctionId, sellerId, decision, counterOfferData = null) {
    const auction = await Auction.findOne({
      where: { id: auctionId, sellerId },
      include: [
        { model: User, as: 'winner', attributes: ['id', 'email', 'firstName', 'lastName'] }
      ]
    });

    if (!auction) {
      throw new Error('Auction not found');
    }

    if (auction.status !== 'ended') {
      throw new Error('Can only make decisions on ended auctions');
    }

    if (auction.sellerDecision !== 'pending') {
      throw new Error('A decision has already been made for this auction');
    }

    if (decision === 'accepted') {
      await auction.update({
        sellerDecision: 'accepted',
        status: 'sold'
      });
      return { auction, action: 'accepted' };
    }

    if (decision === 'rejected') {
      await auction.update({
        sellerDecision: 'rejected',
        status: 'cancelled'
      });
      
      // Send rejection email to the winner
      const EmailService = require('./emailService');
      await EmailService.sendBidRejectedNotification(auction, auction.winner);
      
      return { auction, action: 'rejected' };
    }

    if (decision === 'counter_offer' && counterOfferData) {
      const { CounterOffer } = require('../models');
      
      const counterOffer = await CounterOffer.create({
        auctionId,
        sellerId,
        buyerId: auction.winnerId,
        originalBid: auction.finalPrice,
        counterOfferAmount: counterOfferData.amount,
        message: counterOfferData.message,
        status: 'pending'
      });

      await auction.update({ sellerDecision: 'counter_offered' });
      
      return { auction, counterOffer, action: 'counter_offered' };
    }

    throw new Error('Invalid decision');
  }
}

module.exports = AuctionService;