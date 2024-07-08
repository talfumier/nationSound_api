import mongoose from "mongoose";
import Joi from "joi";
import {joiSubSchema} from "./validation/utilityFunctions.js";

/*MONGODB MODELS DEFINITION*/

/* IMAGES & IMAGE CONTAINERS */
export const ImageSchema = new mongoose.Schema({
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
export const Image = mongoose.model("Image", ImageSchema);
export const ImageContainerSchema = new mongoose.Schema(
  {
    // _id: {type: Number, required: true},
    images: [{type: ImageSchema, required: true, default: []}],
  },
  {timestamps: true}
);
export const ImageContainer = mongoose.model(
  "ImageContainer",
  ImageContainerSchema
);
/* USER INPUT VALIDATION */
export const JoiImageSchema = Joi.object({
  name: Joi.string(),
  lastModified: Joi.number(),
  main: Joi.boolean(),
  type: Joi.string(),
  size: Joi.number(),
  data: Joi.string(),
});
export function validateImage(image, cs = "post") {
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
      return schema.validate(image);
    case "get":
    case "patch":
      const subSchema = joiSubSchema(schema, Object.keys(image));
      return subSchema
        ? subSchema.validate(image)
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
