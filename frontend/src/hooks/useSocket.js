import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export const useSocketEvent = (event, handler, dependencies = []) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on(event, handler);
      return () => socket.off(event, handler);
    }
  }, [socket, event, ...dependencies]);
};