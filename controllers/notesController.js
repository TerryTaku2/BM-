const db = require("../config/db");
const path = require("path");
const fs = require("fs");


// UPLOAD NOTE

const uploadNote = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No file uploaded" });

        const { subject_id, title } = req.body;

        if (!subject_id || !title) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: "Subject and title are required" });
        }

        await db.query(
            `INSERT INTO notes (subject_id, tutor_id, title, filename, original_name, file_type)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [subject_id, req.user.id, title, req.file.filename, req.file.originalname, req.file.mimetype]
        );

        res.status(201).json({ message: "Note uploaded successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Upload failed" });
    }
};


// GET NOTES FOR A SUBJECT (only if student is enrolled)

const getNotesBySubject = async (req, res) => {
    try {
        const { subject_id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        // Tutors and admins can see all notes
        if (role !== "student") {
            const result = await db.query(`
                SELECT n.id, n.title, n.original_name, n.file_type, n.created_at,
                       u.fullname AS tutor_name
                FROM notes n
                JOIN users u ON n.tutor_id = u.id
                WHERE n.subject_id = $1
                ORDER BY n.created_at DESC
            `, [subject_id]);
            return res.json(result.rows);
        }

        // Students: check enrollment first
        const enrolled = await db.query(
            "SELECT id FROM enrollments WHERE student_id = $1 AND subject_id = $2",
            [userId, subject_id]
        );

        if (enrolled.rows.length === 0) {
            return res.status(403).json({ message: "You are not enrolled in this subject" });
        }

        const result = await db.query(`
            SELECT n.id, n.title, n.filename, n.original_name, n.file_type, n.created_at,
                   u.fullname AS tutor_name
            FROM notes n
            JOIN users u ON n.tutor_id = u.id
            WHERE n.subject_id = $1
            ORDER BY n.created_at DESC
        `, [subject_id]);

        res.json(result.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch notes" });
    }
};


// GET ALL NOTES (admin/tutor view)

const getAllNotes = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT n.id, n.title, n.original_name, n.file_type, n.created_at,
                   s.subject_name, u.fullname AS tutor_name
            FROM notes n
            JOIN subjects s ON n.subject_id = s.id
            JOIN users u ON n.tutor_id = u.id
            ORDER BY n.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch notes" });
    }
};


// DELETE NOTE

const deleteNote = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT filename, tutor_id FROM notes WHERE id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: "Note not found" });

        const note = result.rows[0];

        // Only the uploader or admins can delete
        if (req.user.role === "tutor" && note.tutor_id !== req.user.id) {
            return res.status(403).json({ message: "Not authorised" });
        }

        // Remove file from disk
        const filePath = path.join(__dirname, "../uploads/notes", note.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await db.query("DELETE FROM notes WHERE id = $1", [req.params.id]);

        res.json({ message: "Note deleted" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Delete failed" });
    }
};


module.exports = { uploadNote, getNotesBySubject, getAllNotes, deleteNote };
