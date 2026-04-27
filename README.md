# 💰 VaultTrack — Personal Finance Tracker

A full-stack personal finance tracker built with React, Node.js, Express, and MongoDB. Track your income and expenses, visualize spending patterns, and manage monthly budgets.

🔗 **Live Demo:** [vault-track-eta.vercel.app](https://vault-track-eta.vercel.app)  
📁 **GitHub:** [github.com/Devadharshini784/VaultTrack](https://github.com/Devadharshini784/VaultTrack)

---

## Features

- **Authentication** — Secure signup and login with JWT tokens
- **Transaction Tracking** — Add, view, and delete income and expense transactions
- **Dashboard** — Summary cards showing total balance, income, and expenses
- **Charts** — Pie chart for expense breakdown by category, bar chart for monthly overview
- **Budget Tracker** — Set a monthly budget and track spending with progress indicators
- **Search & Filter** — Filter transactions by type, category, or keyword
- **Export CSV** — Download all transactions as a CSV file
- **Dark / Light Mode** — Toggle between dark and light themes, preference saved locally
- **Responsive Design** — Works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT (JSON Web Tokens), bcryptjs |
| Deployment | Vercel (frontend), Render (backend) |

---

## Project Structure

```
VaultTrack/
├── client/                   # React frontend
│   ├── src/
│   │   ├── api/              # Axios API helpers
│   │   ├── components/       # Reusable components
│   │   ├── context/          # Auth context (global state)
│   │   ├── pages/            # Login, Register, Dashboard
│   │   └── App.jsx           # Routes
│   └── vercel.json           # Vercel routing config
│
└── server/                   # Node.js backend
    ├── controllers/          # Business logic
    ├── middleware/            # JWT auth middleware
    ├── models/               # MongoDB schemas
    ├── routes/               # API routes
    └── index.js              # Entry point
```

---

## Getting Started Locally

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Devadharshini784/VaultTrack.git
cd VaultTrack
```

### 2. Setup the backend
```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Start the backend:
```bash
npm run dev
```

### 3. Setup the frontend
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user (protected) |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get all transactions |
| POST | `/api/transactions` | Add a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| GET | `/api/transactions/summary` | Get income/expense summary |

---

## Screenshots

> Dashboard — dark mode with charts and summary cards

> Transactions — search, filter, and export

> Budget — monthly spending tracker with progress bar

---

## What I Learned

- Building a REST API with Node.js and Express
- JWT-based authentication and protected routes
- MongoDB schema design with Mongoose
- React state management with Context API
- Data visualization with Recharts
- Deploying a full-stack app with Vercel and Render

---

## Author

**Devadharshini**  
[GitHub](https://github.com/Devadharshini784)

---

> Built as a portfolio project to demonstrate full-stack development skills.
