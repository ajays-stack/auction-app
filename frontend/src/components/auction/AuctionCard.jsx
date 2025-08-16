import React from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from './CountdownTimer';

const AuctionCard = ({ auction }) => {
  const isActive = auction.status === 'active' && new Date() < new Date(auction.endAt);
  const currentBid = auction.currentHighestBid || auction.startingPrice;

  const getStatusBadge = () => {
    switch (auction.status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Pending</span>;
      case 'active':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Live</span>;
      case 'ended':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Ended</span>;
      case 'sold':
        return <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Sold</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {auction.imageUrl && (
        <img
          src={auction.imageUrl}
          alt={auction.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {auction.title}
          </h3>
          {getStatusBadge()}
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {auction.description}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Current Bid:</span>
            <span className="font-semibold text-green-600">${currentBid}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Starting Price:</span>
            <span>${auction.startingPrice}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Seller:</span>
            <span>{auction.seller?.username}</span>
          </div>
        </div>
        
        {isActive && (
          <div className="mb-4">
            <CountdownTimer endTime={auction.endAt} />
          </div>
        )}
        
        <Link
          to={`/auction/${auction.id}`}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded transition-colors block"
        >
          {isActive ? 'Bid Now' : 'View Details'}
        </Link>
      </div>
    </div>
  );
};

export default AuctionCard;