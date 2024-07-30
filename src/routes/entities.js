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
  validateNewsletter,
  Newsletter,
} from "../models/mysqlModels.js";
import {FileContainer} from "../models/mongoDbModels.js";
import {BadRequest, Unauthorized} from "../models/validation/errors.js";
import {sendBasicEmail} from "../mailjet/sendEmail.js";
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
        validate: validateUser,
        master: "last_name",
      };
    case "newsletter":
      return {
        model: Newsletter,
        validate: validateNewsletter,
        master: "email",
      };
  }
};
function userIsAdmin(req) {
  if (!req.user || (req.user && req.user.role !== "admin"))
    return [false, new Unauthorized("'admin' privileges required !")];
  return [true, null];
}
function userIsOwnerOrAdmin(req, data) {
  if (!req.user)
    return [false, new Unauthorized("User must be authenticated !")];
  if (req.user.role === "admin") return [true, null];
  if (data.email !== req.user.email)
    return [
      false,
      new Unauthorized(
        "User account can only be accessed, updated or deleted by the account owner !"
      ),
    ];
  return [true, null];
}
router.get(
  "/:model",
  routeHandler(async (req, res) => {
    const mdl = model(req.params.model);
    if (mdl.model === User) {
      const cond = userIsAdmin(req);
      if (!cond[0]) return res.send(cond[1]);
    }
    const data = await mdl.model.findAll({attributes: {exclude: ["pwd"]}});
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
    if (mdl.model === User) {
      const cond = userIsOwnerOrAdmin(req, data);
      if (!cond[0]) return res.send(cond[1]);
      data.pwd = undefined;
    }
    res.send({
      statusCode: "200",
      data,
    });
  })
);
router.post(
  "/:model/",
  authHandler,
  routeHandler(async (req, res) => {
    const mdl = model(req.params.model);
    if (mdl.model === User) {
      const cond = userIsAdmin(req);
      if (!cond[0]) return res.send(cond[1]);
    } //user is normally created through the register route
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
    if (mdl.model === User) data.pwd = undefined;
    res.send({
      status: "OK",
      message: `Record successfully created with id:${data.id}.`,
      data,
    });
  })
);
router.patch(
  "/:model/:id",
  authHandler,
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
    let userValidation = null;
    if (mdl.model === User) {
      const cond = userIsOwnerOrAdmin(req, data);
      if (!cond[0]) return res.send(cond[1]);
      userValidation = Object.keys(req.body).indexOf("validated") !== -1;
      if (userValidation && req.user.role !== "admin")
        return res.send(
          new Unauthorized(`'admin' privileges required for user validation !`)
        );
      if (req.body.role && req.user.role !== "admin")
        return res.send(
          new Unauthorized(`'admin' privileges required to change user role !`)
        );
    }
    await data.update(req.body);
    if (userValidation && req.body.validated)
      sendBasicEmail(
        data.email,
        "nationsounds_api: validation de votre compte",
        `<b>${data.email}</b> (id:${data.id}) avec le rôle '${data.role}' a été validé.`
      );
    if (mdl.model === User) data.pwd = undefined;
    res.send({
      status: "OK",
      message: `Record successfully updated.`,
      data,
    });
  })
);
router.delete(
  "/:model/:id",
  authHandler,
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
    if (mdl.model === User) {
      const cond = userIsOwnerOrAdmin(req, data);
      if (!cond[0]) return res.send(cond[1]);
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
    if (mdl.model === User) data.pwd = undefined;
    res.send({
      status: "OK",
      message: `Record '${id}' and associated files (if any) successfully deleted.`,
      data,
    });
  })
);
export default router;
