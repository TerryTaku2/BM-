const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

require("./config/db");
require("dotenv").config();

const createUsersTable = require("./models/userModel");
const createSubjectsTable = require("./models/subjectModel");
const createEnrollmentsTable = require("./models/enrollmentModel");
const createPaymentsTable = require("./models/paymentModel");
const createNotesTable = require("./models/notesModel");
const createAttendanceTable = require("./models/attendanceModel");
const createTestTables = require("./models/testModel");
const createMessagesTable = require("./models/messageModel");
const createCommunityTables = require("./models/communityModel");

const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notesRoutes = require("./routes/notesRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const testRoutes = require("./routes/testRoutes");
const messageRoutes = require("./routes/messageRoutes");
const communityRoutes = require("./routes/communityRoutes");

const { protect, protectAPI, requireRole } = require("./middleware/authMiddleware");

const db = require("./config/db");

const app = express();


// ======================================
// MIDDLEWARE
// ======================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));


// ======================================
// CREATE DATABASE TABLES
// ======================================

createUsersTable();
createSubjectsTable();
createEnrollmentsTable();
createPaymentsTable();
createNotesTable();
createAttendanceTable();
createTestTables();
createMessagesTable();
createCommunityTables();


// ======================================
// AUTH ROUTES (public)
// ======================================

app.use(authRoutes);


// ======================================
// PUBLIC PAGES
// ======================================

app.get("/", (req, res) => res.redirect("/login"));

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "register.html"));
});


// ======================================
// LOGOUT
// ======================================

app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});


// ======================================
// PROTECTED API ROUTES
// ======================================

app.use(protectAPI, subjectRoutes);
app.use(protectAPI, enrollmentRoutes);
app.use(protectAPI, paymentRoutes);
app.use(protectAPI, notesRoutes);
app.use(protectAPI, attendanceRoutes);
app.use(protectAPI, testRoutes);
app.use(protectAPI, messageRoutes);
app.use(protectAPI, communityRoutes);
app.use("/uploads", express.static("uploads"));


// ======================================
// API: CURRENT USER
// ======================================

app.get("/api/me", protectAPI, (req, res) => {
    res.json(req.user);
});


// ======================================
// API: GET STUDENTS LIST (for dropdowns)
// ======================================

app.get("/api/students", protectAPI, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, fullname, email, student_source, referred_by FROM users WHERE role = 'student' ORDER BY fullname"
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch students" });
    }
});


// ======================================
// API: GET STUDENT SOURCE (for payment auto-detect)
// ======================================

