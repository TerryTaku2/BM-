"use strict";

var db = require("../config/db"); // ADD SUBJECT


var addSubject = function addSubject(req, res) {
  var _req$body, subject_name, subject_code, level, query, values;

  return regeneratorRuntime.async(function addSubject$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, subject_name = _req$body.subject_name, subject_code = _req$body.subject_code, level = _req$body.level;
          query = "\n\n            INSERT INTO subjects\n            (subject_name, subject_code, level)\n\n            VALUES ($1, $2, $3)\n\n        ";
          values = [subject_name, subject_code, level];
          _context.next = 6;
          return regeneratorRuntime.awrap(db.query(query, values));

        case 6:
          res.send("Subject Added Successfully");
          _context.next = 13;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0.message);
          res.send("Failed to add subject");

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 9]]);
}; // GET ALL SUBJECTS


var getSubjects = function getSubjects(req, res) {
  var result;
  return regeneratorRuntime.async(function getSubjects$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(db.query("SELECT * FROM subjects ORDER BY id DESC"));

        case 3:
          result = _context2.sent;
          res.json(result.rows);
          _context2.next = 11;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0.message);
          res.send("Failed to fetch subjects");

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

module.exports = {
  addSubject: addSubject,
  getSubjects: getSubjects
};
//# sourceMappingURL=subjectController.dev.js.map
