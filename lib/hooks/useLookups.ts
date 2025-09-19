import useSWR from "swr";
import { fetcher } from "web-utils-common";
import { LookupType } from "../validators/lookupSchema";
import { Paginated } from "../validators/paginatedSchema";

export function useLookupTypes() {
  
  const { data, error, isLoading, mutate } = useSWR<Paginated<LookupType>>(
    `/api/admin/lookups/types`,
    fetcher
  );

  return {
    lookupTypes: data || { data: [] },
    isLoading,
    isError: error,
    mutate,
  };
}

export function useLookUp<T = any>(endpoint: string) {

  const { data, error, isLoading, mutate } = useSWR<Paginated<T>>(
    `/api/admin/lookups/${endpoint}`,
    fetcher
  );

  return {
    items: data || { data: [] },
    isLoading,
    isError: error,
    mutate,
  };
}	
