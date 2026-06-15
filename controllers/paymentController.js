const db = require("../config/db");


// RECORD PAYMENT — commission auto-detected from student profile

const recordPayment = async (req, res) => {

    try {

        const { student_id, amount } = req.body;

        const studentResult = await db.query(
            "SELECT student_source, referred_by FROM users WHERE id = $1 AND role = 'student'",
            [student_id]
        );

        if (studentResult.rows.length === 0) {
            return res.status(404).json({ message: "Student not found" });
        }

        const { student_source, referred_by } = studentResult.rows[0];
        const source = student_source || "bm";

        const tutor_commission = source === "tutor" ? amount * 0.6 : amount * 0.4;
        const bm_profit        = source === "tutor" ? amount * 0.4 : amount * 0.6;

        await db.query(
            `INSERT INTO payments (student_id, tutor_id, amount, tutor_commission, bm_profit, payment_source)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [student_id, referred_by || null, amount, tutor_commission, bm_profit, source]
        );

        res.status(201).json({
            message: "Payment recorded successfully",
            tutor_commission,
            bm_profit,
            payment_source: source
        });

    } catch (error) {

        console.log(error.message);
        res.status(500).json({ message: "Payment failed" });

    }

};


// GET ALL PAYMENTS (admin view)

const getPayments = async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
                payments.id,
                students.fullname AS student_name,
                tutors.fullname   AS tutor_name,
                payments.amount,
                payments.tutor_commission,
                payments.bm_profit,
                payments.payment_source,
                payments.created_at
            FROM payments
            JOIN users students ON payments.student_id = students.id
            LEFT JOIN users tutors ON payments.tutor_id = tutors.id
            ORDER BY payments.id DESC
        `);

        res.json(result.rows);

    } catch (error) {

        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch payments" });

    }

};


// GET EARNINGS FOR LOGGED-IN TUTOR

const getTutorEarnings = async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
                payments.id,
                students.fullname AS student_name,
                payments.amount,
                payments.tutor_commission,
                payments.created_at
            FROM payments
            JOIN users students ON payments.student_id = students.id
            WHERE payments.tutor_id = $1
            ORDER BY payments.id DESC
        `, [req.user.id]);

        const total = result.rows.reduce((sum, r) => sum + parseFloat(r.tutor_commission || 0), 0);

        res.json({ payments: result.rows, total_earnings: total });

    } catch (error) {

        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch earnings" });

    }

};


module.exports = { recordPayment, getPayments, getTutorEarnings };
