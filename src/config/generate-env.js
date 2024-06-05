import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const setEnv = () => {
  const writeFile = fs.writeFile;
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const targetPath = path.join(__dirname, "/environment.js");

  const configFile = `export const environment = {
    user: '${process.env.NATIONSOUND_DB_USER}',
    userPwd: '${process.env.NATIONSOUND_DB_USERPWD}',
    sql_db_host:'${process.env.NATIONSOUND_SQL_DB_HOST}',
    sql_db_port:'${process.env.NATIONSOUND_SQL_DB_PORT}',
    sha256:'${process.env.NATIONSOUND_API_SHA256}',
    salt_rounds:'${process.env.NATIONSOUND_API_SALT}',
    mail_jet_api_key:'${process.env.NATIONSOUND_API_MAILJETKEY}',
    mail_jet_api_secret:'${process.env.NATIONSOUND_API_MAILJETSECRET}',
    mail_jet_sender:'${process.env.NATIONSOUND_API_MAILJETSENDER}',
    production: true,
  };`;
  writeFile(targetPath, configFile, (err) => {
    if (err) console.error(err);
    else
      console.log(
        `Node.js environment.js file generated correctly at ${targetPath} \n`
      );
  });
};

setEnv();
