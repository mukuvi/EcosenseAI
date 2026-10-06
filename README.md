# EcoSense AI

Report waste pollution from your phone and let the right office handle it.

A citizen sends a report with a photo and location. The platform classifies the waste, flags hotspots, routes the report to the responsible agency and tracks it from submission to cleanup. Agencies work from a web dashboard, and reporters earn points for useful reports.

## What it does

- **Mobile app** (Expo, React Native): take a photo, add location, submit a report, follow its status and earn rewards.
- **Web dashboard** (React): agencies see incoming reports, hotspot areas and cleanup progress.
- **Backend API** (Node.js, Express, PostgreSQL): accounts, reports, rewards and hotspots.
- **AI service** (Python, FastAPI): classifies waste from images and supports hotspot detection and pickup route planning.

## How it works

1. A citizen reports waste with a photo and location.
2. The AI service classifies the waste and scores the report.
3. The report is routed to the agency responsible for that area.
4. The agency updates status until the site is cleaned up.
5. The reporter follows the status and earns points.

## Repository layout

```
EcosenseAI/
  ai/        FastAPI service: waste classification, hotspot and routing
  backend/   Express API and PostgreSQL
  mobile/    Expo React Native app
  web/       React dashboard for agencies
  docker-compose.yml
```

## Run it

### With Docker

```bash
docker-compose up --build
```

| Service  | URL                     |
| -------- | ----------------------- |
| Backend  | http://localhost:5000/api |
| Web      | http://localhost:3000   |
| AI       | http://localhost:8000   |
| Postgres | localhost:5432          |

### Manually

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

Web:

```bash
cd web
npm install
npm run dev
```

Mobile:

```bash
cd mobile
npm install
npx expo start
```

AI service:

```bash
cd ai
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Tech

- Frontend: React, Expo React Native
- Backend: Node.js, Express, PostgreSQL
- AI: Python, FastAPI
- Infrastructure: Docker, docker-compose

## Screenshots

Add a few screenshots here: the mobile report screen, the dashboard, and a cleanup status update. Real screenshots make the project easy to understand at a glance.

## License

Apache-2.0
