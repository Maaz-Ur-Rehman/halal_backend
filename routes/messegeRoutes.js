const express = require("express");
const { send, getMessages } = require("../controllers/messegeController");
const router = express.Router();
router.post("/messege", send);
router.get("/getMessege/:fromId/:toId", getMessages);

module.exports = router;
