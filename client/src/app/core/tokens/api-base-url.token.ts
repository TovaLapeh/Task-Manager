import { InjectionToken } from "@angular/core";

/**
 * DI token for the API base URL so it can be swapped per-environment (or in
 * tests) without hardcoding the value inside TaskService.
 */
export const API_BASE_URL = new InjectionToken<string>("API_BASE_URL");
