import {exec, execSync, spawn} from "child_process";
import zipFolder from "zip-folder";
import {uploadFileToDrive} from "./googleDrive.js";
import {environment} from "../../config/environment.js";
export async function generateMongoDump(filename) {
  const host = environment.mongo_db_connection
    .replace("user", environment.user)
    .replace("pwd", environment.userPwd);
  console.log(host);
  const cmd =
    "mongodump --uri " +
    host +
    // " --collection filecontainers" +
    " --out " +
    filename;
  // let process = spawn("mongodump", [
  //   `--uri=${host}`,
  //   "--collection=filecontainers",
  // ]);
  let process = execSync(
    "mongodump",
    [
      `--uri=${host}`,
      "--collection=filecontainers",
      "--authenticationDatabase avnadmin",
    ],
    (error, stdout, stderr) => {
      console.log("xxxx", error, stdout);
    }
  );
  process.on("exit", (code, signal) => {
    if (code) console.log("Backup process exited with code ", code);
    else if (signal)
      console.error("Backup process was killed with singal ", signal);
    else console.log("Successfully backedup the database");
  });

  // exec(cmd, function (error, stdout, stderr) {
  //   console.log("xxxx", error, stdout);
  //   // uploadFileToDrive(filename, "1Oy_3vTv4SXEE7XbDWVG1yOLs1zzbtrG6");
  // });
}
