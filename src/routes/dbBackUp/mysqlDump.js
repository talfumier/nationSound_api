import mysqldump from "mysqldump";
import {rimraf} from "rimraf";
import {environment} from "../../config/environment.js";
import {uploadFileToDrive} from "./googleDrive.js";
export function generateMysqlDump(filename, callback) {
  mysqldump({
    connection: {
      host: environment.sql_db_host,
      port: environment.sql_db_port,
      database: environment.sql_db_name,
      user: environment.user,
      password: environment.userPwd,
    },
    dumpToFile: filename,
  })
    .then(() => {
      uploadFileToDrive(
        filename,
        environment.google_backup_folder_id,
        "text/plain",
        null,
        (success) => {
          rimraf.sync(filename); //remove file
          callback(success); //success/failure from uploadFileToDrive()
        }
      );
    })
    .catch((err) => {
      console.log("Error in mysqlDump.js ... ", err);
      callback(-1);
    });
}
