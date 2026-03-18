/**
 * StratexAI Client Portal
 * Routes: /portal/:orderId (view), /upload-logo/:orderId, /feedback/:orderId, /download/:orderId
 */

const fs = require('fs');
const path = require('path');
const { reviseReport } = require('./report-generator');
const db = require('./db');
const GMAIL_USER = process.env.GMAIL_USER || 'hobbychan111@gmail.com';
const GMAIL_PASS = process.env.GMAIL_PASS || 'cglkzcimgnhsbphs';

// ─── Parse multipart form data (for file uploads) ─────────────────────────
async function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';
    const boundary = contentType.split('boundary=')[1];
    
    if (!boundary) return resolve({ fields: {}, files: {} });

    let body = Buffer.alloc(0);
    req.on('data', chunk => body = Buffer.concat([body, chunk]));
    req.on('end', () => {
      const fields = {};
      const files = {};
      
      const parts = body.toString('binary').split('--' + boundary);
      for (const part of parts) {
        if (!part.includes('Content-Disposition')) continue;
        
        const [headerSection, ...contentParts] = part.split('\r\n\r\n');
        const content = contentParts.join('\r\n\r\n').replace(/\r\n$/, '');
        
        const nameMatch = headerSection.match(/name="([^"]+)"/);
        const filenameMatch = headerSection.match(/filename="([^"]+)"/);
        
        if (!nameMatch) continue;
        const name = nameMatch[1];
        
        if (filenameMatch) {
          files[name] = {
            filename: filenameMatch[1],
            data: Buffer.from(content, 'binary'),
            contentType: headerSection.match(/Content-Type: ([^\r\n]+)/)?.[1] || 'application/octet-stream'
          };
        } else {
          fields[name] = content;
        }
      }
      resolve({ fields, files });
    });
    req.on('error', reject);
  });
}

