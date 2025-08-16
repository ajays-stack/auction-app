const redis = require('../config/redis');
const { Bid, Auction, User } = require('../models');
const { Op } = require('sequelize');

class BidService {
  static async placeBid(auctionId, bidderId, amount) {
    try {
      // Get auction details
      const auction = await Auction.findByPk(auctionId, {
        include: [{ model: User, as: 'seller' }]
      });

      if (!auction) {
        throw new Error('Auction not found');
      }

      // Check if auction is active
      const now = new Date();
      if (now < auction.goLiveAt || now > auction.endAt || auction.status !== 'active') {
        throw new Error('Auction is not active');
      }

      // Check if bidder is not the seller
      if (auction.sellerId === bidderId) {
        throw new Error('Sellers cannot bid on their own auctions');
      }

      // Get current highest bid from Redis
      const currentHighestKey = `auction:${auctionId}:highest_bid`;
      const currentHighest = await redis.get(currentHighestKey);
      const currentHighestAmount = currentHighest ? parseFloat(currentHighest) : auction.startingPrice;

      // Validate bid amount
      const minimumBid = currentHighestAmount + parseFloat(auction.bidIncrement);
      if (amount < minimumBid) {
        throw new Error(`Bid must be at least ${minimumBid}`);
      }

      // Create bid in database
      const bid = await Bid.create({
        auctionId,
        bidderId,
        amount,
        isWinning: true
      });

      // Update previous winning bid
      await Bid.update(
        { isWinning: false },
        {
          where: {
            auctionId,
            id: { [Op.ne]: bid.id },
            isWinning: true
          }
        }
      );

      // Update Redis with new highest bid
      await redis.setex(currentHighestKey, 3600, amount); // 1 hour expiry
      await redis.setex(`auction:${auctionId}:highest_bidder`, 3600, bidderId);

      // Update auction record
      await auction.update({ currentHighestBid: amount });

      // Get bidder info
      const bidder = await User.findByPk(bidderId, {
        attributes: ['id', 'username', 'firstName', 'lastName']
      });

      return {
        bid,
        bidder,
        auction
      };
    } catch (error) {
      throw error;
    }
  }

  static async getAuctionBids(auctionId, limit = 10) {
    return await Bid.findAll({
      where: { auctionId },
      include: [{
        model: User,
        as: 'bidder',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  static async getCurrentHighestBid(auctionId) {
    const redisKey = `auction:${auctionId}:highest_bid`;
    const bidAmount = await redis.get(redisKey);
    
    if (bidAmount) {
      const bidderId = await redis.get(`auction:${auctionId}:highest_bidder`);
      return {
        amount: parseFloat(bidAmount),
        bidderId
      };
    }

    // Fallback to database
    const highestBid = await Bid.findOne({
      where: { auctionId, isWinning: true },
      include: [{
        model: User,
        as: 'bidder',
        attributes: ['id', 'username', 'firstName', 'lastName']
      }]
    });

    return highestBid;
  }
}

module.exports = BidService;