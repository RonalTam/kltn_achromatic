"use client";

import { ChatSender } from "./chat.store";

interface MessageBubbleProps {
  sender: ChatSender;
  content: string;
  createdAt: string;
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function MessageBubble({ sender, content, createdAt }: MessageBubbleProps) {
  const isUser = sender === "USER";
  const isSystem = sender === "SYSTEM";
  const isStaff = sender === "STAFF";

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[10px] text-[#999] bg-[#F3F3F3] rounded-full px-3 py-1 italic">
          {content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 mb-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{
            background: isStaff
              ? "linear-gradient(135deg, #1a1a1a, #444)"
              : "linear-gradient(135deg, #111, #555)",
          }}
        >
          {isStaff ? "NV" : "M"}
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[78%] flex flex-col gap-0.5 ${isUser ? "items-end" : "items-start"}`}>
        {!isUser && (
          <span className="text-[10px] text-[#888] font-medium px-1">
            {isStaff ? "Nhân viên" : "Minh"}
          </span>
        )}
        <div
          className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words"
          style={{
            background: isUser
              ? "#111111"
              : isStaff
                ? "#EEF2FF"
                : "#F0F0F0",
            color: isUser ? "#fff" : "#111",
            borderRadius: isUser
              ? "18px 18px 4px 18px"
              : "18px 18px 18px 4px",
          }}
        >
          {/* Render markdown-like bold: **text** */}
          <span
            dangerouslySetInnerHTML={{
              __html: content
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="underline font-semibold text-blue-600 hover:text-blue-800 cursor-pointer" target="_blank" rel="noopener noreferrer">$1</a>')
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/\n/g, "<br/>"),
            }}
          />
        </div>
        <span className="text-[10px] text-[#BBBBBB] px-1">
          {formatTime(createdAt)}
        </span>
      </div>
    </div>
  );
}

// Typing indicator dots animation
export function TypingIndicator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-[#222] flex items-center justify-center flex-shrink-0">
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-full bg-white animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
      <span className="text-[11px] text-[#999] italic">{label} đang gõ...</span>
    </div>
  );
}
