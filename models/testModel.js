const db = require("../config/db");

const createTestTables = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS tests (
                id          SERIAL PRIMARY KEY,
                subject_id  INTEGER REFERENCES subjects(id),
                tutor_id    INTEGER REFERENCES users(id),
                title       VARCHAR(200) NOT NULL,
                description TEXT,
                duration_minutes INTEGER DEFAULT 60,
                is_published BOOLEAN DEFAULT FALSE,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS test_questions (
                id          SERIAL PRIMARY KEY,
                test_id     INTEGER REFERENCES tests(id) ON DELETE CASCADE,
                question    TEXT NOT NULL,
                type        VARCHAR(30) NOT NULL,
                options     JSONB,
                correct_answer TEXT,
                marks       INTEGER DEFAULT 1,
                order_num   INTEGER DEFAULT 0
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS test_submissions (
                id          SERIAL PRIMARY KEY,
                test_id     INTEGER REFERENCES tests(id),
                student_id  INTEGER REFERENCES users(id),
                answers     JSONB,
                score       DECIMAL(5,2),
                total_marks INTEGER,
                percentage  DECIMAL(5,2),
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(test_id, student_id)
            )
        `);

        console.log("Test tables created successfully");
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = createTestTables;
