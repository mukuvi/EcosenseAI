# EcoSense AI

EcoSense AI is a full-stack platform for reporting and tracking waste pollution.

## Repository layout

```
EcosenseAI/
  ai/
  backend/
  mobile/
  web/
  docker-compose.yml
```

## Run with Docker

```bash
docker-compose up --build
```

Services

| Service  | URL |
|----------|-----|
| Backend  | http://localhost:5000/api |
| Web      | http://localhost:3000 |
| AI       | http://localhost:8000 |
| Database | localhost:5432 |

## Run locally (manual)

Backend

```bash
cd backend
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

Web

```bash
cd web
npm install
npm run dev
```

Mobile

```bash
cd mobile
npm install
npx expo start
```

AI service

```bash
cd ai
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## License

See [LICENSE](LICENSE).
