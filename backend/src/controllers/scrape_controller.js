import axios from "axios";
import * as cheerio from "cheerio";
import db from "../db/db.js";
import pLimit from "p-limit";

const limitConcurrency = pLimit(5); 

const BASE_URL = process.env.AMAZON_URL || "https://www.amazon.com";
const wishlistUrl = `${BASE_URL}/hz/wishlist/ls`;
export const scrapeWishlist = async (req, res) => {
  let { page = 1, limit = 50 } = req.query;

  console.log({
    page,
    limit,
  });

  try {
    console.log("Scraping wishlist...");

    // Fetch the latest valid cookie
    db.get(
      "SELECT cookie FROM cookie_meta WHERE is_valid = 1 ORDER BY refresh_time DESC LIMIT 1",
      async (err, row) => {
        if (err || !row) {
          return res.status(400).json({ error: "Valid cookie not found" });
        }

        const cookie = row.cookie;

        const response = await axios.get(wishlistUrl, {
          headers: {
            Cookie: cookie,
            "User-Agent": "Mozilla/5.0",
          },
        });
        await processAxioResponse(response);
        const result = await queryWishList(page, limit);
        res.status(200).json(result);
      }
    );
  } catch (err) {
    console.error("Scraping error:", err.message);

    // Mark cookie invalid if unauthorized
    if (err.response && err.response.status === 403) {
      db.run("UPDATE cookie_meta SET is_valid = 0 WHERE is_valid = 1");
    }

    res.status(500).json({ error: "Failed to scrape wishlist" });
  }
};

export const fetchWishlistFromDb = async (req, res) => {
  let { page = 1, limit = 50 } = req.query;

  console.log({
    page,
    limit,
  });

  try {
    const result = await queryWishList(page, limit);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(200).json({ items: [] });
  }
};


const queryWishList = async (page, limit) => {
  page = parseInt(page);
  limit = limit === "all" ? "all" : parseInt(limit);

  // If "all", just return everything
  if (limit === "all") {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM wishlist", [], (err, rows) => {
        if (err) return reject(err);
        resolve({
          items: rows,
          total: rows.length,
          page: 1,
          limit: "all",
          totalPages: 1,
        });
      });
    });
  }

  const offset = (page - 1) * limit;

  // Count total items first
  const countPromise = new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as total FROM wishlist", [], (err, row) => {
      if (err) reject(err);
      else resolve(row.total);
    });
  });

  // Fetch paginated items
  const itemsPromise = new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM wishlist LIMIT ? OFFSET ?",
      [limit, offset],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });

  const [total, items] = await Promise.all([countPromise, itemsPromise]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};



const processAxioResponse = async (response, cookie) => {
  console.log('hit')
  if (response.status !== 200) throw new Error("Invalid status code");
  console.time('start time')

  const $ = cheerio.load(response.data);
  const wishlistItems = $(".g-item-sortable");
  console.time('load time')
  const fetchProductDetails = async (el) => {
    const title = $(el).find("h2.a-size-base a.a-link-normal").text().trim();
    const href = $(el).find("h2.a-size-base a.a-link-normal").attr("href");
    if (!href) return null;

    const product_url = `${BASE_URL}${href}`;
    const productPage = await axios.get(product_url, {
      headers: {
        Cookie: cookie,
        "User-Agent": "Mozilla/5.0",
      },
    });

    const $$ = cheerio.load(productPage.data);
    const priceWhole = $$(".a-price .a-price-whole").first().text().replace(/[^\d]/g, "");
    const priceFraction = $$(".a-price .a-price-fraction").first().text().trim();
    const price = priceWhole && priceFraction ? `$${priceWhole}.${priceFraction}` : null;
    const availability = $$("#availability .a-size-medium.a-color-success").text().trim();
    const delivery_time = $$("#deliveryBlockMessage .a-text-bold").text().trim();
    const delivery_location = $$("#contextualIngressPtLabel_deliveryShortLine").text().replace(/\s+/g, " ").trim();

    return { title, price, availability, delivery_location, delivery_time, product_url };
  };
  const itemPromises = wishlistItems.map((_, el) =>
    limitConcurrency(() => fetchProductDetails(el))
  ).get(); // `get()` converts cheerio object to raw array
  const items = (await Promise.all(itemPromises)).filter(Boolean);
  // Save items to DB
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("DELETE FROM wishlist");
      const stmt = db.prepare(
        "INSERT INTO wishlist (title, price, availability, delivery_location, delivery_time, product_url) VALUES (?, ?, ?, ?, ?, ?)"
      );
      for (const item of items) {
        const { title, price, availability, delivery_location, delivery_time, product_url } = item;
        stmt.run(title, price, availability, delivery_location, delivery_time, product_url);
      }
      stmt.finalize(resolve);
    });
  });

  db.run("UPDATE cookie_meta SET refresh_time = ? WHERE cookie = ?", [Date.now(), cookie]);

  return items.length;
};