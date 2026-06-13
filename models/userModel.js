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

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        );

    `;

    try {

        await db.query(query);

        console.log("Users table created successfully");

    } catch(error) {

        console.log(error.message);

    }

};

module.exports = createUsersTable;