# Ojash Desk — Customer Support Ticket System

A full-stack customer support / helpdesk platform inspired by tools like Zendesk and Freshdesk. Built with a vanilla HTML/CSS/JS frontend and a Node.js + Express + MongoDB backend.

**Author:** Ojash Singh

---

## Overview

Ojash Desk lets a support team manage customer tickets end-to-end — from ticket creation and assignment, through live chat and a customer-facing portal, to analytics, billing, and a knowledge base. It also includes AI-style suggested replies and actions on tickets to speed up agent responses.

---

## Features

- **Ticket Management** — create, filter, search, and update tickets by status, priority, category, and assignee, with SLA tracking
- **Customer Management** — customer profiles with plan, order history, lifetime value, and CSAT score
- **Live Chat** — real-time-style chat interface between agents and customers
- **Knowledge Base** — publish and manage help articles with view/helpfulness tracking
- **Analytics Dashboard** — visual stats, charts, and KPIs with animated counters and progress bars
- **Billing** — subscription plan management per user
- **Team / Agent Management** — invite and manage support agents and admins
- **Canned Responses** — reusable reply templates for common issues
- **API Keys & Webhooks** — for integrating external tools
- **Authentication** — email/password login and register, plus a mock Google/GitHub OAuth flow for demo purposes
- **Admin Data Console** — a lightweight standalone admin view (`Admin.html`) for browsing and editing raw ticket data directly against the API
- **AI Suggestions** — each ticket includes an AI-style suggested resolution and recommended next actions

---

## Tech Stack

**Frontend**
- HTML5, CSS3, vanilla JavaScript (no framework)
- Custom design system (`style.css`) with light/dark theme support
- Modular JS: `app.js` (core logic), `api.js` (backend calls), `data.js`, `features.js`, `fixes.js`, `effects.js` (animations/UI polish), `oauth.js` (mock OAuth)

**Backend**
- Node.js + Express
- MongoDB with Mongoose ODM
- bcryptjs for password hashing
- dotenv for environment configuration
- CORS enabled for frontend–backend communication

---

## Project Structure

```
Customer-Support-Ticket-System/
├── .gitignore
├── README.md
│
├── Frontend/
│   ├── index.html              # Inbox
│   ├── home.html               # Dashboard home
│   ├── tickets.html            # All tickets view
│   ├── customers.html          # Customer list
│   ├── customer-portal.html    # Customer-facing contact/portal page
│   ├── live-chat.html          # Live chat interface
│   ├── knowledge-base.html     # Help articles
│   ├── analytics.html          # Analytics dashboard
│   ├── billing.html            # Subscription/billing management
│   ├── settings.html           # App & account settings
│   ├── login.html              # Login page
│   ├── register.html           # Registration page
│   ├── logo.svg
│   ├── style.css               # Global styles
│   ├── app.js                  # Core frontend logic
│   ├── api.js                  # Backend API client
│   ├── data.js                 # Local/demo data helpers
│   ├── features.js
│   ├── fixes.js
│   ├── effects.js              # UI animations (counters, charts, tooltips)
│   └── oauth.js                # Mock Google/GitHub OAuth flow
│
└── Backend/
    ├── server.js                # Express app entry point
    ├── db.js                    # MongoDB connection
    ├── db.json                  # Seed data source
    ├── seed.js                  # Script to seed MongoDB from db.json
    ├── package.json
    ├── .env                     # Environment variables (not committed)
    │
    └── models/
        ├── Ticket.js
        ├── Customer.js
        ├── User.js
        ├── KbArticle.js
        ├── CannedResponse.js
        ├── Chat.js
        ├── Tag.js
        ├── ApiKey.js
        ├── Webhook.js
        ├── Settings.js
        └── cleanJSON.js         # Shared schema output cleanup helper
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally, or a MongoDB Atlas connection string

### 1. Clone the repository
```bash
git clone https://github.com/ojashsingh-coder/Customer-Support-Ticket-System.git
cd Customer-Support-Ticket-System
```

### 2. Set up the backend
```bash
cd Backend
npm install
```

Create a `.env` file inside `Backend/` with:
```
MONGODB_URI=mongodb://localhost:27017/ojashdesk
PORT=3000
```

Seed the database with sample data:
```bash
npm run seed
```

Start the backend server:
```bash
npm start
```
The API will run at `http://localhost:3000`.

### 3. Run the frontend
The frontend is static HTML/CSS/JS — no build step required. Open `Frontend/index.html` in your browser, or serve the `Frontend` folder with any static server (e.g. the Live Server extension in VS Code) so that relative paths and API calls resolve correctly.

> **Note:** Make sure the backend is running first — the frontend fetches ticket, customer, and settings data from the API at `http://localhost:3000`.

---

## Environment Variables

| Variable       | Description                              |
|----------------|-------------------------------------------|
| `MONGODB_URI`  | MongoDB connection string                 |
| `PORT`         | Port the Express server runs on (default: 3000) |

`.env` is excluded from version control via `.gitignore` — never commit real credentials.

---

## Available Scripts (Backend)

| Command         | Description                                  |
|------------------|-----------------------------------------------|
| `npm start`      | Start the server                              |
| `npm run dev`    | Start the server with nodemon (auto-restart)  |
| `npm run seed`   | Populate MongoDB from `db.json`               |

---

## Roadmap Ideas

- Real-time chat via WebSockets
- Real AI-powered ticket suggestions (currently static/demo)
- File attachments on tickets
- Role-based permission system
- Email notifications on ticket updates

---

## License

This project was built for educational purposes.

---

**Built by Ojash Singh**
