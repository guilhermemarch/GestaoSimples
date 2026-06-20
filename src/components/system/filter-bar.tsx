"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FilterSelect = {
  id: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

export type DateRangeFilter = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

type Props = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  selects?: FilterSelect[];
  dateRange?: DateRangeFilter;
  onClear?: () => void;
  showFilterButton?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  selects = [],
  dateRange,
  onClear,
  showFilterButton,
  className,
  children,
}: Props) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-3 shadow-card", className)}>
      <div className="flex flex-wrap items-center gap-2.5">
        {onSearchChange !== undefined && (
          <div className="min-w-[140px] flex-1 sm:min-w-[200px]">
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9"
            />
          </div>
        )}
        {dateRange && (
          <>
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => dateRange.onFromChange(e.target.value)}
              className="h-9 w-full sm:w-[140px]"
            />
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => dateRange.onToChange(e.target.value)}
              className="h-9 w-full sm:w-[140px]"
            />
          </>
        )}
        {selects.map((sel) => (
          <Select key={sel.id} value={sel.value} onValueChange={sel.onChange}>
            <SelectTrigger className="h-9 w-full sm:w-[160px]">
              <SelectValue placeholder={sel.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {sel.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {children}
        {showFilterButton && (
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        )}
        {onClear && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-9 text-muted-foreground">
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
