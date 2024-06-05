import mongoose from "mongoose";
import Joi from "joi";
import {joiSubSchema} from "./validation/joiUtilityFunctions.js";

//MONGODB MODELS DEFINITION
const ImageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    data: {
      type: String,
      required: true,
    },
  },
  {timestamps: true}
);
export const Image = mongoose.model("Image", ImageSchema);

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
//USER INPUT VALIDATION
export function validateImage(img, cs = "post") {
  let schema = Joi.object({
    name: Joi.string(),
    data: Joi.string(),
  });
  let required = [];
  switch (cs) {
    case "post":
      required = ["name", "image"];
      schema = schema.fork(required, (field) => field.required());
      return schema.validate(img);
    case "get":
    case "patch":
      const subSchema = joiSubSchema(schema, Object.keys(img));
      return subSchema
        ? subSchema.validate(img)
        : {
            error: {
              details: [{message: "Request body contains invalid fields."}],
            },
          };
  }
}
