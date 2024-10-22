const Controller = require("../../controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const mongoose = require("mongoose");
const {
  copyObject,
  deleteInvalidPropertyInObject,
} = require("../../../../../utils/functions");
const createHttpError = require("http-errors");
const ObjectId = mongoose.Types.ObjectId;
const { CategoryModel } = require("../../../../models/category");
const { FoodGroupSchemaModel } = require("../../../../models/foodGroups");
const { UserModel } = require("../../../../models/user");
const { ProductModel } = require("../../../../models/product");
const {
  addProductSchema,
  changeCourseDiscountSchema,
} = require("../../../validators/admin/product.schema");

class ProductController extends Controller {
  async addNewProduct(req, res) {
    await addProductSchema.validateAsync(req.body);
    const {
      title,
      description,
      slug,
      imageLink,
      foodGroup,
      category,
      price,
      discount = 0,
      offPrice,
    } = req.body;

    const product = await ProductModel.create({
      title,
      description,
      slug,
      imageLink,
      category,
      foodGroup,
      price,
      discount,
      offPrice,
    });
    if (!product?._id)
      throw createHttpError.InternalServerError("Product was not registered");
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: {
        message: "Product successfully created",
        product,
      },
    });
  }

  async getListOfProducts(req, res) {
    let dbQuery = {};
    const user = req.user;
    const { search, category, sort, foodGroup } = req.query;
    if (search) dbQuery["$text"] = { $search: search };
    if (category) {
      const categories = category.split(",");
      const categoryIds = [];
      for (const item of categories) {
        const { _id } = await CategoryModel.findOne({ englishTitle: item });
        categoryIds.push(_id);
      }
      dbQuery["category"] = {
        $in: categoryIds,
      };
    }
    if (foodGroup) {
      const foodGroups = foodGroup.split(",");
      const foodGroupIds = [];
      for (const item of foodGroups) {
        const { _id } = await FoodGroupSchemaModel.findOne({
          englishTitle: item,
        });
        foodGroupIds.push(_id);
      }
      dbQuery["foodGroup"] = {
        $in: foodGroupIds,
      };
    }

    const sortQuery = {};
    if (!sort) sortQuery["createdAt"] = 1;
    if (sort) {
      if (sort === "latest") sortQuery["createdAt"] = -1;
      if (sort === "earliest") sortQuery["createdAt"] = 1;
      if (sort === "popular") sortQuery["likes"] = -1;
    }

    const products = await ProductModel.find(dbQuery, {
      reviews: 0,
    })
      .populate([{ path: "foodGroup", select: { title: 1, englishTitle: 1 } }])
      .populate([{ path: "category", select: { title: 1, englishTitle: 1 } }])
      .sort(sortQuery);

    const transformedProducts = copyObject(products);

    const newProducts = transformedProducts.map((product) => {
      product.likesCount = product.likes.length;
      product.isLiked = false;
      if (!user) {
        product.isLiked = false;
        delete product.likes;
        return product;
      }
      if (product.likes.includes(user._id.toString())) {
        product.isLiked = true;
      }
      delete product.likes;
      return product;
    });
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        products: newProducts,
      },
    });
  }

  async getProductById(req, res) {
    const { id: productId } = req.params;
    await this.findProductById(productId);
    const product = await ProductModel.findById(productId).populate([
      {
        path: "category",
        model: "Category",
        select: {
          title: 1,
          icon: 1,
          englishTitle: 1,
        },
      },
    ]);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        product,
      },
    });
  }

  async getOneProductBySlug(req, res) {
    const { slug } = req.params;
    const product = await ProductModel.findOne({ slug }).populate([
      {
        path: "category",
        model: "Category",
        select: {
          title: 1,
          icon: 1,
          englishTitle: 1,
        },
      },
    ]);

    if (!product)
      throw createHttpError.NotFound(
        "Product with these specifications was not found"
      );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        product,
      },
    });
  }

  async changeProductDiscountStatus(req, res) {
    const { id } = req.params;
    await this.findProductById(id);
    await changeCourseDiscountSchema.validateAsync(req.body);
    const { discount, offPrice } = req.body;
    const result = await ProductModel.updateOne(
      { _id: id },
      { $set: { discount, offPrice } }
    );
    if (result.modifiedCount > 0) {
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: {
          message: "Product discount status activated",
        },
      });
    }
    throw createHttpError.BadRequest("Change was not made, please try again");
  }

  async removeProduct(req, res) {
    const { id } = req.params;
    await this.findProductById(id);
    const deleteResult = await ProductModel.deleteOne({ _id: id });
    if (deleteResult.deletedCount == 0)
      throw createError.InternalServerError(
        "Product deletion was not performed"
      );
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "Product successfully deleted",
      },
    });
  }

  async updateProduct(req, res) {
    const { id } = req.params;
    await this.findProductById(id);
    const data = copyObject(req.body);
    let blackListFields = ["bookmarks", "likes", "reviews"];
    deleteInvalidPropertyInObject(data, blackListFields);
    const updateProductResult = await ProductModel.updateOne(
      { _id: id },
      {
        $set: data,
      }
    );
    if (!updateProductResult.modifiedCount)
      throw new createHttpError.InternalServerError(
        "Product update was not performed"
      );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "Product successfully updated",
      },
    });
  }

  async likeProduct(req, res) {
    const { id: productId } = req.params;
    const user = req.user;
    const product = await this.findProductById(productId);
    const likedProduct = await ProductModel.findOne({
      _id: productId,
      likes: user._id,
    });
    const updateProductQuery = likedProduct
      ? { $pull: { likes: user._id } }
      : { $push: { likes: user._id } };

    const updateUserQuery = likedProduct
      ? { $pull: { likedProducts: product._id } }
      : { $push: { likedProducts: product._id } };

    const productUpdate = await ProductModel.updateOne(
      { _id: productId },
      updateProductQuery
    );
    const userUpdate = await UserModel.updateOne(
      { _id: user._id },
      updateUserQuery
    );

    if (productUpdate.modifiedCount === 0 || userUpdate.modifiedCount === 0)
      throw createHttpError.BadRequest("Operation was unsuccessful.");

    let message;
    if (!likedProduct) {
      message = "Thanks for your like";
    } else message = "Your like was removed";

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message,
      },
    });
  }

  async findProductById(id) {
    if (!mongoose.isValidObjectId(id))
      throw createHttpError.BadRequest("The sent product ID is incorrect");
    const product = await ProductModel.findById(id);
    if (!product) throw createHttpError.NotFound("No product found.");
    return product;
  }
}

module.exports = {
  ProductController: new ProductController(),
};
