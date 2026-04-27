import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [lastSensorUpdate, setLastSensorUpdate] = useState(null);

  useEffect(() => {
    if (user) {
      // Derive socket URL from API base URL (remove /api suffix if present)
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const socketUrl = apiBase.replace(/\/api\/?$/, '');
      const newSocket = io(socketUrl, {
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('🔗 Live Feed Connected');
      });

      newSocket.on('sensor_update', (data) => {
        setLastSensorUpdate(data);
      });

      newSocket.on('gemini_alert', (data) => {
        toast.error(`⚠️ AI Alert: ${data.anomaly_type} for ${data.batch_id}`, {
          duration: 6000,
          position: 'top-right',
        });
      });

      newSocket.on('blockchain_confirmed', (data) => {
        toast.success(`⛓️ Blockchain Confirmed: ${data.message}`, {
          duration: 4000,
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        console.log('🔌 Live Feed Disconnected');
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, lastSensorUpdate }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
