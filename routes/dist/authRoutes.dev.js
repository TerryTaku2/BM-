"use strict";

var express = require("express");

var router = express.Router();

var _require = require("../controllers/authController"),
    registerUser = _require.registerUser,
    loginUser = _require.loginUser; // REGISTER ROUTE


router.post("/register", registerUser); // LOGIN ROUTE

router.post("/login", loginUser);
module.exports = router;
//# sourceMappingURL=authRoutes.dev.js.map
