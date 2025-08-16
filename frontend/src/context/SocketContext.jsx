import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      const socketInstance = socketService.connect(token);
      setSocket(socketInstance);

      // Listen for notifications
      socketInstance.on('seller_bid_notification', (data) => {
        addNotification('info', data.message);
      });

      socketInstance.on('outbid_notification', (data) => {
        addNotification('warning', data.message);
      });

      socketInstance.on('auction_won', (data) => {
        addNotification('success', data.message);
      });

      socketInstance.on('auction_ended_seller', (data) => {
        addNotification('info', data.message);
      });

      return () => {
        socketService.disconnect();
        setSocket(null);
      };
    }
  }, [isAuthenticated, user]);

  const addNotification = (type, message) => {
    const notification = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date()
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 9)]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <SocketContext.Provider value={{
      socket,
      notifications,
      addNotification,
      removeNotification,
      joinAuction: socketService.joinAuction.bind(socketService),
      leaveAuction: socketService.leaveAuction.bind(socketService)
    }}>
      {children}
    </SocketContext.Provider>
  );
};