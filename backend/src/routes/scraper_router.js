import express from "express";
import { configDotenv } from "dotenv";
import { fetchWishlistFromDb, scrapeWishlist } from "../controllers/scrape_controller.js";

configDotenv();


const scrapperRouter = express.Router();



scrapperRouter.get("/wishlist-amazon", scrapeWishlist);


// Fetch wishlist via GET
scrapperRouter.get("/wishlist-db", fetchWishlistFromDb);


export default scrapperRouter;
