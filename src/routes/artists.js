import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {Artist} from "../models/mysqlModels.js";
import {BadRequest, Unauthorized} from "../models/validation/errors.js";
import {validateIntegerId} from "../models/validation/utilityFunctions.js";

const router = express.Router();

router.get(
  "/",
  routeHandler(async (req, res) => {
    const artists = await Artist.findAll();
    res.send({
      statusCode: "200",
      data: artists,
    });
  })
);
router.get(
  "/:id",
  routeHandler(async (req, res) => {
    const id = req.params.id;
    const {error} = validateIntegerId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const artist = await Artist.findByPk(id);
    if (!artist)
      return res.send(new BadRequest(`Artist with id:${id} not found.`));
    res.send({
      statusCode: "200",
      data: artist,
    });
  })
);
export default router;
