import { createApp } from "./app";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Task Manager API listening on http://localhost:${PORT}`);
});
