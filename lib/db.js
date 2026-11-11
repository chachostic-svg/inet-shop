import { Pool } from "pg";

const globalForDb = globalThis;

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured. Run `neon env pull`.");
  }
  return new Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export const pool = globalForDb.__neonPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__neonPool = pool;
}

const SCHEMA = `
  create table if not exists products (
    id text primary key,
    position integer not null,
    data jsonb not null
  );

  create table if not exists games (
    id text primary key,
    position integer not null,
    data jsonb not null
  );

  create table if not exists orders (
    id text primary key,
    created_at timestamptz not null,
    data jsonb not null
  );

  create index if not exists orders_created_at_idx on orders (created_at);
`;

let initPromise;

export function initDb() {
  if (!initPromise) {
    initPromise = pool.query(SCHEMA).catch((error) => {
      initPromise = undefined;
      throw error;
    });
  }
  return initPromise;
}
