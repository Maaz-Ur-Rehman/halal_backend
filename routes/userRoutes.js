const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
// const s3Upload = require('../middlewares/s3Upload');

const multer = require('multer');
const { verifyToken } = require("../middlewares/authenticate");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post('/register',upload.single('profile'),userController.register);

router.post("/login", userController.signIn);

router.get('/getProfile',verifyToken, userController.getProfile);


module.exports = router;
