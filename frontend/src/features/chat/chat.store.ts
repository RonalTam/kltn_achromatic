"use client";

import { create } from "zustand";

// ─── Types ─────────────────────────────────────────────────────

export type ChatSender = "USER" | "BOT" | "STAFF" | "SYSTEM";
export type ChatStatus =
  | "idle"
  | "connecting"
  | "bot"
  | "staff_requested"
  | "staff"
  | "closed";

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: ChatSender;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId?: string;
  guestId?: string;
  status: string;
}

// ─── Store ─────────────────────────────────────────────────────

interface ChatStore {
  // State
  isOpen: boolean;
  sessionId: string | null;
  messages: ChatMessage[];
  status: ChatStatus;
  isBotTyping: boolean;
  isStaffTyping: boolean;

  // Actions
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  setSessionId: (id: string) => void;
  addMessage: (msg: ChatMessage) => void;
  setStatus: (status: ChatStatus) => void;
  setBotTyping: (typing: boolean) => void;
  setStaffTyping: (typing: boolean) => void;
  reset: () => void;
}

const initialState = {
  isOpen: false,
  sessionId: null,
  messages: [],
  status: "idle" as ChatStatus,
  isBotTyping: false,
  isStaffTyping: false,
};

export const useChatStore = create<ChatStore>((set) => ({
  ...initialState,

  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
  setSessionId: (sessionId) => set({ sessionId }),
  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),
  setStatus: (status) => set({ status }),
  setBotTyping: (isBotTyping) => set({ isBotTyping }),
  setStaffTyping: (isStaffTyping) => set({ isStaffTyping }),
  reset: () => set(initialState),
}));
