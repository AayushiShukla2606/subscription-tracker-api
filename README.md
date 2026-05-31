# 💳 Subscription Tracker API

> **Did you know the average person wastes ₹2,400/year on forgotten subscriptions?**
> This API helps users track, manage, and get AI-powered insights on their subscriptions — so they never pay for something they don't use.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![SendGrid](https://img.shields.io/badge/Email-SendGrid-00B2FF?style=flat-square)
![Render](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=flat-square)

🌐 **Live API:** [https://subscription-tracker-api-t2s0.onrender.com](https://subscription-tracker-api-t2s0.onrender.com)

---

## 🧩 The Problem

Most people subscribe to 5-10 services — Netflix, Spotify, AWS, Notion, and more. Over time:
- 💸 You forget which subscriptions you have
- 📅 Renewals sneak up on you
- 🤷 You keep paying for things you don't use

**This API solves all three.**

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT-based register & login
- 📋 **Subscription Management** — full CRUD operations
- 📊 **Spending Insights** — monthly & yearly spend, category breakdown
- 🔔 **Smart Renewal Alerts** — critical/high/medium urgency based on days left
- 📧 **Email Notifications** — automated renewal alerts via SendGrid
- 🤖 **AI-Powered Suggestions** — rule-based recommendation engine that detects:
  - High cost subscriptions
  - Overlapping services (Spotify + YouTube Premium, ChatGPT + Claude)
  - Cloud cost optimization opportunities
  - Category consolidation opportunities
- ✅ **Input Validation** — clean error messages for invalid data
- 🚀 **Production Deployed** — live on Render with auto-deployment

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Runtime | Node.js | Fast, non-blocking I/O |
| Framework | Express.js | Minimal, flexible REST API |
| Database | PostgreSQL (Neon) | Reliable relational data |
| Auth | JWT + bcrypt | Stateless, secure authentication |
| Validation | express-validator | Clean input validation |
| Email | SendGrid | Transactional email notifications |
| Deployment | Render | Auto-deploy on every push |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Subscriptions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/subscriptions` | Add a subscription |
| GET | `/api/subscriptions` | Get all subscriptions |
| PUT | `/api/subscriptions/:id` | Update a subscription |
| DELETE | `/api/subscriptions/:id` | Delete a subscription |
| GET | `/api/subscriptions/insights` | Get spending insights + AI suggestions + renewal alerts |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database (or Neon free tier)
- SendGrid account (for email notifications)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/AayushiShukla2606/subscription-tracker-api.git

# Navigate to project
cd subscription-tracker-api

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Add your environment variables

# Start development server
npm run dev
```

---

## 📊 Sample API Response

### Spending Insights
```json
{
  "total_subscriptions": 5,
  "monthly_spend": "4626.00",
  "yearly_spend": "55512.00",
  "renewing_soon": [
    {
      "name": "Netflix",
      "amount": "649.00",
      "billing_cycle": "monthly",
      "days_left": 1,
      "urgency": "critical",
      "message": "⚠️ Netflix renews TOMORROW for ₹649.00 — last chance to cancel!"
    }
  ],
  "spend_by_category": {
    "entertainment": 768,
    "cloud": 2400,
    "ai tools": 3350
  },
  "ai_suggestions": [
    {
      "subscription": "ChatGPT",
      "type": "overlap",
      "severity": "high",
      "message": "You have both ChatGPT and Claude — overlapping AI assistants costing ₹3350/month. Both do similar tasks — pick the one you use most and cancel the other."
    },
    {
      "subscription": "AWS",
      "type": "cloud_optimization",
      "severity": "medium",
      "message": "Your AWS bill is ₹2400. Consider reserved instances or savings plans — can reduce costs by up to 72%."
    }
  ]
}
```

---

## 🤖 AI Recommendation Engine

Built a two-layer rule-based recommendation engine:

**Generic Rules** — apply to any subscription:
- Flag subscriptions above ₹500/month
- Detect category consolidation opportunities
- Identify yearly plans that cost more than monthly

**Specific Rules** — detect popular overlapping services:
- Spotify + YouTube Premium → overlapping music
- Netflix + Prime + Hotstar → too many streaming
- ChatGPT + Claude → overlapping AI tools
- LinkedIn + Naukri → overlapping job platforms
- AWS/GCP → cloud cost optimization

---

## 🔐 Security Practices

- Passwords hashed with **bcrypt** (salt rounds: 10)
- **JWT tokens** expire in 7 days
- **Parameterized queries** prevent SQL injection
- Secrets stored in **environment variables** — never in codebase
- **Authorization checks** ensure users access only their own data

---

## 🗂️ Project Structure

```
subscription-tracker-api/
├── config/
│   └── db.js                     ← PostgreSQL connection pool
├── controllers/
│   ├── authController.js         ← Register & login logic
│   └── subscriptionController.js ← CRUD, insights & AI engine
├── middleware/
│   └── authMiddleware.js         ← JWT verification
├── routes/
│   ├── authRoutes.js             ← Auth endpoints + validation
│   └── subscriptionRoutes.js    ← Subscription endpoints + validation
├── utils/
│   └── emailService.js          ← SendGrid email notifications
├── .env                          ← Environment variables (not committed)
├── .env.example                  ← Environment variable template
├── server.js                     ← App entry point
└── package.json
```

---

## 🌱 Upcoming Features

- [x] Email alerts before subscription renewal ✅
- [x] AI-powered cancel suggestions ✅
- [ ] Bank statement PDF parser
- [ ] React frontend dashboard
- [ ] Multi-currency support

---

## 👩‍💻 Author

**Aayushi Shukla** — Full Stack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/aayushi-shukla-3572951ab/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/AayushiShukla2606)
