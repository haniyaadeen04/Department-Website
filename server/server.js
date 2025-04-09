const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { CohereClient } = require("cohere-ai");
const db = require("./db");

const app = express();
const PORT = 5000; // Unified server on one port

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public"))); // Serves static files

// Initialize Cohere Client
const cohere = new CohereClient({
  token: "1vvr4Rj49nvT61mzbzm7LUEevR5tmlFMoqSbfi46", // Replace with your real API key in production
});

// ---------------------------------------------
// 👨‍🎓 Student Management Routes
// ---------------------------------------------

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

// Student login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM students WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.error("Database query error: ", err);
      return res.status(500).send("Internal Server Error");
    }

    if (result.length > 0) {
      res.status(200).send("Login Successful");
    } else {
      res.status(401).send("Invalid Credentials");
    }
  });
});

// Get student details by email
app.get("/students/email/:email", (req, res) => {
  const { email } = req.params;
  const sql = "SELECT * FROM students WHERE email = ?";
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Database query error: ", err);
      return res.status(500).send("Internal Server Error");
    }

    if (result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).send("Student not found");
    }
  });
});

// ---------------------------------------------
// 🤖 Cohere Chatbot Endpoint
// ---------------------------------------------

const staffDirectory = {
  "bansode": {
    name: "Mrs. S.M. Bansode",
    designation: "Associate Professor (HOD)",
    email: "smbansode@sggs.ac.in",
    contact: "0"
  },
  "kulkarni": {
    name: "Dr. Uday Vasantrao Kulkarni",
    designation: "Professor",
    email: "uvkulkarni@sggs.ac.in",
    contact: "9325612705"
  },
  "chavan": {
    name: "Mr. Raosaheb Khubba Chavan",
    designation: "Associate Professor",
    email: "rkchavan@sggs.ac.in",
    contact: "9011518506"
  },
  "waghmare": {
    name: "Dr. Jaishri Mahesh Waghmare",
    designation: "Associate Professor",
    email: "jmwaghmare@sggs.ac.in",
    contact: "0"
  },
  "nalwade": {
    name: "Mr. Prakashrao Shivajirao Nalwade",
    designation: "Associate Professor",
    email: "psnalwade@sggs.ac.in",
    contact: "9860720229"
  },
  "hatkar": {
    name: "Mr. Shubhanand Sidharth Hatkar",
    designation: "Associate Professor",
    email: "sshatkar@sggs.ac.in",
    contact: "9421868526"
  },
  "bainwad": {
    name: "Mr. Anant Madhavrao Bainwad",
    designation: "Associate Professor",
    email: "ambainwad@sggs.ac.in",
    contact: "9860998863"
  },
  "nandedkar": {
    name: "Dr. Amit Vijay Nandedkar",
    designation: "Assistant Professor",
    email: "avnandedkar@sggs.ac.in",
    contact: "9420848235"
  },
  "bombade": {
    name: "Dr. Balaji Rajendra Bombade",
    designation: "Associate Professor",
    email: "brbombade@sggs.ac.in",
    contact: "9260040906"
  },
  "mahindrakar": {
    name: "Dr. Manisha Sachin Mahindrakar",
    designation: "Assistant Professor",
    email: "msmahindrakar@sggs.ac.in",
    contact: "9420020120"
  },
  "ambulgekar": {
    name: "Mr. Hemant Pandurang Ambulgekar",
    designation: "Associate Professor",
    email: "ambulgekar@sggs.ac.in",
    contact: "9860366220"
  },
  "kolapwar": {
    name: "Mrs. Pranjala Gajanan Kolapwar",
    designation: "Assistant Professor",
    email: "pgkolapwar@sggs.ac.in",
    contact: "8668207549"
  },
  "malande": {
    name: "Mr. Gaurao Sudhakarrao Malande",
    designation: "Assistant Professor",
    email: "gsmalande@sggs.ac.in",
    contact: "7588891051"
  },
  "kanhegaonkar": {
    name: "Mr. Prasad Pradeeprao Kanhegaonkar",
    designation: "Assistant Professor",
    email: "ppkanhegaonkar@sggs.ac.in",
    contact: "7588153109"
  },
  "budhewar": {
    name: "Mr. Laxman Mariba Budhewar",
    designation: "Lab Assistant",
    email: "budhewar@sggs.ac.in",
    contact: "9423626885"
  },
  "sonkamble": {
    name: "Mr. Rupesh Sonkamble",
    designation: "Assistant Teacher",
    email: "sonkamblerupesh@sggs.ac.in",
    contact: "8983400574"
  },
  "pathak": {
    name: "Miss. Namita Pathak",
    designation: "Assistant Teacher",
    email: "pathaknamita@sggs.ac.in",
    contact: "9763567859"
  },
  "bhelonde": {
    name: "Miss. Gauri Bhelonde",
    designation: "Assistant Teacher",
    email: "bhelondegauri@sggs.ac.in",
    contact: "9421050396"
  },
  "kasliwal": {
    name: "Miss. Pournima Kasliwal",
    designation: "Assistant Teacher",
    email: "pandepournima@sggs.ac.in",
    contact: "9359122772"
  },
  "nihalani": {
    name: "Miss. Misha Nihalani",
    designation: "Assistant Teacher",
    email: "poojagunwani@sggs.ac.in",
    contact: "9970802555"
  },
  "chalnewad": {
    name: "Miss. Surekha Chalnewad",
    designation: "Assistant Teacher",
    email: "chalanewadsurekha@sggs.ac.in",
    contact: "9767128591"
  },
  "batool": {
    name: "Miss. Zeba Batool Mohammad",
    designation: "Assistant Teacher",
    email: "zebabatool@sggs.ac.in",
    contact: "7385657231"
  }
};

// Custom Q&A
const customAnswers = {
  "what is cse": "CSE stands for Computer Science and Engineering. It focuses on computer systems, programming, and software engineering. Welcome to SGGS CSE!",
  "hod name": "The Head of Department (HOD) of SGGS CSE is Mrs. S.M. Bansode.",
  "location": "The SGGS CSE Department is located on the 2nd floor of the academic building.",
};

// Chatbot endpoint
app.post("/ask", async (req, res) => {
  const userInput = req.body.question;
  const lowerInput = userInput.toLowerCase();

  if (customAnswers[lowerInput]) {
    return res.json({ answer: customAnswers[lowerInput] });
  }

  for (const key in staffDirectory) {
    if (lowerInput.includes(key)) {
      const staff = staffDirectory[key];
      return res.json({
        answer: `${staff.name} is a ${staff.designation}. You can contact them at ${staff.email} or ${staff.contact}.`
      });
    }
  }

  try {
    const response = await cohere.generate({
      model: "command-light",
      prompt: `You are a chatbot for the SGGS CSE Department. Some facts:
      - HOD: Mrs. S.M. Bansode
      - Location: 2nd Floor, Academic Building
      - CSE = Computer Science and Engineering
      - College: SGGSIE&T, Nanded
      
      Answer this: ${userInput}`,
      maxTokens: 100,
      temperature: 0.7,
    });

    const answer = response.generations[0]?.text?.trim() || "Sorry, no response.";
    res.json({ answer });
  } catch (error) {
    console.error("Cohere API error:", error);
    res.status(500).json({ answer: "Sorry, something went wrong." });
  }
});

// ---------------------------------------------
// Start Server
// ---------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
