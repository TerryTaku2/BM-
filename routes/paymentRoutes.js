const express = require("express");

const router = express.Router();

const {
    recordPayment,
    getPayments,
    getTutorEarnings
} = require("../controllers/paymentController");


// RECORD PAYMENT

router.post("/record-payment", recordPayment);


// GET ALL PAYMENTS (admin)

router.get("/payments", getPayments);


// GET TUTOR EARNINGS (tutor's own)

router.get("/my-earnings", getTutorEarnings);


module.exports = router;