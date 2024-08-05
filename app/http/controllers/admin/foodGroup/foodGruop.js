const Controller = require("../../controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const createHttpError = require("http-errors");
const {
  addFoodGroupSchema,
  updateFoodGroupSchema,
} = require("../../../validators/admin/foodGroup.schema");
const { FoodGroupSchemaModel } = require("../../../../models/foodGroups");

class FoodGroupController extends Controller {
  async getListOfFoodGroup(req, res) {
    const query = req.query;
    const foodGroup = await FoodGroupSchemaModel.find(query);
    if (!foodGroup)
      throw createHttpError.ServiceUnavailable("Categories not found");

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        foodGroup,
      },
    });
  }

  async addNewFoodGroup(req, res) {
    const { title, englishTitle, description, type, parent, category } =
      await addFoodGroupSchema.validateAsync(req.body);
    await this.findFoodGroupWithTitle(englishTitle);
    const foodGroup = await FoodGroupSchemaModel.create({
      title,
      englishTitle,
      description,
      type,
      parent,
      category,
    });

    if (!foodGroup) throw createHttpError.InternalServerError("Internal error");
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: {
        message: "Category added successfully",
      },
    });
  }

  async findFoodGroupWithTitle(englishTitle) {
    const foodGroup = await FoodGroupSchemaModel.findOne({ englishTitle });
    if (foodGroup)
      throw createHttpError.BadRequest(
        "A category with this title already exists."
      );
  }

  async checkExistFoodGroup(id) {
    const foodGroup = await FoodGroupSchemaModel.findById(id);
    if (!foodGroup)
      throw createHttpError.BadRequest(
        "A category with this title does not exist."
      );
    return foodGroup;
  }

  async updateFoodGroupy(req, res) {
    const { id } = req.params;
    const { title, englishTitle, type, description } = req.body;
    await this.checkExistFoodGroup(id);
    await updateFoodGroupSchema.validateAsync(req.body);
    const updateResult = await FoodGroupSchemaModel.updateOne(
      { _id: id },
      {
        $set: { title, englishTitle, type, description },
      }
    );
    if (updateResult.modifiedCount == 0)
      throw createError.InternalServerError("Update was not performed");
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "Update was successful",
      },
    });
  }

  async removeFoodGroup(req, res) {
    const { id } = req.params;
    const foodGroup = await this.checkExistFoodGroup(id);
    const deleteResult = await FoodGroupSchemaModel.deleteMany({
      $or: [{ _id: foodGroup._id }, { parentId: foodGroup._id }],
    });
    if (deleteResult.deletedCount == 0)
      throw createError.InternalServerError(
        "Category deletion was not performed"
      );
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "Category deletion was successful",
      },
    });
  }

  async getFoodGroupById(req, res) {
    const { id } = req.params;
    const foodGroup = await this.checkExistFoodGroup(id);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        foodGroup,
      },
    });
  }
}

module.exports = {
  FoodGroupController: new FoodGroupController(),
};
