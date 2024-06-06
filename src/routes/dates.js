import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {Dates} from "../models/mysqlModels.js";
import {Unauthorized} from "../models/validation/errors.js";

const router = express.Router();

router.get(
  "/",
  routeHandler(async (req, res) => {
    const dates = await Dates.findAll();
    res.send({
      statusCode: "200",
      data: dates,
    });
  })
);
router.post(
  "/",
  [authHandler],
  routeHandler(async (req, res) => {
    const dates = await Dates.findAll();
    if (dates.length > 0) {
      return res.send(new Unauthorized("Festival dates are alredy set."));
    }
  })
);
export default router;
