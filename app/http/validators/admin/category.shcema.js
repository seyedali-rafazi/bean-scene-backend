const Joi = require("joi");
const createHttpError = require("http-errors");
const { MongoIDPattern } = require("../../../../utils/constants");

const addCategorySchema = Joi.object({
  title: Joi.string()
    .required()
    .min(3)
    .max(100)
    .error(
      createHttpError.BadRequest(
        "The Persian title of the category is not valid"
      )
    ),
  englishTitle: Joi.string()
    .required()
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
    .valid("foodGroup", "category", "post", "comment", "ticket")
    .error(createHttpError.BadRequest("The category type is not valid")),
  parentId: Joi.string()
    .allow("")
    .pattern(MongoIDPattern)
    .error(createHttpError.BadRequest("The provided ID is not valid")),
});

const updateCategorySchema = Joi.object({
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
    .valid("foodgroup", "post", "comment", "ticket")
    .error(createHttpError.BadRequest("The category type is not valid")),
});

module.exports = {
  addCategorySchema,
  updateCategorySchema,
};
