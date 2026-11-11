import { initDb, pool } from "@/lib/db";

async function replaceRows(table, rows, toRecord) {
  await initDb();
  const records = rows.map(toRecord);
  const ids = records.map((record) => record.id);
  const payload = records.map((record) => JSON.stringify(record.data));
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(`delete from ${table} where not (id = any($1::text[]))`, [ids]);
    await client.query(
      `insert into ${table} (id, position, data)
       select id, ord - 1, data
       from unnest($1::text[], $2::jsonb[]) with ordinality as t(id, data, ord)
       on conflict (id) do update set position = excluded.position, data = excluded.data`,
      [ids, payload]
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function selectRows(table, orderBy) {
  await initDb();
  const { rows } = await pool.query(`select data from ${table} order by ${orderBy}`);
  return rows.map((row) => row.data);
}

export function getProducts() {
  return selectRows("products", "position asc, id asc");
}

export function saveProducts(products) {
  return replaceRows("products", products, (product) => ({ id: String(product.id), data: product }));
}

export function getGames() {
  return selectRows("games", "position asc, id asc");
}

export function saveGames(games) {
  return replaceRows("games", games, (game) => ({ id: String(game.id), data: game }));
}

export function getOrders() {
  return selectRows("orders", "created_at asc, id asc");
}

export async function saveOrders(orders) {
  await initDb();
  const ids = orders.map((order) => String(order.id));
  const createdAt = orders.map((order) => order.createdAt || new Date().toISOString());
  const payload = orders.map((order) => JSON.stringify(order));
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("delete from orders where not (id = any($1::text[]))", [ids]);
    await client.query(
      `insert into orders (id, created_at, data)
       select id, created_at, data
       from unnest($1::text[], $2::timestamptz[], $3::jsonb[]) with ordinality as t(id, created_at, data, ord)
       on conflict (id) do update set created_at = excluded.created_at, data = excluded.data`,
      [ids, createdAt, payload]
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
