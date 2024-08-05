const createError = require("http-errors");
const Joi = require("joi");
const { MongoIDPattern } = require("../../../../utils/constants");

const addProductSchema = Joi.object({
  title: Joi.string()
    .required()
    .min(3)
    .max(30)
    .error(createError.BadRequest("Product title is not valid")),
  description: Joi.string()
    .required()
    .error(createError.BadRequest("The provided description is not valid")),
  slug: Joi.string()
    .required()
    .error(createError.BadRequest("The provided slug is not valid")),
  imageLink: Joi.string()
    .required()
    .error(createError.BadRequest("The course image link is not valid")),
  foodGroup: Joi.string()
    .required()
    .regex(MongoIDPattern)
    .error(createError.BadRequest("The food group category is not valid")),
  category: Joi.string()
    .required()
    .regex(MongoIDPattern)
    .error(createError.BadRequest("The food group category is not valid")),
  price: Joi.number()
    .required()
    .error(createError.BadRequest("The provided price is not valid")),
  discount: Joi.number()
    .allow(0)
    .error(createError.BadRequest("The provided discount is not valid")),
  offPrice: Joi.number()
    .allow(0)
    .error(createError.BadRequest("The discounted price is not valid")),
});

const changeCourseDiscountSchema = Joi.object({
  offPrice: Joi.number()
    .required()
    .error(createError.BadRequest("The provided price is not valid")),
  discount: Joi.number()
    .required()
    .allow(0)
    .error(createError.BadRequest("The provided discount is not valid")),
});

module.exports = {
  addProductSchema,
  changeCourseDiscountSchema,
};
