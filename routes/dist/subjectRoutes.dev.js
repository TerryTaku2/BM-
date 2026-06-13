"use strict";

var express = require("express");

var router = express.Router();

var _require = require("../controllers/subjectController"),
    addSubject = _require.addSubject,
    getSubjects = _require.getSubjects; // ADD SUBJECT


router.post("/add-subject", addSubject); // GET SUBJECTS

router.get("/subjects", getSubjects);
module.exports = router;
//# sourceMappingURL=subjectRoutes.dev.js.map
