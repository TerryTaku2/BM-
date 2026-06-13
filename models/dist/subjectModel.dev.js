"use strict";

var db = require("../config/db");

var createSubjectsTable = function createSubjectsTable() {
  var query;
  return regeneratorRuntime.async(function createSubjectsTable$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          query = "\n\n            CREATE TABLE IF NOT EXISTS subjects (\n\n                id SERIAL PRIMARY KEY,\n\n                subject_name VARCHAR(100) NOT NULL,\n\n                subject_code VARCHAR(50) UNIQUE NOT NULL,\n\n                level VARCHAR(50) NOT NULL,\n\n                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n\n            )\n\n        ";
          _context.next = 4;
          return regeneratorRuntime.awrap(db.query(query));

        case 4:
          console.log("Subjects table created successfully");
          _context.next = 10;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0.message);

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

module.exports = createSubjectsTable;
//# sourceMappingURL=subjectModel.dev.js.map
