import express from "express";
import {errorHandler} from "../middleware/errorHandler.js";
import {invalidPathHandler} from "../middleware/invalidPathHandler.js";
import entities from "./entities.js";
import files from "./files.js";
import translate from "./google/translate.js";
import register from "./users/register.js";
import validate from "./users/validate.js";
import login from "./users/login.js";
import profile from "./users/profile.js";
import users from "./users/users.js";

export function routes(app) {
  app.use(express.json({limit: "10mb"})); //express built-in middleware applies to any route
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // indicate from which domain the request is coming from (CORS)
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
  app.use("/api/validate", validate);
  app.use("/api/login", login);
  app.use("/api/profile", profile);
  app.use("/api/users", users);

  app.use(errorHandler); //custom error handler middleware > function signature : function (err,req,res,next)
  app.use(invalidPathHandler); //invalid path handler middleware > eventually triggerered when none of the routes matches
}
