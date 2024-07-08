import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {Artist, validateArtist} from "../models/mysqlModels.js";
import {ImageContainer} from "../models/mongoDbModels.js";
import {BadRequest, Unauthorized} from "../models/validation/errors.js";
import {validateIntegerId} from "../models/validation/utilityFunctions.js";
import {Event} from "../models/mysqlModels.js";

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
router.post(
  "/",
  // [authHandler, authAdmin],
  routeHandler(async (req, res) => {
    const {error} = validateArtist(req.body, "post");
    if (error) return res.send(new BadRequest(error.details[0].message));
    let artist = await Artist.findOne({
      where: {
        name: req.body.name,
      },
    });
    if (artist)
      return res.send(
        new BadRequest(
          `Artist with name:'${req.body.name}' does already exist.`
        )
      );
    artist = await Artist.create(req.body);
    res.send({
      status: "OK",
      message: `Artist '${artist.name}' successfully created with id:${artist.id}.`,
      data: artist,
    });
  })
);
router.patch(
  "/:id",
  // [authHandler, authValid],
  routeHandler(async (req, res) => {
    const id = req.params.id;
    let error = validateIntegerId(id).error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    const artist = await Artist.findByPk(id);
    if (!artist)
      return res.send(new BadRequest(`Artist with id:${id} not found.`));
    error = validateArtist(req.body, "patch").error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    await artist.update(req.body);
    res.send({
      status: "OK",
      message: `Artist '${artist.name}' successfully updated.`,
      data: artist,
    });
  })
);
router.delete(
  "/:id",
  // [authHandler, authAdmin, authValid],
  routeHandler(async (req, res) => {
    const id = req.params.id;
    let error = validateIntegerId(id).error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    const artist = await Artist.findByPk(id);
    if (!artist)
      return res.send(new BadRequest(`Artist with id:${id} not found.`));
    //check if related records prevent artist deletion
    const event = await Event.findOne({where: {performer: id}});
    if (event)
      return res.send(
        new Unauthorized(
          `Artist id:${id} cannot be deleted due to related records.`
        )
      );
    if (artist.images_id) {
      const container = await ImageContainer.findByIdAndDelete({
        _id: artist.images_id,
      });
      if (!container)
        return res.send(
          new BadRequest(
            `Image container with id:${artist.images_id} not found.`
          )
        );
    }
    await artist.destroy();
    res.send({
      status: "OK",
      message: `Artist '${artist.name}' and associated images successfully deleted.`,
      data: artist,
    });
  })
);
export default router;
