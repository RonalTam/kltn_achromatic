import { ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (item: T) => ReactNode;
  className?: string;
  sticky?: "right";
}

function columnClassName<T>(column: DataTableColumn<T>) {
  return [
    column.className,
    column.sticky === "right" ? "admin-table-sticky-right" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function DataTable<T>({
  rows,
  columns,
  getRowKey,
  emptyTitle = "Chưa có dữ liệu",
  emptyDescription = "Dữ liệu sẽ xuất hiện tại đây khi có bản ghi.",
}: {
  rows: T[];
  columns: Array<DataTableColumn<T>>;
  getRowKey: (item: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return (
    <div className="overflow-x-auto border border-[#E1E1E1] bg-white">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={columnClassName(column)}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((item) => (
            <tr key={getRowKey(item)}>
              {columns.map((column) => (
                <td key={column.key} className={columnClassName(column)}>{column.cell(item)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="px-6 py-14 text-center">
          <p className="font-heading text-xl font-light text-[#111111]">{emptyTitle}</p>
          <p className="mt-1 text-sm text-[#777777]">{emptyDescription}</p>
        </div>
      )}
    </div>
  );
}
