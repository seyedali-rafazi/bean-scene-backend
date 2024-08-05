const Joi = require("joi");
const createHttpError = require("http-errors");
const { MongoIDPattern } = require("../../../../utils/constants");

const addFoodGroupSchema = Joi.object({
  title: Joi.string()
    .required()
    .min(3)
    .max(100)
    .error(
      createHttpError.BadRequest(
        "The Persian title of the food group category is not valid"
      )
    ),
  category: Joi.string()
    .required()
    .regex(MongoIDPattern)
    .error(createHttpError.BadRequest("The selected category is not valid")),

  englishTitle: Joi.string()
    .required()
    .min(3)
    .max(100)
    .error(
      createHttpError.BadRequest(
        "The English title of the food group category is not valid"
      )
    ),
  description: Joi.string()
    .required()
    .min(3)
    .max(200)
    .error(
      createHttpError.BadRequest(
        "The description of the food group category is not valid"
      )
    ),

  type: Joi.string()
    .required()
    .min(3)
    .max(100)
    .valid("foodGroup", "post", "comment", "ticket")
    .error(
      createHttpError.BadRequest(
        "The type of the food group category is not valid"
      )
    ),

  foodParentId: Joi.string()
    .allow("")
    .pattern(MongoIDPattern)
    .error(
      createHttpError.BadRequest("The provided food group ID is not valid")
    ),
});

const updateFoodGroupSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .error(
      createHttpError.BadRequest(
        "The Persian title of the category is not valid"
      )
    ),
  englishTitle: Joi.string()
    .min(3)
    .max(100)
    .error(
      createHttpError.BadRequest(
        "The English title of the category is not valid"
      )
    ),
  description: Joi.string()
    .required()
    .min(3)
    .max(200)
    .error(createHttpError.BadRequest("The category description is not valid")),
  type: Joi.string()
    .required()
    .min(3)
    .max(100)
    .valid("product", "post", "comment", "ticket")
    .error(createHttpError.BadRequest("The category type is not valid")),
});

module.exports = {
  addFoodGroupSchema,
  updateFoodGroupSchema,
};