// ─── Build Portal HTML ─────────────────────────────────────────────────────
function buildPortalPage(orderId, reportExists, feedbackExists, businessName) {
  const reportUrl = reportExists ? `/report/${orderId}` : null;
  const iframeSrc = reportUrl || `about:blank`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>StratexAI — Client Portal</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f7fa; color: #1a2433; }
  header { background: #0a1628; color: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; }
  .container { max-width: 1100px; margin: 40px auto; padding: 0 24px; }
  .status-card { background: white; border-radius: 12px; padding: 32px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 20px; }
  .status-icon { font-size: 48px; flex-shrink: 0; }
  .status-text h3 { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
  .status-text p { font-size: 14px; color: #6b7c93; }
  .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
  .btn { padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; border: none; }
  .btn-primary { background: #0a1628; color: white; }
  .btn-primary:hover { background: #1a3050; }
  .btn-secondary { background: white; color: #0a1628; border: 2px solid #d1d9e0; }
  .btn-secondary:hover { border-color: #0a1628; }
  .report-frame { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 24px; }
  .report-frame iframe { width: 100%; height: 800px; border: none; }
  .feedback-card { background: white; border-radius: 12px; padding: 36px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
  .feedback-card h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
  .feedback-card p { font-size: 14px; color: #6b7c93; margin-bottom: 24px; }
  .stars { display: flex; gap: 8px; margin-bottom: 20px; }
  .star { font-size: 32px; cursor: pointer; opacity: 0.3; }
  .star.active { opacity: 1; }
  textarea { width: 100%; padding: 14px; border: 1.5px solid #d1d9e0; border-radius: 8px; font-family: inherit; resize: vertical; min-height: 120px; margin-bottom: 16px; }
  textarea:focus { border-color: #4a9eff; outline: none; }
  .done-banner { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px 20px; color: #166534; font-size: 14px; font-weight: 500; margin-bottom: 24px; }
  .loading { text-align: center; padding: 60px; background: white; border-radius: 12px; }
  .spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #0a1628; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
<header>
  <h1>StratexAI Client Portal</h1>
  <span style="font-size:13px;color:#8aabcc;">Order: ${orderId}</span>
</header>
<div class="container">
  ${reportExists ? `
  <div class="status-card">
    <div class="status-icon">✅</div>
    <div class="status-text">
      <h3>Report Ready</h3>
      <p>Your Business Intelligence Report for ${businessName || 'your business'} is complete.</p>
    </div>
  </div>

  <div class="actions">
    <a href="/download/${orderId}" class="btn btn-primary" download>⬇ Download (HTML)</a>
    <a href="/report/${orderId}" target="_blank" class="btn btn-secondary">↗ Full Screen</a>
  </div>

  <div class="report-frame">
    <iframe src="${iframeSrc}" title="Your Report"></iframe>
  </div>

  ${!feedbackExists ? `
  <div class="feedback-card">
    <h2>Provide Feedback</h2>
    <p>Help us improve your report. Submit feedback and we'll generate a revised version.</p>
    <form method="POST" action="/feedback/${orderId}">
      <label style="font-size:14px;font-weight:600;display:block;margin-bottom:10px;">Rate this report:</label>
      <div class="stars" id="stars">
        <span class="star" data-val="1" onclick="setRating(1)">★</span>
        <span class="star" data-val="2" onclick="setRating(2)">★</span>
        <span class="star" data-val="3" onclick="setRating(3)">★</span>
        <span class="star" data-val="4" onclick="setRating(4)">★</span>
        <span class="star" data-val="5" onclick="setRating(5)">★</span>
      </div>
      <input type="hidden" name="rating" id="rating" value="3">
      
      <label style="font-size:14px;font-weight:600;display:block;margin-bottom:8px;">What should improve?</label>
      <textarea name="feedback" placeholder="e.g. Add more detail on market expansion..." required></textarea>
      
      <button type="submit" class="btn btn-primary" style="width:100%;">Submit Feedback & Get Revision →</button>
    </form>
  </div>
  ` : `
  <div class="done-banner">
    ✅ Feedback received! We're revising your report and will email it within 10 minutes.
  </div>
  `}
  ` : `
  <div class="loading">
    <div class="spinner"></div>
    <h3>Generating Your Report</h3>
    <p style="color:#6b7c93;margin-top:8px;">This typically takes 2-3 minutes. <a href="">Refresh to check</a></p>
  </div>
  `}
</div>

<script>
function setRating(val) {
  document.getElementById('rating').value = val;
  document.querySelectorAll('.star').forEach((s, i) => {
    s.classList.toggle('active', i < val);
  });
}
setRating(3);
</script>
</body>
</html>`;
}

// ─── Main Route Handler ────────────────────────────────────────────────────
async function handlePortalRoutes(req, res, pathname, method) {
  try {
    // GET /portal/:orderId
    if (method === 'GET' && pathname.startsWith('/portal/')) {
      const orderId = pathname.replace('/portal/', '');
      const report = db.getReport(orderId);
      
      const reportExists = !!report && !!report.html;
      const feedbackExists = report && !!report.feedback;
      const businessName = report && report.meta ? report.meta.business_name : '';
      
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(buildPortalPage(orderId, reportExists, feedbackExists, businessName));
    }

    // POST /feedback/:orderId
    if (method === 'POST' && pathname.startsWith('/feedback/')) {
      const orderId = pathname.replace('/feedback/', '');
      let body = '';
      
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        const params = new URLSearchParams(body);
        const feedback = params.get('feedback') || '';
        
        // Save feedback
        const rating = params.get('rating') || '3';
        db.updateReportFeedback(orderId, feedback, rating);
        
        // Redirect immediately
        res.writeHead(302, { Location: `/portal/${orderId}` });
        res.end();
        
        // Revise report in background
        try {
          const report = db.getReport(orderId);
          if (!report || !report.html) return;
          
          const originalHtml = report.html;
          const businessName = report.meta && report.meta.business_name ? report.meta.business_name : 'Your Business';
          
          console.log(`[Revision] Processing feedback for ${orderId}`);
          const revisedHtml = await reviseReport(originalHtml, feedback, businessName);
          
          // Save revised report
          db.saveRevisedReport(orderId, revisedHtml);
          
          // Email revised report
          if (report.meta && report.meta.email) {
            await sendRevisionEmail(report.meta.email, businessName, orderId, revisedHtml);
          }
        } catch (err) {
          console.error('[ERROR] Revision failed:', err.message);
        }
      });
      
      return true; // handled
    }

    // POST /upload-logo/:orderId
    if (method === 'POST' && pathname.startsWith('/upload-logo/')) {
      const orderId = pathname.replace('/upload-logo/', '');
      const { files } = await parseMultipart(req);
      
      if (files.logo && files.logo.data.length > 0) {
        const reportFile = path.join(REPORTS_DIR, orderId + '.html');
        if (fs.existsSync(reportFile)) {
          let html = fs.readFileSync(reportFile, 'utf8');
          const logoBase64 = files.logo.data.toString('base64');
          const mimeType = files.logo.contentType || 'image/png';
          const logoImg = `<img src="data:${mimeType};base64,${logoBase64}" style="height:40px;object-fit:contain;margin-right:16px;" alt="Logo">`;
          
          // Insert logo into header
          html = html.replace(/<h1>/i, `${logoImg}<h1>`);
          fs.writeFileSync(reportFile, html);
        }
      }
      
      res.writeHead(302, { Location: `/portal/${orderId}` });
      return res.end();
    }

    return false; // not handled
  } catch (err) {
    console.error('[ERROR] Portal route error:', err);
    res.writeHead(500, { 'Content-Type': 'text/html' });
    res.end(`<h1>Error</h1><p>${err.message}</p>`);
  }
}

// ─── Email Revised Report ─────────────────────────────────────────────────
async function sendRevisionEmail(to, businessName, orderId, revisedHtml) {
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_PASS }
    });

    const mailOptions = {
      from: `"StratexAI" <${GMAIL_USER}>`,
      to,
      subject: `Your Revised StratexAI Report is Ready — ${businessName}`,
      html: `<!DOCTYPE html>
<html>
<body style="font-family:Arial,sans-serif;color:#2d3748;">
<h2>Revised Report Ready ✅</h2>
<p>Based on your feedback, we've improved your Business Intelligence Report for <strong>${businessName}</strong>.</p>
<p><a href="https://oyster-app-etznq.ondigitalocean.app/portal/${orderId}" style="display:inline-block;background:#0a1628;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">View Revised Report →</a></p>
</body>
</html>`
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email] Revised report sent to ${to}`);
  } catch (err) {
    console.error('[ERROR] Revision email failed:', err.message);
  }
}

module.exports = { handlePortalRoutes };
