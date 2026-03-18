# StratexAI — AI Business Intelligence Platform

Generate comprehensive McKinsey-level business intelligence reports in minutes using AI.

## Features

- **Intake Form** — Collect business context via web form
- **AI Report Generation** — Claude Sonnet 4.6 generates:
  - Executive Summary
  - Market Analysis
  - Competitive Landscape
  - SWOT Analysis
  - Strategic Recommendations
  - Financial Outlook & Risk Assessment
- **Client Portal** — View, download, provide feedback, upload logo
- **Report Revision** — AI improves reports based on client feedback
- **Email Notifications** — Automatic updates throughout the flow

## Architecture

```
Intake Form → Report Generator (Claude Sonnet 4.6) → Portal View → Feedback → Revision
```

### Services

- **intake-server.js** — Main HTTP server (form submission, report generation orchestration)
- **report-generator.js** — Claude Sonnet 4.6 API integration
- **portal.js** — Portal routing (view, download, feedback, logo upload)

### Storage

Reports saved to `./server/reports/{orderId}.html` with metadata JSON files.

For production (Railway/Render), ensure persistent volume is configured.

## Setup

### Local Development

```bash
npm install

# Set environment variables
export OPENROUTER_API_KEY="sk-or-v1-..."
export GMAIL_USER="your-email@gmail.com"
export GMAIL_PASS="app-password"
export GMAIL_TO="recipient@example.com"

npm start
# Server runs on http://localhost:19001
```

### Deploy to Railway

1. Create new project on railway.app
2. Connect GitHub repository: `assistant4ed/stratexai`
3. Add environment variables (see `.env.example`)
4. Deploy!

Railway will auto-build using `railway.json` config.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key for Claude access | `sk-or-v1-...` |
| `GMAIL_USER` | Gmail address for sending emails | `bot@gmail.com` |
| `GMAIL_PASS` | Gmail app password | `xxxx xxxx xxxx xxxx` |
| `GMAIL_TO` | Notification recipient email | `admin@stratexai.io` |
| `PORT` | Server port (optional) | `8080` |

## API Endpoints

### Intake
- `GET /` — Intake form page
- `POST /intake` — Submit form → trigger report generation

### Portal
- `GET /portal/:orderId` — Client portal (view, feedback, logo upload)
- `GET /report/:orderId` — View full report HTML
- `GET /download/:orderId` — Download report file
- `POST /feedback/:orderId` — Submit feedback → trigger revision

### Health
- `GET /health` — Health check endpoint (JSON)

## Report Generation Flow

1. User submits intake form (business name, industry, market, description, etc.)
2. Server generates unique order ID
3. Report generation starts in background (async)
4. User redirected to portal (shows loading state)
5. Claude Sonnet 4.6 generates comprehensive report (~2-3 min)
6. Report saved to disk + email sent to user
7. Portal auto-refreshes to show completed report

## Feedback & Revision Flow

1. User submits feedback on report via portal
2. Feedback saved, user redirected (immediate response)
3. Claude Sonnet 4.6 revises report based on feedback (async)
4. Revised report saved to disk
5. Email with revised report sent to user

## File Structure

```
stratexai/
├── server/
│   ├── intake-server.js       # Main HTTP server
│   ├── report-generator.js    # Claude Sonnet 4.6 integration
│   ├── portal.js              # Portal routes
│   ├── reports/               # Generated reports (local storage)
│   └── order-success.html     # Success page template
├── landing-page/
│   └── index.html             # Landing page
├── package.json               # Dependencies
├── railway.json               # Railway deployment config
├── .env.example               # Environment variables template
└── README.md                  # This file
```

## Performance

- **Report Generation**: 2-3 minutes (Claude Sonnet 4.6 analysis)
- **Email Delivery**: <30 seconds
- **Portal Load**: <200ms
- **Concurrent Users**: Scales via Railway auto-scaling

## Security

- Input validation (email format, text length)
- XSS protection (HTML sanitization)
- CORS enabled for cross-origin requests
- No sensitive data in URLs
- Environment variables for all secrets

## Future Enhancements

- [ ] Database integration (PostgreSQL) for scalability
- [ ] Rate limiting (max reports per email/day)
- [ ] Advanced analytics (track report views, downloads, feedback)
- [ ] PDF export (HTML → PDF conversion)
- [ ] Report templates (different layouts, branding)
- [ ] Team collaboration (multiple users per order)
- [ ] Payment integration (stripe/checkout for premium reports)

## Support

For issues or questions: support@stratexai.io

---

**Built with Claude Sonnet 4.6 & Node.js**
