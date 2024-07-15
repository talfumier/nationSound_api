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
  data: {
    type: String,
    required: true,
    default: "",
  },
});
export const File = mongoose.model("File", FileSchema);
export const FileContainerSchema = new mongoose.Schema(
  {
    // _id: {type: Number, required: true},
    images: [{type: FileSchema, required: true, default: []}],
  },
  {timestamps: true}
);
export const FileContainer = mongoose.model(
  "FileContainer",
  FileContainerSchema
);
/* USER INPUT VALIDATION */
export const JoiFileSchema = Joi.object({
  name: Joi.string(),
  lastModified: Joi.number(),
  main: Joi.boolean(),
  type: Joi.string(),
  size: Joi.number(),
  data: Joi.string(),
});
export function validateFile(file, cs = "post") {
  let schema = Joi.object({
    name: Joi.string().optional(),
    lastModified: Joi.number().optional(),
    main: Joi.boolean().optional(),
    type: Joi.string().optional(),
    size: Joi.number().optional(),
    data: Joi.string().optional(),
  });
  let required = [];
  switch (cs) {
    case "post":
      required = ["name", "lastModified", "main", "type", "size", "data"];
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

/* UMAP JSON DATA */
const UmapSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    geometry: {
      type: Object,
      required: true,
    },
    properties: {
      type: Object,
      required: true,
    },
    uri: {
      type: String,
      required: true,
    },
    layers: [
      {
        type: Object,
        required: true,
      },
    ],
  },
  {timestamps: true}
);
export const Umap = mongoose.model("Umap", UmapSchema);
