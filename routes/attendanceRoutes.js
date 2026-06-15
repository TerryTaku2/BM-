const express = require("express");
const router  = express.Router();

const {
    markAttendance,
    markLeave,
    getAllAttendance,
    getMyAttendance,
    getStudentAttendance
} = require("../controllers/attendanceController");

router.post("/attendance/mark",        markAttendance);
router.post("/attendance/leave",       markLeave);
router.get("/attendance",              getAllAttendance);
router.get("/attendance/me",           getMyAttendance);
router.get("/attendance/student/:student_id", getStudentAttendance);

module.exports = router;
