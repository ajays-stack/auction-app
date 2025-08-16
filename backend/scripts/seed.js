// backend/scripts/seed.js
const sequelize = require('../config/database');
const { User, Auction } = require('../models');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced!');

    // Create users
    const admin = await User.create({
      email: 'admin@auction.com',
      username: 'admin',
      password: 'admin123', // Make sure your User model hashes password if needed
      isAdmin: true,
      isActive: true,
    });

    const seller = await User.create({
      email: 'seller@test.com',
      username: 'seller',
      password: 'password123',
      isAdmin: false,
      isActive: true,
    });

    const buyer = await User.create({
      email: 'buyer@test.com',
      username: 'buyer',
      password: 'password123',
      isAdmin: false,
      isActive: true,
    });

    // Create auctions
    const auctionsData = [
      {
        title: 'Vintage Watch',
        description: 'A rare vintage watch from 1950s.',
        startingPrice: 1000,
        bidIncrement: 50,
        goLiveAt: new Date(Date.now() + 1 * 60 * 1000), // 1 min from now
        duration: 30, // 30 minutes
        sellerId: seller.id,
      },
      {
        title: 'Antique Painting',
        description: 'Beautiful antique painting from 19th century.',
        startingPrice: 500,
        bidIncrement: 20,
        goLiveAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins from now
        duration: 45, // 45 minutes
        sellerId: seller.id,
      },
    ];

    for (const data of auctionsData) {
      await Auction.create(data); // endAt will be auto-calculated
    }

    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seed();
