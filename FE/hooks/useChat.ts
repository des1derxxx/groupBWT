import { useEffect, useState, useRef } from "react";
import { ChatApi } from "../src/api/chatApi";
import type { ChatMessage } from "../src/api/chatApi";
import { io, Socket } from "socket.io-client";

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data } = await ChatApi.getMessages();
      setMessages(data.reverse());
      setHasMore(data.length === 50);
    } catch (error) {
      console.error("Ошибка при загрузке сообщений:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadOlderMessages = async () => {
    if (loadingOlder || !hasMore || messages.length === 0) {
      return;
    }

    setLoadingOlder(true);
    try {
      const oldestMessageId = messages[0].id;
      const { data } = await ChatApi.getMessages(oldestMessageId);
      
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setMessages((prev) => [...data.reverse(), ...prev]);
        setHasMore(data.length === 50);
      }
    } catch (error) {
      console.error("Ошибка при загрузке старых сообщений:", error);
    } finally {
      setLoadingOlder(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("Токен не найден");
      return;
    }
    const socket = io("http://localhost:5000/chat", {
      auth: {
        token: token,
      },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    socket.on("connect", () => {
      console.log("WebSocket connected");
      setConnected(true);
    });
    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
      setConnected(false);
    });
    socket.on("newMessage", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });
    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      setConnected(false);
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);
  const sendMessage = async (content: string) => {
    if (!socketRef.current || !connected) {
      console.error("WebSocket не подключен");
      try {
        const { data } = await ChatApi.sendMessage(content);
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
        throw error;
      }
      return;
    }
    try {
      socketRef.current.emit("sendMessage", { content });
    } catch (error) {
      console.error("Ошибка при отправке сообщения через WebSocket:", error);
      throw error;
    }
  };
  return {
    messages,
    loading,
    loadingOlder,
    hasMore,
    sendMessage,
    loadOlderMessages,
    connected,
  };
};
