const express = require("express");
const router  = express.Router();

const {
    createTest,
    publishTest,
    getTestsBySubject,
    getTest,
    submitTest,
    getTestResults,
    getMyResults
} = require("../controllers/testController");

router.post("/tests",                       createTest);
router.patch("/tests/:id/publish",          publishTest);
router.get("/tests/subject/:subject_id",    getTestsBySubject);
router.get("/tests/:id",                    getTest);
router.post("/tests/submit",                submitTest);
router.get("/tests/:id/results",            getTestResults);
router.get("/my-results",                   getMyResults);

module.exports = router;
