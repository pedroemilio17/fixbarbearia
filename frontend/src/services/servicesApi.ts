import { apiFetch } from "./api";

export function getServices() {
  return apiFetch("/services");
}
