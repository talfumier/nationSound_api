// @ts-check
import express from "express";
import {errorHandler} from "../middleware/errorHandler.js";
import {invalidPathHandler} from "../middleware/invalidPathHandler.js";
import dates from "./dates.js";
import artists from "./artists.js";
import pois from "./pois.js";
import events from "./events.js";
import faqs from "./faqs.js";
import transports from "./transports.js";
import messages from "./messages.js";
import newsletters from "./newsletters.js";
import partners from "./partners.js";
import register from "./users/register.js";
import validate from "./users/validate.js";
import login from "./users/login.js";
import profile from "./users/profile.js";
import users from "./users/users.js";

export function routes(app) {
  app.use(express.json()); //express built-in middleware applies to any route

  app.use("/api/dates", dates);
  app.use("/api/artists", artists);
  app.use("/api/pois", pois);
  app.use("/api/events", events);
  app.use("/api/faqs", faqs);
  app.use("/api/transports", transports);
  app.use("/api/messages", messages);
  app.use("/api/newsletters", newsletters);
  app.use("/api/partners", partners);

  app.use("/api/register", register);
  app.use("/api/validate", validate);
  app.use("/api/login", login);
  app.use("/api/profile", profile);
  app.use("/api/users", users);

  app.use(errorHandler); //custom error handler middleware > function signature : function (err,req,res,next)
  app.use(invalidPathHandler); //invalid path handler middleware > eventually triggerered when none of the routes matches
}
