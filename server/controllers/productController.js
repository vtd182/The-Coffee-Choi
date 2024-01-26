const Product = require("../models/Product");
const Category = require("../models/Category");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const bucket = require("../utils/upload");
const multer = require("multer");

exports.getAllProducts = catchAsync(async (req, res, next) => {
  // TODO: add filter, sort, limit, pagination
  const feature = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limit()
    .paginate();
  const products = await feature.query;
  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

// Get product by ID
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate({
    path: "category",
    select: "name -_id",
  });
  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

// Get product by slug
exports.getProductBySlug = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate({
    path: "category",
    select: "name -_id",
  });
  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

// Delete product
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  // Update status to false
  product.status = false;
  product.save();
  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Create product
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
exports.uploadImage = upload.single("file");
exports.createProduct = catchAsync(async (req, res, next) => {
  // Check if category exists
  const category = await Category.findOne({ name: req.body.category });
  if (!category) {
    return next(new AppError("No category found with that ID", 404));
  }
  req.body.category = category._id;

  // Upload image to firebase
  let publicUrl = "";
  if (req.file) {
    const { file } = req;
    const fileName = `${Date.now()}_${file.originalname}`;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    });
    blobStream.on("error", (err) => {
      next(err);
    });
    blobStream.on("finish", async () => {
      await blob.makePublic();

      // TODO: Lấy đường dẫn truy cập công khai
      publicUrl = await blob.getSignedUrl({
        action: "read",
        expires: "03-09-2025", // Thời gian hết hạn của đường dẫn ký
      });

      const product = await Product.create({
        ...req.body,
        image: publicUrl[0],
      });
      res.status(201).json({
        status: "success",
        data: {
          product,
        },
      });
    });
    blobStream.end(req.file.buffer);
  } else {
    const product = await Product.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        product,
      },
    });
  }
});