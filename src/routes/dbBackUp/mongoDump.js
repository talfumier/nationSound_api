import {MongoTools} from "node-mongotools";
import {rimraf} from "rimraf";
import {uploadFileToDrive} from "./googleDrive.js";
import {environment} from "../../config/environment.js";
export async function generateMongoDump(filename, callback) {
  const uri = environment.mongo_db_connection
    .replace("user", environment.user)
    .replace("pwd", environment.userPwd);
  const mongoTools = new MongoTools();
  mongoTools
    .mongodump({uri})
    .then((result) => {
      uploadFileToDrive(
        result.fullFileName,
        environment.google_backup_folder_id,
        "application/gz",
        filename,
        (success) => {
          rimraf.sync("backup"); //remove directory and .gz file
          rimraf.sync(result.fileName);
          callback(success); //success/failure from uploadFileToDrive()
        }
      );
    })
    .catch((err) => {
      console.log("Error in mongoDump.js ... ", err);
      callback(-1);
    });
}
