const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const app = express();

// ================== MIDDLEWARE ==================
app.use(express.json());
app.use(express.static('public'));

// ================== DATABASE ==================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123', // apna password
    database: 'assistant_db'
});

db.connect(err => {
    if (err) {
        console.log("❌ MySQL Error:", err);
        return;
    }
    console.log("✅ MySQL Connected...");
});

// ================== REGISTER API ==================
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ success: false, message: "Fill all fields" });
    }

    // Check existing user
    db.query(
        "SELECT * FROM users WHERE username=?",
        [username],
        (err, result) => {
            if (err) return res.json({ success: false });

            if (result.length > 0) {
                return res.json({ success: false, message: "User already exists" });
            }

            // Insert new user
            db.query(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                [username, password],
                (err) => {
                    if (err) return res.json({ success: false });

                    res.json({ success: true });
                }
            );
        }
    );
});

// ================== LOGIN API ==================
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE username=? AND password=?",
        [username, password],
        (err, result) => {
            if (err) return res.json({ success: false });

            if (result.length > 0) {
                res.json({ success: true });
            } else {
                res.json({ success: false });
            }
        }
    );
});

// ================== CHAT BOT ==================
app.post('/command', (req, res) => {
    let input = req.body.text.toLowerCase().trim();
    let username = req.body.username || "guest";

    let response = "";

    // 🤖 Smart logic
    if (input.includes("hello") || input.includes("hi")) {
        response = "Hello! How can I help you?";
    }

    else if (input.includes("time")) {
        response = new Date().toLocaleTimeString();
    }

    else if (input.includes("date")) {
        response = new Date().toLocaleDateString();
    }

    else if (/^\d+\s*[\+\-\*\/]\s*\d+$/.test(input)) {
        try {
            let result = eval(input);
            response = "Result: " + result;
        } catch {
            response = "Invalid calculation";
        }
    }

    else if (input.includes("love")) {
        response = "😊 I appreciate that!";
    }

    else if (input.includes("your name")) {
        response = "I am your Smart Assistant 🤖";
    }

    else if (input.includes("bye")) {
        response = "Goodbye! 👋";
    }

    else {
        response = "Sorry, I don't understand.";
    }

    // 💾 Save chat
    db.query(
        "INSERT INTO chat_history (username, message, response) VALUES (?, ?, ?)",
        [username, input, response],
        (err) => {
            if (err) {
                console.log("❌ Save Error:", err);
            }
        }
    );

    res.json({ reply: response });
});

// ================== SERVER ==================
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});