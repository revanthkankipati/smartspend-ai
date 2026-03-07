# Backend for SmartSpend AI

This directory contains the minimal Express + MongoDB API used by the frontend.

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file (already present) with a valid MongoDB connection:
   ```env
   MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.../yourdb
   ```

   Optionally include an OpenAI API key to enable automatic statement parsing and chat:
   ```env
   OPENAI_API_KEY=sk-...
   ```

3. Start the server:
   ```bash
   npm start    # runs node server.js
   ```
   The API listens on http://localhost:5000.  A root GET returns a quick health text.

## Available endpoints

| Method | Path                   | Description                            |
|--------|------------------------|----------------------------------------|
| GET    | `/api/transactions`    | list all transactions                  |
| POST   | `/api/transactions`    | create a new transaction               |
| PUT    | `/api/transactions/:id`| update an existing transaction         |
| DELETE | `/api/transactions/:id`| delete a transaction                   |
| DELETE | `/api/transactions`    | clear all transactions (use with care) |
| POST   | `/api/transactions/sample` | insert demo records                |
| GET    | `/api/budget`          | retrieve the single budget document    |
| PUT    | `/api/budget`          | update or create monthly budget        |
| GET    | `/api/dashboard`       | compute analytics for current month    |
| POST   | `/api/statement/parse` | parse pasted statement & return analytics |
| POST   | `/api/statement/chat`  | send question + optional data to OpenAI for conversational insights |


CORS is configured to allow requests from ports `3000` and `5173`.

## Frontend integration

The React/Vite frontend (at `../frontend`) proxies `/api` calls to this server.  The
client-side `StoreProvider` handles all network operations so components just use
`useStore()` as before.

Start the frontend (in a separate terminal):

```bash
cd ../frontend
npm install
npm run dev
```

The app will open on http://localhost:3000 and automatically communicate with the
backend.
