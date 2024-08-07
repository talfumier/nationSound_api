import {google} from "googleapis";
import fs from "fs";
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
  delete_after_upload = true
) {
  // attempt authorization
  jwtClient.authorize((authErr) => {
    if (authErr) {
      console.log(authErr);
      return;
    } else {
      const fileMetadata = {
        name: filename, //name of the file to be created on google drive
        parents: [parent_folder_id], // id of the parent folder
      };
      // create data object (from file contents)
      const media = {
        mimeType: "text/plain",
        body: fs.createReadStream(filename),
      };
      // initate create request
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
            return;
          }
          // console.log("File created with ID: ", file.data.id);
          if (delete_after_upload) {
            fs.unlink(filename, (err) => {
              if (err) {
                console.log(
                  "An error occurred while deleting the file: " + err
                );
              }
            });
          }
        }
      );
    }
  });
}
