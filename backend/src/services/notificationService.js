class NotificationService {
  static async sendBidNotification(io, auctionId, bidData) {
    // Notify all users in the auction room
    io.to(`auction:${auctionId}`).emit('new_bid', {
      bid: bidData.bid,
      bidder: bidData.bidder,
      auction: bidData.auction
    });

    // Notify seller
    io.to(`user:${bidData.auction.sellerId}`).emit('seller_bid_notification', {
      message: `New bid of $${bidData.bid.amount} placed on your auction "${bidData.auction.title}"`,
      bid: bidData.bid,
      auction: bidData.auction
    });

    // Notify outbid users (excluding the current bidder)
    const previousBids = await this.getPreviousBidders(auctionId, bidData.bid.bidderId);
    previousBids.forEach(userId => {
      io.to(`user:${userId}`).emit('outbid_notification', {
        message: `You have been outbid on "${bidData.auction.title}"`,
        newBid: bidData.bid,
        auction: bidData.auction
      });
    });
  }

  static async sendAuctionEndNotification(io, auctionData) {
    const { auction, highestBid } = auctionData;
    
    // Notify all participants
    io.to(`auction:${auction.id}`).emit('auction_ended', {
      auction,
      winningBid: highestBid
    });

    // Notify seller
    if (highestBid) {
      io.to(`user:${auction.sellerId}`).emit('auction_ended_seller', {
        message: `Your auction "${auction.title}" has ended with a winning bid of $${highestBid.amount}`,
        auction,
        winningBid: highestBid
      });

      // Notify winner
      io.to(`user:${highestBid.bidderId}`).emit('auction_won', {
        message: `Congratulations! You won "${auction.title}" with a bid of $${highestBid.amount}`,
        auction,
        winningBid: highestBid
      });
    }
  }

  static async getPreviousBidders(auctionId, excludeBidderId) {
    const { Bid } = require('../models');
    const bids = await Bid.findAll({
      where: {
        auctionId,
        bidderId: { [require('sequelize').Op.ne]: excludeBidderId }
      },
      attributes: ['bidderId'],
      group: ['bidderId']
    });

    return bids.map(bid => bid.bidderId);
  }
}

module.exports = NotificationService;