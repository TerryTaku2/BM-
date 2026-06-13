const express = require("express");
const path = require("path");

require("./config/db");

const createUsersTable = require("./models/userModel");
const createSubjectsTable = require("./models/subjectModel");
const createEnrollmentsTable = require("./models/enrollmentModel");
const createPaymentsTable = require("./models/paymentModel");

const authRoutes = require("./routes/authRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();


// ======================================
// MIDDLEWARE
// ======================================

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));


// ======================================
// CREATE DATABASE TABLES
// ======================================

createUsersTable();

createSubjectsTable();

createEnrollmentsTable();

createPaymentsTable();


// ======================================
// API ROUTES
// ======================================

app.use(authRoutes);

app.use(subjectRoutes);

app.use(enrollmentRoutes);

app.use(paymentRoutes);


// ======================================
// HOME PAGE
// ======================================

app.get("/", (req, res) => {

    res.send("BMLC ELMS Running Successfully");

});


// ======================================
// REGISTER PAGE
// ======================================

app.get("/register", (req, res) => {

    res.sendFile(
        path.join(__dirname, "views", "register.html")
    );

});


// ======================================
// LOGIN PAGE
// ======================================

app.get("/login", (req, res) => {

    res.sendFile(
        path.join(__dirname, "views", "login.html")
    );

});


// ======================================
// GENERAL DASHBOARD
// ======================================

app.get("/dashboard", (req, res) => {

    res.sendFile(
        path.join(__dirname, "views", "dashboard.html")
    );

});


// ======================================
// STUDENT DASHBOARD
// ======================================

app.get("/student-dashboard", (req, res) => {

    res.sendFile(
        path.join(__dirname, "views", "studentDashboard.html")
    );

});


// ======================================
// TUTOR DASHBOARD
// ======================================

app.get("/tutor-dashboard", (req, res) => {

    res.sendFile(
        path.join(__dirname, "views", "tutorDashboard.html")
    );

});


// ======================================
// PARENT DASHBOARD
// ======================================

app.get("/parent-dashboard", (req, res) => {

    res.sendFile(
        path.join(__dirname, "views", "parentDashboard.html")
    );

});


// ======================================
// ADMIN DASHBOARD
// ======================================

app.get("/admin-dashboard", (req, res) => {

    res.sendFile(
        path.join(__dirname, "views", "adminDashboard.html")
    );

});


// ======================================
// SUPER ADMIN DASHBOARD
// ======================================

app.get("/superadmin-dashboard", (req, res) => {

    res.sendFile(
        path.join(__dirname, "views", "superAdminDashboard.html")
    );

});


// ======================================
// ADD SUBJECT PAGE
// ======================================

app.get("/add-subject", (req, res) => {

    res.sendFile(
        path.join(__dirname, "views", "addSubject.html")
    );

});


// ======================================
// ENROLL STUDENT PAGE
// ======================================

app.get("/enroll-student", (req, res) => {

    res.sendFile(
        path.join(__dirname, "views", "enrollStudent.html")
    );

});


// ======================================
// RECORD PAYMENT PAGE
// ======================================

app.get("/record-payment", (req, res) => {

    res.sendFile(
        path.join(__dirname, "views", "recordPayment.html")
    );

});


// ======================================
// SERVER
// ======================================

const PORT = 5000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});