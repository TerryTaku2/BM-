const db = require("../config/db");

const createEnrollmentsTable = async () => {

    try {

        const query = `

            CREATE TABLE IF NOT EXISTS enrollments (

                id SERIAL PRIMARY KEY,

                student_id INTEGER REFERENCES users(id),

                subject_id INTEGER REFERENCES subjects(id),

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

            )

        `;

        await db.query(query);

        console.log("Enrollments table created successfully");

    } catch(error) {

        console.log(error.message);

    }

};

module.exports = createEnrollmentsTable;