import express from "express";
import _ from "lodash";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {ImageContainer, validateImage} from "../models/mongoDbModels.js";
import {
  BadRequest,
  NotFound,
  Unauthorized,
} from "../models/validation/errors.js";
import {
  validateIntegerId,
  validateObjectId,
} from "../models/validation/utilityFunctions.js";

const router = express.Router();

router.get(
  "/",
  routeHandler(async (req, res) => {
    const containers = await ImageContainer.find();
    res.send({
      statusCode: "200",
      message: `All image containers successfully retrieved.`,
      data: containers,
    });
  })
);
router.get(
  "/:id", //image container _id > artist.images_id | partner.images_id
  routeHandler(async (req, res) => {
    const id = req.params.id;
    const {error} = validateObjectId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const container = await ImageContainer.findOne({_id: id});
    if (!container)
      return res.send(new BadRequest(`Image container id:${id} not found.`));
    res.send({
      statusCode: "200",
      message: `Image container id:${id} successfully retrieved.`,
      data: container,
    });
  })
);
router.post(
  "/",
  // [authHandler], //user must be logged in
  routeHandler(async (req, res) => {
    let error = null;
    req.body.images.map((img) => {
      if (!error) error = validateImage(img, "post").error;
    });
    if (error) return res.send(new BadRequest(error.details[0].message));
    const container = new ImageContainer(req.body);
    await container.save();
    res.send({
      statusCode: "200",
      message: `Image container id:${container._id} successfully created.`,
      data: container,
    });
  })
);
router.patch(
  "/:id", //image container id > artist.images_id | partner.images_id
  // [authHandler], //user must be logged in
  routeHandler(async (req, res) => {
    const id = req.params.id;
    let error = validateObjectId(id).error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    req.body.images.map((img) => {
      if (!error) error = validateImage(img, "post").error;
    });
    if (error) return res.send(new BadRequest(error.details[0].message));
    const container = await ImageContainer.findByIdAndUpdate(id, req.body);
    if (!container)
      return res.send(new BadRequest(`Image container id:${id} not found.`));
    res.send({
      statusCode: "200",
      message: `Image container id:${id} successfully updated.`,
      data: container,
    });
  })
);
router.delete(
  "/:id", //image container _id
  // [authHandler], //user must be logged in
  routeHandler(async (req, res) => {
    const id = req.params.id;
    const {error} = validateObjectId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const container = await ImageContainer.findByIdAndDelete({_id: id});
    if (!container)
      return res.send(
        new BadRequest(`Image container with id:${id} not found.`)
      );
    res.send({
      statusCode: "200",
      message: `Image container id:${id} successfully deleted.`,
      data: container,
    });
  })
);
export default router;
