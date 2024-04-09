const express = require("express");
const router = express.Router();
const { register, logIn } = require("../controllers/userController");

router.post("/login", logIn);

router.post("/register", register);

module.exports = router;
