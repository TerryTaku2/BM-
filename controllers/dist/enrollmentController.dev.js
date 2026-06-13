"use strict";

var db = require("../config/db"); // ENROL STUDENT


var enrollStudent = function enrollStudent(req, res) {
  var _req$body, student_id, subject_id, query;

  return regeneratorRuntime.async(function enrollStudent$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, student_id = _req$body.student_id, subject_id = _req$body.subject_id;
          query = "\n\n            INSERT INTO enrollments\n            (student_id, subject_id)\n\n            VALUES ($1, $2)\n\n        ";
          _context.next = 5;
          return regeneratorRuntime.awrap(db.query(query, [student_id, subject_id]));

        case 5:
          res.send("Student Enrolled Successfully");
          _context.next = 12;
          break;

        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0.message);
          res.send("Enrollment Failed");

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 8]]);
}; // GET ENROLMENTS


var getEnrollments = function getEnrollments(req, res) {
  var result;
  return regeneratorRuntime.async(function getEnrollments$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(db.query("\n\n            SELECT\n                enrollments.id,\n                users.fullname,\n                subjects.subject_name,\n                subjects.level\n\n            FROM enrollments\n\n            JOIN users\n            ON enrollments.student_id = users.id\n\n            JOIN subjects\n            ON enrollments.subject_id = subjects.id\n\n            ORDER BY enrollments.id DESC\n\n        "));

        case 3:
          result = _context2.sent;
          res.json(result.rows);
          _context2.next = 11;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0.message);
          res.send("Failed to fetch enrollments");

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

module.exports = {
  enrollStudent: enrollStudent,
  getEnrollments: getEnrollments
};
//# sourceMappingURL=enrollmentController.dev.js.map
