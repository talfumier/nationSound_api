import express from "express";
import {errorHandler} from "../src/middleware/errorHandler.js";
import {invalidPathHandler} from "../src/middleware/invalidPathHandler.js";
import entities from "../src/routes/entities.js";
import files from "../src/routes/files.js";
import translate from "../src/routes/google/translate.js";
import register from "../src/routes/users/register.js";
import login from "../src/routes/users/login.js";
import password from "../src/routes/users/password.js";
export function routes(app) {
  app.use(express.json({limit: "10mb"})); //express built-in middleware applies to any route
  app.use(function (req, res, next) {
    const corsWhitelist = ["http://localhost:3000", "http://localhost:4200"]; // indicate from which authorized domain(s) the request is coming from (CORS)
    const origin = req.headers.origin ? req.headers.origin.toLowerCase() : "";
    if (corsWhitelist.indexOf(origin) > -1) {
      res.header("Access-Control-Allow-Origin", origin);
    }
    res.header(
      "Access-Control-Allow-Methods",
      "GET,HEAD,OPTIONS,POST,PUT,PATCH,DELETE"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, x-auth-token"
    );
    next();
  });

  app.use("/api/entities", entities);
  app.use("/api/files", files);
  app.use("/api/translate", translate);

  app.use("/api/register", register);
  app.use("/api/login", login);
  app.use("/api/resetpassword", password);

  app.use(errorHandler); //custom error handler middleware > function signature : function (err,req,res,next)
  app.use(invalidPathHandler); //invalid path handler middleware > eventually triggerered when none of the routes matches
}
