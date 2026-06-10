# CodeMantri 🏦🤖
> Production-Ready MERN Stack FinTech Platform with AI-Driven Loan Eligibility & Verification

SmartLoan AI is a comprehensive modern FinTech platform designed to streamline loan applications, automate credit risk assessment, verify identity through OCR, and provide AI-powered personalized loan recommendations. It features a complete React + TypeScript frontend and a Node.js/Express backend, with a dual database mechanism supporting both local MongoDB and a mock JSON database fallback.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **OTP-based Verification:** Secure phone verification powered by Twilio SMS and WhatsApp sandbox.
- **Fail-safe OTP Log:** Automatic server console print fallback if Twilio is running in trial mode or fails.
- **JWT Session Management:** Strict token-based authentication with auto-refresh mechanism.
- **Role-based Access Control:** Distinct user dashboard and admin panels.

### 📄 Intelligent KYC (Know Your Customer)
- **OCR Identity Scanner:** Simulated automated OCR document scanning for PAN, Aadhaar, and Selfie verification.
- **Status Workflows:** Real-time state updates (`Pending` -> `Approved` / `Rejected`) managed via user and admin actions.

### 📊 Credit & AI Advisory Engine
- **Credit Score Fetching:** CIBIL simulator retrieving credit health scores.
- **AI Recommendation Engine:** Tailored, data-driven loan recommendations (Home, Personal, Auto, Education) based on credit score, income, and debt-to-income ratio.
- **Interactive Eligibility Calculator:** Instant loan approval probability checking.

### 💼 Loan Application & Admin Panel
- **End-to-End Application:** Seamless multi-step loan application tracking.
- **Comprehensive Admin Dashboard:** Manage KYC statuses, review applications, and track platform audit logs.

---

## 🛠️ Technology Stack

| Tier | Technologies Used |
|---|---|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, Redux Toolkit, React Router, Lucide Icons |
| **Backend** | Node.js, Express, Mongoose, JWT, BcryptJS |
| **Database** | MongoDB (Production) / Local JSON Database (Mock fallback mode) |
| **Third-Party Services** | Twilio API (SMS / WhatsApp), Cloudinary (Mock Cloud Storage) |

---

## 📁 Repository Structure

```text
smartloan-ai/
├── backend/
│   ├── config/          # DB connection & Mock DB initialization
│   ├── controllers/     # Auth, Loan, KYC, Credit, Admin controllers
│   ├── data/            # Local JSON database storage (mock_db.json)
│   ├── middleware/      # Auth guard, upload handler, rate limiter
│   ├── models/          # Mongoose Schema Definitions
│   ├── routes/          # API endpoint routes
│   ├── services/        # SMS (Twilio), OCR, Recommendation Engine
│   ├── server.js        # Express server entry point
│   └── .env             # Environment configurations (hidden by Git)
├── frontend/
│   ├── src/
│   │   ├── assets/      # Static assets & icons
│   │   ├── components/  # Layout, Navbar, Sidebar
│   │   ├── pages/       # Dashboard, KYC, Admin, Recommendations, etc.
│   │   ├── store/       # Redux State Management
│   │   └── utils/       # API axios client
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml   # Multi-container orchestration config
├── package.json         # Main workspaces script config
└── .gitignore           # Global git ignore configurations
```

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Git](https://git-scm.com/)
- *Optional:* [MongoDB Community Server](https://www.mongodb.com/try/download/community) (Not required if using `FORCE_MOCK_DB=true`)

### 1. Clone & Install Dependencies
Run the following commands in your terminal:
```bash
# Clone the repository
git clone https://github.com/rupamkumar4973-cell/Fintech-CodeMantri.git
cd Fintech-CodeMantri

# Install dependencies for both Frontend & Backend
npm run install-all
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```bash
cp backend/.env.example backend/.env # Or create backend/.env manually
```
Add the following configurations:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartloan

# Set to true to run WITHOUT local MongoDB installed:
FORCE_MOCK_DB=false

JWT_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# Twilio SMS Config
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
```

---

## 🚀 Running the Platform

### Running both Frontend and Backend concurrently:
At the project root, run:
```bash
npm run dev
```
- **Frontend URL:** [http://localhost:5173](http://localhost:5173)
- **Backend URL:** [http://localhost:5000](http://localhost:5000)

### Running separately:
- To start only the Backend: `npm run start-backend`
- To start only the Frontend: `npm run start-frontend`

---

## 🧑‍💻 Developer

- **Name:** Rupam Bhargov
- **LinkedIn:** [Linkdn](https://www.linkedin.com/in/rupam-bhargov-777380294?utm_source=share_via&utm_content=profile&utm_medium=member_android)
- **GitHub Repository:** [Fintech-CodeMantri](https://github.com/rupamkumar4973-cell/Fintech-CodeMantri)
