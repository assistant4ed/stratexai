/**
 * StratexAI Intake Server
 * Main HTTP server: form submission → report generation → portal delivery
 * Runs on port 19001 (local) or production port via Render/Railway
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { generateReport, reviseReport } = require('./report-generator');
const { handlePortalRoutes } = require('./portal');
const db = require('./db');
const { buildLandingPage } = require('./landing-page');
const { buildIntakeForm } = require('./intake-form');

const PORT = process.env.PORT || 19001;

// Validate environment
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const GMAIL_USER = process.env.GMAIL_USER || 'hobbychan111@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS || 'cglkzcimgnhsbphs';
const GMAIL_TO = process.env.GMAIL_TO || 'hohoho7374@gmail.com';

console.log(`[${new Date().toISOString()}] StratexAI Intake Server starting on port ${PORT}`);

// ─── Main HTTP Server ───────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const method = req.method;

  // Enable CORS for all origins (temporary for dev/cloud setup)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  try {
    // GET / → Landing page (marketing homepage)
    if (method === 'GET' && pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(buildLandingPage());
    }

    // GET /intake → Business details form
    if (method === 'GET' && pathname === '/intake') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(buildIntakeForm(url.searchParams.get('order')));
    }

    // GET /health → Health check (for deployment monitoring)
    if (method === 'GET' && pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    }

    // POST /intake → Form submission → Generate report
    if (method === 'POST' && pathname === '/intake') {
      return handleIntakeSubmission(req, res);
    }

    // GET /portal/:orderId → Portal page
    if (method === 'GET' && pathname.startsWith('/portal/')) {
      const handled = await handlePortalRoutes(req, res, pathname, method);
      if (handled) return;
    }

    // GET /report/:orderId → View report HTML
    if (method === 'GET' && pathname.startsWith('/report/')) {
      const orderId = pathname.replace('/report/', '');
      const reportHtml = db.getReportHtml(orderId) || db.getRevisedReport(orderId);
      
      if (!reportHtml) {
        res.writeHead(404);
        return res.end(build404Page());
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(reportHtml);
    }

    // GET /download/:orderId → Download report as file
    if (method === 'GET' && pathname.startsWith('/download/')) {
      const orderId = pathname.replace('/download/', '');
      const reportHtml = db.getReportHtml(orderId) || db.getRevisedReport(orderId);
      
      if (!reportHtml) {
        res.writeHead(404);
        return res.end('Report not found');
      }
      
      res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="StratexAI-Report-${orderId}.html"`
      });
      return res.end(reportHtml);
    }

    // POST /upload-logo/:orderId, POST /feedback/:orderId → Portal routes
    if ((method === 'POST' && pathname.startsWith('/upload-logo/')) ||
        (method === 'POST' && pathname.startsWith('/feedback/'))) {
      const handled = await handlePortalRoutes(req, res, pathname, method);
      if (handled) return;
    }

    // 404
    res.writeHead(404);
    res.end(build404Page());

  } catch (err) {
    console.error(`[ERROR] ${pathname}:`, err.message);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(build500Page(err.message));
  }
});

// ─── Handle Intake Form Submission ──────────────────────────────────────────
async function handleIntakeSubmission(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
    if (body.length > 500000) { // 500KB limit
      req.pause();
      res.writeHead(413);
      res.end('Payload too large');
    }
  });

  req.on('end', async () => {
    try {
      // Parse form data
      const formData = parseFormData(body);
      
      // Validate required fields
      if (!formData.email || !formData.business_name || !formData.industry) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        return res.end(buildErrorPage('Missing required fields: email, business_name, industry'));
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        return res.end(buildErrorPage('Invalid email format'));
      }

      // Generate order ID
      const orderId = generateOrderId();
      
      // Send "processing" response immediately
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(buildProcessingPage(orderId));

      // Generate report in background
      try {
        console.log(`[${new Date().toISOString()}] Starting report generation for order ${orderId}`);
        
        const reportHtml = await generateReport(formData);
        
        // Save report to database
        const meta = {
          order_id: orderId,
          email: formData.email,
          business_name: formData.business_name,
          industry: formData.industry,
          market: formData.market,
          created_at: new Date().toISOString()
        };
        db.saveReport(orderId, reportHtml, meta);
        console.log(`[${new Date().toISOString()}] Report saved for order ${orderId}`);

        // Send "ready" email
        await sendReportReadyEmail(formData.email, formData.business_name, orderId);
        
      } catch (err) {
        console.error(`[ERROR] Report generation failed for ${orderId}:`, err.message);
        // Send error email
        await sendErrorEmail(formData.email, err.message);
      }

    } catch (err) {
      console.error(`[ERROR] Form submission error:`, err.message);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(buildErrorPage(err.message));
    }
  });
}

// ─── Helper Functions ───────────────────────────────────────────────────────

function generateOrderId() {
  return 'ORD-' + Date.now() + '-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

function parseFormData(body) {
  const params = new URLSearchParams(body);
  return Object.fromEntries(params);
}

// ─── Email Functions ───────────────────────────────────────────────────────

async function sendReportReadyEmail(to, businessName, orderId) {
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_PASS }
    });

    const portalLink = `https://app.stratexai.io/portal/${orderId}`;

    await transporter.sendMail({
      from: `"StratexAI" <${GMAIL_USER}>`,
      to,
      subject: `Your StratexAI Business Intelligence Report is Ready 📊`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;">
<tr><td>
<table width="600" cellpadding="0" cellspacing="0" style="margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <tr><td style="background:#0a1628;padding:40px 48px;text-align:center;">
    <h1 style="color:white;font-size:28px;font-weight:800;margin:0;">Report Ready ✅</h1>
    <p style="color:#8aabcc;font-size:15px;margin:12px 0 0;">Your Business Intelligence Analysis</p>
  </td></tr>
  <tr><td style="padding:48px;">
    <p style="font-size:15px;color:#2d3748;margin:0 0 24px;"><strong>Hi there,</strong><br><br>Your comprehensive McKinsey-level Business Intelligence Report for <strong>${businessName}</strong> is ready!</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr><td style="text-align:center;">
        <a href="${portalLink}" style="display:inline-block;background:#0a1628;color:white;padding:18px 48px;border-radius:10px;text-decoration:none;font-size:17px;font-weight:800;">View Your Report →</a>
      </td></tr>
    </table>

    <div style="background:#f8fafc;border-left:4px solid #4a9eff;padding:24px;border-radius:4px;margin-bottom:24px;">
      <p style="font-size:14px;color:#2d3748;margin:0;"><strong>Your report includes:</strong></p>
      <ul style="font-size:13px;color:#4a5568;margin:12px 0 0;padding-left:20px;">
        <li>Executive Summary & Strategic Recommendations</li>
        <li>Detailed Market Analysis</li>
        <li>Competitive Landscape Deep Dive</li>
        <li>SWOT Analysis</li>
        <li>3-Year Financial Outlook</li>
      </ul>
    </div>

    <p style="font-size:13px;color:#718096;margin:24px 0 0;">Portal Link: ${portalLink}</p>
  </td></tr>
  <tr><td style="padding:20px 48px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#718096;">
    This email was sent to ${to}. You can download, share, and provide feedback on your report via the portal.
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
    });

    console.log(`[${new Date().toISOString()}] Report ready email sent to ${to}`);
  } catch (err) {
    console.error(`[ERROR] Email send failed:`, err.message);
  }
}

async function sendErrorEmail(to, errorMsg) {
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_PASS }
    });

    await transporter.sendMail({
      from: `"StratexAI" <${GMAIL_USER}>`,
      to,
      subject: 'StratexAI Report Generation Failed — Support',
      html: `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;color:#2d3748;">
<h2>Report Generation Error</h2>
<p>We encountered an error generating your report:</p>
<pre style="background:#f0f4f8;padding:16px;border-radius:8px;overflow-x:auto;">${errorMsg}</pre>
<p>Please try submitting your information again, or contact support.</p>
</body>
</html>`
    });
  } catch (err) {
    console.error(`[ERROR] Error email failed:`, err.message);
  }
}

// ─── HTML Pages ────────────────────────────────────────────────────────────


function buildProcessingPage(orderId) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Generating Report...</title>
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f7fa; margin: 0; padding: 40px 20px; text-align: center; color: #2d3748; }
  .card { max-width: 500px; margin: 80px auto; background: white; padding: 60px 40px; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
  .spinner { width: 48px; height: 48px; border: 4px solid #e2e8f0; border-top-color: #0a1628; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 24px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  h2 { font-size: 24px; font-weight: 700; color: #0a1628; margin: 0; }
  p { font-size: 15px; color: #6b7c93; margin: 12px 0 0; }
  .info { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px; margin-top: 24px; font-size: 13px; color: #166534; }
</style>
<script>
  setTimeout(() => {
    window.location.href = '/portal/${orderId}';
  }, 3000);
</script>
</head>
<body>
<div class="card">
  <div class="spinner"></div>
  <h2>Generating Your Report</h2>
  <p>AI analysis in progress... Typically takes 2-3 minutes.</p>
  <div class="info">
    <strong>Order ID:</strong> ${orderId}<br>
    You'll be redirected to your portal automatically.
  </div>
</div>
</body>
</html>`;
}

function buildErrorPage(msg) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; background: #fee; padding: 40px; }
  .error { background: #fcc; border: 1px solid #f99; padding: 20px; border-radius: 8px; color: #c00; }
  h2 { margin-top: 0; }
</style></head>
<body>
<div class="error">
  <h2>Error</h2>
  <p>${msg}</p>
</div>
</body>
</html>`;
}

function build404Page() {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f5f5f5; }
  h1 { color: #333; }
</style></head>
<body>
<h1>404 — Not Found</h1>
<p>The page you're looking for doesn't exist.</p>
</body>
</html>`;
}

function build500Page(msg) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #fee; }
  h1 { color: #c00; }
</style></head>
<body>
<h1>500 — Server Error</h1>
<p>${msg}</p>
</body>
</html>`;
}

// ─── Start Server ───────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`✅ StratexAI Intake Server running on port ${PORT}`);
});

process.on('unhandledRejection', err => {
  console.error('[FATAL] Unhandled rejection:', err);
});
