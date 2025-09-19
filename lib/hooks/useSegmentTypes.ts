import { toKebabCase } from "@/utils/stringUtils";
import { useCallback } from "react";
import { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "web-utils-common";
import { Paginated } from "../validators/paginatedSchema";
import { SegmentType } from "../validators/segmentTypeSchema";

import { Sorting } from "@/components/shared/interface/Sorting";

export function usePaginatedSegmentTypes(searchTerm?: string, batchSize = 1000, sorting?: Sorting) {
  const getKey = (batchIndex: number, previous: Paginated<SegmentType> | null) => {
    if (previous && previous.data.length === 0) return null;
    let url = `/api/admin/segment-types?pageSize=${batchSize}&pageNumber=${batchIndex}`;
    if (sorting) {
      url += `&SortKey=${sorting.sortKey}&SortDirection=${sorting.sortDirection}`;
    }
    if (searchTerm && searchTerm.length >= 3) {
      url += `&Filter.NameLike=${searchTerm}`;
    }
    return url;
  };

  const { data: pages, error, size, setSize, mutate } = useSWRInfinite<Paginated<SegmentType>>(getKey, fetcher, {});
  const allSegmentTypes = pages ? pages.flatMap((p) => p.data) : [];

  const lastBatch = pages ? pages[pages.length - 1] : null;
  const hasMore = lastBatch ? lastBatch.data.length === batchSize : true;

  return {
    segmentTypes: allSegmentTypes,
    isLoading: !error && !pages,
    isError: !!error,
    batchCount: size,
    loadNextBatch: () => setSize(size + 1),
    hasMore,
    mutate,
  };
}

export function useSaveSegmentType() {
  const { mutate: globalMutate } = useSWRConfig();

  const saveSegmentType = useCallback(
    async (payload: Partial<SegmentType> & { id?: string }) => {
      const isCreate = !payload.id;

      payload.fields = payload.fields || [{ Test: "test" }]; //todo : implement fields logic

      payload.id = isCreate ? toKebabCase(payload.name || "new-segment-type") : payload.id;

      console.log("🚀 ~ useSaveSegmentType ~ payload:", payload);
      console.log("🚀 ~ useSaveSegmentType ~ isCreate:", isCreate);

      const url = "/api/admin/segment-types";
      console.log("🚀 ~ useSaveSegmentType ~ url:", url);
      console.log("🚀 ~ useSaveSegmentType ~ JSON.stringify(payload):", JSON.stringify(payload));
      const res = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("🚀 ~ useSaveSegmentType ~ res:", res);

      console.log("🚀 ~ useSaveSegmentType ~ res.ok:", res.ok);
      if (!res.ok) {
        throw new Error("Failed to save segment type");
      }

      const id = await res.text();
      console.log("🚀 ~ useSaveSegmentType ~ await res.text():", id);

      const saved: SegmentType = isCreate ? { ...(payload as SegmentType), id } : ({} as SegmentType);

      globalMutate((key) => typeof key === "string" && key.includes("/segment-types"));

      return saved;
    },
    [globalMutate]
  );

  return { saveSegmentType };
}

export function useDeleteSegmentType() {
  const deleteSegmentType = useCallback(async (id: string) => {
    const url = `/api/admin/segment-types/${id}`;

    const res = await fetch(url, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete segment type");
    }

    return true;
  }, []);

  return { deleteSegmentType };
}
