const express = require("express");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");

const router = express.Router();

const {
    uploadNote,
    getNotesBySubject,
    getAllNotes,
    deleteNote
} = require("../controllers/notesController");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "../uploads/notes");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
        cb(null, unique + path.extname(file.originalname));
    }
});

const ALLOWED_TYPES = /pdf|msword|vnd\.openxmlformats|vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument|mp4|mpeg|quicktime/;

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
    fileFilter: (req, file, cb) => {
        if (ALLOWED_TYPES.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, Word, PowerPoint, and video files are allowed"));
        }
    }
});

// UPLOAD NOTE (tutors, admins)
router.post("/notes/upload", upload.single("file"), uploadNote);

// GET NOTES FOR A SUBJECT
router.get("/notes/subject/:subject_id", getNotesBySubject);

// GET ALL NOTES (admin/tutor)
router.get("/notes", getAllNotes);

// DELETE NOTE
router.delete("/notes/:id", deleteNote);

module.exports = router;
