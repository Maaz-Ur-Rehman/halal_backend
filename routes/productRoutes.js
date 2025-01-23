
const express = require("express");
const { getProducts } = require("../controllers/productController");
const router = express.Router();
router.get("/search-products", getProducts)


module.exports = router;