import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ endTime, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime) - new Date();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft === 0) {
        setIsActive(false);
        if (onEnd) onEnd();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getColorClass = () => {
    if (timeLeft > 3600) return 'text-green-600'; // More than 1 hour
    if (timeLeft > 300) return 'text-yellow-600'; // More than 5 minutes
    return 'text-red-600'; // Less than 5 minutes
  };

  return (
    <div className={`font-mono text-lg font-bold ${getColorClass()}`}>
      {isActive ? (
        <span>Time left: {formatTime(timeLeft)}</span>
      ) : (
        <span className="text-red-600">AUCTION ENDED</span>
      )}
    </div>
  );
};

export default CountdownTimer;