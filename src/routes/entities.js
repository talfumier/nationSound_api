import express from "express";
import {routeHandler} from "../middleware/routeHandler.js";
import {authHandler} from "../middleware/authHandler.js";
import {
  Artist,
  validateArtist,
  Partner,
  validatePartner,
  Transport,
  validateTransport,
  Faq,
  validateFaq,
  Message,
  validateMessage,
  Poi,
  validatePoi,
  Dates,
  validateDates,
  Event,
  validateEvent,
  Map,
  Logo,
  User,
  validateUser,
} from "../models/mysqlModels.js";
import {FileContainer} from "../models/mongoDbModels.js";
import {BadRequest, Unauthorized} from "../models/validation/errors.js";
import {validateIntegerId} from "../models/validation/utilityFunctions.js";

const router = express.Router();

const model = (entity) => {
  switch (entity) {
    case "artist":
      return {
        model: Artist,
        validate: validateArtist,
        master: "name",
      };
    case "partner":
      return {
        model: Partner,
        validate: validatePartner,
        master: "name",
      };
    case "transport":
      return {
        model: Transport,
        validate: validateTransport,
        master: "name",
      };
    case "faq":
      return {
        model: Faq,
        validate: validateFaq,
        master: "question",
      };
    case "message":
      return {
        model: Message,
        validate: validateMessage,
        master: "title",
      };
    case "poi":
      return {
        model: Poi,
        validate: validatePoi,
        master: "name",
      };
    case "date":
      return {
        model: Dates,
        validate: validateDates,
        master: "start_date",
      };
    case "event":
      return {
        model: Event,
        validate: validateEvent,
        master: "performer",
      };
    case "map":
      return {
        model: Map,
        validate: validatePartner, //same validation as partner
        master: "name",
      };
    case "logo":
      return {
        model: Logo,
        validate: validatePartner, //same validation as partner
        master: "name",
      };
    case "user":
      return {
        model: User,
        validate: validateUser, //same validation as partner
        master: "last_name",
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
      return res.send(new BadRequest(`Record with id:${id} not found.`));
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
    let data = null;
    if (mdl.model !== Event) {
      data = await mdl.model.findOne({
        where: {
          [mdl.master]: req.body[mdl.master],
        },
      });
      if (data)
        return res.send(
          new BadRequest(`Record '${req.body[mdl.master]}' does already exist.`)
        );
    }
    data = await mdl.model.create(req.body);
    res.send({
      status: "OK",
      message: `Record successfully created with id:${data.id}.`,
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
      return res.send(new BadRequest(`Record with id:${id} not found.`));
    error = mdl.validate(req.body, "patch").error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    await data.update(req.body);
    res.send({
      status: "OK",
      message: `Record successfully updated.`,
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
      return res.send(new BadRequest(`Record with id:${id} not found.`));
    //check if related records prevent artist or poi deletion
    if (mod === "artist" || mod === "poi") {
      const event = await Event.findOne({
        where: {[mod === "artist" ? "performer" : "location"]: id},
      });
      if (event)
        return res.send(
          new Unauthorized(
            `Record id:${id} cannot be deleted due to related records.`
          )
        );
    }
    if (data.files_id) {
      const container = await FileContainer.findByIdAndDelete({
        _id: data.files_id,
      });
      if (!container)
        return res.send(
          new BadRequest(`File container with id:${data.files_id} not found.`)
        );
    }
    await data.destroy();
    res.send({
      status: "OK",
      message: `Record '${id}' and associated files (if any) successfully deleted.`,
      data,
    });
  })
);
export default router;
