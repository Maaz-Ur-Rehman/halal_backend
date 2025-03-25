const express = require("express");
const { test } = require("../controllers/testController");
const router = express.Router();


router.get("/testapi", test);




module.exports = router;
