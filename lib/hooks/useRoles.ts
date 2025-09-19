import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "web-utils-common";
import { Paginated } from "../validators/paginatedSchema";
import { Role } from "../validators/roleSchema";

export function useRoles(pageNumber = 0, pageSize = 10) {
  const url = `/api/admin/roles?pageSize=${pageSize}&pageNumber=${pageNumber}`;
  const { data, error, isLoading, mutate } = useSWR<Paginated<Role>>(url, fetcher);
  return {
    roles: data,
    isLoading,
    isError: error,
    mutate,
  };
}

import { Sorting } from "@/components/shared/interface/Sorting";

export function usePaginatedRoles(searchTerm?: string, batchSize = 1000, sorting?: Sorting) {
  const getKey = (batchIndex: number, previous: Paginated<Role> | null) => {
    if (previous && previous.data.length === 0) return null;
    let url = `/api/admin/roles?pageSize=${batchSize}&pageNumber=${batchIndex}`;
    if (sorting) {
      url += `&SortKey=${sorting.sortKey}&SortDirection=${sorting.sortDirection}`;
    }
    if (searchTerm && searchTerm.length >= 3) {
      url += `&Filter.NameLike=${searchTerm}`;
    }
    return url;
  };

  const { data: pages, error, size, setSize, mutate } = useSWRInfinite<Paginated<Role>>(getKey, fetcher);
  const allRoles = pages ? pages.flatMap((p) => p.data) : [];

  const lastBatch = pages ? pages[pages.length - 1] : null;
  const hasMore = lastBatch ? lastBatch.data.length === batchSize : true;

  return {
    roles: allRoles,
    isLoading: !error && !pages,
    isError: !!error,
    batchCount: size,
    loadNextBatch: () => setSize(size + 1),
    hasMore,
    mutate,
  };
}

export function useRole(id?: string) {
  const url = id ? `/api/admin/roles/${id}` : null;
  const { data, error, isLoading, mutate } = useSWR<Role>(url, fetcher);

  return {
    role: data,
    isLoading,
    isError: !!error,
    mutate, // convenient when you save on the same page
  };
}

export function useSaveRole() {
  const { mutate: globalMutate } = useSWRConfig();

  const saveRole = useCallback(
    async (payload: Partial<Role> & { id?: number }) => {
      payload.privilegeIds = payload.privilegeIds || ["read-invoice", "read-user", "read-purchase-order"];
      console.log("🚀 ~ useSaveRole ~ payload:", payload);
      const isCreate = !payload.id;
      console.log("🚀 ~ useSaveRole ~ isCreate:", isCreate);

      const url = "/api/admin/roles";
      console.log("🚀 ~ useSaveRole ~ url:", url);
      console.log("🚀 ~ useSaveRole ~ JSON.stringify(payload):", JSON.stringify(payload));
      const res = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("🚀 ~ useSaveRole ~ res:", res);

      console.log("🚀 ~ useSaveRole ~ res.ok:", res.ok);
      if (!res.ok) {
        throw new Error("Failed to save role");
      }

      const saved = isCreate ? ((await res.json()) as Role) : ({} as Role);

      globalMutate((key) => typeof key === "string" && key.includes("/roles"));

      return saved;
    },
    [globalMutate]
  );

  return { saveRole };
}

export function useDeleteRole() {
  const deleteRole = useCallback(async (id: number) => {
    const url = `/api/admin/roles/${id}`;

    const res = await fetch(url, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete role");
    }

    return true;
  }, []);

  return { deleteRole };
}
