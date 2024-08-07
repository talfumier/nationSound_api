import express from "express";
import {environment} from "../../config/environment.js";
import translate from "translate";
import langdetect from "langdetect";
import {routeHandler} from "../../middleware/routeHandler.js";

const router = express.Router();

router.post(
  "/", //no authentication required
  routeHandler(async (req, res) => {
    translate.engine = "google";
    translate.key = environment.google_api_key;
    const text = await translate(req.body.text, {
      from: req.body.from
        ? req.body.from
        : langdetect.detect(req.body.text)[0].lang,
      to: req.body.to,
    });
    res.send({
      statusCode: "200",
      text,
    });
  })
);
export default router;
