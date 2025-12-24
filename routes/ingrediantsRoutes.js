
const express = require("express");
const { getEcodeByStatus, getIngredientStatus,getCertifiedByStatus,getSubCategoryByStatus,getCategoryByStatus,getIngredientByEcodeAndName,getIngredientByEcodeAndAdditive,getIngredientByAdditives,getAdditive,searchIngredients} = require("../controllers/ingrediantsController");
const router = express.Router();
// router.post("/search-ingredients", searchIngrediants)
router.post("/scan-ingredients", getIngredientStatus)
// router.post("/search-ecode", getIngredientByEcodeAndName)
router.post("/search-ecodes", getIngredientByEcodeAndAdditive)
router.post("/search-ecode", searchIngredients)
router.get("/additives", getAdditive)
router.post("/search-additives", getIngredientByAdditives)

router.get("/get-ecode",getEcodeByStatus)

router.get("/get-category",getCategoryByStatus)

router.get("/get-subcategory",getSubCategoryByStatus)

router.get("/get-certificate", getCertifiedByStatus)

module.exports = router;

