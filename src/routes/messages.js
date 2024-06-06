import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {Message} from "../models/mysqlModels.js";
import {BadRequest, Unauthorized} from "../models/validation/errors.js";
import {validateIntegerId} from "../models/validation/utilityFunctions.js";

const router = express.Router();

router.get(
  "/",
  routeHandler(async (req, res) => {
    const messages = await Message.findAll();
    res.send({
      statusCode: "200",
      data: messages,
    });
  })
);
router.get(
  "/:id",
  routeHandler(async (req, res) => {
    const id = req.params.id;
    const {error} = validateIntegerId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const message = await Message.findByPk(id);
    if (!message)
      return res.send(new BadRequest(`Message with id:${id} not found.`));
    res.send({
      statusCode: "200",
      data: message,
    });
  })
);
export default router;
