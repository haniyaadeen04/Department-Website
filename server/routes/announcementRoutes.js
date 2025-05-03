const express = require("express");
const router = express.Router();
const db = require("../db"); // or wherever your MySQL connection is

// GET all announcements
router.get("/", (req, res) => {
  const sql = "SELECT * FROM announcements";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).send("Error fetching announcements");
    }
    res.json(result);
  });
});

module.exports = router;
