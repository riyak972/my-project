const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.post("/add-sample", productController.addSampleProducts);
router.get("/", productController.getAllProducts);
router.get("/category/:category", productController.getByCategory);
router.get("/variants", productController.getVariants);
router.put("/update-stock", productController.updateStock);

module.exports = router;