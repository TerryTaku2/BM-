const db = require("../config/db");

const createUsersTable = async () => {

    const query = `

        CREATE TABLE IF NOT EXISTS users (

            id SERIAL PRIMARY KEY,

            fullname VARCHAR(100) NOT NULL,

            email VARCHAR(100) UNIQUE NOT NULL,

            password VARCHAR(255) NOT NULL,

            role VARCHAR(20) NOT NULL,

            referral_code VARCHAR(50),

            referred_by INTEGER REFERENCES users(id),

            student_source VARCHAR(10) DEFAULT 'bm',

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        );

    `;

    try {

        await db.query(query);

        await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INTEGER REFERENCES users(id)`);
        await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS student_source VARCHAR(10) DEFAULT 'bm'`);

        console.log("Users table created successfully");

    } catch(error) {

        console.log(error.message);

    }

};

module.exports = createUsersTable;