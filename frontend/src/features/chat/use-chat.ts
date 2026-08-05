"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useChatStore, ChatMessage } from "./chat.store";
import { useAuthStore } from "@/store/auth-store";

// Singleton socket instance
let globalSocket: Socket | null = null;

const getSocketUrl = () => {
  try {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return new URL(process.env.NEXT_PUBLIC_API_URL).origin;
    }
  } catch (e) {}
  return "http://localhost:3001";
};
const SOCKET_URL = getSocketUrl();

// Generate a stable guest ID (persisted in sessionStorage)
function getGuestId(): string {
  if (typeof window === "undefined") return "ssr_guest";
  const key = "achromatic_guest_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function useChatSocket() {
  const store = useChatStore();
  const { user } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  // ─── Setup socket only once ──────────────────────────────────

  useEffect(() => {
    if (initialized) return;
    if (globalSocket) {
      setInitialized(true);
      return;
    }

    store.setStatus("connecting");

    const socket = io(`${SOCKET_URL}/chat`, {
      transports: ["websocket", "polling"],
      auth: { userId: user?.id ?? undefined },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    globalSocket = socket;
    setInitialized(true);

    socket.on("connect", () => {
      console.log("[Chat] Socket connected:", socket.id);
      // Start a new session
      const guestId = !user ? getGuestId() : undefined;
      socket.emit("chat:start", { guestId });
    });

    socket.on("connect_error", (err) => {
      console.error("[Chat] Connection error:", err.message);
      store.setStatus("idle");
    });

    socket.on("disconnect", (reason) => {
      console.warn("[Chat] Disconnected:", reason);
      store.setStatus("idle");
    });

    socket.on("chat:session_created", ({ sessionId, message }: { sessionId: string; message: ChatMessage }) => {
      store.setSessionId(sessionId);
      store.setStatus("bot");
      store.addMessage(message);
    });

    socket.on("chat:message_received", (msg: ChatMessage) => {
      const exists = useChatStore.getState().messages.some((m) => m.id === msg.id);
      if (!exists) store.addMessage(msg);
    });

    socket.on("chat:bot_typing", () => {
      store.setBotTyping(true);
    });

    socket.on("chat:bot_reply", (msg: ChatMessage) => {
      store.setBotTyping(false);
      store.addMessage(msg);
    });

    socket.on("chat:system_message", (msg: ChatMessage) => {
      store.addMessage(msg);
    });

    socket.on("chat:staff_joined", ({ message }: { sessionId: string; message: ChatMessage }) => {
      store.setStatus("staff");
      store.addMessage(message);
    });

    socket.on("chat:staff_reply", (msg: ChatMessage) => {
      store.setStaffTyping(false);
      store.addMessage(msg);
    });

    socket.on("chat:typing", ({ sender, isTyping }: { sender: string; isTyping: boolean }) => {
      if (sender === "staff") store.setStaffTyping(isTyping);
    });

    socket.on("chat:session_closed", (msg: ChatMessage) => {
      store.setStatus("closed");
      store.addMessage(msg);
    });

    socket.on("chat:error", ({ message }: { message: string }) => {
      console.error("[Chat] Server error:", message);
    });

    return () => {
      // Don't disconnect on unmount — keep socket alive for session persistence
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // ─── Actions ─────────────────────────────────────────────────

  const sendMessage = useCallback((content: string) => {
    const { sessionId } = useChatStore.getState();
    if (!globalSocket?.connected || !sessionId || !content.trim()) {
      console.warn("[Chat] Cannot send: socket=", globalSocket?.connected, "session=", sessionId);
      return;
    }

    // Optimistic UI removed to prevent duplicate messages since server broadcasts it back
    // The message will be added when chat:message_received is handled

    // Include userId with every message so backend always has current auth state
    // (the socket singleton may have been created before login)
    const { user } = useAuthStore.getState();
    globalSocket.emit("chat:message", { sessionId, content, userId: user?.id ?? undefined });
  }, [store]);

  const requestStaff = useCallback(() => {
    const { sessionId } = useChatStore.getState();
    if (!globalSocket?.connected || !sessionId) return;
    globalSocket.emit("chat:request_staff", { sessionId });
    store.setStatus("staff_requested");
  }, [store]);

  const sendTyping = useCallback((isTyping: boolean) => {
    const { sessionId } = useChatStore.getState();
    if (!globalSocket?.connected || !sessionId) return;
    globalSocket.emit("chat:typing", { sessionId, isTyping });
  }, []);

  const endChat = useCallback(() => {
    const { sessionId } = useChatStore.getState();
    if (!globalSocket?.connected || !sessionId) return;
    globalSocket.emit("chat:end", { sessionId });
  }, []);

  return {
    isConnected: globalSocket?.connected ?? false,
    sendMessage,
    requestStaff,
    sendTyping,
    endChat,
  };
}
