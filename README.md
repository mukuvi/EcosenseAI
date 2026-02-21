# 🌍 EcoSense AI

**Empowering citizens to report and track waste pollution in Kenyan metropolitan areas.**

EcoSense AI is a full-stack platform combining a React Native mobile app, React admin dashboard, Node.js backend, and Python AI microservice to facilitate efficient waste management and environmental remediation.

---

## Project Structure

```
EcosenseAI/
├── backend/          # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # Environment configuration
│   │   ├── controllers/      # Route handlers
│   │   ├── db/               # Database connection, migrations, seeds
│   │   ├── middleware/       # Auth, error handling, file uploads
│   │   ├── routes/           # API route definitions
│   │   ├── utils/            # Logger and helpers
│   │   └── server.js         # Express app entry point
│   ├── Dockerfile
│   └── package.json
│
├── web/              # React + Vite Admin Dashboard
│   ├── src/
│   │   ├── components/       # Layout, StatCard, StatusBadge
│   │   ├── pages/            # Dashboard, Reports, Users, Rewards, Hotspots
│   │   ├── services/         # Axios API client
│   │   ├── store/            # Zustand auth store
│   │   ├── App.jsx           # Router + protected routes
│   │   └── main.jsx          # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── mobile/           # React Native (Expo) Mobile App
│   ├── src/
│   │   ├── navigation/       # Tab + stack navigation
│   │   ├── screens/          # Login, Register, Home, Report, Map, Rewards, Profile
│   │   ├── services/         # API client with secure token storage
│   │   └── store/            # Zustand auth store
│   ├── App.js
│   ├── app.json
│   └── package.json
│
├── ai/               # Python FastAPI AI Microservice
│   ├── app/
│   │   ├── routers/
│   │   │   ├── classifier.py # CNN waste image classification
│   │   │   ├── hotspot.py    # DBSCAN-based hotspot prediction
│   │   │   └── optimizer.py  # Route optimization for collection vehicles
│   │   └── main.py           # FastAPI entry point
│   ├── models/               # Trained ML model files
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml        # Full-stack orchestration
├── .gitignore
├── LICENSE
└── README.md
```

---

## Quick Start

### Option 1: Docker (recommended)

```bash
docker-compose up --build
```

Services:
| Service   | URL                        |
|-----------|----------------------------|
| Backend   | http://localhost:5000/api   |
| Web       | http://localhost:3000       |
| AI        | http://localhost:8000       |
| Database  | localhost:5432              |

### Option 2: Manual Setup

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # Edit database credentials
npm run migrate         # Create tables
npm run seed            # Insert sample data
npm run dev             # Start with hot reload
```

**Web Dashboard**
```bash
cd web
npm install
npm run dev             # Opens at http://localhost:3000
```

**Mobile App**
```bash
cd mobile
npm install
npx expo start          # Scan QR code with Expo Go
```

**AI Service**
```bash
cd ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## API Endpoints

### Authentication
| Method | Endpoint           | Description           |
|--------|--------------------|-----------------------|
| POST   | /api/auth/register | Register new user     |
| POST   | /api/auth/login    | Login, receive JWT    |
| GET    | /api/auth/me       | Get current user      |

### Waste Reports
| Method | Endpoint                  | Description               |
|--------|---------------------------|---------------------------|
| POST   | /api/reports              | Create report (+ images)  |
| GET    | /api/reports              | List with filters/paging  |
| GET    | /api/reports/:id          | Get single report         |
| PATCH  | /api/reports/:id/status   | Update status (admin)     |

### Users
| Method | Endpoint              | Description                 |
|--------|-----------------------|-----------------------------|
| GET    | /api/users/points     | Get points + transactions   |
| GET    | /api/users            | List all users (admin)      |
| PATCH  | /api/users/:id/role   | Update user role (admin)    |

### Rewards
| Method | Endpoint                 | Description               |
|--------|--------------------------|---------------------------|
| GET    | /api/rewards             | List available rewards    |
| POST   | /api/rewards/:id/redeem  | Redeem a reward           |
| POST   | /api/rewards             | Create reward (admin)     |
| PUT    | /api/rewards/:id         | Update reward (admin)     |

### Hotspots
| Method | Endpoint            | Description            |
|--------|---------------------|------------------------|
| GET    | /api/hotspots       | List predicted hotspots|
| GET    | /api/hotspots/:id   | Hotspot + nearby reports|

### AI Service
| Method | Endpoint               | Description                        |
|--------|------------------------|------------------------------------|
| POST   | /ai/classify           | Classify waste from image          |
| POST   | /ai/hotspots/predict   | Predict hotspots from report data  |
| POST   | /ai/optimize-route     | Optimize collection vehicle route  |

---

## Database Schema

- **users** — Citizens, admins, field agents with point balances
- **waste_reports** — Geo-tagged waste reports with images and AI classification
- **report_assignments** — Task assignments for field teams
- **rewards** — Configurable rewards (airtime, vouchers, merchandise)
- **reward_redemptions** — User reward redemption records
- **point_transactions** — Full audit trail of point earn/spend events
- **hotspots** — AI-predicted waste accumulation zones

---

## Tech Stack

| Layer    | Technology                                  |
|----------|---------------------------------------------|
| Mobile   | React Native (Expo), Zustand, React Navigation |
| Web      | React, Vite, Tailwind CSS, Recharts, Zustand |
| Backend  | Node.js, Express, PostgreSQL, JWT, Multer   |
| AI/ML    | Python, FastAPI, TensorFlow, scikit-learn   |
| DevOps   | Docker, Docker Compose                      |

---

## Sample Credentials (after seeding)

| Role        | Email                  | Password    |
|-------------|------------------------|-------------|
| Admin       | admin@ecosense.co.ke   | admin123    |
| Citizen     | jane@example.com       | citizen123  |
| Field Agent | agent@ecosense.co.ke   | agent123    |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the terms specified in the [LICENSE](LICENSE) file.
