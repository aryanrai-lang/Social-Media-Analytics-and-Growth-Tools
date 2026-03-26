# Social Media Analytics & Growth Tool - Setup Guide

Complete setup instructions for the Social Media Analytics and Growth Tool project. This guide covers frontend, backend, and environment configuration.

## Prerequisites

- **Node.js**: v18+ (recommended v20+)
- **npm**: v9+ (comes with Node.js)
- **MongoDB Atlas**: Free account with a cluster set up
- **Git**: For version control

## Project Structure

```
social_media/
├── server/                 # Express + TypeScript backend
├── client/                 # React 19 + Vite frontend
├── setup.md               # This file
└── README.md
```

---

## Part 1: Backend Setup

### 1.1 Install Dependencies

```bash
cd server
npm install
```

This installs:
- **Express** — REST API framework
- **TypeScript & ts-node** — Type-safe Node.js
- **Mongoose** — MongoDB ODM
- **Passport.js** — Authentication (JWT + Google OAuth)
- **@google/generative-ai** — Gemini API
- **@anthropic-ai/sdk** — Claude API
- **openai** — OpenAI API
- **apify-client** — Instagram data scraping
- **snoowrap** — Reddit API
- **axios** — HTTP client
- **jsonwebtoken** — JWT auth
- **bcryptjs** — Password hashing
- **dotenv** — Environment variables

### 1.2 Create `.env` File

Create `server/.env` with the following variables:

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/social_media?retryWrites=true&w=majority

# Authentication
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Client URL for OAuth redirects
CLIENT_URL=http://localhost:5173

# Data Sources
APIFY_API_TOKEN=apify_api_token_here

# AI Models (Gemini is free, requires API key)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Trend Research & Community
PERPLEXITY_API_KEY=your_perplexity_api_key_here
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here
REDDIT_USER_AGENT=social-media-analytics/1.0

# Meta (Instagram Business Account)
META_APP_ID=your_meta_app_id_here
META_APP_SECRET=your_meta_app_secret_here
META_ACCESS_TOKEN=your_meta_access_token_here
```

### 1.3 Get API Keys

#### MongoDB Atlas
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/...`
4. Paste into `MONGO_URI`

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:5000/api/auth/google/callback` as Authorized redirect URI
6. Copy Client ID and Secret

#### Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy and paste into `GEMINI_API_KEY`

#### Apify (Instagram Scraping)
1. Go to [apify.com](https://apify.com/)
2. Sign up for free account
3. Get API token from Settings
4. Paste into `APIFY_API_TOKEN`

#### Claude API (Optional)
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create account and get API key
3. **User will add in Settings UI** — no need in .env

#### OpenAI API (Optional)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create account and get API key
3. **User will add in Settings UI** — no need in .env

### 1.4 Verify Backend Setup

```bash
npm run build      # Compile TypeScript to JavaScript
npm run dev        # Start development server with nodemon
```

Expected output:
```
[nodemon] starting `ts-node src/index.ts`
Server running on http://localhost:5000
MongoDB connected
```

### 1.5 Backend Structure

```
server/src/
├── models/           # Mongoose schemas (User, Workspace, InstagramProfile, etc.)
├── controllers/      # Route handlers (authController, aiController, etc.)
├── services/         # Business logic (aiService, analyticsService, apifyService, etc.)
├── routes/           # Express routes (auth.ts, workspaces.ts, ai.ts, etc.)
├── middleware/       # Auth middleware, error handling
├── config/           # Environment config (env.ts)
├── utils/            # Helpers (token generation, etc.)
└── index.ts          # Entry point
```

---

## Part 2: Frontend Setup

### 2.1 Install Dependencies

```bash
cd client
npm install
```

This installs:
- **React 19** — UI library
- **Vite 8** — Lightning-fast build tool
- **TypeScript** — Type safety
- **react-router-dom v7** — Routing
- **shadcn/ui (base-ui)** — Headless UI components
- **Tailwind CSS v4** — Utility-first styling
- **axios** — HTTP client
- **lucide-react** — Icon library

### 2.2 Create `.env` File

Create `client/.env` (optional, defaults work fine):

```env
VITE_API_URL=http://localhost:5000/api
```

### 2.3 Verify Frontend Setup

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

Expected output:
```
  VITE v8.0.0 ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 2.4 Frontend Structure

```
client/src/
├── api/              # API client modules (auth, workspaces, ai, analytics, etc.)
├── pages/            # Page components (Auth, Dashboard, etc.)
│   ├── auth/         # Login, Signup, OAuthCallback
│   └── dashboard/    # Workspace, Overview, Competitors, AIInsights, etc.
├── components/       # Reusable components
│   └── ui/           # shadcn/ui components (Button, Card, Input, Select, etc.)
├── lib/              # Utilities (cn for class merging, etc.)
├── styles/           # Global CSS
├── App.tsx           # Main app with routes
└── main.tsx          # Entry point
```

---

## Part 3: Running the Full Stack

### 3.1 Terminal Setup (Recommended: 2 terminals)

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

### 3.2 Access the Application

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Auth**: Sign up or Google OAuth at `/login`

## Environment Variables Summary

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `MONGO_URI` | MongoDB connection | ✅ Yes | `mongodb+srv://user:pass@cluster.mongodb.net/...` |
| `ACCESS_TOKEN_SECRET` | JWT signing key | ✅ Yes | Random 32+ character string |
| `REFRESH_TOKEN_SECRET` | Refresh token signing key | ✅ Yes | Random 32+ character string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ Yes | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | ✅ Yes | `GOCSP...` |
| `CLIENT_URL` | Frontend URL for redirects | ✅ Yes | `http://localhost:5173` |
| `APIFY_API_TOKEN` | Instagram scraping API | ✅ Yes | `apify_...` |
| `GEMINI_API_KEY` | Default AI model | ✅ Yes | `AIza...` |
| `PERPLEXITY_API_KEY` | Trend research | ❌ Optional | `pplx-...` |
| `REDDIT_CLIENT_ID` | Community insights | ❌ Optional | `abc123...` |
| `REDDIT_CLIENT_SECRET` | Community insights | ❌ Optional | `xyz789...` |

---


## Next Steps

1. ✅ Complete setup using this guide
2. Create workspace and add Instagram profiles
3. Add competitors for analysis
4. Fetch data via "Fetch Data" button
5. View analytics in Dashboard
6. Add API keys (Claude/OpenAI/Perplexity) in Settings
7. Generate AI insights with preferred model
8. Create content plans and growth strategies

---

## Support & Documentation

- **GitHub Issues**: Report bugs or request features
- **MongoDB Docs**: [docs.mongodb.com](https://docs.mongodb.com/)
- **React Docs**: [react.dev](https://react.dev/)
- **Express Docs**: [expressjs.com](https://expressjs.com/)
- **Vite Docs**: [vitejs.dev](https://vitejs.dev/)

---

## License

MIT License — Feel free to use and modify for your projects.
