"use client";

interface QuickRepliesProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

const QUICK_REPLIES = [
  "Tư vấn size cho mình",
  "Sản phẩm mới nhất",
  "Khuyến mãi đang có",
  "Chính sách đổi trả",
];

export function QuickReplies({ onSelect, disabled }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-1.5 px-4 pb-2">
      {QUICK_REPLIES.map((text) => (
        <button
          key={text}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(text)}
          className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-[#DDDDD] bg-white text-[#333] hover:bg-[#111] hover:text-white hover:border-[#111] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {text}
        </button>
      ))}
    </div>
  );
}
