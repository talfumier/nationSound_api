import jwt from "jsonwebtoken";
import {environment} from "../config/environment.js";
export function routeHandler(handler) {
  return async (req, res, next) => {
    try {
      const token = req.header("x-auth-token");
      if (token) {
        const decoded = jwt.verify(token, environment.sha256);
        req.user = decoded;
      }
      await handler(req, res);
    } catch (err) {
      next(err, req, res, next); //call error handler
    }
  };
}
