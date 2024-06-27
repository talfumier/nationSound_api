import express from "express";
import {BadRequest} from "../../models/validation/errors.js";
import {Image, validateImage} from "../../models/mongoDbModels.js";
import {validateObjectId} from "../../models/validation/utilityFunctions.js";
import {routeHandler} from "../../middleware/routeHandler.js";
import {authHandler} from "../../middleware/authHandler.js";
import fs from "node:fs";

const router = express.Router();

router.get(
  "/",
  routeHandler(async (req, res) => {
    const images = await Image.find();
    res.send({
      statusCode: "200",
      message: `${images.length}image(s) successfully retrieved.`,
      data: images,
    });
  })
);
router.get(
  "/:id",
  routeHandler(async (req, res) => {
    const _id = req.params.id;
    const {error} = validateObjectId(_id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const image = await Partner.findOne({_id});
    if (!image)
      return res.send(new BadRequest(`Image with id:${id} not found.`));
    res.send({
      statusCode: "200",
      message: `Image with id:${_id} successfully retrieved.`,
      data: image,
    });
  })
);
async function getFile() {
  const path = "./src/routes/images/artists/AuroraBorealisBluesCollective.jpg";
  const file = new File(path);
  console.log(file.name);
  fs.readFile(path, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(data);
  });
}

router.post(
  "/init",
  // [authHandler], //user must be logged in
  routeHandler(async (req, res) => {
    const file = await getFile();
    return;
    const {error} = validateImage(req.body, "post");
    if (error) return res.send(new BadRequest(error.details[0].message));
    const image = new Image(req.body);
    await image.save();
    res.send({
      statusCode: "200",
      message: "Image successfully recorded.",
      data: image._id,
    });
  })
);
router.post(
  "/",
  // [authHandler], //user must be logged in
  routeHandler(async (req, res) => {
    const {error} = validateImage(req.body, "post");
    if (error) return res.send(new BadRequest(error.details[0].message));
    const image = new Image(req.body);
    await image.save();
    res.send({
      statusCode: "200",
      message: "Image successfully recorded.",
      data: image._id,
    });
  })
);
router.delete(
  "/:id",
  // [authHandler], //user must be logged in
  routeHandler(async (req, res) => {
    const _id = req.params.id;
    const {error} = validateObjectId(_id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const image = await Image.findOne({_id});
    if (!image)
      return res.send(new BadRequest(`Image with id:${_id} not found.`));
    await Image.deleteOne({_id});
    res.send({
      statusCode: "200",
      message: "Images successfully deleted.",
      data: image._id,
    });
  })
);
export default router;
