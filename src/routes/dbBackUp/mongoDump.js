import fs from "fs";
import {rimraf} from "rimraf";
import {uploadFileToDrive} from "./googleDrive.js";
import {FileContainer} from "../../models/mongoDbModels.js";
import {environment} from "../../config/environment.js";
export async function generateMongoDump(filename, callback) {
  //mongoDB dump is limited to the filecontainers collection
  await FileContainer.find()
    .then((result) => {
      fs.writeFile("./" + filename, JSON.stringify(result), (error) => {
        if (error) {
          console.log("Error in mongoDump.js ... ", error);
          callback(-1);
          return;
        }
        uploadFileToDrive(
          filename,
          environment.google_backup_folder_id,
          "application/json",
          null,
          (success) => {
            rimraf.sync(filename);
            callback(success); //success/failure from uploadFileToDrive()
          }
        );
      });
    })
    .catch((err) => {
      console.log("Error in mongoDump.js ... ", err);
      callback(-1);
    });
}
