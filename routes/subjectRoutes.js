const express = require("express");

const router = express.Router();

const {
    addSubject,
    getSubjects
} = require("../controllers/subjectController");


// ADD SUBJECT

router.post("/add-subject", addSubject);


// GET SUBJECTS

router.get("/subjects", getSubjects);


module.exports = router;