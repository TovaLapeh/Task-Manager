import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";
import { Task, TaskInput } from "../models/task.model";
import { API_BASE_URL } from "../tokens/api-base-url.token";

/**
 * Single point of contact with the REST API. Components never call
 * HttpClient directly — this keeps data access centralized and makes the
 * components trivial to test with a mocked service.
 */
@Injectable({ providedIn: "root" })
export class TaskService {
  private readonly tasksUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string,
  ) {
    this.tasksUrl = `${apiBaseUrl}/tasks`;
  }

  getAll(): Observable<Task[]> {
    return this.http.get<Task[]>(this.tasksUrl).pipe(catchError(this.handleError));
  }

  create(task: TaskInput): Observable<Task> {
    return this.http.post<Task>(this.tasksUrl, task).pipe(catchError(this.handleError));
  }

  update(id: number, task: TaskInput): Observable<Task> {
    return this.http.put<Task>(`${this.tasksUrl}/${id}`, task).pipe(catchError(this.handleError));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.tasksUrl}/${id}`).pipe(catchError(this.handleError));
  }

  /**
   * Normalizes HttpErrorResponse into a user-presentable message. Status 0
   * means the request never reached the server (connection refused, offline,
   * CORS) — in that case `error.error` is the browser's raw fetch/XHR
   * failure, not our API's JSON body, so it must be checked first.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    const message =
      error.status === 0
        ? "Unable to reach the server. Please check your connection and try again."
        : error.error && typeof error.error.message === "string"
          ? error.error.message
          : "Something went wrong. Please try again.";

    return throwError(() => new Error(message));
  }
}
