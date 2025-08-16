import React from 'react';
import { useSocket } from '../../context/SocketContext';

const NotificationCenter = () => {
  const { notifications, removeNotification } = useSocket();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.slice(0, 5).map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
            notification.type === 'warning' ? 'bg-yellow-100 border border-yellow-400 text-yellow-700' :
            notification.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
            'bg-blue-100 border border-blue-400 text-blue-700'
          }`}
        >
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-lg leading-none opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
          <p className="text-xs mt-1 opacity-70">
            {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;