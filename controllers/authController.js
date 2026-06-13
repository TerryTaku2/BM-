const db = require("../config/db");
const bcrypt = require("bcrypt");


// REGISTER USER

const registerUser = async (req, res) => {

    try {

        const {
            fullname,
            email,
            password,
            role,
            referral_code
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `

            INSERT INTO users
            (fullname, email, password, role, referral_code)

            VALUES ($1, $2, $3, $4, $5)

            RETURNING *;

        `;

        const values = [
            fullname,
            email,
            hashedPassword,
            role,
            referral_code
        ];

        await db.query(query, values);

        res.send("User Registered Successfully");

    } catch(error) {

        console.log(error.message);

        res.send("Registration Failed");

    }

};



// LOGIN USER

const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        // CHECK USER

        const result = await db.query(

            "SELECT * FROM users WHERE email = $1",

            [email]
        );

        // USER NOT FOUND

        if(result.rows.length === 0) {

            return res.send("User not found");

        }

        const user = result.rows[0];

        // CHECK PASSWORD

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if(!validPassword) {

            return res.send("Invalid password");

        }

        // LOGIN SUCCESS

        // ROLE-BASED REDIRECT

if(user.role === "student") {

    return res.redirect("/student-dashboard");

}

if(user.role === "tutor") {

    return res.redirect("/tutor-dashboard");

}

if(user.role === "parent") {

    return res.redirect("/parent-dashboard");

}

if(user.role === "admin") {

    return res.redirect("/admin-dashboard");

}

if(user.role === "superadmin") {

    return res.redirect("/superadmin-dashboard");

}


// DEFAULT

res.send("Login Successful");
    } catch(error) {

        console.log(error.message);

        res.send("Login Failed");

    }

};


module.exports = {
    registerUser,
    loginUser
};