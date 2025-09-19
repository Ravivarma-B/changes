import { useCallback } from "react";
import useSWR from "swr";
import { fetcher } from "web-utils-common";
import { UserGroup } from "../validators/userGroupSchema";

export function useUserGroup(departmentId: string) {
  const { data, error, isLoading, mutate } = useSWR<UserGroup[]>(`/api/admin/departments/${departmentId}/user-groups`, fetcher);

  return {
    userGroups: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUserGroups() {
  const { data, error, isLoading, mutate } = useSWR<UserGroup[]>("/api/admin/departments/user-groups", fetcher);

  return {
    userGroups: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useDeleteUserGroup() {
  const deleteUserGroup = useCallback(async (id: number) => {
    const url = `/api/admin/user-groups/${id}`;

    const res = await fetch(url, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete user group");
    }

    return true;
  }, []);

  return { deleteUserGroup };
}
