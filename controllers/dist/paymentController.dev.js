"use strict";

var db = require("../config/db"); // RECORD PAYMENT


var recordPayment = function recordPayment(req, res) {
  var _req$body, student_id, amount, payment_source, tutor_commission, bm_profit, query;

  return regeneratorRuntime.async(function recordPayment$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _req$body = req.body, student_id = _req$body.student_id, amount = _req$body.amount, payment_source = _req$body.payment_source;
          tutor_commission = 0;
          bm_profit = 0; // BM BROUGHT STUDENT

          if (payment_source === "bm") {
            tutor_commission = amount * 0.4;
            bm_profit = amount * 0.6;
          } // TUTOR BROUGHT STUDENT
          else if (payment_source === "tutor") {
              tutor_commission = amount * 0.6;
              bm_profit = amount * 0.4;
            }

          query = "\n\n            INSERT INTO payments\n            (\n                student_id,\n                amount,\n                tutor_commission,\n                bm_profit,\n                payment_source\n            )\n\n            VALUES ($1, $2, $3, $4, $5)\n\n        ";
          _context.next = 8;
          return regeneratorRuntime.awrap(db.query(query, [student_id, amount, tutor_commission, bm_profit, payment_source]));

        case 8:
          res.send("Payment Recorded Successfully");
          _context.next = 15;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0.message);
          res.send("Payment Failed");

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 11]]);
}; // GET PAYMENTS


var getPayments = function getPayments(req, res) {
  var result;
  return regeneratorRuntime.async(function getPayments$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _context2.next = 3;
          return regeneratorRuntime.awrap(db.query("SELECT * FROM payments ORDER BY id DESC"));

        case 3:
          result = _context2.sent;
          res.json(result.rows);
          _context2.next = 11;
          break;

        case 7:
          _context2.prev = 7;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0.message);
          res.send("Failed to fetch payments");

        case 11:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 7]]);
};

module.exports = {
  recordPayment: recordPayment,
  getPayments: getPayments
};
//# sourceMappingURL=paymentController.dev.js.map
