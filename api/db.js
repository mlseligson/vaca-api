import pg from "pg";
import db from "./secrets/db-credentials.js";

export const pool = new pg.Pool({
  // host: 'docker.for.mac.host.internal',
  host: 'db',
  database: db.database,
  user: db.user,
  password: db.password,
  port: db.port
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function connectToPool(req, res, next) {
  req.client = await pool.connect();
  next();
};