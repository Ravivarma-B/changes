import { useCallback } from "react";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "web-utils-common";
import { Paginated } from "../validators/paginatedSchema";
import { Workflow } from "../validators/workflowSchema";

export function usePaginatedWorkflows(searchTerm?: string, batchSize = 1000) {
  const getKey = (batchIndex: number, previous: Paginated<Workflow> | null) => {
    if (previous && previous.data.length === 0) return null;
    let url = `/api/admin/workflow-definitions?pageSize=${batchSize}&pageNumber=${batchIndex}&SortKey=name`;
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
  } = useSWRInfinite<Paginated<Workflow>>(getKey, fetcher, {
    revalidateFirstPage: false,
  });
  const allWorkflows = pages ? pages.flatMap((p) => p.data) : [];

  const lastBatch = pages ? pages[pages.length - 1] : null;
  const hasMore = lastBatch ? lastBatch.data.length === batchSize : true;

  return {
    workflows: allWorkflows,
    isLoading: !error && !pages,
    isError: !!error,
    batchCount: size,
    loadNextBatch: () => setSize(size + 1),
    hasMore,
    mutate,
  };
}

export function useDeleteWorkflow() {
  const deleteWorkflow = useCallback(async (id: number) => {
    const url = `/api/admin/workflows/${id}`;

    const res = await fetch(url, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Failed to delete workflow");
    }

    return true;
  }, []);

  return { deleteWorkflow };
}
