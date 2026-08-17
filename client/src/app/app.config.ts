import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { API_BASE_URL } from "./core/tokens/api-base-url.token";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    // Same-origin: the dev server proxies /tasks to the API (see
    // proxy.config.json). This avoids a hardcoded host, so the app also works
    // in sandboxed environments such as StackBlitz, where the API is not
    // reachable at localhost from the browser.
    { provide: API_BASE_URL, useValue: "" },
  ],
};
