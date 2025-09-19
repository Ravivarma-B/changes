import useSWR from "swr";
import { useConfig } from "@/contexts/ConfigContext";
import { post } from "web-utils-common";

type DashboardCounts = {
  departmentCount: number;
  positionCount: number;
  roleCount: number;
  userCount: number;
  groupCount: number;
  workflowCount: number;
  entityTypeCount: number;
  documentTypeCount: number;
  segmentTypeCount: number;
  lookupTypeCount: number;
};

export function useDashboard() {
  const config = useConfig();

  const url = "/api/admin/lookups/dashboard-counts";
  const payload = {
    limit: config.DASHBOARD_COUNT_LIMIT,
    countDepartments: true,
    countPositions: true,
    countRoles: true,
    countUsers: true,
    countGroups: true,
    countWorkflows: true,
    countEntityTypes: true,
    countDocumentTypes: true,
    countSegmentTypes: true,
    countLookupTypes: true,
  };

  const { data, error, isLoading, mutate } = useSWR([url, payload], ([url, body]) => post<DashboardCounts>(url, body));

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}
