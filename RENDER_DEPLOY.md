# Deploy WebCraft Backend on Render

Follow these steps to deploy the Node.js backend (Express + Socket.io) on Render. This enables **real-time collaboration** when used with your Vercel frontend.

---

## Step 1: Push your code to GitHub

Ensure the latest code is on your GitHub repo (e.g. `https://github.com/Archana-P-Nair/code-visualizer`).

```bash
cd "c:\Users\Archana Nair\OneDrive\Desktop\Capstone\code-editor"
git add .
git commit -m "Add Render deployment"
git push origin main
```

---

## Step 2: Sign in to Render

1. Go to [render.com](https://render.com).
2. Click **Get Started for Free**.
3. Sign up or log in with **GitHub** and authorize Render.

---

## Step 3: Create a new Web Service

1. From the **Dashboard**, click **New +** → **Web Service**.
2. Connect your GitHub account if prompted.
3. Find and select your repo (**code-visualizer** or the repo that contains your WebCraft app).

---

## Step 4: Configure the Web Service

Fill in these settings:

| Field | Value |
|-------|--------|
| **Name** | `webcraft-backend` (or any name you like) |
| **Region** | Choose closest to your users (e.g. Oregon, Frankfurt) |
| **Branch** | `main` (or your default branch) |
| **Root Directory** | Leave **empty** if the app is at the repo root. If your app is in a subfolder like `code-editor`, enter `code-editor`. |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` or `node server.js` |

---

## Step 5: Choose a plan

- **Free** – Service sleeps after ~15 minutes of inactivity. Good for testing.
- **Starter** (~$7/month) – No sleep, always on.

Click **Create Web Service**.

---

## Step 6: Wait for deployment

Render will:

1. Clone your repo  
2. Run `npm install`  
3. Run `npm start`  

Build logs appear in the dashboard. When the status changes to **Live**, your backend is deployed.

---

## Step 7: Get your backend URL

In the dashboard, copy your service URL, for example:

```
https://webcraft-backend-xxxx.onrender.com
```

---

## Step 8: Connect Vercel to this backend

1. Open your project on **Vercel** → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `SOCKET_SERVER_URL`
   - **Value:** `https://webcraft-backend-xxxx.onrender.com` (your real Render URL, no trailing slash)
3. Click **Save**.
4. In Vercel, go to **Deployments** → **⋯** on the latest deployment → **Redeploy**.

Collaboration will work on your Vercel site by using the Render backend.

---

## Step 9: Use the Render URL directly (optional)

The Render deployment serves both the **static app** and the **Socket.io server**. You can use the Render URL directly for the full app with collaboration:

```
https://webcraft-backend-xxxx.onrender.com
```

---

## Summary

| Step | Action |
|------|--------|
| 1 | Push code to GitHub |
| 2 | Sign in at render.com with GitHub |
| 3 | New + → Web Service → Select your repo |
| 4 | Root: `.` or `code-editor`, Build: `npm install`, Start: `npm start` |
| 5 | Create Web Service |
| 6 | Wait for build to finish |
| 7 | Copy the service URL |
| 8 | Add `SOCKET_SERVER_URL` on Vercel and redeploy |

---

## Notes

- **Free tier**: Service sleeps after inactivity. The first request after sleep may take 30–60 seconds to wake.
- **CORS**: Your server already allows all origins, so the Vercel frontend can connect to it.
- **Custom domain**: You can add a custom domain in Render under **Settings** → **Custom Domains**.
