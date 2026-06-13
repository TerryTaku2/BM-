const express = require("express");

const router = express.Router();

const {
    recordPayment,
    getPayments
} = require("../controllers/paymentController");


// RECORD PAYMENT

router.post("/record-payment", recordPayment);


// GET PAYMENTS

router.get("/payments", getPayments);


module.exports = router;