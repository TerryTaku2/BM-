const express = require("express");

const router = express.Router();

const {
    enrollStudent,
    getEnrollments
} = require("../controllers/enrollmentController");


// ENROLL STUDENT

router.post("/enroll-student", enrollStudent);


// GET ENROLLMENTS

router.get("/enrollments", getEnrollments);


module.exports = router;