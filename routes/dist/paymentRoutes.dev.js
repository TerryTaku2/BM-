"use strict";

var express = require("express");

var router = express.Router();

var _require = require("../controllers/paymentController"),
    recordPayment = _require.recordPayment,
    getPayments = _require.getPayments; // RECORD PAYMENT


router.post("/record-payment", recordPayment); // GET PAYMENTS

router.get("/payments", getPayments);
module.exports = router;
//# sourceMappingURL=paymentRoutes.dev.js.map
