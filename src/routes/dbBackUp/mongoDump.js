import {exec} from "child_process";
import zipFolder from "zip-folder";
import {rimraf} from "rimraf";
import {uploadFileToDrive} from "./googleDrive.js";
import {environment} from "../../config/environment.js";
export function generateMongoDump(filename) {
  const uri = environment.mongo_db_connection
    .replace("user", environment.user)
    .replace("pwd", environment.userPwd);
  const cmd =
    "mongodump --uri " + uri + " --collection filecontainers" + " --out ./";
  exec(cmd, function (error, stdout, stderr) {
    if (error) {
      console.log("Error in mongoDump.js ... ", error);
      return;
    }
    zipFolder("nationsound", filename + ".zip", function (err) {
      if (err) console.log("Zip error in mongoDump.js ... ", err);
      else
        uploadFileToDrive(
          filename + ".zip",
          environment.google_backup_folder_id,
          "application/zip",
          () => {
            //remove directory and zip file
            rimraf.sync("nationsound");
            rimraf.sync(filename + ".zip");
          }
        );
    });
  });
}
