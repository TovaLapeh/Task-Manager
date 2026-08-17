import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { App } from "./app";
import { DEFAULT_LANGUAGE, TRANSLATIONS } from "./core/i18n/translations";
import { API_BASE_URL } from "./core/tokens/api-base-url.token";

describe("App", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: "http://localhost:3000" }],
    }).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // Asserted against the dictionary rather than a literal, so the test stays
  // valid if the default language changes.
  it("should render the heading in the default language", () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector("h1")?.textContent).toContain(TRANSLATIONS[DEFAULT_LANGUAGE].app.title);
  });
});
