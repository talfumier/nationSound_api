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
    sql_db_name: '${process.env.NATIONSOUND_DB_NAME}',
    sql_db_host:'${process.env.NATIONSOUND_SQL_DB_HOST}',
    sql_db_port:'${process.env.NATIONSOUND_SQL_DB_PORT}',
    mongo_db_connection:'${process.env.NATIONSOUND_MONGO_DB_CONNECTION}',
    sha256:'${process.env.NATIONSOUND_API_SHA256}',
    salt_rounds:'${process.env.NATIONSOUND_API_SALT}',
    mail_jet_api_key:'${process.env.NATIONSOUND_API_MAILJETKEY}',
    mail_jet_api_secret:'${process.env.NATIONSOUND_API_MAILJETSECRET}',
    mail_jet_sender:'${process.env.NATIONSOUND_API_MAILJETSENDER}',
    google_api_key:'${process.env.NATIONSOUND_API_GOOGLEAPIKEY}',
    cloudinary_name: '${process.env.NATIONSOUND_CLOUDINARY_NAME}',
    cloudinary_api_key: '${process.env.NATIONSOUND_CLOUDINARY_APIKEY}',
    cloudinary_api_secret: '${process.env.NATIONSOUND_CLOUDINARY_APISECRET}',
    front_source_url:'${process.env.NATIONSOUND_FRONT_SOURCE_URL}',
    bo_source_url:'${process.env.NATIONSOUND_BACK_OFFICE_URL}',
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
