const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");  // Import cors package

const app = express();
app.use(cors({
  origin: "*",  // Allow all origins (change to a specific origin in production)
  methods: "GET, POST, PUT, DELETE",  // Allow specific HTTP methods
  allowedHeaders: "Content-Type",  // Allow specific headers
}));

const path = require("path");
const { CohereClient } = require("cohere-ai");
const db = require("./db");

const multer = require("multer"); 
const upload = multer({
  dest: path.join(__dirname, "../public/uploads"), // Define destination for file uploads
  limits: { fileSize: 50 * 1024 * 1024 }, // Optional: file size limit (50MB)
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]; // Allowed file types
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Invalid file type"));
    }
    cb(null, true); // Accept file
  }
});




const PORT = 5000; // Unified server on one port

global.db = db;

// Mount announcement routes
const announcementRoutes = require("./routes/announcementRoutes");
app.use("/api/announcements", announcementRoutes);




// Middleware

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../public"))); // Serves static files

// Initialize Cohere Client
const cohere = new CohereClient({
  token: "1vvr4Rj49nvT61mzbzm7LUEevR5tmlFMoqSbfi46", 
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

// Faculty login
app.post("/faculty-login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM faculty WHERE email = ?";  // Find the faculty by email
  
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Database query error: ", err);
      return res.status(500).send("Internal Server Error");
    }

    if (result.length > 0) {
      const faculty = result[0];

      // Compare the password entered with the stored password
      if (faculty.password === password) {
        res.status(200).send("Login Successful");
      } else {
        res.status(401).send("Invalid Credentials");
      }
    } else {
      res.status(401).send("No faculty found with this email");
    }
  });
});

// Get faculty details by email
app.get("/faculty/email/:email", (req, res) => {
  const { email } = req.params;
  const sql = "SELECT * FROM faculty WHERE email = ?";
  
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("Database query error: ", err);
      return res.status(500).send("Internal Server Error");
    }

    if (result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).send("Faculty not found");
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

// Route to fetch all students
app.get("/students", (req, res) => {
  const sql = "SELECT * FROM students"; // Query to get all data from 'students' table
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Database query error: ", err);
      return res.status(500).send("Internal Server Error");
    }
    res.status(200).json(result); // Return the result as JSON
  });
});

// ---------------------------------------------
// Start Server
// ---------------------------------------------
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Announcement posting route
app.post("/api/announcements", upload.single("attachment"), (req, res) => {
  const { title, description, audience } = req.body;
  const attachment = req.file ? req.file.path : null;

  let sql = "INSERT INTO announcements (title, description, target_audience) VALUES (?, ?, ?)";
  const values = [title, description, audience];

  if (attachment) {
    sql = "INSERT INTO announcements (title, description, target_audience, attachment_path) VALUES (?, ?, ?, ?)";
    values.push(attachment); // Add the file path to the values
  }

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Database error");
    }
    res.json({ message: "Announcement posted successfully!" });
  });




// Express route for fetching all announcements
app.get("/api/announcements", (req, res) => {
  const sql = "SELECT * FROM announcements";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.status(200).json(result); // <-- Add this line
  });
});

app.get('/api/user-role/:email', (req, res) => {
  const email = req.params.email;
  const sql = "SELECT role FROM users WHERE email = ?";  // Adjust table name if necessary
  
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).send("Error fetching user role");
    }

    if (result.length === 0) {
      return res.status(404).send("User not found");
    }

    const role = result[0].role;  // Extract the role (student or faculty)
    res.json({ role });
  });
});

app.get('/api/announcements/:role', (req, res) => {
  const role = req.params.role;  // 'student' or 'faculty'
  const sql = "SELECT * FROM announcements WHERE role = ?";  // Adjust table name if necessary
  
  db.query(sql, [role], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).send("Error fetching announcements");
    }

    res.json(result);  // Return the fetched announcements
  });
});



const notifications = [
  { title: "New Event in CSE", message: "The Texplorer 2025 event has been a grand success." },
  { title: "New Research Paper Published", message: "A new research paper on AI by our faculty members has been published in a renowned journal." }
];

// Route to fetch notifications
app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});


});

