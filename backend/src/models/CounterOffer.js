const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CounterOffer = sequelize.define('CounterOffer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  auctionId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  buyerId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  originalBid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  counterOfferAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending',
  },
  message: {
    type: DataTypes.TEXT,
  },
});

module.exports = CounterOffer;