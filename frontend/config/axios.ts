import axios from "axios";

/**
 * Axios client that should be used by the front end of the application.
 * This instance will talk directly to the nextjs backend.
 */
export const frontendAxios = axios.create({
  baseURL: "/api/",
  timeout: 120000,
  validateStatus: () => true,
});

/**
 * Axios client that should be used by the backend end of the application.
 * This instance will talk directly to the nextjs backend.
 */
export const v1APIAxios = axios.create({
  baseURL: process.env.V1_API_ENDPOINT,
  timeout: 120000,
  validateStatus: () => true,
});