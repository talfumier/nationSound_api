import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {Faq} from "../models/mysqlModels.js";
import {BadRequest, Unauthorized} from "../models/validation/errors.js";
import {validateIntegerId} from "../models/validation/utilityFunctions.js";

const router = express.Router();

router.get(
  "/",
  routeHandler(async (req, res) => {
    const faqs = await Faq.findAll();
    res.send({
      statusCode: "200",
      data: faqs,
    });
  })
);
router.get(
  "/:id",
  routeHandler(async (req, res) => {
    const id = req.params.id;
    const {error} = validateIntegerId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const faq = await Faq.findByPk(id);
    if (!faq) return res.send(new BadRequest(`Faq with id:${id} not found.`));
    res.send({
      statusCode: "200",
      data: faq,
    });
  })
);
export default router;
