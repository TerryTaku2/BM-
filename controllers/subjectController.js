const db = require("../config/db");


// ADD SUBJECT

const addSubject = async (req, res) => {

    try {

        const { subject_name, subject_code, level } = req.body;

        await db.query(
            `INSERT INTO subjects (subject_name, subject_code, level)
             VALUES ($1, $2, $3)`,
            [subject_name, subject_code, level]
        );

        res.status(201).json({ message: "Subject added successfully" });

    } catch (error) {

        console.log(error.message);
        res.status(500).json({ message: "Failed to add subject" });

    }

};


// GET ALL SUBJECTS

const getSubjects = async (req, res) => {

    try {

        const result = await db.query(
            "SELECT * FROM subjects ORDER BY id DESC"
        );

        res.json(result.rows);

    } catch (error) {

        console.log(error.message);
        res.status(500).json({ message: "Failed to fetch subjects" });

    }

};


module.exports = { addSubject, getSubjects };
