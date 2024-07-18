import express from "express";
import bcrypt from "bcrypt";
import {routeHandler} from "../../middleware/routeHandler.js";
import {bodyCleanUp} from "../../models/validation/utilityFunctions.js";
import {User, validateUser} from "../../models/mysqlModels.js";
import {BadRequest} from "../../models/validation/errors.js";
import {sendBasicEmail} from "../../mailjet/sendEmail.js";
import {environment} from "../../config/environment.js";
import config from "../../config/config.json" assert {type: "json"};

const router = express.Router();

router.post(
  "/",
  routeHandler(async (req, res) => {
    req.body = bodyCleanUp(req.body);
    if (req.body.role && req.body.role === "admin")
      return res.send(
        new BadRequest(
          `User ${req.body.email} with admin privilege cannot be created through the API.`
        )
      );
    const {error} = validateUser(req.body, "post");
    if (error) return res.send(new BadRequest(error.details[0].message));
    let user = null;
    //check that user being created does not already exist
    user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (user)
      return res.send(
        new BadRequest(`User ${user.email} is already registered.`)
      );
    user = await User.create({
      ...req.body,
      pwd: await bcrypt.hash(req.body.pwd, environment.salt_rounds),
    });
    user.pwd = undefined; //does not return the password
    sendBasicEmail(
      user.email,
      "nationsound_api: nouvel utilisateur enregistré",
      `<b>${user.email}</b> avec le rôle '${user.role}' a été enregistré avec succès.
      Le compte est en attente de validation par l'administrateur.`
    );
    sendBasicEmail(
      config.email_admin,
      "nationsounds_api: validation requise",
      `<b>${user.email}</b> (id:${user.id}) avec le rôle '${user.role}' attend votre validation.`
    );
    res.send({
      statusCode: "200",
      message: `User '${user.email}' successfully registered ! Account is waiting for validation by the system administrator.`,
      data: user,
    });
  })
);
export default router;
