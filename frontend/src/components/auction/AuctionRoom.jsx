import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useSocketEvent } from '../../hooks/useSocket';
import api from '../../services/api';
import CountdownTimer from './CountdownTimer';
import BidForm from './BidForm';
import BidHistory from './BidHistory';
import Loading from '../common/Loading';

const AuctionRoom = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { joinAuction, leaveAuction } = useSocket();
  const navigate = useNavigate();
  
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [highestBid, setHighestBid] = useState(null);

  useEffect(() => {
    fetchAuction();
    fetchHighestBid();
    
    if (id) {
      joinAuction(id);
    }

    return () => {
      if (id) {
        leaveAuction(id);
      }
    };
  }, [id]);

  useSocketEvent('new_bid', (data) => {
    if (data.auction.id === id) {
      setHighestBid({
        amount: data.bid.amount,
        bidder: data.bidder
      });
      setAuction(prev => ({
        ...prev,
        currentHighestBid: data.bid.amount
      }));
    }
  }, [id]);

  useSocketEvent('auction_ended', (data) => {
    if (data.auction.id === id) {
      // Fetch fresh auction data when it ends to get all updated fields
      fetchAuction();
    }
  }, [id]);

  const fetchAuction = async () => {
    try {
      const response = await api.get(`/auctions/${id}`);
      setAuction(response.data);
    } catch (error) {
      setError('Failed to load auction');
    } finally {
      setLoading(false);
    }
  };

  const fetchHighestBid = async () => {
    try {
      const response = await api.get(`/bids/auction/${id}/highest`);
      setHighestBid(response.data);
    } catch (error) {
      console.error('Failed to fetch highest bid:', error);
    }
  };

  const [successMessage, setSuccessMessage] = useState('');
  
  const handleSellerDecision = async (decision, counterOffer = null) => {
    try {
      const payload = { decision };
      if (counterOffer) {
        payload.counterOffer = counterOffer;
      }

      await api.post(`/auctions/${id}/seller-decision`, payload);
      
      // Show appropriate success message
      const messages = {
        accepted: 'Bid accepted! The buyer will be notified.',
        rejected: 'Bid rejected. The buyer will be notified.',
        counter_offer: 'Counter offer sent! Waiting for buyer response.'
      };
      setSuccessMessage(messages[decision]);
      
      fetchAuction();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to process decision');
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-center text-red-600 py-8">{error}</div>;
  if (!auction) return <div className="text-center py-8">Auction not found</div>;

  const isActive = auction.status === 'active' && new Date() < new Date(auction.endAt);
  const isOwner = user?.id === auction.sellerId;
  const canBid = isAuthenticated && !isOwner && isActive;
  const currentBid = auction.currentHighestBid || auction.startingPrice;

  return (
    <div className="container mx-auto px-4 py-8">
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Auction Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {auction.imageUrl && (
              <img
                src={auction.imageUrl}
                alt={auction.title}
                className="w-full h-64 object-cover"
              />
            )}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{auction.title}</h1>
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  auction.status === 'active' ? 'bg-green-100 text-green-800' :
                  auction.status === 'ended' ? 'bg-blue-100 text-blue-800' :
                  auction.status === 'sold' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {auction.status.toUpperCase()}
                </span>
              </div>
              
              <p className="text-gray-600 mb-6">{auction.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-gray-500">Current Bid</h3>
                  <p className="text-2xl font-bold text-green-600">${currentBid}</p>
                  {highestBid?.bidder && (
                    <p className="text-sm text-gray-600">by {highestBid.bidder.username}</p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-gray-500">Starting Price</h3>
                  <p className="text-2xl font-bold">${auction.startingPrice}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-gray-500">Bid Increment</h3>
                  <p className="text-lg font-semibold">${auction.bidIncrement}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="text-sm font-medium text-gray-500">Seller</h3>
                  <p className="text-lg font-semibold">{auction.seller?.username}</p>
                </div>
              </div>
              
              {isActive && (
                <div className="mb-6">
                  <CountdownTimer
                    endTime={auction.endAt}
                    onEnd={() => {
                      fetchAuction(); // Fetch fresh auction data when timer ends
                    }}
                  />
                </div>
              )}
              
              {/* Seller Decision Panel */}
              {isOwner && auction.status === 'ended' && auction.sellerDecision === 'pending' && (
                <SellerDecisionPanel
                  auction={auction}
                  onDecision={handleSellerDecision}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Bidding Panel */}
        <div className="space-y-6">
          {canBid && (
            <BidForm
              auction={auction}
              onBidPlaced={fetchHighestBid}
              disabled={!canBid}
            />
          )}
          
          <BidHistory auctionId={id} />
        </div>
      </div>
    </div>
  );
};

// Seller Decision Panel Component
const SellerDecisionPanel = ({ auction, onDecision }) => {
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [counterOfferMessage, setCounterOfferMessage] = useState('');

  const handleCounterOffer = () => {
    onDecision('counter_offer', {
      amount: parseFloat(counterOfferAmount),
      message: counterOfferMessage
    });
    setShowCounterOffer(false);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Auction Decision Required</h3>
      <p className="mb-4">
        The auction has ended with a winning bid of <strong>${auction.finalPrice}</strong> 
        from <strong>{auction.winner?.username}</strong>.
      </p>
      
      {!showCounterOffer ? (
        <div className="flex space-x-3">
          <button
            onClick={() => onDecision('accepted')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Accept Bid
          </button>
          
          <button
            onClick={() => onDecision('rejected')}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Reject Bid
          </button>
          
          <button
            onClick={() => setShowCounterOffer(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Make Counter Offer
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Counter Offer Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={counterOfferAmount}
              onChange={(e) => setCounterOfferAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              placeholder={auction.finalPrice}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea
              value={counterOfferMessage}
              onChange={(e) => setCounterOfferMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded"
              rows={3}
              placeholder="Explain your counter offer..."
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleCounterOffer}
              disabled={!counterOfferAmount}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded"
            >
              Send Counter Offer
            </button>
            
            <button
              onClick={() => setShowCounterOffer(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionRoom;