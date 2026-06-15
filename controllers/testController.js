const db = require("../config/db");


// TUTOR: CREATE TEST

const createTest = async (req, res) => {
    try {
        const { subject_id, title, description, duration_minutes, questions } = req.body;

        const testResult = await db.query(
            `INSERT INTO tests (subject_id, tutor_id, title, description, duration_minutes)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [subject_id, req.user.id, title, description || null, duration_minutes || 60]
        );

        const testId = testResult.rows[0].id;

        if (questions && questions.length) {
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                await db.query(
                    `INSERT INTO test_questions (test_id, question, type, options, correct_answer, marks, order_num)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [testId, q.question, q.type, JSON.stringify(q.options || []), q.correct_answer || null, q.marks || 1, i]
                );
            }
        }

        res.status(201).json({ message: "Test created successfully", test_id: testId });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to create test" });
    }
};


// TUTOR: PUBLISH TEST

const publishTest = async (req, res) => {
    try {
        await db.query(
            "UPDATE tests SET is_published = TRUE WHERE id = $1 AND tutor_id = $2",
            [req.params.id, req.user.id]
        );
        res.json({ message: "Test published" });
    } catch (error) {
        res.status(500).json({ message: "Failed to publish test" });
    }
};


// GET TESTS FOR A SUBJECT (published only for students)

const getTestsBySubject = async (req, res) => {
    try {
        const { subject_id } = req.params;
        const role = req.user.role;

        const whereClause = role === "student" ? "AND t.is_published = TRUE" : "";

        const result = await db.query(`
            SELECT t.id, t.title, t.description, t.duration_minutes, t.is_published, t.created_at,
                   u.fullname AS tutor_name,
                   COUNT(q.id) AS question_count
            FROM tests t
            JOIN users u ON t.tutor_id = u.id
            LEFT JOIN test_questions q ON q.test_id = t.id
            WHERE t.subject_id = $1 ${whereClause}
            GROUP BY t.id, u.fullname
            ORDER BY t.created_at DESC
        `, [subject_id]);

        res.json(result.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch tests" });
    }
};


// GET SINGLE TEST WITH QUESTIONS (for taking the test)

const getTest = async (req, res) => {
    try {
        const testResult = await db.query(
            "SELECT * FROM tests WHERE id = $1 AND is_published = TRUE",
            [req.params.id]
        );

        if (testResult.rows.length === 0) return res.status(404).json({ message: "Test not found" });

        // Check enrollment for students
        if (req.user.role === "student") {
            const enrolled = await db.query(
                "SELECT id FROM enrollments WHERE student_id = $1 AND subject_id = $2",
                [req.user.id, testResult.rows[0].subject_id]
            );
            if (enrolled.rows.length === 0) return res.status(403).json({ message: "Not enrolled in this subject" });

            // Check if already submitted
            const submitted = await db.query(
                "SELECT id FROM test_submissions WHERE test_id = $1 AND student_id = $2",
                [req.params.id, req.user.id]
            );
            if (submitted.rows.length > 0) return res.status(400).json({ message: "You have already submitted this test" });
        }

        const questions = await db.query(
            "SELECT id, question, type, options, marks, order_num FROM test_questions WHERE test_id = $1 ORDER BY order_num",
            [req.params.id]
        );

        // Hide correct_answer from students
        const qs = questions.rows.map(q => {
            if (req.user.role === "student") {
                const { correct_answer, ...safe } = q;
                return safe;
            }
            return q;
        });

        res.json({ test: testResult.rows[0], questions: qs });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to load test" });
    }
};


// STUDENT: SUBMIT TEST (auto-mark MCQ and True/False)

const submitTest = async (req, res) => {
    try {
        const { test_id, answers } = req.body;
        const student_id = req.user.id;

        const questions = await db.query(
            "SELECT id, type, correct_answer, marks FROM test_questions WHERE test_id = $1",
            [test_id]
        );

        let score = 0;
        let total_marks = 0;

        for (const q of questions.rows) {
            total_marks += q.marks;
            const studentAnswer = answers[q.id];

            if (["multiple_choice", "true_false"].includes(q.type) && q.correct_answer) {
                if (studentAnswer && studentAnswer.toString().toLowerCase().trim() === q.correct_answer.toLowerCase().trim()) {
                    score += q.marks;
                }
            }
        }

        const percentage = total_marks > 0 ? (score / total_marks) * 100 : 0;

        await db.query(
            `INSERT INTO test_submissions (test_id, student_id, answers, score, total_marks, percentage)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [test_id, student_id, JSON.stringify(answers), score, total_marks, percentage]
        );

        res.status(201).json({
            message: "Test submitted successfully",
            score,
            total_marks,
            percentage: percentage.toFixed(1)
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({ message: "You have already submitted this test" });
        }
        console.log(error.message);
        res.status(500).json({ message: "Submission failed" });
    }
};


// GET ALL RESULTS FOR A TEST (tutor/admin view)

const getTestResults = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                ts.id, u.fullname AS student_name, u.email,
                ts.score, ts.total_marks, ts.percentage, ts.submitted_at
            FROM test_submissions ts
            JOIN users u ON ts.student_id = u.id
            WHERE ts.test_id = $1
            ORDER BY ts.percentage DESC
        `, [req.params.id]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch results" });
    }
};


// STUDENT: GET MY TEST RESULTS

const getMyResults = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                t.title, s.subject_name,
                ts.score, ts.total_marks, ts.percentage, ts.submitted_at
            FROM test_submissions ts
            JOIN tests t ON ts.test_id = t.id
            JOIN subjects s ON t.subject_id = s.id
            WHERE ts.student_id = $1
            ORDER BY ts.submitted_at DESC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch results" });
    }
};


module.exports = { createTest, publishTest, getTestsBySubject, getTest, submitTest, getTestResults, getMyResults };
