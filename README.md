# Eluno — AI-Powered Order Management System

Full order lifecycle management for an eyewear brand: lens inventory management,
status dashboard with SLA tracking, and AI-driven TAT prediction & breach alerts.

## Modules
1. **Lens Inventory Management** — tracks in-house stock (power range, index,
   coating, quantity) and determines IN_HOUSE vs EXTERNAL_PROCUREMENT per order.
2. **Status Dashboard** — manage all orders through lifecycle stages, filter by
   status/lens type/store, update status with delay reasons, view SLA timers.
3. **TAT Prediction & Breach Alerts** — ML model (RandomForest) predicts breach
   risk per order; email/WhatsApp alerts sent automatically (cron every 15 min)
   or on-demand.

## Quick Start (Docker)

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- ML service: http://localhost:8001

## Manual Setup

### 1. MongoDB
Run a local MongoDB instance on `27017`, or update `MONGO_URI` in `backend/.env`.

### 2. ML Service
```bash
cd ml
pip install -r requirements.txt
cd model
python train.py
uvicorn predict:app --host 0.0.0.0 --port 8001
```

### 3. Backend
```bash
cd backend
npm install
npm run dev
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Seed Data
- `ml/data/order_history.csv` — sample historical orders used to train the TAT model.
- `ml/data/sla_config.csv` — sample SLA overrides (reference; load into `SLAConfig`
  collection manually or via a seed script if needed).
- Add inventory entries via the **Inventory** page in the UI before creating orders,
  so availability checks return meaningful results.

## Environment Variables
See `backend/.env` for required config: MongoDB URI, ML service URL, SMTP
credentials (email alerts), Twilio credentials (WhatsApp alerts).

## Docs
- `docs/architecture-note.md` — AI models/APIs used and rationale (1-page).
- `docs/demo-script.md` — 15-minute demo walkthrough script.
