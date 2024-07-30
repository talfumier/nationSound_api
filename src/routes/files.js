import express from "express";
import _ from "lodash";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {FileContainer, validateFile} from "../models/mongoDbModels.js";
import {BadRequest} from "../models/validation/errors.js";
import {validateObjectId} from "../models/validation/utilityFunctions.js";

import {v2 as cloudinary} from "cloudinary";
import {environment} from "../config/environment.js";

const router = express.Router();

router.get(
  "/",
  routeHandler(async (req, res) => {
    const containers = await FileContainer.find();
    res.send({
      statusCode: "200",
      message: `All file containers successfully retrieved.`,
      data: containers.map((item) => {
        return item.files.map((it) => {
          return it.url;
        });
      }),
    });
  })
);
router.get(
  "/:id", //file container _id > artist.files_id | partner.files_id
  routeHandler(async (req, res) => {
    const id = req.params.id;
    const {error} = validateObjectId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const container = await FileContainer.findOne({_id: id});
    if (!container)
      return res.send(new BadRequest(`File container id:${id} not found.`));
    res.send({
      statusCode: "200",
      message: `File container id:${id} successfully retrieved.`,
      data: !req.query.main
        ? container
        : {
            _id: id,
            data: _.filter(container.files, (item) => {
              return item.main;
            })[0][!req.query.map ? "url" : "data"],
          },
    });
  })
);
cloudinary.config({
  cloud_name: environment.cloudinary_name,
  api_key: environment.cloudinary_api_key,
  api_secret: environment.cloudinary_api_secret,
});
router.post(
  "/cloudinary-upload-base64",
  [authHandler], //user must be logged in
  routeHandler(async (req, res) => {
    const options = {
      public_id: req.body.publicId,
      folder: "nationsound",
      unique_filename: true,
      use_filename: true,
    };
    const result = await cloudinary.uploader.upload(req.body.data, options);
    res.send({
      statusCode: "200",
      message: `Image ${req.body.publicId} successfully uploaded to Cloudinary.`,
      url: result.secure_url,
    });
  })
);
router.post(
  "/",
  [authHandler], //user must be logged in
  routeHandler(async (req, res) => {
    let error = null;
    req.body.files.map((img) => {
      if (!error) error = validateFile(img, "post").error;
    });
    if (error) return res.send(new BadRequest(error.details[0].message));
    const container = await FileContainer.create(req.body);
    res.send({
      statusCode: "200",
      message: `File container id:${container._id} successfully created.`,
      data: container,
    });
  })
);
router.put(
  "/:id", //file container id > artist.files_id | partner.files_id
  [authHandler], //user must be logged in
  routeHandler(async (req, res) => {
    const id = req.params.id;
    let error = validateObjectId(id).error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    req.body.files.map((img) => {
      if (!error) error = validateFile(img, "post").error;
    });
    if (error) return res.send(new BadRequest(error.details[0].message));
    const container = await FileContainer.findByIdAndUpdate(id, req.body);
    if (!container)
      return res.send(new BadRequest(`File container id:${id} not found.`));
    res.send({
      statusCode: "200",
      message: `File container id:${id} successfully updated.`,
      data: container,
    });
  })
);
router.delete(
  "/:id", //file container _id
  [authHandler], //user must be logged in
  routeHandler(async (req, res) => {
    const id = req.params.id;
    const {error} = validateObjectId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const container = await FileContainer.findByIdAndDelete({_id: id});
    if (!container)
      return res.send(
        new BadRequest(`File container with id:${id} not found.`)
      );
    res.send({
      statusCode: "200",
      message: `File container id:${id} successfully deleted.`,
      data: container,
    });
  })
);
export default router;
