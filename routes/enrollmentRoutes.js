const express = require("express");

const router = express.Router();

const {
    enrollStudent,
    getEnrollments,
    getMyEnrollments
} = require("../controllers/enrollmentController");


router.post("/enroll-student", enrollStudent);

router.get("/enrollments", getEnrollments);

router.get("/my-enrollments", getMyEnrollments);


module.exports = router;
