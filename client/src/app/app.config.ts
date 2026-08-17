import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { API_BASE_URL } from "./core/tokens/api-base-url.token";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    { provide: API_BASE_URL, useValue: "http://localhost:3000" },
  ],
};
