import Joi from "joi";

export const JoiIntegerIdSchema = Joi.number().integer().min(0).required(); //integer >=0 required
export function validateIntegerId(id) {
  return JoiIntegerIdSchema.validate(id);
}
export function joiSubSchema(base, fields) {
  const baseFields = Object.keys(base.describe().keys);
  if (fields.every((field) => baseFields.includes(field))) {
    //check that incoming fields are all contained in base schema fields
    return fields.reduce((schema, field) => {
      if (baseFields.indexOf(field) !== -1)
        return schema.concat(
          Joi.object({
            [field]: base.extract(field),
          })
        );
    }, Joi.object());
  }
  return null;
}
export function bodyCleanUp(body) {
  const keys = Object.keys(body);
  keys.map((key) => {
    switch (key) {
      case "last_name":
      case "first_name":
      case "role":
      case "email":
        body[key] = body[key].toString().trim();
        break;
      default:
    }
  });
  return body;
}
export const JoiObjectIdSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .required();
export function validateObjectId(id) {
  //ObjectId validation
  return JoiObjectIdSchema.validate(id);
}
export function strToDate(str) {
  const arr = str.split("/");
  return new Date(`${arr[2]}/${arr[1]}/${arr[0]}`);
}
