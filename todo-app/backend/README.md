# DSO101 Assignment A1
## Assignment Repository Link
[Open
Repository](https://github.com/02250353cst-wq/KenchoDorji_02250353_DSO101_A1)

# ✦ Taskly — To-Do App
### DSO101 Assignment 1 | CI/CD with Docker & Render

---

## 📁 Project Structure

```
todo-app/
├── backend/
│   ├── server.js          # Express API (CRUD)
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example       # Copy to .env and fill in values
├── frontend/
│   ├── index.html         # App UI
│   ├── style.css
│   ├── app.js             # API calls & rendering
│   ├── nginx.conf         # Nginx config for serving
│   ├── Dockerfile
│   └── .env.example
├── render.yaml            # Part B: Blueprint for Render
├── .gitignore
└── README.md
```

---

## ⚙️ Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | HTML, CSS, JavaScript   |
| Backend  | Node.js + Express       |
| Database | PostgreSQL              |
| Deploy   | Docker + Render.com     |

---

## 🚀 Step 0 — Run Locally

### Prerequisites
- [Node.js 18+](https://nodejs.org)
- [PostgreSQL](https://www.postgresql.org/download/) running locally
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd todo-app
```

### 2. Set up the Backend
```bash
cd backend
npm install
```

Copy the example env file and fill in your local PostgreSQL credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=tododb
DB_PORT=5432
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Create the database in PostgreSQL:
```bash
psql -U postgres -c "CREATE DATABASE tododb;"
```

Start the backend:
```bash
npm start
# Server running on port 5000
```

Test the API:
```bash
curl http://localhost:5000/health
# {"status":"ok"}
```

### 3. Set up the Frontend
The frontend is plain HTML/JS — just open in browser:
```bash
cd ../frontend
# Open index.html in your browser directly
# OR use VS Code Live Server extension
```

> ⚠️ The frontend reads `API_URL` from `window._env_.API_URL`. Locally it falls back to `http://localhost:5000` automatically.

---

## 🐳 Part A — Build & Push Docker Images to Docker Hub

### 1. Create a Docker Hub account
Go to https://hub.docker.com and sign up. Note your Docker Hub username.

### 2. Login to Docker Hub
```bash
docker login
# Enter your Docker Hub username and password
```

### 3. Build & Push Backend Image
> Replace `yourdockerhub` with your Docker Hub username and `YOURSTUDENTID` with your actual student ID.

```bash
cd backend

# Build image
docker build -t yourdockerhub/be-todo:YOURSTUDENTID .

# Push to Docker Hub
docker push yourdockerhub/be-todo:YOURSTUDENTID
```

### 4. Build & Push Frontend Image
```bash
cd ../frontend

# Build image
docker build -t yourdockerhub/fe-todo:YOURSTUDENTID .

# Push to Docker Hub
docker push yourdockerhub/fe-todo:YOURSTUDENTID
```

Verify your images appear at:
- `https://hub.docker.com/r/yourdockerhub/be-todo`
- `https://hub.docker.com/r/yourdockerhub/fe-todo`

---

### 5. Deploy on Render.com (Part A — Manual Docker Image)

#### Database
1. Go to https://render.com → **New → PostgreSQL**
2. Name: `todo-db`
3. After creation, copy the **Internal Database URL** details (host, user, password, database name)

#### Backend Service
1. **New → Web Service**
2. Select **"Deploy an existing image from a registry"**
3. Image URL: `docker.io/yourdockerhub/be-todo:YOURSTUDENTID`
4. Under **Environment Variables**, add:

| Key           | Value                           |
|---------------|---------------------------------|
| `DB_HOST`     | (from Render PostgreSQL dashboard) |
| `DB_USER`     | (from Render PostgreSQL dashboard) |
| `DB_PASSWORD` | (from Render PostgreSQL dashboard) |
| `DB_NAME`     | `tododb`                        |
| `DB_PORT`     | `5432`                          |
| `PORT`        | `5000`                          |
| `NODE_ENV`    | `production`                    |

5. Click **Create Web Service**
6. Copy the deployed URL e.g. `https://be-todo.onrender.com`

#### Frontend Service
1. **New → Web Service**
2. Select **"Deploy an existing image from a registry"**
3. Image URL: `docker.io/yourdockerhub/fe-todo:YOURSTUDENTID`
4. Environment Variables:

| Key       | Value                             |
|-----------|-----------------------------------|
| `API_URL` | `https://be-todo.onrender.com`    |

5. Click **Create Web Service**

---

## 🔄 Part B — Automated Build & Deploy from GitHub

This removes manual Docker Hub steps — Render **automatically builds and deploys** on every `git push`.

### 1. Push your code to GitHub
```bash
git init
git add .
git commit -m "Initial commit - todo app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

> ⚠️ Make sure `.env` files are in `.gitignore` and NOT committed!

### 2. Connect GitHub to Render via Blueprint

1. Go to https://render.com → **New → Blueprint**
2. Connect your GitHub account
3. Select your repository
4. Render will detect the `render.yaml` file automatically
5. Click **Apply** — Render creates all services and the database

### 3. Set secret environment variables on Render
After the Blueprint deploys, go to each service's **Environment** tab and set the sensitive DB variables (Render auto-links them via `fromDatabase` in `render.yaml`).

### 4. Test Auto-Deploy
Make any change to your code and push:
```bash
git add .
git commit -m "Test auto-deploy"
git push
```
Watch Render automatically rebuild and redeploy both services! 🎉

---

## 🔗 API Endpoints

| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | `/api/todos`              | Get all todos         |
| GET    | `/api/todos/:id`          | Get single todo       |
| POST   | `/api/todos`              | Create todo           |
| PUT    | `/api/todos/:id`          | Update todo           |
| PATCH  | `/api/todos/:id/toggle`   | Toggle completed      |
| DELETE | `/api/todos/:id`          | Delete todo           |
| GET    | `/health`                 | Health check          |

---

## 📌 Important Notes

- **Never commit `.env` files** — they are in `.gitignore`
- Use `.env.example` as a template — copy it to `.env` locally
- Your Docker image tag must be your **student ID**
- Document every step with **screenshots** in this README