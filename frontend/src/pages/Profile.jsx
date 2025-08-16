import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import AuctionCard from '../components/auction/AuctionCard';
import Loading from '../components/common/Loading';

const Profile = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('auctions');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [auctionsResponse] = await Promise.all([
        api.get('/auctions/user/my-auctions')
      ]);
      
      setAuctions(auctionsResponse.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading message="Loading your profile..." />;

  const activeAuctions = auctions.filter(a => a.status === 'active');
  const endedAuctions = auctions.filter(a => a.status === 'ended');
  const soldAuctions = auctions.filter(a => a.status === 'sold');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                Welcome back, {user?.name || 'User'}
              </h1>
              <p className="text-gray-600 text-lg">Manage your auctions and track your activity</p>
            </div>
            <div className="hidden sm:block">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200/50 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{activeAuctions.length}</div>
                  <div className="text-blue-700 font-medium">Active Auctions</div>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                  🔥
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200/50 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-1">{soldAuctions.length}</div>
                  <div className="text-green-700 font-medium">Sold Items</div>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                  💰
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-6 border border-purple-200/50 transform hover:scale-105 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{auctions.length}</div>
                  <div className="text-purple-700 font-medium">Total Auctions</div>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                  📊
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-2">
            <nav className="flex space-x-1">
              {[
                { key: 'auctions', label: 'My Auctions', icon: '🏪' },
                { key: 'bids', label: 'My Bids', icon: '🔨' }
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    activeTab === key
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/70'
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 min-h-96">
          {activeTab === 'auctions' && (
            <div className="p-8">
              {auctions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                    📦
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">No auctions yet</h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                    Start your selling journey by creating your first auction. It's quick and easy!
                  </p>
                  <a
                    href="/create-auction"
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span>✨</span>
                    <span>Create Your First Auction</span>
                  </a>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Your Auctions</h2>
                    <a
                      href="/create-auction"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <span>+</span>
                      <span>New Auction</span>
                    </a>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {auctions.map(auction => (
                      <div key={auction.id} className="transform hover:scale-105 transition-all duration-200">
                        <AuctionCard auction={auction} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bids' && (
            <div className="p-8">
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                  🔨
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Bid History Coming Soon</h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
                  We're working on bringing you a comprehensive view of all your bidding activity. Stay tuned!
                </p>
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 max-w-lg mx-auto">
                  <h4 className="font-semibold text-amber-800 mb-2">What's coming:</h4>
                  <div className="text-left space-y-2 text-amber-700">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span>Track all your bids in real-time</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span>See won and lost auctions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                      <span>Get notifications for outbids</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;