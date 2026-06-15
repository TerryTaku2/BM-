const db = require("../config/db");

const createMessagesTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id          SERIAL PRIMARY KEY,
                sender_id   INTEGER REFERENCES users(id),
                receiver_id INTEGER REFERENCES users(id),
                subject     VARCHAR(200),
                body        TEXT NOT NULL,
                is_read     BOOLEAN DEFAULT FALSE,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Messages table created successfully");
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = createMessagesTable;
