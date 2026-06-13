const db = require("../config/db");


// ADD SUBJECT

const addSubject = async (req, res) => {

    try {

        const {
            subject_name,
            subject_code,
            level
        } = req.body;

        const query = `

            INSERT INTO subjects
            (subject_name, subject_code, level)

            VALUES ($1, $2, $3)

        `;

        const values = [
            subject_name,
            subject_code,
            level
        ];

        await db.query(query, values);

        res.send("Subject Added Successfully");

    } catch(error) {

        console.log(error.message);

        res.send("Failed to add subject");

    }

};



// GET ALL SUBJECTS

const getSubjects = async (req, res) => {

    try {

        const result = await db.query(

            "SELECT * FROM subjects ORDER BY id DESC"

        );

        res.json(result.rows);

    } catch(error) {

        console.log(error.message);

        res.send("Failed to fetch subjects");

    }

};


module.exports = {
    addSubject,
    getSubjects
};