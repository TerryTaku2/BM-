const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function buildReferralCode(fullname, userId) {
    const prefix = fullname.replace(/\s+/g, "").substring(0, 5).toUpperCase();
    return prefix + String(userId).padStart(3, "0");
}


// REGISTER USER

const registerUser = async (req, res) => {

    try {

        const { fullname, email, password, role, referral_code } = req.body;

        const existing = await db.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Resolve referral code — only for students
        let referred_by = null;
        let student_source = "bm";

        if (role === "student" && referral_code) {
            const tutor = await db.query(
                "SELECT id FROM users WHERE referral_code = $1 AND role = 'tutor'",
                [referral_code.toUpperCase()]
            );
            if (tutor.rows.length > 0) {
                referred_by = tutor.rows[0].id;
                student_source = "tutor";
            }
        }

        const result = await db.query(
            `INSERT INTO users (fullname, email, password, role, referred_by, student_source)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [fullname, email, hashedPassword, role, referred_by, student_source]
        );

        const userId = result.rows[0].id;

        // Auto-generate unique referral code for tutors
        if (role === "tutor") {
            const code = buildReferralCode(fullname, userId);
            await db.query("UPDATE users SET referral_code = $1 WHERE id = $2", [code, userId]);
        }

        res.status(201).json({ message: "Registration successful" });

    } catch (error) {

        console.log(error.message);
        res.status(500).json({ message: "Registration failed" });

    }

};



// LOGIN USER

const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        const result = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user.id, fullname: user.fullname, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const redirectMap = {
            student: "/student-dashboard",
            tutor: "/tutor-dashboard",
            parent: "/parent-dashboard",
            admin: "/admin-dashboard",
            superadmin: "/superadmin-dashboard"
        };

        res.json({
            message: "Login successful",
            redirect: redirectMap[user.role] || "/dashboard"
        });

    } catch (error) {

        console.log(error.message);
        res.status(500).json({ message: "Login failed" });

    }

};


module.exports = { registerUser, loginUser };
