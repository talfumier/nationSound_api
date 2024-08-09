import express from "express";
import {format} from "date-fns";
import {routeHandler} from "../../middleware/routeHandler.js";
import {generateMysqlDump} from "./mysqlDump.js";
import {generateMongoDump} from "./mongoDump.js";
import {cleanUpDrive} from "./googleDrive.js";

const router = express.Router();

router.get(
  "/mysql",
  routeHandler(async (req, res) => {
    const date = format(new Date(), "yyyy-MM-dd");
    let result = {
      statusCode: "200",
      message: `MySQL database successfully backed-up on ${date}`,
    };
    generateMysqlDump("mysqldump_" + date + ".sql", (success) => {
      if (success === -1)
        result = {
          statusCode: 500,
          message: `MySQL database back-up failed on ${date}`,
        };
    });
    res.send(result);
  })
);
router.get(
  "/mongo",
  routeHandler(async (req, res) => {
    const date = format(new Date(), "yyyy-MM-dd");
    let result = {
      statusCode: "200",
      message: `MongoDB database successfully backed-up on ${date}`,
    };
    generateMongoDump("mongodump_" + date + ".gz", (success) => {
      if (success === -1)
        result = {
          statusCode: 500,
          message: `MongoDB database back-up failed on ${date}`,
        };
    });
    res.send(result);
  })
);
router.get(
  "/cleanup",
  routeHandler(async (req, res) => {
    const date = format(new Date(), "yyyy-MM-dd");
    let result = {
      statusCode: "200",
      message: `Google drive database back-up files successfully cleaned-up on ${date}`,
    };
    cleanUpDrive((success) => {
      if (success === -1)
        result = {
          statusCode: 500,
          message: `Google drive database back-up files clean-up failed on ${date}`,
        };
    });
    res.send(result);
  })
);
export default router;
