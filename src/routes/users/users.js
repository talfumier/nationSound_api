// @ts-check
import express from "express";
import {authHandler} from "./../../middleware/authHandler.js";
import {authAdmin} from "../../middleware/authAdmin.js";
import {routeHandler} from "../../middleware/routeHandler.js";
import {User} from "../../models/mysqlModels.js";
import {BadRequest, Unauthorized} from "../../models/validation/errors.js";
import {validateIntegerId} from "../../models/validation/utilityFunctions.js";

const router = express.Router();

router.get(
  "/",
  [authHandler, authAdmin],
  routeHandler(async (req, res) => {
    const users = await User.findAll();
    res.send({
      statusCode: "200",
      data: users,
    });
  })
);
router.get(
  "/:id",
  [authHandler, authAdmin],
  routeHandler(async (req, res) => {
    const id = req.params.id;
    const {error} = validateIntegerId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const user = await User.findOne({
      where: {id},
      attributes: {exclude: ["pwd"]},
    });
    if (!user) return res.send(new BadRequest(`User with id:${id} not found.`));
    res.send({
      statusCode: "200",
      data: user,
    });
  })
);
router.delete(
  "/:id",
  [authHandler, authAdmin],
  routeHandler(async (req, res) => {
    const id = req.params.id;
    const {error} = validateIntegerId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const user = await User.findOne({
      where: {id},
      attributes: {exclude: ["pwd"]},
    });
    if (!user) return res.send(new BadRequest(`User with id:${id} not found.`));
    await user.destroy();
    res.send({
      statusCode: "200",
      message: `User with id:${id} successfully deleted.`,
      data: user,
    });
  })
);
export default router;
