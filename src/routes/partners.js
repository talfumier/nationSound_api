import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {Partner} from "../models/mysqlModels.js";
import {BadRequest, Unauthorized} from "../models/validation/errors.js";
import {validateIntegerId} from "../models/validation/utilityFunctions.js";

const router = express.Router();

router.get(
  "/",
  routeHandler(async (req, res) => {
    const partners = await Partner.findAll();
    res.send({
      statusCode: "200",
      data: partners,
    });
  })
);
router.get(
  "/:id",
  routeHandler(async (req, res) => {
    const id = req.params.id;
    const {error} = validateIntegerId(id);
    if (error) return res.send(new BadRequest(error.details[0].partner));
    const partner = await Partner.findByPk(id);
    if (!partner)
      return res.send(new BadRequest(`Partner with id:${id} not found.`));
    res.send({
      statusCode: "200",
      data: partner,
    });
  })
);
export default router;
