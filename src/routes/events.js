import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {Event} from "../models/mysqlModels.js";
import {BadRequest, Unauthorized} from "../models/validation/errors.js";
import {validateIntegerId} from "../models/validation/utilityFunctions.js";

const router = express.Router();

router.get(
  "/",
  routeHandler(async (req, res) => {
    const events = await Event.findAll();
    res.send({
      statusCode: "200",
      data: events,
    });
  })
);
router.get(
  "/:id",
  routeHandler(async (req, res) => {
    const id = req.params.id;
    const {error} = validateIntegerId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const event = await Event.findByPk(id);
    if (!event)
      return res.send(new BadRequest(`Event with id:${id} not found.`));
    res.send({
      statusCode: "200",
      data: event,
    });
  })
);
export default router;
