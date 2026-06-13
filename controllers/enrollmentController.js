const db = require("../config/db");


// ENROL STUDENT

const enrollStudent = async (req, res) => {

    try {

        const {
            student_id,
            subject_id
        } = req.body;

        const query = `

            INSERT INTO enrollments
            (student_id, subject_id)

            VALUES ($1, $2)

        `;

        await db.query(query, [
            student_id,
            subject_id
        ]);

        res.send("Student Enrolled Successfully");

    } catch(error) {

        console.log(error.message);

        res.send("Enrollment Failed");

    }

};



// GET ENROLMENTS

const getEnrollments = async (req, res) => {

    try {

        const result = await db.query(`

            SELECT
                enrollments.id,
                users.fullname,
                subjects.subject_name,
                subjects.level

            FROM enrollments

            JOIN users
            ON enrollments.student_id = users.id

            JOIN subjects
            ON enrollments.subject_id = subjects.id

            ORDER BY enrollments.id DESC

        `);

        res.json(result.rows);

    } catch(error) {

        console.log(error.message);

        res.send("Failed to fetch enrollments");

    }

};


module.exports = {
    enrollStudent,
    getEnrollments
};