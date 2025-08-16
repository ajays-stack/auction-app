import React, { useState } from 'react';
import api from '../../services/api';

const BidForm = ({ auction, onBidPlaced, disabled }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const minimumBid = parseFloat(auction.currentHighestBid || auction.startingPrice) + 
                    parseFloat(auction.bidIncrement);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(bidAmount);
    if (amount < minimumBid) {
      setError(`Minimum bid is ${minimumBid.toFixed(2)}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/bids', {
        auctionId: auction.id,
        amount: amount
      });

      setBidAmount('');
      if (onBidPlaced) onBidPlaced();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-center">
        <p className="text-gray-600">Bidding is not available for this auction</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Place Your Bid</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bid Amount (Minimum: ${minimumBid.toFixed(2)})
        </label>
        <input
          type="number"
          step="0.01"
          min={minimumBid}
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`${minimumBid.toFixed(2)}`}
          required
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !bidAmount}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded transition-colors"
      >
        {loading ? 'Placing Bid...' : 'Place Bid'}
      </button>
    </form>
  );
};

export default BidForm;