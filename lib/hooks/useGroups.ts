import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "web-utils-common";
import { Group } from "../validators/groupSchema";
import { Paginated } from "../validators/paginatedSchema";

import { Sorting } from "@/components/shared/interface/Sorting";

export function usePaginatedGroups(batchSize = 1000, searchTerm?: string, sorting?: Sorting) {
  const getKey = (batchIndex: number, previous: Paginated<Group> | null) => {
    if (previous && previous.data.length === 0) return null;
    let url = `/api/admin/groups?pageSize=${batchSize}&pageNumber=${batchIndex}`;
    if (sorting) {
      url += `&SortKey=${sorting.sortKey}&SortDirection=${sorting.sortDirection}`;
    }
    if (searchTerm && searchTerm.length >= 3) {
      url += `&Filter.NameLike=${searchTerm}`;
    }
    return url;
  };

  const {
    data: pages,
    error,
    size,
    setSize,
    mutate,
  } = useSWRInfinite<Paginated<Group>>(getKey, fetcher, {
    revalidateFirstPage: false,
  });
  const allGroups = pages ? pages.flatMap((p) => p.data) : [];

  const lastBatch = pages ? pages[pages.length - 1] : null;
  const hasMore = lastBatch ? lastBatch.data.length === batchSize : true;

  return {
    groups: allGroups,
    isLoading: !error && !pages,
    isError: !!error,
    batchCount: size,
    loadNextBatch: () => setSize(size + 1),
    hasMore,
    mutate,
  };
}

export function useGroup(groupId: string) {
  const { data, error, isLoading, mutate } = useSWR<Group>(`/api/admin/groups/${groupId}`, fetcher);

  return {
    group: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSaveGroup() {
  const { mutate: globalMutate } = useSWRConfig();

  const saveGroup = useCallback(
    async (payload: Partial<Group> & { id?: number }) => {
      const isCreate = !payload.id;
      if (!isCreate && !payload.id) {
        throw new Error("Missing id for group update");
      }
      const url = `/api/admin/groups`;

      const res = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error("Failed to save group, status:", res.status, "body:", errorBody);
        throw new Error(`Failed to save group: ${res.status} ${res.statusText}`);
      }

      const saved = isCreate ? ((await res.json()) as Group) : ({} as Group);

      globalMutate((key) => typeof key === "string" && key.includes("/groups"));
      return saved;
    },
    [globalMutate]
  );
  return { saveGroup };
}

export function useDeleteGroup() {
  const { mutate: globalMutate } = useSWRConfig();

  const deleteGroup = useCallback(
    async (id: number) => {
      const url = `/api/admin/groups/${id}`;

      const res = await fetch(url, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete group");
      }

      globalMutate((key) => typeof key === "string" && key.includes("/groups"));

      return true;
    },
    [globalMutate]
  );

  return { deleteGroup };
}
