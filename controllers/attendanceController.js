const db = require("../config/db");


// STUDENT: MARK ATTENDANCE (join lesson)

const markAttendance = async (req, res) => {
    try {
        const { subject_id } = req.body;
        const student_id = req.user.id;
        const today = new Date().toISOString().split("T")[0];

        // Check enrollment
        const enrolled = await db.query(
            "SELECT id FROM enrollments WHERE student_id = $1 AND subject_id = $2",
            [student_id, subject_id]
        );
        if (enrolled.rows.length === 0) {
            return res.status(403).json({ message: "You are not enrolled in this subject" });
        }

        // Prevent duplicate for same day
        const existing = await db.query(
            "SELECT id FROM attendance WHERE student_id = $1 AND subject_id = $2 AND lesson_date = $3",
            [student_id, subject_id, today]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Attendance already marked for today" });
        }

        const result = await db.query(
            `INSERT INTO attendance (student_id, subject_id, lesson_date, joined_at, status)
             VALUES ($1, $2, $3, NOW(), 'present') RETURNING id`,
            [student_id, subject_id, today]
        );

        res.status(201).json({ message: "Attendance marked", attendance_id: result.rows[0].id });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to mark attendance" });
    }
};


// STUDENT: MARK LEAVE TIME

const markLeave = async (req, res) => {
    try {
        const { attendance_id } = req.body;

        await db.query(
            "UPDATE attendance SET left_at = NOW() WHERE id = $1 AND student_id = $2",
            [attendance_id, req.user.id]
        );

        res.json({ message: "Leave time recorded" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to record leave" });
    }
};


// ADMIN/TUTOR: GET ALL ATTENDANCE

const getAllAttendance = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                a.id,
                u.fullname   AS student_name,
                s.subject_name,
                a.lesson_date,
                a.joined_at,
                a.left_at,
                a.status,
                CASE
                    WHEN a.joined_at IS NOT NULL AND a.left_at IS NOT NULL
                    THEN ROUND(EXTRACT(EPOCH FROM (a.left_at - a.joined_at)) / 60)
                    ELSE NULL
                END AS duration_minutes
            FROM attendance a
            JOIN users u ON a.student_id = u.id
            JOIN subjects s ON a.subject_id = s.id
            ORDER BY a.lesson_date DESC, a.joined_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch attendance" });
    }
};


// STUDENT: GET MY OWN ATTENDANCE

const getMyAttendance = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                a.id,
                s.subject_name,
                a.lesson_date,
                a.joined_at,
                a.left_at,
                a.status,
                CASE
                    WHEN a.joined_at IS NOT NULL AND a.left_at IS NOT NULL
                    THEN ROUND(EXTRACT(EPOCH FROM (a.left_at - a.joined_at)) / 60)
                    ELSE NULL
                END AS duration_minutes
            FROM attendance a
            JOIN subjects s ON a.subject_id = s.id
            WHERE a.student_id = $1
            ORDER BY a.lesson_date DESC
        `, [req.user.id]);

        const total   = result.rows.length;
        const present = result.rows.filter(r => r.status === "present").length;
        const rate    = total > 0 ? Math.round((present / total) * 100) : 0;

        res.json({ records: result.rows, total, present, attendance_rate: rate });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch attendance" });
    }
};


// PARENT: GET CHILD'S ATTENDANCE (pass student_id as query param)

const getStudentAttendance = async (req, res) => {
    try {
        const { student_id } = req.params;

        const result = await db.query(`
            SELECT
                a.id,
                s.subject_name,
                a.lesson_date,
                a.joined_at,
                a.left_at,
                a.status,
                CASE
                    WHEN a.joined_at IS NOT NULL AND a.left_at IS NOT NULL
                    THEN ROUND(EXTRACT(EPOCH FROM (a.left_at - a.joined_at)) / 60)
                    ELSE NULL
                END AS duration_minutes
            FROM attendance a
            JOIN subjects s ON a.subject_id = s.id
            WHERE a.student_id = $1
            ORDER BY a.lesson_date DESC
        `, [student_id]);

        const total   = result.rows.length;
        const present = result.rows.filter(r => r.status === "present").length;
        const rate    = total > 0 ? Math.round((present / total) * 100) : 0;

        res.json({ records: result.rows, total, present, attendance_rate: rate });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch attendance" });
    }
};


module.exports = { markAttendance, markLeave, getAllAttendance, getMyAttendance, getStudentAttendance };
