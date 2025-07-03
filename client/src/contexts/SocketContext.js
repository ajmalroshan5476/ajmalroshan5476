import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
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
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Initialize socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      setSocket(newSocket);

      // Socket event listeners
      newSocket.on('connect', () => {
        console.log('Connected to server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      newSocket.on('user-joined', (userId) => {
        console.log('User joined:', userId);
        setOnlineUsers(prev => [...prev.filter(id => id !== userId), userId]);
      });

      newSocket.on('user-left', (userId) => {
        console.log('User left:', userId);
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Clean up socket when user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setOnlineUsers([]);
        setCurrentRoom(null);
      }
    }
  }, [user]);

  const joinRoom = (roomId) => {
    if (socket && roomId) {
      socket.emit('join-room', roomId);
      setCurrentRoom(roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket && roomId) {
      socket.emit('leave-room', roomId);
      setCurrentRoom(null);
    }
  };

  const sendMessage = (roomId, message, type = 'text') => {
    if (socket && roomId && message) {
      const messageData = {
        roomId,
        message,
        sender: user,
        type,
        timestamp: new Date()
      };
      socket.emit('send-message', messageData);
    }
  };

  const shareFile = (roomId, fileData) => {
    if (socket && roomId && fileData) {
      const shareData = {
        roomId,
        filename: fileData.originalName,
        fileUrl: fileData.fileUrl,
        fileType: fileData.fileType,
        sender: user,
        timestamp: new Date()
      };
      socket.emit('share-file', shareData);
    }
  };

  const onReceiveMessage = (callback) => {
    if (socket) {
      socket.on('receive-message', callback);
      return () => socket.off('receive-message', callback);
    }
  };

  const onFileShared = (callback) => {
    if (socket) {
      socket.on('file-shared', callback);
      return () => socket.off('file-shared', callback);
    }
  };

  const onUserJoined = (callback) => {
    if (socket) {
      socket.on('user-joined', callback);
      return () => socket.off('user-joined', callback);
    }
  };

  const onUserLeft = (callback) => {
    if (socket) {
      socket.on('user-left', callback);
      return () => socket.off('user-left', callback);
    }
  };

  const value = {
    socket,
    onlineUsers,
    currentRoom,
    joinRoom,
    leaveRoom,
    sendMessage,
    shareFile,
    onReceiveMessage,
    onFileShared,
    onUserJoined,
    onUserLeft,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};