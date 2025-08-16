import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocketEvent } from '../../hooks/useSocket';

const BidHistory = ({ auctionId }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, [auctionId]);

  useSocketEvent('new_bid', (data) => {
    if (data.bid.auctionId === auctionId) {
      setBids(prev => [data.bid, ...prev.slice(0, 9)]);
    }
  }, [auctionId]);

  const fetchBids = async () => {
    try {
      const response = await api.get(`/bids/auction/${auctionId}`);
      setBids(response.data);
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-32 rounded"></div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Bid History</h3>
      
      {bids.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No bids yet</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {bids.map((bid, index) => (
            <div
              key={bid.id}
              className={`flex justify-between items-center p-3 rounded ${
                index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}
            >
              <div>
                <span className="font-medium">{bid.bidder?.username}</span>
                {index === 0 && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Winning Bid
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">${bid.amount}</div>
                <div className="text-xs text-gray-500">
                  {new Date(bid.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BidHistory;