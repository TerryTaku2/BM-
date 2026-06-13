"use strict";

var db = require("../config/db");

var createUsersTable = function createUsersTable() {
  var query;
  return regeneratorRuntime.async(function createUsersTable$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          query = "\n\n        CREATE TABLE IF NOT EXISTS users (\n\n            id SERIAL PRIMARY KEY,\n\n            fullname VARCHAR(100) NOT NULL,\n\n            email VARCHAR(100) UNIQUE NOT NULL,\n\n            password VARCHAR(255) NOT NULL,\n\n            role VARCHAR(20) NOT NULL,\n\n            referral_code VARCHAR(50),\n\n            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n\n        );\n\n    ";
          _context.prev = 1;
          _context.next = 4;
          return regeneratorRuntime.awrap(db.query(query));

        case 4:
          console.log("Users table created successfully");
          _context.next = 10;
          break;

        case 7:
          _context.prev = 7;
          _context.t0 = _context["catch"](1);
          console.log(_context.t0.message);

        case 10:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[1, 7]]);
};

module.exports = createUsersTable;
//# sourceMappingURL=userModel.dev.js.map
