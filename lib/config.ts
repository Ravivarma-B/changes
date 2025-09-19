import {_parseNumberOrDefault} from "web-utils-common";

export type Config = {
  BASE_URL: string;
  API_ADMIN_URL: string;
  PAGINATION_BATCH_SIZE: number;
  PAGINATION_PAGE_SIZE: number;
  DASHBOARD_COUNT_LIMIT: number;
};

export const config: Config = {
  BASE_URL: process.env.BASE_URL || "http://localhost:3000/admin",
  API_ADMIN_URL: process.env.API_ADMIN_URL || "https://decision-dev.int.taqniat.ae",
  PAGINATION_BATCH_SIZE: _parseNumberOrDefault(process.env.PAGINATION_BATCH_SIZE, 100),
  PAGINATION_PAGE_SIZE: _parseNumberOrDefault(process.env.PAGINATION_PAGE_SIZE, 10),
  DASHBOARD_COUNT_LIMIT: _parseNumberOrDefault(process.env.DASHBOARD_COUNT_LIMIT, 1000),
};
