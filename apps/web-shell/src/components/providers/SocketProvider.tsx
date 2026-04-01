"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");

    if (!token || !user._id) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005/api";
    const socketUrl = apiUrl.replace(/\/api$/, "");
    
    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ["websocket"]
    });

    socketInstance.on("connect", () => {
      console.log("[SOCKET] Connected to backend");
      setIsConnected(true);

      // Join rooms based on role and linked child if any
      const joinData: any = { userId: user._id, role: user.role };
      
      // If student, join student room and batch room
      if (user.role === 'STUDENT') {
        const student = JSON.parse(localStorage.getItem("student_profile") || "{}");
        if (student._id) joinData.studentId = student._id;
        if (student.batchId) joinData.batchId = student.batchId;
      }
      
      // If parent, join linked child rooms
      if (user.role === 'PARENT') {
        const children = JSON.parse(localStorage.getItem("children_profiles") || "[]");
        if (children.length > 0) {
          joinData.studentId = children[0]._id; // For simplicity, first child
          joinData.batchId = children[0].batchId;
        }
      }

      socketInstance.emit("join", joinData);
    });

    socketInstance.on("disconnect", () => {
      console.log("[SOCKET] Disconnected from backend");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
