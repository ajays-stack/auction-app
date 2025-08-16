const User = require('./User');
const Auction = require('./Auction');
const Bid = require('./Bid');
const CounterOffer = require('./CounterOffer');

// Define associations
User.hasMany(Auction, { foreignKey: 'sellerId', as: 'auctions' });
Auction.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

User.hasMany(Auction, { foreignKey: 'winnerId', as: 'wonAuctions' });
Auction.belongsTo(User, { foreignKey: 'winnerId', as: 'winner' });

User.hasMany(Bid, { foreignKey: 'bidderId', as: 'bids' });
Bid.belongsTo(User, { foreignKey: 'bidderId', as: 'bidder' });

Auction.hasMany(Bid, { foreignKey: 'auctionId', as: 'bids' });
Bid.belongsTo(Auction, { foreignKey: 'auctionId', as: 'auction' });

Auction.hasMany(CounterOffer, { foreignKey: 'auctionId', as: 'counterOffers' });
CounterOffer.belongsTo(Auction, { foreignKey: 'auctionId', as: 'auction' });

User.hasMany(CounterOffer, { foreignKey: 'sellerId', as: 'madeCounterOffers' });
CounterOffer.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

User.hasMany(CounterOffer, { foreignKey: 'buyerId', as: 'receivedCounterOffers' });
CounterOffer.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

module.exports = {
  User,
  Auction,
  Bid,
  CounterOffer,
};