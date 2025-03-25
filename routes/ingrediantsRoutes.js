
const express = require("express");
const {  getIngredientStatus, getIngredientByEcodeAndName,getIngredientByAdditives,getAdditive,getIngredientByEcodeAndAdditive } = require("../controllers/ingrediantsController");
const router = express.Router();
// router.post("/search-ingredients", searchIngrediants)
router.post("/scan-ingredients", getIngredientStatus)
// router.post("/search-ecode", getIngredientByEcodeAndName)

router.post("/search-ecode", getIngredientByEcodeAndAdditive)
router.get("/additives", getAdditive)
router.post("/search-additives", getIngredientByAdditives)

module.exports = router;

