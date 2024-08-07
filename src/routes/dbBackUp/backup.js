import express from "express";
import {format} from "date-fns";
import zipFolder from "zip-folder";
import {routeHandler} from "../../middleware/routeHandler.js";
import {generateMysqlDump} from "./mysqlDump.js";
import {generateMongoDump} from "./mongoDump.js";
import {uploadFileToDrive} from "./googleDrive.js";

const router = express.Router();

router.get(
  "/mysql",
  routeHandler(async (req, res) => {
    const date = format(new Date(), "yyyy-MM-dd");
    let file = "mysqldump_" + date + ".sql";
    generateMysqlDump(file);
    uploadFileToDrive(file, "1Oy_3vTv4SXEE7XbDWVG1yOLs1zzbtrG6");
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
    let file = "mongodump_" + date + ".bson";
    generateMongoDump(file);
    res.send({
      statusCode: "200",
      message: `MongoDB database successfully backed-up on ${date}`,
    });
  })
);
export default router;
