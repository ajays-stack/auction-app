const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auction = sequelize.define('Auction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  startingPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  bidIncrement: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currentHighestBid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  goLiveAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: false,
  },
  endAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'ended', 'sold', 'cancelled'),
    defaultValue: 'pending',
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  winnerId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  finalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  sellerDecision: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'counter_offered'),
    defaultValue: 'pending',
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
}, {
  hooks: {
    beforeCreate: (auction) => {
      auction.endAt = new Date(auction.goLiveAt.getTime() + auction.duration * 60000);
    },
  },
});

module.exports = Auction;