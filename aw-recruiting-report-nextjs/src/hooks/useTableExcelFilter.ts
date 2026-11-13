import { useState, useMemo, useCallback } from "react";

export interface TableSortConfig {
  key: string;
  direction: "asc" | "desc";
}

export interface DistinctValueOption {
  value: string;
  label: string;
  count: number;
}

export interface UseTableExcelFilterOptions<T> {
  customExtractors?: Record<string, (item: T) => any>;
  defaultSort?: TableSortConfig;
}

export const EMPTY_VALUE_KEY = "__EMPTY__";

export function useTableExcelFilter<T>(
  data: T[],
  options?: UseTableExcelFilterOptions<T>
) {
  const { customExtractors, defaultSort } = options || {};

  // filters map: columnKey -> Set of allowed string values.
  // If null or undefined, column has no filter applied.
  const [filters, setFilters] = useState<Record<string, Set<string> | null>>({});
  const [sortConfig, setSortConfig] = useState<TableSortConfig | null>(defaultSort || null);

  // Helper to extract string value for a given row and column key
  const getValue = useCallback(
    (item: T, columnKey: string): string => {
      let raw: any;
      if (customExtractors && customExtractors[columnKey]) {
        raw = customExtractors[columnKey](item);
      } else {
        raw = (item as any)?.[columnKey];
      }

      if (raw === null || raw === undefined || raw === "" || raw === false) {
        if (typeof raw === "boolean") return "false";
        return EMPTY_VALUE_KEY;
      }
      if (typeof raw === "boolean") {
        return raw ? "true" : "false";
      }
      return String(raw).trim() || EMPTY_VALUE_KEY;
    },
    [customExtractors]
  );

  // Helper to get formatted display label for a distinct value
  const getLabel = useCallback((val: string, columnKey: string): string => {
    if (val === EMPTY_VALUE_KEY) return "(Trống)";
    if (val === "true") return "Đạt / Có / Hoàn thành";
    if (val === "false") return "Chưa / Không";
    return val;
  }, []);

  // Compute distinct values, cascading from all other active filters (Excel standard behavior)
  const getDistinctValues = useCallback(
    (columnKey: string): DistinctValueOption[] => {
      // Find rows that satisfy all OTHER active column filters
      const otherActiveFilters = Object.entries(filters).filter(
        ([key, set]) => key !== columnKey && set !== null && set !== undefined
      ) as [string, Set<string>][];

      const activeSubset = otherActiveFilters.length === 0
        ? data
        : data.filter((item) => {
            for (const [colKey, allowedSet] of otherActiveFilters) {
              const itemVal = getValue(item, colKey);
              if (!allowedSet.has(itemVal)) return false;
            }
            return true;
          });

      // Tally counts in active subset
      const counts = new Map<string, number>();
      for (const item of activeSubset) {
        const val = getValue(item, columnKey);
        counts.set(val, (counts.get(val) || 0) + 1);
      }

      // Also ensure values already selected in this column are present even if count is 0
      const currentSelected = filters[columnKey];
      if (currentSelected) {
        currentSelected.forEach((val) => {
          if (!counts.has(val)) {
            counts.set(val, 0);
          }
        });
      }

      // If activeSubset is empty, fallback to entire dataset so filter list isn't completely empty
      if (counts.size === 0) {
        for (const item of data) {
          const val = getValue(item, columnKey);
          counts.set(val, 0);
        }
      }

      const options: DistinctValueOption[] = [];
      counts.forEach((count, val) => {
        options.push({
          value: val,
          label: getLabel(val, columnKey),
          count,
        });
      });

      // Sort distinct values descending (giảm dần Z -> A, số lớn -> bé, ngày mới nhất lên đầu), with (Trống) at the bottom
      return options.sort((a, b) => {
        if (a.value === EMPTY_VALUE_KEY) return 1;
        if (b.value === EMPTY_VALUE_KEY) return -1;
        return b.label.localeCompare(a.label, "vi", { numeric: true });
      });
    },
    [data, filters, getValue, getLabel]
  );

  // Filter and sort the dataset
  const filteredData = useMemo(() => {
    let result = [...data];

    // 1. Apply column filters
    const activeFilterEntries = Object.entries(filters).filter(
      ([_, set]) => set !== null && set !== undefined
    ) as [string, Set<string>][];

    if (activeFilterEntries.length > 0) {
      result = result.filter((item) => {
        for (const [colKey, allowedSet] of activeFilterEntries) {
          const itemVal = getValue(item, colKey);
          const isAllowed =
            allowedSet instanceof Set
              ? allowedSet.has(itemVal)
              : Array.isArray(allowedSet)
              ? (allowedSet as string[]).includes(itemVal)
              : Boolean((allowedSet as any)?.has?.(itemVal));

          if (!isAllowed) {
            return false;
          }
        }
        return true;
      });
    }

    // 2. Apply sorting
    if (sortConfig) {
      const { key, direction } = sortConfig;
      result.sort((a, b) => {
        let valA: any = customExtractors?.[key] ? customExtractors[key](a) : (a as any)?.[key];
        let valB: any = customExtractors?.[key] ? customExtractors[key](b) : (b as any)?.[key];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined || valA === "") return 1;
        if (valB === null || valB === undefined || valB === "") return -1;

        // Numeric comparison if both are numbers or numeric strings
        const numA = Number(valA);
        const numB = Number(valB);
        if (!isNaN(numA) && !isNaN(numB) && typeof valA !== "boolean" && typeof valB !== "boolean") {
          return direction === "asc" ? numA - numB : numB - numA;
        }

        // Date comparison if string matches date format
        const isDateA = typeof valA === "string" && !isNaN(Date.parse(valA)) && valA.length >= 8;
        const isDateB = typeof valB === "string" && !isNaN(Date.parse(valB)) && valB.length >= 8;
        if (isDateA && isDateB) {
          const timeA = new Date(valA).getTime();
          const timeB = new Date(valB).getTime();
          return direction === "asc" ? timeA - timeB : timeB - timeA;
        }

        // String locale comparison
        const strA = String(valA);
        const strB = String(valB);
        const comp = strA.localeCompare(strB, "vi", { numeric: true });
        return direction === "asc" ? comp : -comp;
      });
    }

    return result;
  }, [data, filters, sortConfig, getValue, customExtractors]);

  // Set filter for a column
  const setFilter = useCallback((columnKey: string, values: Set<string> | string[] | null) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (!values) {
        delete next[columnKey];
      } else {
        next[columnKey] = values instanceof Set ? values : new Set(values);
      }
      return next;
    });
  }, []);

  // Set sort
  const setSort = useCallback((columnKey: string, direction: "asc" | "desc" | null) => {
    if (!direction) {
      setSortConfig(null);
    } else {
      setSortConfig({ key: columnKey, direction });
    }
  }, []);

  // Reset a specific column's filter
  const resetFilter = useCallback((columnKey: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[columnKey];
      return next;
    });
  }, []);

  // Reset all filters and sort
  const resetAllFilters = useCallback(() => {
    setFilters({});
    setSortConfig(null);
  }, []);

  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).length;
  }, [filters]);

  const isFiltered = activeFilterCount > 0 || sortConfig !== null;

  return {
    filteredData,
    filters,
    sortConfig,
    getDistinctValues,
    setFilter,
    setSort,
    resetFilter,
    resetAllFilters,
    isFiltered,
    activeFilterCount,
  };
}
