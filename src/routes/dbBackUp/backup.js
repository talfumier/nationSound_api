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
    generateMysqlDump("mysqldump_" + date + ".sql");
    res.send({
      statusCode: "200",
      message: `MySQL database successfully backed-up on ${date}`,
    });
  })
);
router.get(
  "/mongo",
  routeHandler(async (req, res) => {
    const date = format(new Date(), "yyyy-MM-dd");
    generateMongoDump("mongodump_" + date);
    res.send({
      statusCode: "200",
      message: `MongoDB database successfully backed-up on ${date}`,
    });
  })
);
router.get(
  "/cleanup",
  routeHandler(async (req, res) => {
    const date = format(new Date(), "yyyy-MM-dd");
    cleanUpDrive();
    res.send({
      statusCode: "200",
      message: `Google drive database successfully cleaned-up on ${date}`,
    });
  })
);
export default router;
