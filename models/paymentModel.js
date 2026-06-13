const db = require("../config/db");

const createPaymentsTable = async () => {

    try {

        const query = `

            CREATE TABLE IF NOT EXISTS payments (

                id SERIAL PRIMARY KEY,

                student_id INTEGER REFERENCES users(id),

                amount DECIMAL(10,2) NOT NULL,

                tutor_commission DECIMAL(10,2),

                bm_profit DECIMAL(10,2),

                payment_source VARCHAR(50),

                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

            )

        `;

        await db.query(query);

        console.log("Payments table created successfully");

    } catch(error) {

        console.log(error.message);

    }

};

module.exports = createPaymentsTable;