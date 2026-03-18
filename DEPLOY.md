# StratexAI Deployment Guide

## DigitalOcean App Platform (Recommended)

### Quick Deploy (5 minutes)

1. **Go to DigitalOcean Dashboard:**
   - https://cloud.digitalocean.com/apps

2. **Click "Create App"** (blue button)

3. **Connect GitHub:**
   - Select "GitHub"
   - Click "Authorize with GitHub" (if first time)
   - Select repository: `assistant4ed/stratexai`
   - Branch: `main`
   - Click "Next"

4. **DigitalOcean auto-reads app.yaml:**
   - You should see:
     - Service: `api` (Node.js, port 19001)
     - Environment variables pre-filled
   - Review + click "Next"

5. **Final Step:**
   - App name: `stratexai` (auto-filled)
   - Region: Choose closest to you (e.g., New York, Singapore)
   - Click **"Create Resources"**

6. **Deploy:**
   - DigitalOcean builds and deploys (~3-5 min)
   - You'll get a live URL: `https://stratexai.ondigitalocean.app`

---

## Environment Variables (Already Configured)

These are saved in `app.yaml`:

```
OPENROUTER_API_KEY=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
GMAIL_USER=hobbychan111@gmail.com
GMAIL_PASS=cglkzcimgnhsbphs
GMAIL_TO=hohoho7374@gmail.com
NODE_ENV=production
```

---

## Testing After Deploy

Once live:

1. **Health check:**
   ```
   curl https://stratexai.ondigitalocean.app/health
   ```
   Expected: `{"status":"ok","timestamp":"2026-03-19T..."}`

2. **Access intake form:**
   ```
   https://stratexai.ondigitalocean.app/
   ```

3. **Test submission:**
   - Fill form → Submit
   - Check email (hohoho7374@gmail.com) for confirmation

4. **View portal:**
   ```
   https://stratexai.ondigitalocean.app/portal/{order_id}
   ```

---

## Auto-Deploy (Every 2 Hours)

Once deployed, every push to `main` branch triggers auto-rebuild:

```bash
git push origin main
# DigitalOcean detects change
# Auto-builds and deploys within 2-3 min
```

---

## Troubleshooting

**"GitHub not authenticated" error:**
- Go back to step 3, re-authorize GitHub
- Make sure `assistant4ed/stratexai` repo is selected

**App won't start:**
- Check logs in DigitalOcean dashboard (App → Logs)
- Verify all env vars are set

**Reports not generating:**
- Check if OPENROUTER_API_KEY is valid
- Check app logs for API errors

---

## Dashboard Commands (via Jojo)

Once deployed, I can:
- Monitor logs
- Re-deploy on demand
- Scale resources
- Update environment variables
- Setup auto-deploy triggers

---

**Ready? Go to https://cloud.digitalocean.com/apps and click "Create App"**
