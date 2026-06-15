const db = require("../config/db");


// ENROL STUDENT

const enrollStudent = async (req, res) => {

    try {

        const { student_id, subject_id } = req.body;

        await db.query(
            `INSERT INTO enrollments (student_id, subject_id) VALUES ($1, $2)`,
            [student_id, subject_id]
        );

        res.status(201).json({ message: "Student enrolled successfully" });

    } catch (error) {

        console.log(error.message);
        res.status(500).json({ message: "Enrollment failed" });

    }

};


// GET ALL ENROLMENTS

const getEnrollments = async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
                enrollments.id,
                users.fullname AS student_name,
                subjects.subject_name,
                subjects.level,
                enrollments.created_at
            FROM enrollments
            JOIN users ON enrollments.student_id = users.id
            JOIN subjects ON enrollments.subject_id = subjects.id
            ORDER BY enrollments.id DESC
        `);

        res.json(result.rows);

    } catch (error) {

        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch enrollments" });

    }

};


// GET ENROLLMENTS FOR THE LOGGED-IN STUDENT

const getMyEnrollments = async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
                subjects.id AS subject_id,
                subjects.subject_name,
                subjects.subject_code,
                subjects.level,
                enrollments.created_at
            FROM enrollments
            JOIN subjects ON enrollments.subject_id = subjects.id
            WHERE enrollments.student_id = $1
            ORDER BY enrollments.id DESC
        `, [req.user.id]);

        res.json(result.rows);

    } catch (error) {

        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch your enrollments" });

    }

};


module.exports = { enrollStudent, getEnrollments, getMyEnrollments };
