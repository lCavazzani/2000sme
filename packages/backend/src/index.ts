import { Hono } from "hono";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", (c) => {
  const db = c.env.portfolio_db;
  return c.text("Hello Hono!");
});

app.get("/api/health", (c) => {
  return c.text("ok");
});
export default app;
