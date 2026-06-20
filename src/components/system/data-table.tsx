import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  /** max-width for this column (CSS value) */
  maxWidth?: string;
  /** min-width for this column (CSS value) */
  minWidth?: string;
  /** alinhamento horizontal da celula + header */
  align?: "left" | "right" | "center";
  /** trunca o conteudo com reticencias (default: true) */
  truncate?: boolean;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  keyFn: (row: T) => string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  footerText?: string;
  className?: string;
  /** densidade da linha (default: md = 40px) */
  density?: "sm" | "md";
};

const alignClass: Record<NonNullable<Column<unknown>["align"]>, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export function DataTable<T>({
  columns,
  data,
  keyFn,
  pagination,
  footerText,
  className,
  density = "md",
}: Props<T>) {
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;
  const rowHeight = density === "sm" ? "h-9" : "h-10";

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border border-border bg-card shadow-card",
        className
      )}
    >
      <div className="min-w-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => {
                const truncate = col.truncate !== false;
                return (
                  <TableHead
                    key={col.key}
                    className={cn(
                      "h-9 whitespace-nowrap font-medium text-muted-foreground",
                      col.align && alignClass[col.align],
                      col.className,
                    )}
                    style={{
                      maxWidth: col.maxWidth,
                      minWidth: col.minWidth,
                    }}
                  >
                    {col.header}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={keyFn(row)} className={rowHeight}>
                  {columns.map((col) => {
                    const truncate = col.truncate !== false;
                    return (
                      <TableCell
                        key={col.key}
                        className={cn(
                          truncate && "truncate",
                          col.align && alignClass[col.align],
                          col.className,
                        )}
                        style={{
                          maxWidth: col.maxWidth,
                          minWidth: col.minWidth,
                        }}
                      >
                        {col.render(row)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {(pagination || footerText) && (
        <div className="flex flex-col gap-2 border-t border-border px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {footerText ??
              (pagination
                ? `Exibindo ${(pagination.page - 1) * pagination.pageSize + 1} a ${Math.min(pagination.page * pagination.pageSize, pagination.total)} de ${pagination.total}`
                : "")}
          </p>
          {pagination && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === pagination.page ? "default" : "outline"}
                  size="icon"
                  className={cn("h-7 w-7 text-xs", p === pagination.page && "bg-primary")}
                  onClick={() => pagination.onPageChange(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={pagination.page >= totalPages}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
