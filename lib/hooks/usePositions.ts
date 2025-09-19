import { useCallback } from "react";
import { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "web-utils-common";
import { Paginated } from "../validators/paginatedSchema";
import { Position } from "../validators/positionSchema";

import { Sorting } from "@/components/shared/interface/Sorting";

export function usePaginatedPositions(searchTerm?: string, batchSize = 1000, sorting?: Sorting) {
  const getKey = (batchIndex: number, previous: Paginated<Position> | null) => {
    if (previous && previous.data.length === 0) return null;
    let url = `/api/admin/positions?pageSize=${batchSize}&pageNumber=${batchIndex}`;
    if (sorting) {
      url += `&SortKey=${sorting.sortKey}&SortDirection=${sorting.sortDirection}`;
    }
    if (searchTerm && searchTerm.length >= 3) {
      url += `&Filter.NameLike=${searchTerm}`;
    }
    return url;
  };

  const { data: pages, error, size, setSize, mutate } = useSWRInfinite<Paginated<Position>>(getKey, fetcher, {});
  const allPositions = pages ? pages.flatMap((p) => p.data) : [];

  const lastBatch = pages ? pages[pages.length - 1] : null;
  const hasMore = lastBatch ? lastBatch.data.length === batchSize : true;

  return {
    positions: allPositions,
    isLoading: !error && !pages,
    isError: !!error,
    batchCount: size,
    loadNextBatch: () => setSize(size + 1),
    hasMore,
    mutate,
  };
}

export function useSavePosition() {
  const { mutate: globalMutate } = useSWRConfig();

  const savePosition = useCallback(
    async (payload: Partial<Position> & { id?: number }) => {
      console.log("🚀 ~ useSavePosition ~ payload:", payload);
      const isCreate = !payload.id;
      console.log("🚀 ~ useSavePosition ~ isCreate:", isCreate);

      const url = "/api/admin/positions";
      console.log("🚀 ~ useSavePosition ~ url:", url);
      console.log("🚀 ~ useSavePosition ~ JSON.stringify(payload):", JSON.stringify(payload));
      const res = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("🚀 ~ useSavePosition ~ res:", res);

      console.log("🚀 ~ useSavePosition ~ res.ok:", res.ok);
      if (!res.ok) {
        throw new Error("Failed to save position");
      }

      const saved = isCreate ? ((await res.json()) as Position) : ({} as Position);

      globalMutate((key) => typeof key === "string" && key.includes("/positions"));

      return saved;
    },
    [globalMutate]
  );

  return { savePosition };
}

export function useDeletePosition() {
  const { mutate: globalMutate } = useSWRConfig();

  const deletePosition = useCallback(
    async (id: number, departmentId: string) => {
      const url = `/api/admin/positions/${id}?departmentId=${departmentId}`;

      const res = await fetch(url, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete position");
      }

      globalMutate((key) => typeof key === "string" && key.includes("/positions"));
      return true;
    },
    [globalMutate]
  );

  return { deletePosition };
}
