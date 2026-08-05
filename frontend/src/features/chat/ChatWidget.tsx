"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useChatStore } from "./chat.store";
import { useChatSocket } from "./use-chat";
import { ChatPanel } from "./ChatPanel";

export function ChatWidget() {
  // Initialize singleton socket on first mount
  const { sendMessage, requestStaff, sendTyping, endChat } = useChatSocket();

  // ✅ Reactive selectors — each re-renders when value changes
  const isOpen = useChatStore((s) => s.isOpen);
  const closeChat = useChatStore((s) => s.closeChat);
  const openChat = useChatStore((s) => s.openChat);
  const messages = useChatStore((s) => s.messages);

  const unreadCount = messages.filter(
    (m) => m.sender !== "USER" && m.sender !== "SYSTEM"
  ).length;

  const handleToggle = () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  return (
    <>
      {/* ── Chat Panel (floating) ─────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-20 right-4 z-[9998] w-[360px] h-[540px] max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-[#E0E0E0]"
            style={{
              boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
            }}
            role="dialog"
            aria-label="Chat tư vấn"
          >
            <ChatPanel
              onClose={closeChat}
              onSendMessage={sendMessage}
              onRequestStaff={requestStaff}
              onSendTyping={sendTyping}
              onEndChat={endChat}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating action button ─────────────────────────────── */}
      <motion.button
        type="button"
        onClick={handleToggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-4 right-4 z-[9999] flex items-center justify-center text-white shadow-lg"
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: isOpen
            ? "#333333"
            : "linear-gradient(135deg, #111111 0%, #444444 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
        }}
        aria-label={isOpen ? "Đóng chat" : "Mở chat tư vấn"}
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="x-icon"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="chat-icon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageCircle className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
