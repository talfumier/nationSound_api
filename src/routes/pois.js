import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {Poi} from "../models/mysqlModels.js";
import {BadRequest, Unauthorized} from "../models/validation/errors.js";
import {validateIntegerId} from "../models/validation/utilityFunctions.js";

const router = express.Router();

router.get(
  "/",
  routeHandler(async (req, res) => {
    const pois = await Poi.findAll();
    res.send({
      statusCode: "200",
      data: pois,
    });
  })
);
router.get(
  "/:id",
  routeHandler(async (req, res) => {
    const id = req.params.id;
    const {error} = validateIntegerId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const poi = await Poi.findByPk(id);
    if (!poi) return res.send(new BadRequest(`Poi with id:${id} not found.`));
    res.send({
      statusCode: "200",
      data: poi,
    });
  })
);
export default router;
