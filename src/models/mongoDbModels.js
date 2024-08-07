import mongoose from "mongoose";
import Joi from "joi";
import {joiSubSchema} from "./validation/utilityFunctions.js";

/*MONGODB MODELS DEFINITION*/

/* IMAGES & IMAGE CONTAINERS */
export const FileSchema = new mongoose.Schema({
  //single image schema
  _id: false,
  name: {
    type: String,
    required: true,
    trim: true,
    default: "",
  },
  lastModified: {
    type: Number,
    default: 1561110050000,
  },
  main: {type: Boolean, default: false},
  type: {
    type: String,
    default: "image/png",
  },
  size: {
    type: Number,
    default: 0,
  },
  url: {
    type: String,
    required: false,
    default: null,
  },
  data: {
    type: String,
    required: false,
    default: null,
  },
});
export const File = mongoose.model("File", FileSchema);
export const FileContainerSchema = new mongoose.Schema(
  {
    // _id: {type: Number, required: true},
    files: [{type: FileSchema, required: true, default: []}],
  },
  {timestamps: true}
);
export const FileContainer = mongoose.model(
  "FileContainer",
  FileContainerSchema
);
/*TOKENS FOR USER PASSWORD RESET*/
const TokenSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, //token is automatically deleted after 300s >>> mongosh command : db.tokens.createIndex( { "createdAt": 1 }, { expireAfterSeconds: 300 } )
  },
});
export const Token = mongoose.model("Token", TokenSchema);

export function validateFile(file, cs = "post") {
  let schema = Joi.object({
    name: Joi.string(),
    lastModified: Joi.number(),
    main: Joi.boolean(),
    type: Joi.string(),
    size: Joi.number(),
    url: Joi.string().allow(null),
    data: Joi.string().allow(null, ""),
  });
  let required = [];
  switch (cs) {
    case "post":
      required = ["name", "lastModified", "main", "type", "size"];
      schema = schema.fork(required, (field) => field.required());
      return schema.validate(file);
    case "get":
    case "patch":
      const subSchema = joiSubSchema(schema, Object.keys(file));
      return subSchema
        ? subSchema.validate(file)
        : {
            error: {
              details: [{message: "Request body contains invalid fields."}],
            },
          };
  }
}
export function validateToken(token, cs = "post") {
  let schema = Joi.object({
    userId: Joi.number(),
    token: Joi.string(),
  });
  const required = ["userId", "token"];
  schema = schema.fork(required, (field) => field.required());
  return schema.validate(token);
}
