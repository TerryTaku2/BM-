"use strict";

var express = require("express");

var path = require("path");

require("./config/db");

var createUsersTable = require("./models/userModel");

var createSubjectsTable = require("./models/subjectModel");

var createEnrollmentsTable = require("./models/enrollmentModel");

var createPaymentsTable = require("./models/paymentModel");

var authRoutes = require("./routes/authRoutes");

var subjectRoutes = require("./routes/subjectRoutes");

var enrollmentRoutes = require("./routes/enrollmentRoutes");

var paymentRoutes = require("./routes/paymentRoutes");

var app = express(); // ======================================
// MIDDLEWARE
// ======================================

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(express["static"]("public")); // ======================================
// CREATE DATABASE TABLES
// ======================================

createUsersTable();
createSubjectsTable();
createEnrollmentsTable();
createPaymentsTable(); // ======================================
// API ROUTES
// ======================================

app.use(authRoutes);
app.use(subjectRoutes);
app.use(enrollmentRoutes);
app.use(paymentRoutes); // ======================================
// HOME PAGE
// ======================================

app.get("/", function (req, res) {
  res.send("BMLC ELMS Running Successfully");
}); // ======================================
// REGISTER PAGE
// ======================================

app.get("/register", function (req, res) {
  res.sendFile(path.join(__dirname, "views", "register.html"));
}); // ======================================
// LOGIN PAGE
// ======================================

app.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname, "views", "login.html"));
}); // ======================================
// GENERAL DASHBOARD
// ======================================

app.get("/dashboard", function (req, res) {
  res.sendFile(path.join(__dirname, "views", "dashboard.html"));
}); // ======================================
// STUDENT DASHBOARD
// ======================================

app.get("/student-dashboard", function (req, res) {
  res.sendFile(path.join(__dirname, "views", "studentDashboard.html"));
}); // ======================================
// TUTOR DASHBOARD
// ======================================

app.get("/tutor-dashboard", function (req, res) {
  res.sendFile(path.join(__dirname, "views", "tutorDashboard.html"));
}); // ======================================
// PARENT DASHBOARD
// ======================================

app.get("/parent-dashboard", function (req, res) {
  res.sendFile(path.join(__dirname, "views", "parentDashboard.html"));
}); // ======================================
// ADMIN DASHBOARD
// ======================================

app.get("/admin-dashboard", function (req, res) {
  res.sendFile(path.join(__dirname, "views", "adminDashboard.html"));
}); // ======================================
// SUPER ADMIN DASHBOARD
// ======================================

app.get("/superadmin-dashboard", function (req, res) {
  res.sendFile(path.join(__dirname, "views", "superAdminDashboard.html"));
}); // ======================================
// ADD SUBJECT PAGE
// ======================================

app.get("/add-subject", function (req, res) {
  res.sendFile(path.join(__dirname, "views", "addSubject.html"));
}); // ======================================
// ENROLL STUDENT PAGE
// ======================================

app.get("/enroll-student", function (req, res) {
  res.sendFile(path.join(__dirname, "views", "enrollStudent.html"));
}); // ======================================
// RECORD PAYMENT PAGE
// ======================================

app.get("/record-payment", function (req, res) {
  res.sendFile(path.join(__dirname, "views", "recordPayment.html"));
}); // ======================================
// SERVER
// ======================================

var PORT = 5000;
app.listen(PORT, function () {
  console.log("Server running on port ".concat(PORT));
});
//# sourceMappingURL=server.dev.js.map
