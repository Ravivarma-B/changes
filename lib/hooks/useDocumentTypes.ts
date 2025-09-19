import { toKebabCase } from "@/utils/stringUtils";
import { useCallback } from "react";
import { useSWRConfig } from "swr";
import useSWRInfinite from "swr/infinite";
import { fetcher } from "web-utils-common";
import { DocumentType } from "../validators/documentTypeSchema";
import { Paginated } from "../validators/paginatedSchema";

import { Sorting } from "@/components/shared/interface/Sorting";

export function usePaginatedDocumentTypes(searchTerm?: string, batchSize = 1000, sorting?: Sorting) {
  const getKey = (batchIndex: number, previous: Paginated<DocumentType> | null) => {
    if (previous && previous.data.length === 0) return null;
    let url = `/api/admin/document-types?pageSize=${batchSize}&pageNumber=${batchIndex}`;
    if (sorting) {
      url += `&SortKey=${sorting.sortKey}&SortDirection=${sorting.sortDirection}`;
    }
    if (searchTerm && searchTerm.length >= 3) {
      url += `&Filter.NameLike=${searchTerm}`;
    }
    return url;
  };

  const { data: pages, error, size, setSize, mutate } = useSWRInfinite<Paginated<DocumentType>>(getKey, fetcher);

  const allDocumentTypes = pages ? pages.flatMap((p) => p.data) : [];

  const lastBatch = pages ? pages[pages.length - 1] : null;
  const hasMore = lastBatch ? lastBatch.data.length === batchSize : true;

  return {
    documentTypes: allDocumentTypes,
    isLoading: !error && !pages,
    isError: !!error,
    batchCount: size,
    loadNextBatch: () => setSize(size + 1),
    hasMore,
    mutate,
  };
}

export function useSaveDocumentType() {
  const { mutate: globalMutate } = useSWRConfig();

  const saveDocumentType = useCallback(
    async (payload: Partial<DocumentType> & { id?: string }) => {
      const isCreate = !payload.id;

      payload.workflowIds = payload.workflowIds || ["procurement-policy-q-three-update", "remote-work-policy-v-one"]; //todo : implement workflows logic
      payload.formTemplate = payload.formTemplate || [{ Test: "test" }]; //todo : implement fields logic
      payload.id = isCreate ? toKebabCase(payload.name || "new-segment-type") : payload.id;
      payload.departmentIds = payload.departmentIds || [1000002]; //todo : implement departments logic
      console.log("🚀 ~ useSaveDocumentType ~ payload:", payload);
      console.log("🚀 ~ useSaveDocumentType ~ isCreate:", isCreate);
      const url = `/api/admin/document-types`;
      console.log("🚀 ~ useSaveDocumentType ~ url:", url);
      console.log("🚀 ~ useSaveDocumentType ~ JSON.stringify(payload):", JSON.stringify(payload));
      const res = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log("🚀 ~ useSaveDocumentType ~ res:", res);

      console.log("🚀 ~ useSaveDocumentType ~ res.ok:", res.ok);

      if (!res.ok) {
        throw new Error("Failed to save document type");
      }
      const id = await res.text();
      console.log("🚀 ~ useSaveDocumentType ~ await res.text():", id);

      const saved: DocumentType = isCreate ? { ...(payload as DocumentType), id } : ({} as DocumentType);

      globalMutate((key) => typeof key === "string" && key.includes("/document-types"));

      return saved;
    },
    [globalMutate]
  );

  return { saveDocumentType };
}

export function useDeleteDocumentType() {
  const { mutate: globalMutate } = useSWRConfig();

  const deleteDocumentType = useCallback(
    async (id: string) => {
      const url = `/api/admin/document-types/${id}`;

      const res = await fetch(url, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete document type");
      }

      globalMutate((key) => typeof key === "string" && key.includes("/document-types"));

      return true;
    },
    [globalMutate]
  );

  return { deleteDocumentType };
}
