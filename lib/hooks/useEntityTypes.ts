import { useCallback } from "react";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "web-utils-common";
import { EntityType } from "../validators/entityTypeSchema";
import { Paginated } from "../validators/paginatedSchema";

import { Sorting } from "@/components/shared/interface/Sorting";
import { toKebabCase } from "@/utils/stringUtils";
import { useSWRConfig } from "swr";

export function usePaginatedEntityTypes(
  searchTerm?: string,
  batchSize = 1000,
  sorting?: Sorting
) {
  const getKey = (
    batchIndex: number,
    previous: Paginated<EntityType> | null
  ) => {
    if (previous && previous.data.length === 0) return null;
    let url = `/api/admin/entity-types?pageSize=${batchSize}&pageNumber=${batchIndex}`;
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
  } = useSWRInfinite<Paginated<EntityType>>(getKey, fetcher, {
    revalidateFirstPage: false,
  });
  const allEntityTypes = pages ? pages.flatMap((p) => p.data) : [];

  const lastBatch = pages ? pages[pages.length - 1] : null;
  const hasMore = lastBatch ? lastBatch.data.length === batchSize : true;

  return {
    entityTypes: allEntityTypes,
    isLoading: !error && !pages,
    isError: !!error,
    batchCount: size,
    loadNextBatch: () => setSize(size + 1),
    hasMore,
    mutate,
  };
}

export function useDeleteEntityType() {
  const deleteEntityType = useCallback(async (id: string) => {
    const url = `/api/admin/entity-types/${id}`;

    const res = await fetch(url, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete entity type");
    }

    return true;
  }, []);

  return { deleteEntityType };
}

export function useSaveEntityType() {
  const { mutate: globalMutate } = useSWRConfig();

  const saveEntityType = useCallback(
    async (payload: Partial<EntityType> & { id?: string }) => {
      const isCreate = !payload.id;
      payload.attributes = payload.attributes || [];
      payload.id = isCreate
        ? toKebabCase(payload.name || "new-entity-type")
        : payload.id;

      console.log("🚀 ~ useSaveEntityType ~ payload:", payload);
      console.log("🚀 ~ useSaveEntityType ~ isCreate:", isCreate);

      const url = "/api/admin/entity-types";
      console.log("🚀 ~ useSaveEntityType ~ url:", url);
      console.log(
        "🚀 ~ useSaveEntityType ~ JSON.stringify(payload):",
        JSON.stringify(payload)
      );
      const res = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("🚀 ~ useSaveEntityType ~ res:", res);

      console.log("🚀 ~ useSaveEntityType ~ res.ok:", res.ok);
      if (!res.ok) {
        throw new Error("Failed to save entity type");
      }

      const id = await res.text();
      console.log("🚀 ~ useSaveEntityType ~ await res.text():", id);

      const saved: EntityType = isCreate
        ? { ...(payload as EntityType), id }
        : ({} as EntityType);

      globalMutate(
        (key) => typeof key === "string" && key.includes("/entity-types")
      );

      return saved;
    },
    [globalMutate]
  );

  return { saveEntityType };
}
