import express from "express";
import { setCookie, updateRefreshTime } from "../controllers/cookie_controller.js";

const cookieRouter = express.Router();

cookieRouter.post("/set", setCookie);
cookieRouter.post("/update_refresh_time", updateRefreshTime);
  

export default cookieRouter;