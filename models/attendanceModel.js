const db = require("../config/db");

const createAttendanceTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id          SERIAL PRIMARY KEY,
                student_id  INTEGER REFERENCES users(id),
                subject_id  INTEGER REFERENCES subjects(id),
                lesson_date DATE NOT NULL DEFAULT CURRENT_DATE,
                joined_at   TIMESTAMP,
                left_at     TIMESTAMP,
                status      VARCHAR(20) DEFAULT 'present',
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Attendance table created successfully");
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = createAttendanceTable;
