import sqlite3 from "sqlite3";
const db = new sqlite3.Database("wishlist.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      product_url TEXT,
      price TEXT,
      availability TEXT,
      delivery_location TEXT,
      delivery_time TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cookie_meta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cookie TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT 1,
  refresh_time INTEGER  -- store timestamp in milliseconds
);

    `);
});

export default db;
