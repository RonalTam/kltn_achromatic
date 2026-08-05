"use client";

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from "react";
import {
  X,
  Send,
  UserRound,
  Loader2,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useChatStore } from "./chat.store";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { QuickReplies } from "./QuickReplies";

interface ChatPanelProps {
  onClose: () => void;
  onSendMessage: (content: string) => void;
  onRequestStaff: () => void;
  onSendTyping: (isTyping: boolean) => void;
  onEndChat: () => void;
}

export function ChatPanel({
  onClose,
  onSendMessage,
  onRequestStaff,
  onSendTyping,
  onEndChat,
}: ChatPanelProps) {
  const messages = useChatStore((s) => s.messages);
  const status = useChatStore((s) => s.status);
  const isBotTyping = useChatStore((s) => s.isBotTyping);
  const isStaffTyping = useChatStore((s) => s.isStaffTyping);

  const [input, setInput] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBotTyping, isStaffTyping]);

  // Focus input when panel opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || status === "closed") return;
    onSendMessage(text);
    setInput("");
    onSendTyping(false);
    if (typingTimeout) clearTimeout(typingTimeout);
  }, [input, status, onSendMessage, onSendTyping, typingTimeout]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (typingTimeout) clearTimeout(typingTimeout);
    onSendTyping(true);
    const timeout = setTimeout(() => onSendTyping(false), 2000);
    setTypingTimeout(timeout);
  };

  const isDisabled = status === "closed" || status === "connecting" || status === "idle";
  const showQuickReplies = messages.length <= 1 && status === "bot";

  const statusLabel = {
    idle: "Đang khởi tạo...",
    connecting: "Đang kết nối...",
    bot: "Minh • Nhân viên tư vấn • Online",
    staff_requested: "Đang kết nối nhân viên...",
    staff: "Nhân viên tư vấn • Online",
    closed: "Phiên chat đã kết thúc",
  }[status];

  const statusColor = {
    idle: "#999",
    connecting: "#F59E0B",
    bot: "#10B981",
    staff_requested: "#F59E0B",
    staff: "#10B981",
    closed: "#EF4444",
  }[status];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-[#111111] text-white flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#111]"
              style={{ background: statusColor }}
            />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">ACHROMATIC</p>
            <p className="text-[10px] text-white/60">{statusLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Thu nhỏ chat"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => { onEndChat(); onClose(); }}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Đóng chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Messages area ────────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 bg-[#FAFAFA]"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#CCCCCC #FAFAFA",
        }}
      >
        {status === "connecting" && (
          <div className="flex items-center justify-center h-full gap-2 text-sm text-[#999]">
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang kết nối...
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            sender={msg.sender}
            content={msg.content}
            createdAt={msg.createdAt}
          />
        ))}

        {isBotTyping && <TypingIndicator label="Trợ lý AI" />}
        {isStaffTyping && <TypingIndicator label="Nhân viên" />}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick replies (shown at start) ───────────────────── */}
      {showQuickReplies && (
        <div className="border-t border-[#EEEEEE] pt-2 bg-white flex-shrink-0">
          <QuickReplies
            onSelect={(text) => onSendMessage(text)}
            disabled={isDisabled}
          />
        </div>
      )}

      {/* ── "Gặp nhân viên" button ───────────────────────────── */}
      {(status === "bot" || status === "staff_requested") && (
        <div className="flex-shrink-0 px-4 py-2 bg-white border-t border-[#EEEEEE]">
          <button
            type="button"
            disabled={status === "staff_requested"}
            onClick={onRequestStaff}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-lg border border-[#DDDDDD] text-[#555] hover:border-[#111] hover:text-[#111] hover:bg-[#F7F7F7] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserRound className="w-3.5 h-3.5" />
            {status === "staff_requested"
              ? "Đang kết nối nhân viên..."
              : "Gặp nhân viên tư vấn"}
          </button>
        </div>
      )}

      {/* ── Input area ───────────────────────────────────────── */}
      <div className="flex-shrink-0 p-3 bg-white border-t border-[#EEEEEE]">
        {status === "closed" ? (
          <p className="text-center text-xs text-[#999] py-2">
            Phiên chat đã kết thúc. Làm mới trang để bắt đầu mới.
          </p>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                status === "connecting"
                  ? "Đang kết nối..."
                  : "Nhập tin nhắn... (Enter để gửi)"
              }
              disabled={isDisabled}
              rows={1}
              className="flex-1 resize-none text-sm rounded-xl border border-[#E0E0E0] px-3.5 py-2.5 outline-none focus:border-[#111] transition-colors disabled:bg-[#F5F5F5] disabled:text-[#999] placeholder:text-[#BBBBBB] max-h-28 overflow-y-auto"
              style={{ lineHeight: "1.5" }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isDisabled}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#111111] text-white flex items-center justify-center hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
