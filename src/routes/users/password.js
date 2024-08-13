import express from "express";
import bcrypt from "bcrypt";
import {format} from "date-fns";
import {Token} from "../../models/mongoDbModels.js";
import {User, validateUser} from "../../models/mysqlModels.js";
import {
  BadRequest,
  NotFound,
  InternalServerError,
  Unauthorized,
} from "../../models/validation/errors.js";
import {routeHandler} from "../../middleware/routeHandler.js";
import {environment} from "../../config/environment.js";
import {sendBasicEmail} from "../../mailjet/sendEmail.js";
import {validateIntegerId} from "../../models/validation/utilityFunctions.js";

const router = express.Router();

//request a new password
router.post(
  "/forgotPassword", //No authentication when requesting a new password
  routeHandler(async (req, res) => {
    const {error} = validateUser({email: req.body.email}, "postForgotPwd");
    if (error) return res.send(new BadRequest(error.details[0].message));
    const {email} = req.body;
    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (!user)
      return res.send(new NotFound(`User ${email} could not be found.`));
    let token = await Token.findOne({userId: user.id});
    if (token) await token.deleteOne();
    const {randomBytes} = await import("node:crypto");
    const resetToken = randomBytes(256).toString("hex");
    console.log(resetToken);
    const hash = await bcrypt.hash(resetToken, environment.salt_rounds);
    console.log(hash);
    const data = await Token.create({
      userId: user.id,
      token: hash ? hash : "vvvvvv",
    });
    console.log(data);
    sendBasicEmail(
      user.email,
      "NationSound : mot de passe oublié",
      `<div>
        <span>
          Veuillez suivre ce lien pour créer un nouveau mot de passe :
        </span>
        <span>
          <a href=${environment.bo_source_url}/resetpassword?id=${
        user.id
      }&random=${resetToken}>
            Réinitialisation mot de passe
          </a>
        </span>
       <br />
        <span>
          Ce lien est utilisable jusqu'à ${format(
            data.createdAt.getTime() + 300e3,
            "HH:mm:ss"
          )}.     
        </span>
      </div>`, //plain (i.e. not hashed) resetToken
      (err) => {
        if (err)
          res.send(
            new InternalServerError(`Unable to deliver mail to user ${email}.`)
          );
        else
          res.send({
            statusCode: "200",
            message: `Email with reset instructions is on its way to ${email}.`,
          });
      }
    );
  })
);
//process password reset following "forgot password" request
router.patch(
  "/forgotPassword/:id/:resetToken", //No authentication when updating a forgotten password
  routeHandler(async (req, res) => {
    const id = req.params.id;
    let error = validateIntegerId(id).error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    error = validateUser(req.body, "patch").error;
    if (error) return res.send(new BadRequest(error.details[0].message));
    const user = await User.findByPk(id);
    if (!user) return res.send(new NotFound(`User ${id} could not be found.`));
    const token = await Token.findOne({userId: id});
    if (!token)
      return res.send(new Unauthorized("Invalid or expired reset token."));
    const isValid = bcrypt.compare(req.params.resetToken, token.token);
    if (!isValid)
      return res.send(
        new Unauthorized("Invalid or expired password reset token")
      );
    user.pwd = await bcrypt.hash(req.body.pwd, environment.salt_rounds);
    await user.save();
    res.send({
      statusCode: "200",
      message: `Password successfully reset for ${user.email}.`,
    });
  })
);
export default router;
