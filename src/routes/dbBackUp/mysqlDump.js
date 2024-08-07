import mysqldump from "mysqldump";
import {environment} from "../../config/environment.js";
export async function generateMysqlDump(filename) {
  await mysqldump({
    connection: {
      host: environment.sql_db_host,
      user: environment.user,
      password: environment.userPwd,
      database: environment.sql_db_name,
    },
    dumpToFile: filename,
  }).catch(() => {});
}
