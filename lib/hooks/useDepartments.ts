import { Sorting } from "@/components/shared/interface/Sorting";
import { useCallback } from "react";
import useSWR, { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import { Department } from "../validators/departmentSchema";
import { fetcher } from "web-utils-common";
import { Paginated } from "@/lib/validators/paginatedSchema";

export function useDepartments(pageNumber = 0, pageSize = 10) {
  const url = `/api/admin/departments?pageSize=${pageSize}&pageNumber=${pageNumber}`;
  const { data, error, isLoading, mutate } = useSWR<Paginated<Department>>(url, fetcher);

  return {
    departments: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function usePaginatedDepartments(searchTerm?: string, batchSize = 1000, sorting?: Sorting) {
  const getKey = (batchIndex: number, previous: Paginated<Department> | null) => {
    if (previous && previous.data.length === 0) return null;

    let url = `/api/admin/departments?pageSize=${batchSize}&pageNumber=${batchIndex}`;

    if (sorting) {
      url += `&SortKey=${sorting.sortKey}&SortDirection=${sorting.sortDirection}`;
    }

    if (searchTerm && searchTerm.length >= 3) {
      url += `&Filter.NameLike=${searchTerm}`;
    }

    return url;
  };

  const { data: pages, error, size, setSize, mutate } = useSWRInfinite<Paginated<Department>>(getKey, fetcher, {});
  const allDepartments = pages ? pages.flatMap((p) => p.data) : [];

  const lastBatch = pages ? pages[pages.length - 1] : null;
  const hasMore = lastBatch ? lastBatch.data.length === batchSize : true;

  return {
    departments: allDepartments,
    isLoading: !error && !pages,
    isError: !!error,
    batchCount: size,
    loadNextBatch: () => setSize(size + 1),
    hasMore,
    mutate,
  };
}

export function useDepartment(departmentId: string) {
  const { data, error, isLoading, mutate } = useSWR<Department>(`/api/admin/departments/${departmentId}`, fetcher);

  return {
    department: data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useSaveDepartment() {
  const { mutate: globalMutate } = useSWRConfig();

  const saveDepartment = useCallback(
    async (payload: Partial<Department> & { id?: number }) => {
      console.log("🚀 ~ useSaveDepartment ~ payload:", payload);
      const isCreate = !payload.id;
      console.log("🚀 ~ useSaveDepartment ~ isCreate:", isCreate);

      const url = "/api/admin/departments";
      console.log("🚀 ~ useSaveDepartment ~ url:", url);
      console.log("🚀 ~ useSaveDepartment ~ JSON.stringify(payload):", JSON.stringify(payload));
      const res = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("🚀 ~ useSaveDepartment ~ res:", res);

      console.log("🚀 ~ useSaveDepartment ~ res.ok:", res.ok);
      if (!res.ok) {
        throw new Error("Failed to save department");
      }

      const saved = isCreate ? ((await res.json()) as Department) : ({} as Department);

      globalMutate((key) => typeof key === "string" && key.includes("/department"));

      return saved;
    },
    [globalMutate]
  );

  return { saveDepartment };
}

export function useDeleteDepartment() {
  const { mutate: globalMutate } = useSWRConfig();

  const deleteDepartment = useCallback(
    async (id: number, code: string) => {
      const url = `/api/admin/departments/${id}?code=${code}`;

      const res = await fetch(url, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete department");
      }

      globalMutate((key) => typeof key === "string" && key.includes("/departments"));

      return true;
    },
    [globalMutate]
  );

  return { deleteDepartment };
}
