import mysqldump from "mysqldump";
import {rimraf} from "rimraf";
import {environment} from "../../config/environment.js";
import {uploadFileToDrive} from "./googleDrive.js";
export function generateMysqlDump(filename) {
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
        () => {
          rimraf.sync(filename);
        }
      );
    })
    .catch((err) => {
      console.log("Error in mysqlDump.js ... ", err);
    });
}
