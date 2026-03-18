/**
 * StratexAI Client Portal
 * Handles: logo upload, portal view, feedback, PDF download, email delivery
 * Attach to intake-server.js on port 19001
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const REPORTS_DIR = path.join(__dirname, 'reports');
const GMAIL_USER = 'hobbychan111@gmail.com';
const GMAIL_PASS = 'cglkzcimgnhsbphs';

// ─── Email via Gmail SMTP (raw SMTP, no nodemailer needed) ───────────────────
async function sendEmail(to, subject, htmlBody, attachmentPath) {
  // Use nodemailer if available, otherwise log
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_PASS }
    });
    
    const mailOptions = {
      from: `"StratexAI" <${GMAIL_USER}>`,
      to,
      subject,
      html: htmlBody
    };
    
    if (attachmentPath && fs.existsSync(attachmentPath)) {
      mailOptions.attachments = [{
        filename: path.basename(attachmentPath),
        path: attachmentPath
      }];
    }
    
    await transporter.sendMail(mailOptions);
    console.log('Email sent to', to);
    return true;
  } catch (err) {
    console.error('Email error:', err.message);
    return false;
  }
}

// ─── AI Report Revision ───────────────────────────────────────────────────────
async function reviseReport(originalHtml, feedback, businessName) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('No API key');

  const prompt = `You are a senior strategy consultant. A client has reviewed their business intelligence report and provided feedback for improvement.

Business: ${businessName}
Client Feedback: ${feedback}

Original Report (HTML):
${originalHtml.slice(0, 8000)}

Please revise and improve the report based on the client's feedback. Focus specifically on what they asked to improve. Return the complete revised HTML report with all sections. Maintain the same professional McKinsey-style design and structure but improve the content based on feedback.`;

  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://stratexai.io'
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000
    })
  });

  if (!resp.ok) throw new Error(`API ${resp.status}`);
  const json = await resp.json();
  return json.choices[0].message.content;
}

// ─── Parse multipart form data (for logo upload) ─────────────────────────────
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const boundary = req.headers['content-type']?.split('boundary=')[1];
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

// ─── Portal HTML Page ─────────────────────────────────────────────────────────
function buildPortalPage(orderId, reportExists, feedbackExists, businessName, reportUrl) {
  // Use external reportUrl if provided, else local endpoint
  const iframeSrc = reportUrl || `/report/${orderId}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>StratexAI — Your Report Portal</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f7fa; color: #1a2433; }
  header { background: #0a1628; color: white; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; }
  header h1 { font-size: 20px; font-weight: 600; }
  .container { max-width: 1100px; margin: 40px auto; padding: 0 24px; }
  .status-card { background: white; border-radius: 12px; padding: 32px; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 20px; }
  .status-icon { width: 48px; height: 48px; background: #f0fdf4; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
  .status-text h3 { font-size: 17px; font-weight: 700; color: #0a1628; margin-bottom: 4px; }
  .status-text p { font-size: 14px; color: #6b7c93; }
  .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px; }
  .btn { padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; border: none; }
  .btn-primary { background: #0a1628; color: white; }
  .btn-primary:hover { background: #1a3050; }
  .btn-secondary { background: white; color: #0a1628; border: 2px solid #d1d9e0; }
  .btn-secondary:hover { border-color: #0a1628; }
  .report-frame { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 24px; }
  .report-frame iframe { width: 100%; height: 700px; border: none; }
  .feedback-card { background: white; border-radius: 12px; padding: 36px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
  .feedback-card h2 { font-size: 20px; font-weight: 700; color: #0a1628; margin-bottom: 8px; }
  .feedback-card p { font-size: 14px; color: #6b7c93; margin-bottom: 24px; }
  .stars { display: flex; gap: 8px; margin-bottom: 20px; }
  .star { font-size: 32px; cursor: pointer; opacity: 0.3; transition: opacity 0.15s; }
  .star.active, .star:hover { opacity: 1; }
  textarea { width: 100%; padding: 14px; border: 1.5px solid #d1d9e0; border-radius: 8px; font-size: 14px; font-family: inherit; resize: vertical; min-height: 120px; margin-bottom: 16px; }
  textarea:focus { border-color: #4a9eff; outline: none; }
  .upload-section { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 24px; }
  .upload-section h2 { font-size: 18px; font-weight: 700; color: #0a1628; margin-bottom: 8px; }
  .upload-section p { font-size: 14px; color: #6b7c93; margin-bottom: 16px; }
  .done-banner { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 16px 20px; color: #166534; font-size: 14px; font-weight: 500; }
</style>
</head>
<body>
<header>
  <h1>StratexAI Client Portal</h1>
  <span style="font-size:13px;color:#8aabcc;">Order: ${orderId}</span>
</header>
<div class="container">
  <div class="status-card">
    <div class="status-icon">${reportExists ? '✅' : '⏳'}</div>
    <div class="status-text">
      <h3>${reportExists ? 'Your Report is Ready' : 'Report Generating...'}</h3>
      <p>${reportExists ? `Business Intelligence Report for ${businessName || 'your business'} — ready to view and download` : 'Please wait 60-90 seconds and refresh this page'}</p>
    </div>
  </div>

  ${reportExists ? `
  <div class="actions">
    <a href="/download/${orderId}" class="btn btn-primary" download>⬇ Download Report (HTML)</a>
    <a href="${iframeSrc}" target="_blank" class="btn btn-secondary">↗ Open Full Screen</a>
  </div>

  <!-- Logo Upload -->
  <div class="upload-section">
    <h2>Add Your Logo to the Report</h2>
    <p>Upload your company logo (PNG or JPG) to have it embedded in the report header.</p>
    <form method="POST" action="/upload-logo/${orderId}" enctype="multipart/form-data" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
      <input type="file" name="logo" accept="image/png,image/jpeg" style="font-size:14px;">
      <button type="submit" class="btn btn-primary">Upload Logo</button>
    </form>
  </div>

  <!-- Report Preview -->
  <div class="report-frame">
    <iframe src="${iframeSrc}" title="Your StratexAI Report"></iframe>
  </div>

  <!-- Feedback -->
  ${feedbackExists ? `
  <div class="done-banner">
    ✅ Your feedback has been received. A revised report will be emailed to you within 10 minutes.
  </div>
  ` : `
  <div class="feedback-card">
    <h2>Improve Your Report</h2>
    <p>Submit your feedback once and our AI will revise the report and email you the improved version.</p>
    <form method="POST" action="/feedback/${orderId}">
      <div style="margin-bottom:16px;">
        <label style="font-size:14px;font-weight:600;color:#1a2433;display:block;margin-bottom:10px;">How would you rate this report?</label>
        <div class="stars" id="stars">
          <span class="star" data-val="1" onclick="setRating(1)">★</span>
          <span class="star" data-val="2" onclick="setRating(2)">★</span>
          <span class="star" data-val="3" onclick="setRating(3)">★</span>
          <span class="star" data-val="4" onclick="setRating(4)">★</span>
          <span class="star" data-val="5" onclick="setRating(5)">★</span>
        </div>
        <input type="hidden" name="rating" id="rating" value="3">
      </div>
      <label style="font-size:14px;font-weight:600;color:#1a2433;display:block;margin-bottom:8px;">What should be improved?</label>
      <textarea name="feedback" placeholder="e.g. Please add more detail on the Singapore market expansion. The competitor analysis for Asana needs more depth on pricing. Add a risk assessment section..." required></textarea>
      <input type="hidden" name="email" value="">
      <button type="submit" class="btn btn-primary" style="width:100%;">Submit Feedback & Get Revised Report →</button>
    </form>
  </div>
  `}
  ` : '<div style="text-align:center;padding:60px;background:white;border-radius:12px;"><div style="font-size:48px;margin-bottom:16px;">⏳</div><h3 style="color:#0a1628;">Generating your report...</h3><p style="color:#6b7c93;margin-top:8px;">This takes 60-90 seconds. <a href="" style="color:#4a9eff;">Refresh to check</a></p></div>'}
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

// ─── Route Handler (attach to existing server) ────────────────────────────────
async function handlePortalRoutes(req, res, url, method) {
  // GET /portal/:orderId
  if (method === 'GET' && url.startsWith('/portal/')) {
    const rawUrl = new URL('http://localhost' + req.url);
    const orderId = rawUrl.pathname.replace('/portal/', '');
    // Accept external reportUrl param (e.g. from intake.stratexai.io)
    const reportUrl = rawUrl.searchParams.get('reportUrl') || null;

    const reportFile = path.join(REPORTS_DIR, orderId + '.html');
    const feedbackFile = path.join(REPORTS_DIR, orderId + '.feedback.json');
    const metaFile = path.join(REPORTS_DIR, orderId + '.meta.json');
    
    // Report exists locally OR a remote URL was provided
    const reportExists = reportUrl || fs.existsSync(reportFile);
    const feedbackExists = fs.existsSync(feedbackFile);
    let businessName = '';
    if (fs.existsSync(metaFile)) {
      try { businessName = JSON.parse(fs.readFileSync(metaFile)).business_name || ''; } catch(e) {}
    }
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(buildPortalPage(orderId, reportExists, feedbackExists, businessName, reportUrl));
  }

  // POST /upload-logo/:orderId
  if (method === 'POST' && url.startsWith('/upload-logo/')) {
    const orderId = url.replace('/upload-logo/', '');
    const { files } = await parseMultipart(req);
    
    if (files.logo && files.logo.data.length > 0) {
      const logoDir = path.join(REPORTS_DIR, orderId);
      fs.mkdirSync(logoDir, { recursive: true });
      const logoPath = path.join(logoDir, 'logo.png');
      fs.writeFileSync(logoPath, files.logo.data);
      
      // Embed logo in existing report
      const reportFile = path.join(REPORTS_DIR, orderId + '.html');
      if (fs.existsSync(reportFile)) {
        let html = fs.readFileSync(reportFile, 'utf8');
        const logoBase64 = files.logo.data.toString('base64');
        const mimeType = files.logo.contentType || 'image/png';
        const logoImg = `<img src="data:${mimeType};base64,${logoBase64}" style="height:40px;object-fit:contain;" alt="Company Logo">`;
        html = html.replace('</header>', `${logoImg}</header>`);
        fs.writeFileSync(reportFile, html);
      }
    }
    
    res.writeHead(302, { Location: `/portal/${orderId}` });
    return res.end();
  }

  // GET /download/:orderId
  if (method === 'GET' && url.startsWith('/download/')) {
    const orderId = url.replace('/download/', '');
    const reportFile = path.join(REPORTS_DIR, orderId + '.html');
    
    if (!fs.existsSync(reportFile)) {
      res.writeHead(404);
      return res.end('Report not found');
    }
    
    res.writeHead(200, {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="StratexAI-Report-${orderId}.html"`
    });
    return res.end(fs.readFileSync(reportFile));
  }

  // POST /feedback/:orderId
  if (method === 'POST' && url.startsWith('/feedback/')) {
    const orderId = url.replace('/feedback/', '');
    let body = '';
    req.on('data', c => body += c.toString());
    req.on('end', async () => {
      const params = new URLSearchParams(body);
      const rating = params.get('rating') || '3';
      const feedback = params.get('feedback') || '';
      const email = params.get('email') || '';
      
      // Save feedback
      const feedbackData = { rating, feedback, email, timestamp: new Date().toISOString() };
      fs.writeFileSync(
        path.join(REPORTS_DIR, orderId + '.feedback.json'),
        JSON.stringify(feedbackData)
      );
      
      // Redirect immediately
      res.writeHead(302, { Location: `/portal/${orderId}` });
      res.end();
      
      // Revise report in background
      try {
        const reportFile = path.join(REPORTS_DIR, orderId + '.html');
        if (!fs.existsSync(reportFile)) return;
        
        const originalHtml = fs.readFileSync(reportFile, 'utf8');
        const metaFile = path.join(REPORTS_DIR, orderId + '.meta.json');
        let businessName = 'Your Business';
        if (fs.existsSync(metaFile)) {
          try { businessName = JSON.parse(fs.readFileSync(metaFile)).business_name || businessName; } catch(e) {}
        }
        
        console.log('Revising report based on feedback:', feedback.slice(0, 100));
        const revisedContent = await reviseReport(originalHtml, feedback, businessName);
        
        // Save revised report
        const revisedFile = path.join(REPORTS_DIR, orderId + '-revised.html');
        fs.writeFileSync(revisedFile, revisedContent);
        
        // Send email if we have address
        if (email && email.includes('@')) {
          await sendEmail(
            email,
            `Your Revised StratexAI Report is Ready — ${businessName}`,
            `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#0a1628;padding:24px 32px;border-radius:8px 8px 0 0;">
                <h2 style="color:white;margin:0;font-size:20px;">StratexAI — Revised Report Ready</h2>
              </div>
              <div style="padding:32px;background:#f5f7fa;border-radius:0 0 8px 8px;">
                <p style="font-size:15px;color:#2d3748;margin-bottom:16px;">Hi,</p>
                <p style="font-size:15px;color:#2d3748;margin-bottom:16px;">Based on your feedback, we've revised your Business Intelligence Report for <strong>${businessName}</strong>.</p>
                <p style="font-size:15px;color:#2d3748;margin-bottom:24px;">Your feedback: <em>"${feedback.slice(0, 200)}"</em></p>
                <a href="https://app.stratexai.io/portal/${orderId}" style="display:inline-block;background:#0a1628;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">View Revised Report →</a>
                <p style="font-size:13px;color:#6b7c93;margin-top:24px;">Thank you for choosing StratexAI.</p>
              </div>
            </div>`,
            revisedFile
          );
        }
      } catch (err) {
        console.error('Revision error:', err.message);
      }
    });
    return true; // handled
  }

  return false; // not handled
}

module.exports = { handlePortalRoutes };
