import { apiFetch } from "./api";

export type AvailabilityBlock = { time: string; totalMinutes: number };

export type AvailabilityResponse = {
  date: string;
  blocks: AvailabilityBlock[];
};

export function getAvailability(date: string) {
  return apiFetch(`/availability?date=${encodeURIComponent(date)}`) as Promise<AvailabilityResponse>;
}
