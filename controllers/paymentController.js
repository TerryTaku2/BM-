const db = require("../config/db");


// RECORD PAYMENT

const recordPayment = async (req, res) => {

    try {

        const {
            student_id,
            amount,
            payment_source
        } = req.body;

        let tutor_commission = 0;
        let bm_profit = 0;

        // BM BROUGHT STUDENT

        if(payment_source === "bm") {

            tutor_commission = amount * 0.4;

            bm_profit = amount * 0.6;

        }

        // TUTOR BROUGHT STUDENT

        else if(payment_source === "tutor") {

            tutor_commission = amount * 0.6;

            bm_profit = amount * 0.4;

        }

        const query = `

            INSERT INTO payments
            (
                student_id,
                amount,
                tutor_commission,
                bm_profit,
                payment_source
            )

            VALUES ($1, $2, $3, $4, $5)

        `;

        await db.query(query, [
            student_id,
            amount,
            tutor_commission,
            bm_profit,
            payment_source
        ]);

        res.send("Payment Recorded Successfully");

    } catch(error) {

        console.log(error.message);

        res.send("Payment Failed");

    }

};



// GET PAYMENTS

const getPayments = async (req, res) => {

    try {

        const result = await db.query(

            "SELECT * FROM payments ORDER BY id DESC"

        );

        res.json(result.rows);

    } catch(error) {

        console.log(error.message);

        res.send("Failed to fetch payments");

    }

};


module.exports = {
    recordPayment,
    getPayments
};