app.get("/api/students/:id/source", protectAPI, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.student_source, t.fullname AS tutor_name, t.referral_code
             FROM users u
             LEFT JOIN users t ON u.referred_by = t.id
             WHERE u.id = $1 AND u.role = 'student'`,
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Student not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch student source" });
    }
});


// ======================================
// API: GET MY STUDENTS (tutor's referred students)
// ======================================

app.get("/api/my-students", protectAPI, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, fullname, email, created_at FROM users WHERE referred_by = $1 AND role = 'student' ORDER BY fullname",
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch your students" });
    }
});


// ======================================
// API: GET TUTOR INFO (referral code etc.)
// ======================================

// ======================================
// API: GET ALL USERS (admin/superadmin)
// ======================================

app.get("/api/users", protectAPI, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, fullname, email, role, referral_code, created_at FROM users ORDER BY created_at DESC"
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
});


// ======================================
// API: UPDATE USER ROLE (admin/superadmin)
// ======================================

app.patch("/api/users/:id/role", protectAPI, async (req, res) => {
    try {
        const { role } = req.body;
        const targetId = parseInt(req.params.id);
        const requesterId = req.user.id;
        const requesterRole = req.user.role;

        const allowed = ["student", "tutor", "parent", "admin", "superadmin"];
        if (!allowed.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Only superadmin can assign superadmin role
        if (role === "superadmin" && requesterRole !== "superadmin") {
            return res.status(403).json({ message: "Only a superadmin can assign the superadmin role" });
        }

        // Prevent admin from changing their own role
        if (targetId === requesterId) {
            return res.status(400).json({ message: "You cannot change your own role" });
        }

        await db.query("UPDATE users SET role = $1 WHERE id = $2", [role, targetId]);
        res.json({ message: "Role updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update role" });
    }
});


app.get("/api/tutor-info", protectAPI, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT referral_code FROM users WHERE id = $1",
            [req.user.id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch tutor info" });
    }
});


// ======================================
// API: FINANCIAL REPORT
// ======================================

app.get("/api/financial-report", protectAPI, async (req, res) => {
    try {
        const summary = await db.query(`
            SELECT
                COALESCE(SUM(amount), 0)           AS total_revenue,
                COALESCE(SUM(tutor_commission), 0) AS total_tutor_payouts,
                COALESCE(SUM(bm_profit), 0)        AS total_bm_profit,
                COUNT(*)                           AS total_payments
            FROM payments
        `);

        const monthly = await db.query(`
            SELECT
                TO_CHAR(created_at, 'YYYY-MM')     AS month,
                COALESCE(SUM(amount), 0)           AS revenue,
                COALESCE(SUM(tutor_commission), 0) AS tutor_payouts,
                COALESCE(SUM(bm_profit), 0)        AS bm_profit,
                COUNT(*)                           AS payments
            FROM payments
            GROUP BY month
            ORDER BY month DESC
            LIMIT 12
        `);

        const byTutor = await db.query(`
            SELECT
                t.fullname                           AS tutor_name,
                t.referral_code,
                COUNT(p.id)                          AS students_paid,
                COALESCE(SUM(p.amount), 0)           AS revenue_generated,
                COALESCE(SUM(p.tutor_commission), 0) AS tutor_earnings,
                COALESCE(SUM(p.bm_profit), 0)        AS bm_from_tutor
            FROM payments p
            JOIN users t ON p.tutor_id = t.id
            GROUP BY t.id, t.fullname, t.referral_code
            ORDER BY tutor_earnings DESC
        `);

        res.json({
            summary: summary.rows[0],
            monthly: monthly.rows,
            by_tutor: byTutor.rows
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Failed to generate report" });
    }
});


// ======================================
// API: SINGLE PAYMENT (for receipt)
// ======================================

app.get("/api/payments/:id", protectAPI, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                p.id, p.amount, p.tutor_commission, p.bm_profit, p.payment_source, p.created_at,
                s.fullname AS student_name, s.email AS student_email,
                t.fullname AS tutor_name, t.referral_code
            FROM payments p
            JOIN users s ON p.student_id = s.id
            LEFT JOIN users t ON p.tutor_id = t.id
            WHERE p.id = $1
        `, [req.params.id]);

        if (result.rows.length === 0) return res.status(404).json({ message: "Payment not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch payment" });
    }
});


// ======================================
// PROTECTED PAGE ROUTES
// ======================================

app.get("/dashboard", protect, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "dashboard.html"));
});

app.get("/student-dashboard", protect, requireRole("student"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "studentDashboard.html"));
});

app.get("/tutor-dashboard", protect, requireRole("tutor"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "tutorDashboard.html"));
});

app.get("/parent-dashboard", protect, requireRole("parent"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "parentDashboard.html"));
});

app.get("/admin-dashboard", protect, requireRole("admin", "superadmin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "adminDashboard.html"));
});

app.get("/superadmin-dashboard", protect, requireRole("superadmin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "superAdminDashboard.html"));
});

app.get("/add-subject", protect, requireRole("admin", "superadmin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "addSubject.html"));
});

app.get("/enroll-student", protect, requireRole("admin", "superadmin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "enrollStudent.html"));
});

app.get("/record-payment", protect, requireRole("admin", "superadmin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "recordPayment.html"));
});

app.get("/upload-notes", protect, requireRole("tutor", "admin", "superadmin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "uploadNotes.html"));
});

app.get("/notes-library", protect, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "notesLibrary.html"));
});

app.get("/attendance-report", protect, requireRole("admin", "superadmin", "tutor"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "attendanceReport.html"));
});

app.get("/my-attendance", protect, requireRole("student"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "myAttendance.html"));
});

app.get("/create-test", protect, requireRole("tutor", "admin", "superadmin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "createTest.html"));
});

app.get("/take-test/:id", protect, requireRole("student"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "takeTest.html"));
});

app.get("/my-results", protect, requireRole("student"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "myResults.html"));
});

app.get("/messages", protect, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "messages.html"));
});

app.get("/community", protect, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "community.html"));
});

app.get("/community/subject/:id", protect, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "communityChannel.html"));
});

app.get("/community/post/:id", protect, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "communityPost.html"));
});

app.get("/financial-report", protect, requireRole("admin", "superadmin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "financialReport.html"));
});

app.get("/manage-users", protect, requireRole("admin", "superadmin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "manageUsers.html"));
});

app.get("/receipt/:id", protect, requireRole("admin", "superadmin"), (req, res) => {
    res.sendFile(path.join(__dirname, "views", "receipt.html"));
});


// ======================================
// SERVER
// ======================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
