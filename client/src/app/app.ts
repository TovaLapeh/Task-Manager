import { Component } from "@angular/core";
import { TaskManager } from "./features/tasks/task-manager/task-manager";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [TaskManager],
  templateUrl: "./app.html",
})
export class App {}
