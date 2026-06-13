"use strict";

var db = require("../config/db");

var bcrypt = require("bcrypt"); // REGISTER USER


var registerUser = function registerUser(req, res) {
  var _req$body, fullname, email, password, role, referral_code, hashedPassword, query, values;

  return regeneratorRuntime.async(function registerUser$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, fullname = _req$body.fullname, email = _req$body.email, password = _req$body.password, role = _req$body.role, referral_code = _req$body.referral_code;
          _context.next = 4;
          return regeneratorRuntime.awrap(bcrypt.hash(password, 10));

        case 4:
          hashedPassword = _context.sent;
          query = "\n\n            INSERT INTO users\n            (fullname, email, password, role, referral_code)\n\n            VALUES ($1, $2, $3, $4, $5)\n\n            RETURNING *;\n\n        ";
          values = [fullname, email, hashedPassword, role, referral_code];
          _context.next = 9;
          return regeneratorRuntime.awrap(db.query(query, values));

        case 9:
          res.send("User Registered Successfully");
          _context.next = 16;
          break;

        case 12:
          _context.prev = 12;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0.message);
          res.send("Registration Failed");

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 12]]);
}; // LOGIN USER


var loginUser = function loginUser(req, res) {
  var _req$body2, email, password, result, user, validPassword;

  return regeneratorRuntime.async(function loginUser$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password; // CHECK USER

          _context2.next = 4;
          return regeneratorRuntime.awrap(db.query("SELECT * FROM users WHERE email = $1", [email]));

        case 4:
          result = _context2.sent;

          if (!(result.rows.length === 0)) {
            _context2.next = 7;
            break;
          }

          return _context2.abrupt("return", res.send("User not found"));

        case 7:
          user = result.rows[0]; // CHECK PASSWORD

          _context2.next = 10;
          return regeneratorRuntime.awrap(bcrypt.compare(password, user.password));

        case 10:
          validPassword = _context2.sent;

          if (validPassword) {
            _context2.next = 13;
            break;
          }

          return _context2.abrupt("return", res.send("Invalid password"));

        case 13:
          if (!(user.role === "student")) {
            _context2.next = 15;
            break;
          }

          return _context2.abrupt("return", res.redirect("/student-dashboard"));

        case 15:
          if (!(user.role === "tutor")) {
            _context2.next = 17;
            break;
          }

          return _context2.abrupt("return", res.redirect("/tutor-dashboard"));

        case 17:
          if (!(user.role === "parent")) {
            _context2.next = 19;
            break;
          }

          return _context2.abrupt("return", res.redirect("/parent-dashboard"));

        case 19:
          if (!(user.role === "admin")) {
            _context2.next = 21;
            break;
          }

          return _context2.abrupt("return", res.redirect("/admin-dashboard"));

        case 21:
          if (!(user.role === "superadmin")) {
            _context2.next = 23;
            break;
          }

          return _context2.abrupt("return", res.redirect("/superadmin-dashboard"));

        case 23:
          // DEFAULT
          res.send("Login Successful");
          _context2.next = 30;
          break;

        case 26:
          _context2.prev = 26;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0.message);
          res.send("Login Failed");

        case 30:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 26]]);
};

module.exports = {
  registerUser: registerUser,
  loginUser: loginUser
};
//# sourceMappingURL=authController.dev.js.map
