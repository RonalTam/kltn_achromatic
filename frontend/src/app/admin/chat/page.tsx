"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  CheckCircle,
  Clock,
  Loader2,
  MessageCircle,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { AdminPageHeader } from "@/components/admin/AdminPrimitives";
import { api } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────

type SessionStatus = "BOT_HANDLING" | "STAFF_REQUESTED" | "STAFF_HANDLING" | "CLOSED";
type MessageSender = "USER" | "BOT" | "STAFF" | "SYSTEM";

interface ChatUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  sender: MessageSender;
  content: string;
  createdAt: string;
}

interface ChatSession {
  id: string;
  status: SessionStatus;
  userId?: string;
  guestId?: string;
  staffId?: string;
  createdAt: string;
  updatedAt: string;
  user?: ChatUser;
  messages?: ChatMessage[];
}

interface ApiList<T> {
  data: T[];
  meta: { total: number; page: number; limit: number };
}

// ─── Helpers ───────────────────────────────────────────────────

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:3001";

const STATUS_LABELS: Record<SessionStatus, string> = {
  BOT_HANDLING: "Bot đang xử lý",
  STAFF_REQUESTED: "Chờ nhân viên",
  STAFF_HANDLING: "Đang tư vấn",
  CLOSED: "Đã đóng",
};

const STATUS_COLORS: Record<SessionStatus, string> = {
  BOT_HANDLING: "#6B7280",
  STAFF_REQUESTED: "#F59E0B",
  STAFF_HANDLING: "#10B981",
  CLOSED: "#9CA3AF",
};

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(iso));
}

function getDisplayName(session: ChatSession) {
  if (session.user) {
    return `${session.user.firstName} ${session.user.lastName}`.trim() || session.user.email;
  }
  return `Khách vãng lai ${session.guestId?.slice(-6) ?? ""}`;
}

// ─── Sub-components ────────────────────────────────────────────

function StaffMessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.sender === "USER";
  const isSystem = msg.sender === "SYSTEM";
  const isStaff = msg.sender === "STAFF";

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-[10px] text-[#999] bg-[#F5F5F5] rounded-full px-3 py-1 italic">
          {msg.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 mb-3 ${isStaff ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
        style={{ background: isUser ? "#6B7280" : isStaff ? "#111" : "#4B5563" }}
      >
        {isUser ? "KH" : isStaff ? "NV" : "AI"}
      </div>
      <div className={`max-w-[75%] flex flex-col gap-0.5 ${isStaff ? "items-end" : "items-start"}`}>
        <span className="text-[10px] text-[#888] px-1">
          {isUser ? "Khách hàng" : isStaff ? "Bạn (Nhân viên)" : "Trợ lý AI"} • {formatTime(msg.createdAt)}
        </span>
        <div
          className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words"
          style={{
            background: isStaff ? "#111111" : "#F3F4F6",
            color: isStaff ? "#fff" : "#111",
            borderRadius: isStaff ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          }}
        >
          <span
            dangerouslySetInnerHTML={{
              __html: msg.content
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/\n/g, "<br/>"),
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ───────────────────────────────────────

export default function AdminChatPage() {
  const { user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const selectedSessionRef = useRef<ChatSession | null>(null);

  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const [stats, setStats] = useState({ waiting: 0, active: 0, closed: 0 });
  const [filterStatus, setFilterStatus] = useState<SessionStatus | "">("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Auto scroll ────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isCustomerTyping]);

  // ── Load sessions via REST ─────────────────────────────────

  const loadSessions = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      const params = new URLSearchParams({ limit: "50" });
      if (filterStatus) params.set("status", filterStatus);
      const res = await api.get<{ data: ApiList<ChatSession> }>(`/chat/sessions?${params}`);
      setSessions(res.data.data.data);
    } catch {
      // silent
    } finally {
      setIsLoadingSessions(false);
    }
  }, [filterStatus]);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get<{ data: typeof stats }>("/chat/stats");
      setStats(res.data.data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    void loadSessions();
    void loadStats();
  }, [loadSessions, loadStats]);

  // ── Load messages for selected session ─────────────────────

  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      setIsLoadingMessages(true);
      const res = await api.get<{ data: ChatMessage[] }>(`/chat/sessions/${sessionId}/messages?limit=100`);
      setMessages(res.data.data);
    } catch {
      // silent
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const selectSession = useCallback((session: ChatSession) => {
    setSelectedSession(session);
    setInput("");
    void loadMessages(session.id);
  }, [loadMessages]);

  const handleAcceptSession = () => {
    if (!selectedSession || !socketRef.current || !user?.id) return;
    socketRef.current.emit("staff:join_session", {
      sessionId: selectedSession.id,
      staffId: user.id,
    });
    // Optimistically update local state to avoid waiting for roundtrip to hide the button
    setSelectedSession((prev) => prev ? { ...prev, status: "STAFF_HANDLING", staffId: user.id } : null);
    setSessions((prev) =>
      prev.map((s) => (s.id === selectedSession.id ? { ...s, status: "STAFF_HANDLING", staffId: user.id } : s))
    );
  };

  // ── Socket.IO ──────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;

    const socket = io(`${SOCKET_URL}/chat`, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("staff:connect", { staffId: user.id });
    });

    // New request from a customer
    socket.on("staff:new_request", ({ session }: { session: ChatSession }) => {
      setSessions((prev) => {
        const exists = prev.find((s) => s.id === session.id);
        if (exists) {
          return prev.map((s) =>
            s.id === session.id ? { ...s, status: "STAFF_REQUESTED" } : s
          );
        }
        return [session, ...prev];
      });
      setStats((s) => ({ ...s, waiting: s.waiting + 1 }));
    });

    // Customer message in active session
    socket.on("staff:customer_message", ({ sessionId, message }: { sessionId: string; message: ChatMessage }) => {
      if (selectedSessionRef.current?.id === sessionId) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    // Customer typing
    socket.on("staff:customer_typing", ({ sessionId, isTyping }: { sessionId: string; isTyping: boolean }) => {
      if (selectedSessionRef.current?.id === sessionId) {
        setIsCustomerTyping(isTyping);
        if (isTyping) setTimeout(() => setIsCustomerTyping(false), 3000);
      }
    });

    // Staff message echo
    socket.on("staff:message_sent", ({ sessionId, message }: { sessionId: string; message: ChatMessage }) => {
      if (selectedSessionRef.current?.id === sessionId) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    // Session assigned to someone else
    socket.on("staff:session_assigned", ({ sessionId, staffId }: { sessionId: string; staffId: string }) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, status: "STAFF_HANDLING", staffId } : s
        )
      );
      if (staffId !== user.id) {
        setStats((s) => ({ ...s, waiting: Math.max(0, s.waiting - 1), active: s.active + 1 }));
      }
    });

    // Session closed
    socket.on("staff:session_closed", ({ sessionId }: { sessionId: string }) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, status: "CLOSED" } : s
        )
      );
      if (selectedSessionRef.current?.id === sessionId) {
        setSelectedSession((s) => s ? { ...s, status: "CLOSED" } : s);
      }
      setStats((s) => ({ ...s, active: Math.max(0, s.active - 1), closed: s.closed + 1 }));
    });


    return () => {
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Send message ───────────────────────────────────────────

  const handleSend = () => {
    if (!input.trim() || !selectedSession || !socketRef.current) return;
    socketRef.current.emit("staff:send_message", {
      sessionId: selectedSession.id,
      content: input.trim(),
    });
    setInput("");
  };

  // ── Close session ──────────────────────────────────────────

  const handleClose = () => {
    if (!selectedSession || !socketRef.current) return;
    socketRef.current.emit("staff:close_session", { sessionId: selectedSession.id });
  };

  // ── Filter sessions ────────────────────────────────────────

  const filteredSessions = filterStatus
    ? sessions.filter((s) => s.status === filterStatus)
    : sessions;

  // ─── Render ────────────────────────────────────────────────

  return (
    <>
      <AdminPageHeader
        title="Hỗ trợ Chat"
        description="Quản lý và phản hồi các phiên chat tư vấn từ khách hàng theo thời gian thực."
      />

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Chờ nhân viên", value: stats.waiting, color: "#F59E0B" },
          { label: "Đang tư vấn", value: stats.active, color: "#10B981" },
          { label: "Đã đóng hôm nay", value: stats.closed, color: "#9CA3AF" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-[#E1E1E1] p-4 flex items-center gap-3"
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: stat.color }}
            />
            <div>
              <p className="text-2xl font-semibold text-[#111]">{stat.value}</p>
              <p className="text-xs text-[#777]">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main split layout */}
      <div className="flex border border-[#E1E1E1] bg-white rounded-lg overflow-hidden shadow-sm" style={{ height: "calc(100vh - 200px)", minHeight: 500 }}>

        {/* ── Left: Session list ──────────────────────────────────── */}
        <div className="w-72 flex-shrink-0 border-r border-[#E1E1E1] flex flex-col">
          {/* Filter tabs */}
          <div className="border-b border-[#E1E1E1] p-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as SessionStatus | "")}
              className="w-full text-xs border border-[#E1E1E1] px-2 py-1.5 text-[#444] bg-[#FAFAFA] focus:outline-none focus:border-[#111]"
            >
              <option value="">Tất cả phiên ({sessions.length})</option>
              <option value="STAFF_REQUESTED">Chờ nhân viên ({stats.waiting})</option>
              <option value="STAFF_HANDLING">Đang tư vấn ({stats.active})</option>
              <option value="BOT_HANDLING">Bot xử lý</option>
              <option value="CLOSED">Đã đóng</option>
            </select>
          </div>

          {/* Session items */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingSessions ? (
              <div className="flex items-center justify-center h-32 gap-2 text-xs text-[#999]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang tải...
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-xs text-[#999]">
                <MessageCircle className="w-8 h-8 mb-2 opacity-30" />
                Chưa có phiên chat
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = selectedSession?.id === session.id;
                const isWaiting = session.status === "STAFF_REQUESTED";
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => selectSession(session)}
                    className={`w-full text-left px-4 py-3 border-b border-[#F0F0F0] hover:bg-[#F7F7F7] transition-colors ${isSelected ? "bg-[#111] text-white" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-semibold truncate ${isSelected ? "text-white" : "text-[#111]"}`}>
                        {getDisplayName(session)}
                      </span>
                      {isWaiting && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-1" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{
                          background: isSelected ? "rgba(255,255,255,0.15)" : `${STATUS_COLORS[session.status]}15`,
                          color: isSelected ? "rgba(255,255,255,0.8)" : STATUS_COLORS[session.status],
                        }}
                      >
                        {STATUS_LABELS[session.status]}
                      </span>
                      <span className={`text-[10px] ${isSelected ? "text-white/50" : "text-[#999]"}`}>
                        {formatTime(session.updatedAt)}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Center: Chat window ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedSession ? (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#E1E1E1] flex-shrink-0">
                <div>
                  <p className="text-sm font-semibold text-[#111]">
                    {getDisplayName(selectedSession)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: STATUS_COLORS[selectedSession.status] }}
                    />
                    <span className="text-xs text-[#777]">
                      {STATUS_LABELS[selectedSession.status]}
                    </span>
                  </div>
                </div>
                {selectedSession.status === "STAFF_HANDLING" && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex items-center gap-1.5 text-xs text-[#666] border border-[#DDDDD] px-3 py-1.5 hover:border-[#111] hover:text-[#111] transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Kết thúc phiên
                  </button>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 bg-[#FAFAFA]">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full gap-2 text-sm text-[#999]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tải tin nhắn...
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <StaffMessageBubble key={msg.id} msg={msg} />
                    ))}
                    {isCustomerTyping && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-[#6B7280] flex items-center justify-center flex-shrink-0">
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
                        <span className="text-[11px] text-[#999] italic">Khách đang gõ...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div className="flex-shrink-0 p-4 border-t border-[#E1E1E1] bg-white">
                {selectedSession.status === "CLOSED" ? (
                  <p className="text-center text-xs text-[#999] py-2">Phiên chat đã đóng</p>
                ) : selectedSession.status === "STAFF_REQUESTED" ? (
                  <button
                    type="button"
                    onClick={handleAcceptSession}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#111] text-white text-sm font-medium hover:bg-[#333] transition-colors rounded-lg"
                  >
                    <UserRound className="w-4 h-4" />
                    Tiếp nhận phiên tư vấn này
                  </button>
                ) : (
                  <div className="flex items-end gap-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Nhập tin nhắn phản hồi khách... (Enter để gửi)"
                      rows={2}
                      className="flex-1 resize-none text-sm border border-[#E0E0E0] px-3 py-2.5 outline-none focus:border-[#111] transition-colors placeholder:text-[#BBBBBB] max-h-28 overflow-y-auto"
                    />
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="flex-shrink-0 w-10 h-10 bg-[#111] text-white flex items-center justify-center hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Gửi"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#999]">
              <MessageCircle className="w-12 h-12 opacity-20" />
              <p className="text-sm">Chọn một phiên chat để bắt đầu</p>
            </div>
          )}
        </div>

        {/* ── Right: Customer info ────────────────────────────────── */}
        {selectedSession && (
          <div className="w-60 flex-shrink-0 border-l border-[#E1E1E1] p-4 overflow-y-auto">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-3">
              Thông tin khách
            </p>
            {selectedSession.user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#F0F0F0] flex items-center justify-center text-sm font-semibold text-[#444]">
                    {selectedSession.user.firstName?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111]">
                      {selectedSession.user.firstName} {selectedSession.user.lastName}
                    </p>
                    <p className="text-[11px] text-[#777]">Khách hàng</p>
                  </div>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-[#F0F0F0]">
                  <div>
                    <p className="text-[10px] text-[#999]">Email</p>
                    <p className="text-xs text-[#333] break-all">{selectedSession.user.email}</p>
                  </div>
                  {selectedSession.user.phone && (
                    <div>
                      <p className="text-[10px] text-[#999]">Điện thoại</p>
                      <p className="text-xs text-[#333]">{selectedSession.user.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[#999]">
                <UserRound className="w-4 h-4" />
                <p className="text-xs">Khách vãng lai</p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-[#F0F0F0]">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#999] mb-2">
                Phiên chat
              </p>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#999]">Bắt đầu</span>
                  <span className="text-[11px] text-[#444]">{formatTime(selectedSession.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-[#999]">Cập nhật</span>
                  <span className="text-[11px] text-[#444]">{formatTime(selectedSession.updatedAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-[#999]">Trạng thái</span>
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `${STATUS_COLORS[selectedSession.status]}15`,
                      color: STATUS_COLORS[selectedSession.status],
                    }}
                  >
                    {STATUS_LABELS[selectedSession.status]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
