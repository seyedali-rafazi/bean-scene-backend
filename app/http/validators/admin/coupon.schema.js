const Joi = require("joi");
const createHttpError = require("http-errors");

const addCouponSchema = Joi.object({
  code: Joi.string()
    .required()
    .min(5)
    .max(30)
    .error(createHttpError.BadRequest("Invalid discount code.")),
  type: Joi.string()
    .required()
    .valid("fixedProduct", "percent")
    .error(
      createHttpError.BadRequest(
        "Please enter the correct type of discount code."
      )
    ),
  amount: Joi.number()
    .required()
    .error(
      createHttpError.BadRequest("Please enter the correct discount amount.")
    ),
  expireDate: Joi.date()
    .allow()
    .error(
      createHttpError.BadRequest("Please enter the correct expiration date.")
    ),
  usageLimit: Joi.number()
    .required()
    .error(
      createHttpError.BadRequest(
        "Please enter the correct usage limit for the discount code."
      )
    ),
  productIds: Joi.array().error(
    createHttpError.BadRequest("Invalid product ID.")
  ),
});

module.exports = {
  addCouponSchema,
};
