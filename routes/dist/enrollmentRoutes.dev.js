"use strict";

var express = require("express");

var router = express.Router();

var _require = require("../controllers/enrollmentController"),
    enrollStudent = _require.enrollStudent,
    getEnrollments = _require.getEnrollments; // ENROLL STUDENT


router.post("/enroll-student", enrollStudent); // GET ENROLLMENTS

router.get("/enrollments", getEnrollments);
module.exports = router;
//# sourceMappingURL=enrollmentRoutes.dev.js.map
