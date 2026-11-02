# EcoSense AI

Report waste pollution from your phone and let the right office handle it.

A citizen sends a report with a photo and location. The platform classifies the waste, flags hotspots, routes the report to the responsible agency and tracks it from submission to cleanup. Agencies work from a web dashboard, and reporters earn points for useful reports.

## What it does

- **Mobile app** (Expo, React Native): take a photo, add location, submit a report, follow its status history, receive notifications and earn rewards.
- **Web dashboard** (React): agencies see incoming reports, assign them to field agents, watch hotspot clusters on a live map and track cleanup progress.
- **Backend API** (Node.js, Express, PostgreSQL): accounts, reports, assignments, status history, notifications, rewards and hotspots.
- **AI service** (Python, FastAPI): a trained waste classifier plus hotspot detection and pickup route planning.

## How it works

1. A citizen reports waste with a photo and location.
2. The AI service classifies the waste and scores the report.
3. An admin or organization assigns the report to a field agent.
4. The agent updates status until the site is cleaned up.
5. The reporter follows the status history, receives notifications and earns points.

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

The same project runs on Android, iOS and the web. Press `a`, `i` or `w` in the Expo terminal, scan the QR code with Expo Go, or open `http://localhost:8081` for the web preview.

### Mobile builds

The app uses Expo Go compatible modules (`expo-camera`, `expo-location`, `expo-image-picker`, `expo-secure-store`, `expo-av`) plus `react-native-maps`. App icons and the splash screen live in `mobile/assets`.

```bash
cd mobile
npm install -g eas-cli
eas login
eas build --platform android --profile preview
eas build --platform ios --profile production
```

`eas.json` defines a `preview` profile that produces an installable APK and a `production` profile for store builds. Android builds run on Linux, macOS or Windows. iOS builds run on Expo's build servers, so a Mac is not required unless you build locally with Xcode.

Expo Go includes a Google Maps key, but a standalone Android build needs your own key for the map tab. Add `android.config.googleMaps.apiKey` to `app.json` before building the APK. iOS uses Apple Maps and needs no key. Until a key is set, the rest of the app works and the map tab stays blank on Android.

Set `EXPO_PUBLIC_API_URL` when building so the app points at your deployed API:

```bash
EXPO_PUBLIC_API_URL=https://your-api.onrender.com/api eas build --platform android --profile preview
```

## One database for web and mobile

The mobile app and the web dashboard do not keep separate data. Both call the same Express API, which reads and writes one PostgreSQL database. A report submitted from the Android app appears in the web dashboard, points earned on the phone show up in the browser, and a status change made by an agency on the web is visible to the citizen in the app. The only local state on a device is the login token and the cached user profile.

## Assignments and notifications

Admins and organizations assign a report to an active field agent from the report detail page. The assignment is stored in `report_assignments`, the report moves to `assigned`, and the agent sees it under **Assigned to me** in the agent portal. Field agents can only change the status of reports assigned to them, and completing a report closes the assignment.

Every assignment, status change and reward redemption creates an in-app notification. When the user has registered an Expo push token, the API also sends the same message through Expo Push. Add your EAS project ID to `mobile/app.json` under `expo.extra.eas.projectId` after running `eas init`, then rebuild the app. Without a project ID the app still works and notifications remain in-app.

## Waste classifier model

`ai/models/waste_classifier.keras` is a MobileNetV2 transfer learning model trained on the TrashNet dataset (2,527 images across cardboard, glass, metal, paper, plastic and trash). TrashNet classes are mapped to EcoSense categories: cardboard to construction, plastic to plastic, trash to mixed, and glass, metal and paper to other. Organic, electronic, hazardous, medical and textile reports keep the label the citizen chooses until a dataset covering those classes is added.

To retrain:

```bash
python ai/scripts/train_trashnet.py --data-dir /path/to/dataset-resized --out ai/models/waste_classifier.keras
```

The script writes `waste_classifier_labels.json` next to the model. Delete that file to fall back to the built-in TrashNet mapping.

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
3. Optionally attach a domain you already control to `ecosense-web` in **Settings → Custom Domains**, for example `reports.yourdomain.com`, and point `api.yourdomain.com` at `ecosense-api`. Skip this if you don't need one: the `*.onrender.com` URLs work as-is.
4. Build the mobile app with `EXPO_PUBLIC_API_URL=https://<your-api-domain-or-onrender-url>/api` so it talks to the deployed API. `mobile/.env.example` shows the shape; `api.ecosense.co.ke` is only the current default.

Notes:

- `ecosense-api` exposes `GET /api/reports/:id/audio`, which streams a spoken status update generated by ElevenLabs and caches it on disk per status. Set `ELEVENLABS_API_KEY` to enable it; without the key the endpoint returns 503 and the dashboard shows a short message.
- `ecosense-api` stores report photos on a 1 GB persistent disk mounted at `/app/uploads`. Container filesystems are ephemeral, so without the disk every deploy would delete the photos.
- The seeded `admin@gmail.com` account takes its password from `SEED_ADMIN_PASSWORD`, which the blueprint generates. Read it under the service's **Environment** tab to sign in, and change the demo accounts' passwords before sharing the URL publicly.
- The free Postgres plan is deleted after 30 days. Move to a paid plan before then, or the data goes with it.
- `ecosense-ai` ships with the trained TrashNet model in `ai/models/`. It loads at startup, so the first report is not slowed down by TensorFlow initialization. The API stores the predicted type and confidence in `ai_waste_type` and `ai_confidence`. The hotspot page recomputes clusters from recent reports through the same service. Commit a different model to `ai/models/waste_classifier.keras` or set `WASTE_CLASSIFIER_MODEL_PATH` to override it.
- `ecosense-ai` is on the Render standard plan because TensorFlow inference needs more than the 512 MB starter instance.
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
