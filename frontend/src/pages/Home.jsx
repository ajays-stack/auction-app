import React, { useState, useEffect } from 'react';
import api from '../services/api';
import AuctionCard from '../components/auction/AuctionCard';
import Loading from '../components/common/Loading';

const Home = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const response = await api.get('/auctions');
      setAuctions(response.data);
    } catch (error) {
      console.error('Failed to fetch auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAuctions = auctions.filter(auction => {
    if (filter === 'all') return true;
    if (filter === 'active') return auction.status === 'active';
    if (filter === 'ending-soon') {
      const endTime = new Date(auction.endAt);
      const now = new Date();
      const hoursLeft = (endTime - now) / (1000 * 60 * 60);
      return auction.status === 'active' && hoursLeft <= 24;
    }
    return true;
  });

  if (loading) return <Loading message="Loading auctions..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 font-inter">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6 font-poppins">
            Live Auctions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Discover unique items and place your bids on exclusive collections from around the world
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-2">
            <nav className="flex space-x-2">
              {[
                { 
                  key: 'all', 
                  label: 'All Auctions', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )
                },
                { 
                  key: 'active', 
                  label: 'Active', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  )
                },
                { 
                  key: 'ending-soon', 
                  label: 'Ending Soon', 
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )
                }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    filter === key
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/80'
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Auctions Grid */}
        {filteredAuctions.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-12 max-w-md mx-auto">
              <div className="mb-8 flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-bounce">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0A2.701 2.701 0 003 15.546V18a2 2 0 002 2h14a2 2 0 002-2v-2.454zM3 15.546V12a9 9 0 0118 0v3.546" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-poppins">No auctions found</h3>
              <p className="text-gray-600 text-lg font-medium">Check back later for new exciting auctions</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAuctions.map(auction => (
              <div key={auction.id} className="transform transition-all duration-300 hover:scale-105">
                <AuctionCard auction={auction} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;