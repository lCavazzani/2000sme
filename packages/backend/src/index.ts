import { Hono } from "hono";

type GuestbookEntry = {
  id: number;
  name: string;
  message: string;
  created_at: string;
};

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/api/health", (c) => {
  return c.text("ok");
});

app.get("/api/guestbook", async (c) => {
  const { results } = await c.env.portfolio_db
    .prepare("SELECT id, name, message, created_at FROM guestbook ORDER BY created_at DESC")
    .all<GuestbookEntry>();

  return c.json(results ?? []);
});

app.post("/api/guestbook", async (c) => {
  const body = await c.req.json<{ name?: unknown; message?: unknown }>().catch(() => null);

  if (!body) return c.json({ error: "Invalid JSON body" }, 400);

  const { name, message } = body;

  if (typeof name !== "string" || name.trim() === "") return c.json({ error: "name is required" }, 400);
  if (typeof message !== "string" || message.trim() === "") return c.json({ error: "message is required" }, 400);
  if (name.trim().length > 50) return c.json({ error: "name must be 50 characters or fewer" }, 400);
  if (message.trim().length > 280) return c.json({ error: "message must be 280 characters or fewer" }, 400);

  const created_at = new Date().toISOString();

  const entry = await c.env.portfolio_db
    .prepare("INSERT INTO guestbook (name, message, created_at) VALUES (?, ?, ?) RETURNING id, name, message, created_at")
    .bind(name.trim(), message.trim(), created_at)
    .first<GuestbookEntry>();

  return c.json(entry, 201);
});

export default app;
