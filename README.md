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

## Deploy on Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/mukuvi/EcosenseAI)

`render.yaml` is a Render Blueprint for the three app services plus Postgres. Render does not run `docker-compose.yml`, so each service is declared separately.

1. Push this repo, then in Render choose **New → Blueprint** and pick the repo.
2. Deploy. `ecosense-api` runs migrations automatically before each release; seed demo data once from the service shell with `node src/db/seed.js`.
3. Attach a custom domain to `ecosense-web` (for example `ecosense.tech`) in **Settings → Custom Domains**. Point `api.ecosense.tech` at `ecosense-api` if you want a separate API hostname.
4. Build the mobile app with `EXPO_PUBLIC_API_URL=https://<your-domain>/api` so it talks to the deployed API.

Notes:

- `ecosense-api` stores report photos on a 1 GB persistent disk mounted at `/app/uploads`. Container filesystems are ephemeral, so without the disk every deploy would delete the photos.
- The seeded `admin@gmail.com` account takes its password from `SEED_ADMIN_PASSWORD`, which the blueprint generates. Read it under the service's **Environment** tab to sign in, and change the demo accounts' passwords before sharing the URL publicly.
- The free Postgres plan is deleted after 30 days. Move to a paid plan before then, or the data goes with it.
- `ecosense-ai` ships without a trained model, so it serves the heuristic classifier in `ai/app/ml/waste_classifier.py`. Commit a model to `ai/models/` or set `WASTE_CLASSIFIER_MODEL_PATH` to use a real one; TensorFlow is only imported when a `.keras`/`.h5` file is found.
- The dashboard is served by nginx (`web/Dockerfile.render`), which proxies `/api` and `/uploads` to the API service. One origin, no CORS setup, and relative API URLs keep working.
- Local development is unchanged: `docker-compose up` still runs the Vite dev server through `web/Dockerfile`.

## Tech

- Frontend: React, Expo React Native
- Backend: Node.js, Express, PostgreSQL
- AI: Python, FastAPI
- Infrastructure: Docker, docker-compose

## Screenshots

Add a few screenshots here: the mobile report screen, the dashboard, and a cleanup status update. Real screenshots make the project easy to understand at a glance.

## License

Apache-2.0
