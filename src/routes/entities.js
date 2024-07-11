import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {Artist, validateArtist} from "../models/mysqlModels.js";
import {Partner, validatePartner} from "../models/mysqlModels.js";
import {Transport, validateTransport} from "../models/mysqlModels.js";
import {ImageContainer} from "../models/mongoDbModels.js";
import {BadRequest, Unauthorized} from "../models/validation/errors.js";
import {validateIntegerId} from "../models/validation/utilityFunctions.js";
import {Event} from "../models/mysqlModels.js";

const router = express.Router();

const model = (entity) => {
  switch (entity) {
    case "artist":
      return {model: Artist, validate: validateArtist, label: "Artist"};
    case "partner":
      return {model: Partner, validate: validatePartner, label: "Partner"};
    case "transport":
      return {
        model: Transport,
        validate: validateTransport,
        label: "Transport",
      };
  }
};

router.get(
  "/:model",
  routeHandler(async (req, res) => {
    const mdl = model(req.params.model);
    const data = await mdl.model.findAll();
    res.send({
      statusCode: "200",
      data,
    });
  })
);
router.get(
  "/:model/:id",
  routeHandler(async (req, res) => {
    const {model: mod, id} = req.params;
    const mdl = model(mod);
    const {error} = validateIntegerId(id);
    if (error) return res.send(new BadRequest(error.details[0].message));
    const data = await mdl.model.findByPk(id);
    if (!data)
      return res.send(new BadRequest(`Artist with id:${id} not found.`));
    res.send({
      statusCode: "200",
      data,
    });
  })
);
router.post(
  "/:model/",
  // [authHandler, authAdmin],
  routeHandler(async (req, res) => {
    const mdl = model(req.params.model);
    const {error} = mdl.validate(req.body, "post");
    if (error) return res.send(new BadRequest(error.details[0].message));
    let data = await mdl.model.findOne({
      where: {
        name: req.body.name,
      },
    });
    if (data)
      return res.send(
        new BadRequest(
          `${mdl.label} with name:'${req.body.name}' does already exist.`
        )
      );
    data = await mdl.model.create(req.body);
    res.send({
      status: "OK",
      message: `${mdl.label} '${data.name}' successfully created with id:${data.id}.`,
      data,
    });
  })
);
router.patch(
  "/:model/:id",
  // [authHandler, authValid],
  routeHandler(async (req, res) => {
    const {model: mod, id} = req.params;
    const mdl = model(mod);
    let error = validateIntegerId(id).error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    const data = await mdl.model.findByPk(id);
    if (!data)
      return res.send(new BadRequest(`${mdl.label} with id:${id} not found.`));
    error = mdl.validate(req.body, "patch").error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    await data.update(req.body);
    res.send({
      status: "OK",
      message: `${mdl.label} '${data.name}' successfully updated.`,
      data,
    });
  })
);
router.delete(
  "/:model/:id",
  // [authHandler, authAdmin, authValid],
  routeHandler(async (req, res) => {
    const {model: mod, id} = req.params;
    const mdl = model(mod);
    let error = validateIntegerId(id).error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    const data = await mdl.model.findByPk(id);
    if (!data)
      return res.send(new BadRequest(`${mdl.label} with id:${id} not found.`));
    //check if related records prevent artist deletion
    if (mod === "artist") {
      const event = await Event.findOne({where: {performer: id}});
      if (event)
        return res.send(
          new Unauthorized(
            `${mdl.label} id:${id} cannot be deleted due to related records.`
          )
        );
    }
    if (data.images_id) {
      const container = await ImageContainer.findByIdAndDelete({
        _id: data.images_id,
      });
      if (!container)
        return res.send(
          new BadRequest(`Image container with id:${data.images_id} not found.`)
        );
    }
    await data.destroy();
    res.send({
      status: "OK",
      message: `${mdl.label} '${data.name}' and associated images successfully deleted.`,
      data,
    });
  })
);
export default router;
