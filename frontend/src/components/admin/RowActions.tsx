import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";

export function RowActions({
  onEdit,
  onToggle,
  onDelete,
  active,
}: {
  onEdit?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  active?: boolean;
}) {
  return (
    <div className="flex justify-end gap-2">
      {onEdit && <button type="button" onClick={onEdit} className="admin-icon-button" aria-label="Sửa"><Pencil className="size-4" /></button>}
      {onToggle && <button type="button" onClick={onToggle} className="admin-icon-button" aria-label={active ? "Ẩn" : "Hiện"}>{active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>}
      {onDelete && <button type="button" onClick={onDelete} className="admin-icon-button" aria-label="Xóa"><Trash2 className="size-4" /></button>}
    </div>
  );
}
