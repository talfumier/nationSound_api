import express from "express";
import {routeHandler} from "./../../middleware/routeHandler.js";
import {User} from "../../models/mysqlModels.js";

const router = express.Router();

router.get(
  "/",
  routeHandler(async (req, res) => {
    const data = (
      await User.findAll({
        attributes: ["last_connection"],
        order: [["last_connection", "DESC"]],
      })
    )[0];
    res.send({
      statusCode: "200",
      data,
    });
  })
);
export default router;
