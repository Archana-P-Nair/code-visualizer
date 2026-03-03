# Deploy WebCraft on Vercel

Follow these steps to deploy the project on Vercel.

## Important: What runs where

- **Vercel** will host the **frontend only** (HTML, CSS, JS, editor UI). The app will work in **Work Solo** mode.
- **Real-time collaboration** needs a **Node server** (Socket.io). Vercel’s serverless model does **not** support long-lived WebSockets, so collaboration will not work if you deploy only to Vercel.
- To get **collaboration** in production, you need to host the server somewhere else (e.g. Railway, Render) and point the frontend to it (see **Optional: Collaboration in production** below).

---

## Step 1: Push your code to GitHub

Make sure the latest code is on GitHub (e.g. `https://github.com/Archana-P-Nair/webcraft-editor`).

---

## Step 2: Sign in to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (or create an account).
2. Choose **Continue with GitHub** and authorize Vercel.

---

## Step 3: Import the project

1. Click **Add New…** → **Project**.
2. Under **Import Git Repository**, select **github.com** and find **webcraft-editor** (or your repo name).
3. Click **Import** next to the repo.

---

## Step 4: Configure the project

Vercel will detect the repo. Use these settings:

| Field | Value |
|--------|--------|
| **Framework Preset** | Other |
| **Root Directory** | `./` (leave default; repo root = `code-editor` if you deployed only that folder, otherwise the root that contains `vercel.json`) |
| **Build Command** | `node scripts/generate-config.js` (or leave blank; it’s set in `vercel.json`) |
| **Output Directory** | `.` (or leave default) |
| **Install Command** | `npm install` (optional; only needed if the build script has dependencies) |

If your **entire repo** is the WebCraft app (e.g. you cloned only `code-editor`):

- **Root Directory**: leave as **.** (root).

If the WebCraft app lives in a **subfolder** (e.g. `code-editor`) of the repo:

- Set **Root Directory** to **code-editor** (or whatever that folder is named).

---

## Step 5: Environment variables (optional)

- For **frontend-only** (Work Solo only): you can leave **Environment Variables** empty.
- For **collaboration** later: add:
  - **Name:** `SOCKET_SERVER_URL`  
  - **Value:** `https://your-backend-url.up.railway.app` (or your backend URL)  
  Then redeploy so the build can regenerate `config.js` with this URL.

Click **Deploy**.

---

## Step 6: Wait for deployment

Vercel will run the build and deploy. When it finishes, you’ll get a URL like:

`https://webcraft-editor-xxx.vercel.app`

Open it: the editor should load and **Work Solo** will work.

---

## Optional: Collaboration in production

To enable **Join Session** / **Create Session** in production:

1. **Host the Node server** on a platform that supports WebSockets and long-running processes, for example:
   - **Railway** ([railway.app](https://railway.app))  
   - **Render** ([render.com](https://render.com))  

2. **Deploy the server** there (same repo; run `node server.js` or `npm start`, and expose the port they give you).

3. **Copy the public URL** of that server (e.g. `https://your-app.up.railway.app`).

4. In **Vercel** → your project → **Settings** → **Environment Variables**:
   - Add **SOCKET_SERVER_URL** = `https://your-app.up.railway.app` (no trailing slash).

5. **Redeploy** the Vercel project (Deployments → … → Redeploy).

After that, the Vercel frontend will use that URL for Socket.io, and collaboration will work from the deployed site.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Push code to GitHub |
| 2 | Sign in at vercel.com with GitHub |
| 3 | Add New → Project → Import **webcraft-editor** |
| 4 | Framework: Other, Root: `.` (or `code-editor` if app is in a subfolder) |
| 5 | (Optional) Add `SOCKET_SERVER_URL` for collaboration |
| 6 | Deploy and use the generated URL |
