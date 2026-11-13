"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  ListFilter,
  ArrowUpAZ,
  ArrowDownZA,
  Search,
  Check,
  CheckSquare,
  Square,
  RotateCcw,
  X,
  ChevronDown,
} from "lucide-react";
import { DistinctValueOption, EMPTY_VALUE_KEY } from "@/hooks/useTableExcelFilter";

export interface ExcelColumnFilterProps {
  title: string;
  columnKey: string;
  distinctValues: DistinctValueOption[];
  selectedValues: Set<string> | null;
  onFilterChange: (values: Set<string> | null) => void;
  sortDirection?: "asc" | "desc" | null;
  onSortChange?: (direction: "asc" | "desc" | null) => void;
  align?: "left" | "center" | "right";
  className?: string;
  showSort?: boolean;
  dataType?: "text" | "number" | "date";
}

export function ExcelColumnFilter({
  title,
  columnKey,
  distinctValues,
  selectedValues,
  onFilterChange,
  sortDirection,
  onSortChange,
  align = "left",
  className = "",
  showSort = true,
  dataType = "text",
}: ExcelColumnFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Position state for portal
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Internal search inside popover
  const [searchValue, setSearchValue] = useState("");

  // Checkbox items sort order: default to "desc" (giảm dần)
  const [checkboxSortOrder, setCheckboxSortOrder] = useState<"desc" | "asc">("desc");

  // Temporary selected set while popover is open
  const [draftSelected, setDraftSelected] = useState<Set<string>>(new Set());

  // Check if this column is currently active (has filter applied)
  const isFilterActive = selectedValues !== null && selectedValues !== undefined;
  const isSortActive = Boolean(sortDirection);

  // When opening popover, calculate position and initialize draft state
  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 260;
      let left = rect.left;

      // Adjust if popup would overflow viewport on the right
      if (left + popoverWidth > window.innerWidth - 12) {
        left = window.innerWidth - popoverWidth - 12;
      }
      if (left < 12) left = 12;

      setCoords({
        top: rect.bottom + 6,
        left,
      });
    }

    // If already filtered, copy current selection; otherwise select all distinct values
    if (selectedValues) {
      setDraftSelected(new Set(selectedValues));
    } else {
      setDraftSelected(new Set(distinctValues.map((d) => d.value)));
    }
    setSearchValue("");
    setIsOpen(true);
  };

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const popoverWidth = 260;
        let left = rect.left;
        if (left + popoverWidth > window.innerWidth - 12) {
          left = window.innerWidth - popoverWidth - 12;
        }
        if (left < 12) left = 12;
        setCoords({ top: rect.bottom + 6, left });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  // Filtered distinct options based on search query, sorted by checkboxSortOrder (default descending)
  const filteredOptions = useMemo(() => {
    let opts = distinctValues;
    if (searchValue.trim()) {
      const q = searchValue.toLowerCase().trim();
      opts = opts.filter((opt) => opt.label.toLowerCase().includes(q));
    }
    return [...opts].sort((a, b) => {
      if (a.value === EMPTY_VALUE_KEY) return 1;
      if (b.value === EMPTY_VALUE_KEY) return -1;
      const comp = b.label.localeCompare(a.label, "vi", { numeric: true });
      return checkboxSortOrder === "desc" ? comp : -comp;
    });
  }, [distinctValues, searchValue, checkboxSortOrder]);

  // Are all visible options currently selected?
  const isAllSelected = useMemo(() => {
    if (filteredOptions.length === 0) return false;
    return filteredOptions.every((opt) => draftSelected.has(opt.value));
  }, [filteredOptions, draftSelected]);

  // Toggle select all
  const handleToggleSelectAll = () => {
    setDraftSelected((prev) => {
      const next = new Set(prev);
      if (isAllSelected) {
        // Uncheck all visible
        filteredOptions.forEach((opt) => next.delete(opt.value));
      } else {
        // Check all visible
        filteredOptions.forEach((opt) => next.add(opt.value));
      }
      return next;
    });
  };

  // Toggle single item
  const handleToggleOption = (value: string) => {
    setDraftSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  };

  // Apply filters
  const handleApply = () => {
    // If all distinct values are selected, it's equivalent to clearing the filter
    if (draftSelected.size === distinctValues.length) {
      onFilterChange(null);
    } else {
      onFilterChange(new Set(draftSelected));
    }
    setIsOpen(false);
  };

  // Clear this column filter
  const handleClear = () => {
    onFilterChange(null);
    setIsOpen(false);
  };

  // Sort handlers
  const handleSortAsc = () => {
    if (onSortChange) {
      onSortChange(sortDirection === "asc" ? null : "asc");
    }
    setIsOpen(false);
  };

  const handleSortDesc = () => {
    if (onSortChange) {
      onSortChange(sortDirection === "desc" ? null : "desc");
    }
    setIsOpen(false);
  };

  return (
    <div
      className={`inline-flex items-center gap-1 group/filter select-none ${
        align === "center" ? "justify-center w-full" : align === "right" ? "justify-end w-full" : "justify-start"
      } ${className}`}
    >
      <span className="truncate">{title}</span>

      {/* Filter trigger button - Borderless clean design */}
      <button
        ref={triggerRef}
        id={`filter-col-${columnKey}`}
        type="button"
        onClick={handleOpen}
        title={`Lọc dữ liệu cột: ${title}`}
        aria-label={`Lọc cột ${title}`}
        className={`relative inline-flex items-center justify-center p-1 rounded-md transition-all duration-150 focus:outline-none shrink-0 cursor-pointer ${
          isFilterActive || isSortActive
            ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold"
            : "hover:bg-slate-300/50 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        }`}
      >
        <ListFilter className={`w-3.5 h-3.5 ${isFilterActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
        
        {/* Active Indicator dot */}
        {isFilterActive && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#18181C]" />
        )}
      </button>

      {/* Floating Popover Portal */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
            className="fixed z-[70] w-64 rounded-xl border border-slate-200 dark:border-[#2e2e38] bg-white dark:bg-[#18181C] text-slate-800 dark:text-zinc-100 shadow-xl shadow-black/15 overflow-hidden text-xs animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Popover Header */}
            <div className="px-3 py-2 border-b border-slate-100 dark:border-[#26262C] bg-slate-50 dark:bg-[#131316] flex items-center justify-between">
              <span className="font-bold text-[11px] text-slate-700 dark:text-zinc-300 truncate">
                Lọc: {title}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sort Options */}
            {showSort && (
              <div className="p-1 border-b border-slate-100 dark:border-[#26262C] flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={handleSortAsc}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer ${
                    sortDirection === "asc"
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-[#222228] text-slate-700 dark:text-zinc-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ArrowUpAZ className="w-3.5 h-3.5" />
                    <span>
                      {dataType === "number"
                        ? "Sắp xếp từ bé đến lớn"
                        : dataType === "date"
                        ? "Sắp xếp cũ nhất đến mới nhất"
                        : "Sắp xếp A → Z (Tăng dần)"}
                    </span>
                  </span>
                  {sortDirection === "asc" && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>

                <button
                  type="button"
                  onClick={handleSortDesc}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors cursor-pointer ${
                    sortDirection === "desc"
                      ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-[#222228] text-slate-700 dark:text-zinc-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ArrowDownZA className="w-3.5 h-3.5" />
                    <span>
                      {dataType === "number"
                        ? "Sắp xếp từ lớn đến bé"
                        : dataType === "date"
                        ? "Sắp xếp mới nhất đến cũ nhất"
                        : "Sắp xếp Z → A (Giảm dần)"}
                    </span>
                  </span>
                  {sortDirection === "desc" && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>
              </div>
            )}

            {/* Search within filter */}
            <div className="p-2 border-b border-slate-100 dark:border-[#26262C]">
              <div className="relative">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (filteredOptions.length > 0) {
                        const newSet = new Set(filteredOptions.map((o) => o.value));
                        onFilterChange(newSet);
                        setIsOpen(false);
                      }
                    }
                  }}
                  placeholder="Tìm giá trị (Enter để chọn)..."
                  className="w-full h-7 rounded-md bg-slate-50 dark:bg-[#131316] border border-slate-200 dark:border-[#26262C] pl-6 pr-6 text-[11px] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                {searchValue && (
                  <button
                    type="button"
                    onClick={() => setSearchValue("")}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Values Checkbox List */}
            <div className="p-1">
              {/* Select All Checkbox with Sort Toggle */}
              <div className="flex items-center justify-between px-1 py-0.5">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="flex items-center gap-2 px-1 py-1 rounded text-left hover:bg-slate-100 dark:hover:bg-[#222228] font-semibold text-[11px] text-slate-800 dark:text-zinc-200 cursor-pointer flex-1"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                  )}
                  <span>(Chọn tất cả)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCheckboxSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#222228] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  title={checkboxSortOrder === "desc" ? "Đang sắp xếp giảm dần. Bấm để đổi sang tăng dần" : "Đang sắp xếp tăng dần. Bấm để đổi sang giảm dần"}
                >
                  {checkboxSortOrder === "desc" ? (
                    <>
                      <ArrowDownZA className="w-3 h-3 text-rose-500" />
                      <span>Giảm dần</span>
                    </>
                  ) : (
                    <>
                      <ArrowUpAZ className="w-3 h-3 text-indigo-500" />
                      <span>Tăng dần</span>
                    </>
                  )}
                </button>
              </div>

              {/* Scrollable list */}
              <div className="max-h-44 overflow-y-auto custom-scrollbar mt-0.5 space-y-0.5">
                {filteredOptions.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 dark:text-zinc-500 text-[11px]">
                    Không có giá trị phù hợp
                  </div>
                ) : (
                  filteredOptions.map((opt) => {
                    const isChecked = draftSelected.has(opt.value);
                    return (
                      <div
                        key={opt.value}
                        className="group/item flex items-center justify-between px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-[#222228] text-[11px] text-slate-700 dark:text-zinc-300"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleOption(opt.value)}
                          className="flex items-center gap-2 truncate flex-1 text-left cursor-pointer"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                          )}
                          <span className="truncate">{opt.label}</span>
                        </button>

                        <div className="flex items-center gap-1.5 ml-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDraftSelected(new Set([opt.value]));
                            }}
                            className="hidden group-hover/item:inline-block text-[10px] text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
                            title={`Chỉ chọn "${opt.label}"`}
                          >
                            Chỉ chọn
                          </button>
                          <span className="text-[10px] text-slate-400 dark:text-zinc-500 tabular-nums">
                            ({opt.count})
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-2 py-1.5 border-t border-slate-100 dark:border-[#26262C] bg-slate-50 dark:bg-[#131316] flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={handleClear}
                disabled={!isFilterActive}
                className={`px-2 py-1 rounded text-[10px] font-bold inline-flex items-center gap-1 transition-colors ${
                  isFilterActive
                    ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    : "text-slate-300 dark:text-zinc-600 cursor-not-allowed"
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xóa lọc</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 rounded text-[10px] font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-[#222228] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-3 py-1 rounded text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 shadow-xs transition-colors"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
