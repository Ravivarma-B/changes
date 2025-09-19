import { Sorting } from "@/components/shared/interface/Sorting";
import { fetcher } from "web-utils-common";
import { useCallback } from "react";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { Paginated } from "../validators/paginatedSchema";
import { User } from "../validators/userSchema";

export function usePaginatedUsers(
  searchTerm?: string,
  batchSize = 1000,
  sorting?: Sorting
) {
  const getKey = (batchIndex: number, previous: Paginated<User> | null) => {
    if (previous && previous.data.length === 0) return null;
    let url = `/api/admin/users?pageSize=${batchSize}&pageNumber=${batchIndex}&SortKey=name`;

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
  } = useSWRInfinite<Paginated<User>>(getKey, fetcher, {
    revalidateFirstPage: false,
  });

  const allUsers = pages ? pages.flatMap((p) => p.data) : [];
  const lastBatch = pages ? pages[pages.length - 1] : null;
  const hasMore = lastBatch ? lastBatch.data.length === batchSize : true;

  return {
    users: allUsers,
    isLoading: !error && !pages,
    isError: !!error,
    batchCount: size,
    loadNextBatch: () => setSize(size + 1),
    hasMore,
    mutate,
  };
}
export function useUsers(pageNumber = 0, pageSize = 10) {
  const url = `/api/admin/users?pageSize=${pageSize}&pageNumber=${pageNumber}`;
  const { data, error, isLoading, mutate } = useSWR<Paginated<User>>(
    url,
    fetcher
  );

  return {
    users: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// To get single department by ID
export function useUser(userId: string) {
  const { data, error, isLoading, mutate } = useSWR<User>(
    `/api/admin/users/${userId}`,
    fetcher
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useDeleteUser() {
  const deleteUser = useCallback(async (id: number) => {
    const url = `/api/admin/users/${id}`;

    const res = await fetch(url, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete user");
    }

    return true;
  }, []);

  return { deleteUser };
}
