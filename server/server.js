const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Register student
app.post("/register", (req, res) => {
    const { name, email, password, course, year, contact } = req.body;
    const sql = "INSERT INTO students (name, email, password, course, year, contact) VALUES (?, ?, ?, ?, ?, ?)";
    const values = [name, email, password, course, year, contact];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).send(err);
        res.send("Student registered successfully!");
    });
});

// Login student
// ✅ Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM students WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error('Database query error: ', err);
            return res.status(500).send('Internal Server Error');
        }

        if (result.length > 0) {
            res.status(200).send('Login Successful');  // ✅ Send success message
        } else {
            res.status(401).send('Invalid Credentials');  // ❌ Invalid credentials
        }
    });
});


// Fetch student details
// ✅ New route to get student by email
app.get('/students/email/:email', (req, res) => {
    const { email } = req.params;

    const sql = 'SELECT * FROM students WHERE email = ?';
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Database query error: ', err);
            return res.status(500).send('Internal Server Error');
        }

        if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).send('Student not found');
        }
    });
});



// Server listening on port 3000
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
