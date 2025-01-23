
const express = require("express");
const {  getIngredientStatus, getIngredientByEcodeAndName } = require("../controllers/ingrediantsController");
const router = express.Router();
// router.post("/search-ingredients", searchIngrediants)
router.post("/scan-ingredients", getIngredientStatus)
router.post("/search-ecode", getIngredientByEcodeAndName)


module.exports = router;

