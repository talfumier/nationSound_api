// @ts-check
import express from "express";
import {authHandler} from "../../middleware/authHandler.js";
import {authAdmin} from "../../middleware/authAdmin.js";
import {routeHandler} from "../../middleware/routeHandler.js";
import {User} from "../../models/mysqlModels.js";
import {BadRequest} from "../../models/validation/errors.js";
import {sendBasicEmail} from "../../mailjet/sendEmail.js";
import {validateIntegerId} from "../../models/validation/utilityFunctions.js";

const router = express.Router();

router.patch(
  "/:userId", // user.id to be validated
  [authHandler, authAdmin], //only an admin can validate a user
  routeHandler(async (req, res) => {
    const userId = req.params.userId;
    let error = validateIntegerId(userId).error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    const user = await User.findByPk(userId, {
      attributes: {exclude: ["pwd"]},
    });
    if (!user)
      return res.send(new BadRequest(`User with id:${userId} not found.`));
    await user.update({validated: new Date()});
    sendBasicEmail(
      user.email,
      "nationsounds_api: validation de votre compte",
      `<b>${user.email}</b> (id:${user.id}) avec le rôle '${user.role}' a été validé.`
    );
    res.send({
      statusCode: "200",
      message: `User with id:${userId} successfully validated.`,
      data: user,
    });
  })
);
export default router;
