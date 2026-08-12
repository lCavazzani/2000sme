import { Hono } from "hono";
import { cors } from "hono/cors";

type GuestbookEntry = {
  id: number;
  name: string;
  message: string;
  created_at: string;
};

const ALLOWED_ORIGINS = ["https://2000sme.cavazzanileonardo.workers.dev"];
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60;

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(
  "*",
  cors({
    origin: (origin) => {
      if (ALLOWED_ORIGINS.includes(origin)) return origin;
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return origin;
      return null;
    },
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

async function isRateLimited(kv: KVNamespace, ip: string): Promise<boolean> {
  const key = `rl:${ip}`;
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;
  if (count >= RATE_LIMIT_MAX) return true;
  await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
  return false;
}

app.get("/", (c) => c.text("Hello Hono!"));

app.get("/api/health", (c) => c.text("ok"));

app.get("/api/guestbook", async (c) => {
  const { results } = await c.env.portfolio_db
    .prepare("SELECT id, name, message, created_at FROM guestbook ORDER BY created_at DESC")
    .all<GuestbookEntry>();

  return c.json(results ?? []);
});

app.post("/api/guestbook", async (c) => {
  const ip = c.req.header("CF-Connecting-IP") ?? "unknown";

  if (await isRateLimited(c.env.RATE_LIMIT, ip)) {
    return c.json({ error: "Too many requests. Try again in a minute." }, 429);
  }

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
