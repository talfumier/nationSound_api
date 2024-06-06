import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {Transport} from "../models/mysqlModels.js";
import {BadRequest, Unauthorized} from "../models/validation/errors.js";
import {validateIntegerId} from "../models/validation/utilityFunctions.js";

const router = express.Router();

router.get(
  "/",
  routeHandler(async (req, res) => {
    const transports = await Transport.findAll();
    res.send({
      statusCode: "200",
      data: transports,
    });
  })
);
router.get(
  "/:id",
  routeHandler(async (req, res) => {
    const id = req.params.id;
    const {error} = validateIntegerId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const transport = await Transport.findByPk(id);
    if (!transport)
      return res.send(new BadRequest(`Transport with id:${id} not found.`));
    res.send({
      statusCode: "200",
      data: transport,
    });
  })
);
export default router;
