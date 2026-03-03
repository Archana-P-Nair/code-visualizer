# Push WebCraft to GitHub

Follow these steps to push the project to your GitHub.

## Step 1: Create a new repository on GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** in the top right → **New repository**
3. Name it (e.g. `webcraft-editor` or `code-editor`)
4. Choose **Public**
5. **Do not** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**
7. Copy the repository URL (e.g. `https://github.com/YOUR_USERNAME/webcraft-editor.git`)

## Step 2: Run these commands in your terminal

Open PowerShell or Command Prompt, then:

```bash
cd "c:\Users\Archana Nair\OneDrive\Desktop\Capstone\code-editor"
```

If you have a lock file from a previous run, remove it first:

```bash
del .git\index.lock 2>nul
```

Add and commit all files:

```bash
git add .
git commit -m "Initial commit: WebCraft HTML/CSS/JS code editor with real-time collaboration"
```

Add your GitHub repo as remote (replace with YOUR repo URL):

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Push to GitHub:

```bash
git branch -M main
git push -u origin main
```

If prompted for credentials, use your GitHub username and a **Personal Access Token** (not your password). Create one at: GitHub → Settings → Developer settings → Personal access tokens.
