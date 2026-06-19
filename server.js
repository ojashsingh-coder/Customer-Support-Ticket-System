const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Ojash*11",
    database: "customer_support"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err);
        return;
    }

    console.log("MySQL Connected Successfully!");
});

// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Test Route
app.get("/test", (req, res) => {
    res.send("TEST ROUTE WORKS");
});

// Register Route
app.post("/register", (req, res) => {

    const { name, email, password } = req.body;

    db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, password, "customer"],
        (err, result) => {

            if (err) {
                return res.status(400).json({
                    message: err.message
                });
            }

            res.json({
                message: "Registration Successful!"
            });
        }
    );
});

// Login Route
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ? AND password = ?",
        [email, password],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Server Error"
                });
            }

            if (result.length > 0) {

                res.json({
                    message: "Login Successful!"
                });

            } else {

                res.status(401).json({
                    message: "Invalid Email or Password"
                });

            }
        }
    );
});

// Create Ticket
app.post("/create-ticket", (req, res) => {

    const {
        email,
        category,
        priority,
        description
    } = req.body;

    db.query(
        "INSERT INTO tickets (customer_email, category, priority, description) VALUES (?, ?, ?, ?)",
        [email, category, priority, description],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Ticket Creation Failed"
                });
            }

            res.json({
                message: "Ticket Created Successfully!"
            });

        }
    );
});

// Get All Tickets
app.get("/tickets", (req, res) => {

    db.query(
        "SELECT * FROM tickets ORDER BY id DESC",
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Error Loading Tickets"
                });
            }

            res.json(result);
        }
    );

});

// Get Customer Tickets
app.get("/my-tickets/:email", (req, res) => {

    const email = req.params.email;

    db.query(
        "SELECT * FROM tickets WHERE customer_email = ? ORDER BY id DESC",
        [email],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Error Loading Customer Tickets"
                });
            }

            res.json(result);
        }
    );

});

// Update Ticket Status
app.post("/update-ticket", (req, res) => {

    const { id, status } = req.body;

    db.query(
        "UPDATE tickets SET status = ? WHERE id = ?",
        [status, id],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Update Failed"
                });
            }

            res.json({
                message: "Status Updated Successfully"
            });

        }
    );

});

// Delete Ticket
app.post("/delete-ticket", (req, res) => {

    const { id } = req.body;

    db.query(
        "DELETE FROM tickets WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Delete Failed"
                });
            }

            res.json({
                message: "Ticket Deleted Successfully"
            });

        }
    );

});
// ================= LIVE CHAT =================

// Save Message
app.post("/send-message", (req, res) => {

    const { sender, message } = req.body;

    db.query(
        "INSERT INTO messages (sender, message) VALUES (?, ?)",
        [sender, message],
        (err) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Failed"
                });
            }

            res.json({
                message: "Sent"
            });

        }
    );

});

// Get Messages
app.get("/messages", (req, res) => {

    db.query(
        "SELECT * FROM messages ORDER BY id ASC",
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Failed"
                });

            }

            res.json(result);

        }
    );

});

// Bot Reply
app.post("/bot-reply", (req, res) => {

    const { message } = req.body;

    let reply = "Our support team will contact you soon.";

    const text = message.toLowerCase();

    if (text.includes("login")) {
        reply = "Please try resetting your password.";
    }
    else if (text.includes("password")) {
        reply = "Use the Forgot Password option.";
    }
    else if (text.includes("ticket")) {
        reply = "You can create a ticket from the dashboard.";
    }
    else if (text.includes("hello") || text.includes("hi")) {
        reply = "Hello! How can I help you today?";
    }

    db.query(
        "INSERT INTO messages (sender, message) VALUES (?, ?)",
        ["Bot", reply],
        () => {

            res.json({
                reply
            });

        }
    );

});

// Start Server
app.listen(5000, () => {
    console.log("Server running at http://localhost:5000");
});

