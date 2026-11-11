import { promises as fs } from "fs";
import path from "path";
import { Pool } from "pg";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const dataDir = path.join(process.cwd(), "data");
const bucket = process.env.NEON_STORAGE_BUCKET || "assets";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
});
const s3 = new S3Client({ forcePathStyle: true });

const CONTENT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

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

async function readJson(name) {
  return JSON.parse(await fs.readFile(path.join(dataDir, name), "utf8"));
}

await pool.query(SCHEMA);

const products = await readJson("products.json");
await pool.query(
  `insert into products (id, position, data)
   select id, ord - 1, data
   from unnest($1::text[], $2::jsonb[]) with ordinality as t(id, data, ord)
   on conflict (id) do nothing`,
  [products.map((product) => product.id), products.map((product) => JSON.stringify(product))]
);

const games = await readJson("games.json");
await pool.query(
  `insert into games (id, position, data)
   select id, ord - 1, data
   from unnest($1::text[], $2::jsonb[]) with ordinality as t(id, data, ord)
   on conflict (id) do nothing`,
  [games.map((game) => game.id), games.map((game) => JSON.stringify(game))]
);

const receiptsDir = path.join(dataDir, "receipts");
const receiptFiles = await fs.readdir(receiptsDir).catch(() => []);
const uploaded = [];

for (const file of receiptFiles) {
  if (file.startsWith(".")) continue;
  const buffer = await fs.readFile(path.join(receiptsDir, file));
  const ext = path.extname(file).slice(1).toLowerCase();
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: `receipts/${file}`,
      Body: buffer,
      ContentType: CONTENT_TYPES[ext] || "application/octet-stream",
      CacheControl: "private, max-age=3600",
    })
  );
  uploaded.push(file);
}

const orders = await readJson("orders.json");
for (const order of orders) {
  if (order.receiptImage && !order.receiptImage.startsWith("receipts/")) {
    order.receiptImage = `receipts/${order.receiptImage}`;
  }
}
await pool.query(
  `insert into orders (id, created_at, data)
   select id, created_at, data
   from unnest($1::text[], $2::timestamptz[], $3::jsonb[]) with ordinality as t(id, created_at, data, ord)
   on conflict (id) do update set created_at = excluded.created_at, data = excluded.data`,
  [
    orders.map((order) => order.id),
    orders.map((order) => order.createdAt || new Date().toISOString()),
    orders.map((order) => JSON.stringify(order)),
  ]
);

const counts = await pool.query(
  `select
     (select count(*) from products) as products,
     (select count(*) from games) as games,
     (select count(*) from orders) as orders`
);

console.log("Seeded Neon database:", counts.rows[0]);
console.log(`Uploaded ${uploaded.length} receipt(s) to bucket "${bucket}".`);

await pool.end();
