const db = require("../config/db");

const createNotesTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS notes (
                id           SERIAL PRIMARY KEY,
                subject_id   INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
                tutor_id     INTEGER REFERENCES users(id),
                title        VARCHAR(200) NOT NULL,
                filename     VARCHAR(300) NOT NULL,
                original_name VARCHAR(300) NOT NULL,
                file_type    VARCHAR(50),
                created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Notes table created successfully");
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = createNotesTable;
