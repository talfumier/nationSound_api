import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {Newsletter} from "../models/mysqlModels.js";
import {BadRequest, Unauthorized} from "../models/validation/errors.js";
import {validateIntegerId} from "../models/validation/utilityFunctions.js";
import {validateNewsletter} from "../models/mysqlModels.js";
import {bodyCleanUp} from "../models/validation/utilityFunctions.js";

const router = express.Router();

router.get(
  "/",
  routeHandler(async (req, res) => {
    const subscribers = await Newsletter.findAll();
    res.send({
      statusCode: "200",
      data: subscribers,
    });
  })
);
router.get(
  "/:id",
  routeHandler(async (req, res) => {
    const id = req.params.id;
    const {error} = validateIntegerId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const subscriber = await Newsletter.findByPk(id);
    if (!subscriber)
      return res.send(
        new BadRequest(`Newsletter subscriber with id:${id} not found.`)
      );
    res.send({
      statusCode: "200",
      data: subscriber,
    });
  })
);
router.post(
  "/",
  routeHandler(async (req, res) => {
    req.body = bodyCleanUp(req.body);
    const {error} = validateNewsletter(req.body, "post");
    if (error) return res.send(new BadRequest(error.details[0].message));
    let subscriber = null;
    //check that subscriber being created does not already exist
    subscriber = await Newsletter.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (subscriber)
      return res.send(
        new BadRequest(
          `Newsletter subscriber ${subscriber.email} is already registered.`
        )
      );
    subscriber = await Newsletter.create(req.body);
    res.send({
      statusCode: "200",
      message: `Newsletter subscriber ${subscriber.email} successfully registered.`,
      data: subscriber,
    });
  })
);
export default router;
