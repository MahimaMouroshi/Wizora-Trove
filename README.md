# Wizora Trove

Full project: `backend/` (Express + MongoDB API) and `frontend/` (React + Vite UI).


## Run the backend
```bash
cd backend
npm install
cp .env.example .env      # then fill in MONGODB_URI and JWT_SECRET
npm run dev                # http://localhost:5000
```

## Run the frontend
```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

Open http://localhost:5173 — the frontend calls the API at
`http://localhost:5000/api` by default (see `frontend/.env.example` to change
it via `VITE_API_URL`).

Run backend and frontend in two separate terminals; both need to be running
at the same time for sign-in, the library, blind date orders, etc. to work.
