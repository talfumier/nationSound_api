import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {routeHandler} from "../../middleware/routeHandler.js";
import {User} from "../../models/mysqlModels.js";
import {Unauthorized} from "../../models/validation/errors.js";
import config from "../../config/config.json" assert {type: "json"};
import {environment} from "../../config/environment.js";

const router = express.Router();

router.post(
  "/",
  routeHandler(async (req, res) => {
    const user = await User.findOne({
      where: {email: req.body.email},
    });
    if (user) {
      if (!user.validated)
        return res.send(
          new Unauthorized("Your account is still pending validation.")
        );
      const pwd_valid = await bcrypt.compare(req.body.pwd, user.pwd);
      if (pwd_valid) {
        const token = jwt.sign(
          {
            id: user.id,
            last_name: user.last_name,
            first_name: user.first_name,
            email: user.email,
            role: user.role,
            files_id: user.files_id,
          },
          environment.sha256, //signing algorithm secret key kept in an environment variable
          {
            expiresIn: config.token_expires_in,
          }
        );
        await user.update({last_connection: new Date()});
        user.pwd = undefined;
        return res
          .header("x-auth-token", token)
          .header("access-control-expose-headers", ["x-auth-token"])
          .send({
            statusCode: "200",
            message: `User with id:${user.id} successfully logged-in.`,
            data: user,
          });
      }
    }
    return res.send(new Unauthorized("Wrong username or password."));
  })
);
export default router;
