import {google} from "googleapis";
import fs from "fs";
import _ from "lodash";
import {environment} from "../../config/environment.js";

const drive = google.drive("v3");

const jwtClient = new google.auth.JWT(
  environment.google_client_email,
  null,
  environment.google_private_key,
  ["https://www.googleapis.com/auth/drive"], //scopes
  null
);
export function uploadFileToDrive(
  filename,
  parent_folder_id,
  mimeType,
  renameTo,
  callback
) {
  jwtClient.authorize((authErr) => {
    if (authErr) {
      console.log(authErr);
      callback(-1);
      return;
    } else {
      const fileMetadata = {
        name: filename, //name of the file to be created on google drive
        parents: [parent_folder_id], // id of the parent folder
      };
      const media = {
        mimeType,
        body: fs.createReadStream(filename),
      };
      drive.files.create(
        {
          auth: jwtClient,
          resource: fileMetadata,
          media,
          fields: "id",
        },
        (err, file) => {
          if (err) {
            console.log(err);
            callback(-1);
            return;
          }
          console.log("File created with ID: ", file.data.id);
          if (renameTo) {
            drive.files.update(
              {
                auth: jwtClient,
                fileId: file.data.id,
                resource: {name: renameTo},
              },
              (err, res) => {
                if (err) {
                  console.log(err);
                  callback(-1);
                  return;
                }
              }
            );
          }
          callback(file.data.id);
        }
      );
    }
  });
}
export function cleanUpDrive(callback) {
  jwtClient.authorize((authErr) => {
    if (authErr) {
      console.log(authErr);
      callback(-1);
      return;
    } else {
      drive.files.list(
        {
          auth: jwtClient,
          fields: "files(name, id, createdTime)",
        },
        (err, data) => {
          if (err) {
            console.log(err);
            callback(-1);
            return;
          }
          const toBedeleted = _.orderBy(
            _.filter(data.data.files, (item) => {
              return item.id !== environment.google_backup_folder_id;
            }),
            "createdTime",
            "desc"
          ).slice(6); //keep last 3 backup of each (mysql and mongo)
          toBedeleted.map((file) => {
            drive.files.delete(
              {auth: jwtClient, fileId: file.id},
              (err, data) => {
                if (err) {
                  console.log(err);
                  callback(-1);
                  return;
                }
                console.log("File " + file.id + " deleted.");
                callback(1);
              }
            );
          });
        }
      );
    }
  });
}
