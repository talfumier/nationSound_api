import {DataTypes} from "sequelize";
import Joi from "joi";
import {joiPasswordExtendCore} from "joi-password";
import {joiSubSchema} from "./validation/utilityFunctions.js";
/* MYSQL MODELS DEFINITION */
export let Dates,
  Artist,
  Poi,
  Event,
  Faq,
  Transport,
  Message,
  Newsletter,
  Partner,
  User,
  connection;
export function defineMySqlModels(mySqlConnection) {
  Dates = mySqlConnection.define("dates", {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    opening_hours: {type: DataTypes.STRING, allowNull: false},
    street: {type: DataTypes.STRING, allowNull: false},
    city: {type: DataTypes.STRING, allowNull: false},
    lat: {type: DataTypes.STRING, allowNull: false},
    lng: {type: DataTypes.STRING, allowNull: false},
  });
  Artist = mySqlConnection.define("artists", {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    name: {type: DataTypes.STRING, allowNull: false},
    country: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
    albums: {type: DataTypes.STRING, allowNull: true, defaultValue: ""},
    composition: {type: DataTypes.STRING, allowNull: false},
    style: {type: DataTypes.STRING, allowNull: false},
    images_id: {
      type: DataTypes.STRING,
      allowNull: true, //images container _id in mongoDB
    },
  });
  Poi = mySqlConnection.define("pois", {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    name: {type: DataTypes.STRING, allowNull: false},
    type: {type: DataTypes.STRING, allowNull: false},
  });
  Event = mySqlConnection.define("events", {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    performer: {type: DataTypes.INTEGER, allowNull: false},
    type: {type: DataTypes.STRING, allowNull: false},
    location: {type: DataTypes.INTEGER, allowNull: false},
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
  Faq = mySqlConnection.define("faqs", {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    question: {type: DataTypes.STRING, allowNull: false},
    answer: {type: DataTypes.STRING, allowNull: false},
  });
  Transport = mySqlConnection.define("transports", {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    title: {type: DataTypes.STRING, allowNull: false},
    transport_mean: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
  });
  Message = mySqlConnection.define("messages", {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    title: {type: DataTypes.STRING, allowNull: false},
    text: {type: DataTypes.STRING, allowNull: false},
    criticality: {type: DataTypes.STRING, allowNull: false},
    active: {type: DataTypes.BOOLEAN, allowNull: false},
    order: {type: DataTypes.INTEGER, allowNull: false},
  });
  Newsletter = mySqlConnection.define("newsletters", {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    email: {type: DataTypes.STRING, allowNull: false},
  });
  Partner = mySqlConnection.define("partners", {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    name: {type: DataTypes.STRING, allowNull: false},
    image: {type: DataTypes.STRING, allowNull: true}, //image ObjectId in mongoDB
  });
  User = mySqlConnection.define("users", {
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true},
    last_name: {type: DataTypes.STRING, allowNull: false},
    first_name: {type: DataTypes.STRING, allowNull: false},
    email: {type: DataTypes.STRING, allowNull: false},
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "editor",
    },
    validated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    pwd: {type: DataTypes.STRING, allowNull: false},
    last_connection: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });
  connection = mySqlConnection;
  return {
    Artist,
    Poi,
    Event,
  };
}
/* USER INPUT VALIDATION */
export function validateDates(dates, cs = "post") {
  let schema = Joi.object({
    start_date: Joi.date(),
    end_date: Joi.date(),
    opening_hours: Joi.string(),
    street: Joi.string(),
    city: Joi.string(),
    lat: Joi.string(),
    lng: Joi.string(),
  });
  let required = [];
  switch (cs) {
    case "post":
      required = [
        "start_date",
        "end_date",
        "opening_hours",
        "street",
        "city",
        "lat",
        "lng",
      ];
      schema = schema.fork(required, (field) => field.required());
      return schema.validate(dates);
    case "get":
    case "patch":
      const subSchema = joiSubSchema(schema, Object.keys(dates));
      return subSchema
        ? subSchema.validate(dates)
        : {
            error: {
              details: [{message: "Request body contains invalid fields."}],
            },
          };
  }
}
export function validateArtist(artist, cs = "post") {
  let schema = Joi.object({
    name: Joi.string(),
    country: Joi.string(),
    description: Joi.string(),
    albums: Joi.string().allow(null),
    composition: Joi.string(),
    style: Joi.string(),
    images_id: Joi.string().allow(null),
  });
  let required = [];
  switch (cs) {
    case "post":
      required = [
        "name",
        "country",
        "description",
        "composition",
        "style",
        "images_id",
      ];
      schema = schema.fork(required, (field) => field.required());
      return schema.validate(artist);
    case "get":
    case "patch":
      const subSchema = joiSubSchema(schema, Object.keys(artist));
      return subSchema
        ? subSchema.validate(artist)
        : {
            error: {
              details: [{message: "Request body contains invalid fields."}],
            },
          };
  }
}
export function validatePoi(poi, cs = "post") {
  let schema = Joi.object({
    name: Joi.string(),
    type: Joi.string().valid("stage", "meeting"),
  });
  let required = [];
  switch (cs) {
    case "post":
      required = ["name", "type"];
      schema = schema.fork(required, (field) => field.required());
      return schema.validate(poi);
    case "get":
    case "patch":
      const subSchema = joiSubSchema(schema, Object.keys(poi));
      return subSchema
        ? subSchema.validate(poi)
        : {
            error: {
              details: [{message: "Request body contains invalid fields."}],
            },
          };
  }
}
export function validateEvent(event, cs = "post") {
  let schema = Joi.object({
    performer: Joi.number(),
    type: Joi.string().valid("concert", "rencontre"),
    location: Joi.number(),
    date: Joi.date(),
  });
  let required = [];
  switch (cs) {
    case "post":
      required = ["performer", "type", "location", "date"];
      schema = schema.fork(required, (field) => field.required());
      return schema.validate(event);
    case "get":
    case "patch":
      const subSchema = joiSubSchema(schema, Object.keys(event));
      return subSchema
        ? subSchema.validate(event)
        : {
            error: {
              details: [{message: "Request body contains invalid fields."}],
            },
          };
  }
}
export function validateFaq(faq, cs = "post") {
  let schema = Joi.object({
    question: Joi.string(),
    answer: Joi.string(),
  });
  let required = [];
  switch (cs) {
    case "post":
      required = ["question", "answer"];
      schema = schema.fork(required, (field) => field.required());
      return schema.validate(faq);
    case "get":
    case "patch":
      const subSchema = joiSubSchema(schema, Object.keys(faq));
      return subSchema
        ? subSchema.validate(faq)
        : {
            error: {
              details: [{message: "Request body contains invalid fields."}],
            },
          };
  }
}
export function validateTransport(transport, cs = "post") {
  let schema = Joi.object({
    title: Joi.string(),
    transport_mean: Joi.string().valid("car", "plane", "train"),
    description: Joi.string(),
  });
  let required = [];
  switch (cs) {
    case "post":
      required = ["title", "transport_mean", "description"];
      schema = schema.fork(required, (field) => field.required());
      return schema.validate(transport);
    case "get":
    case "patch":
      const subSchema = joiSubSchema(schema, Object.keys(transport));
      return subSchema
        ? subSchema.validate(transport)
        : {
            error: {
              details: [{message: "Request body contains invalid fields."}],
            },
          };
  }
}
export function validateMessage(message, cs = "post") {
  let schema = Joi.object({
    title: Joi.string(),
    text: Joi.string(),
    criticality: Joi.string().valid("info", "warning"),
    active: Joi.boolean(),
    order: Joi.number(),
  });
  let required = [];
  switch (cs) {
    case "post":
      required = ["title", "text", "criticality", "active", "order"];
      schema = schema.fork(required, (field) => field.required());
      return schema.validate(message);
    case "get":
    case "patch":
      const subSchema = joiSubSchema(schema, Object.keys(message));
      return subSchema
        ? subSchema.validate(message)
        : {
            error: {
              details: [{message: "Request body contains invalid fields."}],
            },
          };
  }
}
export function validateNewsletter(newsletter, cs = "post") {
  let schema = Joi.object({
    email: Joi.string().email(),
  });
  let required = [];
  switch (cs) {
    case "post":
      required = ["email"];
      schema = schema.fork(required, (field) => field.required());
      return schema.validate(newsletter);
    case "get":
    case "patch":
      const subSchema = joiSubSchema(schema, Object.keys(newsletter));
      return subSchema
        ? subSchema.validate(newsletter)
        : {
            error: {
              details: [{message: "Request body contains invalid fields."}],
            },
          };
  }
}
export function validatePartner(partner, cs = "post") {
  let schema = Joi.object({
    name: Joi.string(),
    image: Joi.string().allowNull(),
  });
  let required = [];
  switch (cs) {
    case "post":
      required = ["name", "image"];
      schema = schema.fork(required, (field) => field.required());
      return schema.validate(partner);
    case "get":
    case "patch":
      const subSchema = joiSubSchema(schema, Object.keys(partner));
      return subSchema
        ? subSchema.validate(partner)
        : {
            error: {
              details: [{message: "Request body contains invalid fields."}],
            },
          };
  }
}
export function validateUser(user, cs = "post") {
  const joiPassword = Joi.extend(joiPasswordExtendCore);
  let schema = Joi.object({
    last_name: Joi.string(),
    first_name: Joi.string(),
    email: Joi.string().email(),
    role: Joi.string().valid("admin", "editor"),
    validated: Joi.date().optional(),
    pwd: joiPassword
      .string()
      .min(8)
      .max(60)
      .minOfSpecialCharacters(1)
      .minOfUppercase(1)
      .minOfNumeric(1)
      .noWhiteSpaces(),
    last_connection: Joi.date(),
  });
  let required = [];
  switch (cs) {
    case "post":
      required = ["last_name", "first_name", "email", "role", "pwd"];
      schema = schema.fork(required, (field) => field.required());
      return schema.validate(user);
    case "get":
    case "patch":
      const subSchema = joiSubSchema(schema, Object.keys(user));
      return subSchema
        ? subSchema.validate(user)
        : {
            error: {
              details: [{message: "Request body contains invalid fields."}],
            },
          };
  }
}
