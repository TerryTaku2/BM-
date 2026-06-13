const db = require("../config/db");

const createSubjectsTable = async () => {

    try {

        const query = `

            CREATE TABLE IF NOT EXISTS subjects (

                id SERIAL PRIMARY KEY,

                subject_name VARCHAR(100) NOT NULL,

                subject_code VARCHAR(50) UNIQUE NOT NULL,

                level VARCHAR(50) NOT NULL,

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

            )

        `;

        await db.query(query);

        console.log("Subjects table created successfully");

    } catch(error) {

        console.log(error.message);

    }

};

module.exports = createSubjectsTable;