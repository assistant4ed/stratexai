const http = require('http');
const fs = require('fs');
const path = require('path');
const { handlePortalRoutes } = require('./portal');

const PORT = 19001;
const REPORTS_DIR = path.join(__dirname, 'reports');
if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

const INTAKE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>StratexAI — Business Intelligence Report Intake</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f7fa; color: #1a2433; }
  header { background: #0a1628; color: white; padding: 20px 40px; display: flex; align-items: center; gap: 16px; }
  header h1 { font-size: 22px; font-weight: 600; letter-spacing: -0.3px; }
  header span { color: #4a9eff; }
  .container { max-width: 860px; margin: 48px auto; padding: 0 24px; }
  .card { background: white; border-radius: 12px; padding: 48px; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
  h2 { font-size: 26px; font-weight: 700; color: #0a1628; margin-bottom: 8px; }
  .subtitle { color: #6b7c93; font-size: 15px; margin-bottom: 36px; border-bottom: 1px solid #e8ecf0; padding-bottom: 24px; }
  .form-group { margin-bottom: 24px; }
  label { display: block; font-weight: 600; font-size: 14px; color: #1a2433; margin-bottom: 8px; }
  label .req { color: #e53e3e; }
  input, select, textarea { width: 100%; padding: 12px 16px; border: 1.5px solid #d1d9e0; border-radius: 8px; font-size: 15px; color: #1a2433; background: #fafbfc; transition: border-color 0.2s; outline: none; font-family: inherit; }
  input:focus, select:focus, textarea:focus { border-color: #4a9eff; background: white; }
  textarea { resize: vertical; min-height: 100px; }
  .row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .hint { font-size: 12px; color: #8896a5; margin-top: 6px; }
  .submit-btn { width: 100%; padding: 16px; background: #0a1628; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 12px; transition: background 0.2s; }
  .submit-btn:hover { background: #1a3050; }
  .steps { display: flex; gap: 12px; margin-bottom: 32px; }
  .step { flex: 1; padding: 16px; background: #f5f7fa; border-radius: 8px; text-align: center; }
  .step-num { width: 28px; height: 28px; background: #0a1628; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; margin: 0 auto 8px; }
  .step-label { font-size: 12px; color: #6b7c93; font-weight: 500; }
</style>
</head>
<body>
<header>
  <h1>Strat<span>ex</span>AI</h1>
</header>
<div class="container">
  <div class="card">
    <h2>Tell Us About Your Business</h2>
    <p class="subtitle">We'll generate a comprehensive McKinsey-level intelligence report — market analysis, competitor profiles, SWOT, and strategic recommendations.</p>
    
    <div class="steps">
      <div class="step"><div class="step-num">1</div><div class="step-label">Fill this form</div></div>
      <div class="step"><div class="step-num">2</div><div class="step-label">AI analysis runs</div></div>
      <div class="step"><div class="step-num">3</div><div class="step-label">Report ready in 2 min</div></div>
    </div>

    <form method="POST" action="/intake">
      <input type="hidden" name="order_id" id="order_id">
      
      <div class="row">
        <div class="form-group">
          <label>Your Email <span class="req">*</span></label>
          <input type="email" name="email" placeholder="you@company.com" required>
        </div>
        <div class="form-group">
          <label>Business Name <span class="req">*</span></label>
          <input type="text" name="business_name" placeholder="e.g. Acme Corp" required>
        </div>
      </div>
      <div class="row">
        <div class="form-group">
          <label>Industry <span class="req">*</span></label>
          <select name="industry" required>
            <option value="">Select industry...</option>
            <option>SaaS / Software</option>
            <option>E-commerce / Retail</option>
            <option>FinTech / Finance</option>
            <option>Healthcare / MedTech</option>
            <option>Real Estate</option>
            <option>Food & Beverage</option>
            <option>Education / EdTech</option>
            <option>Manufacturing</option>
            <option>Consulting / Professional Services</option>
            <option>Media / Entertainment</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="form-group">
          <label>Primary Market / Region <span class="req">*</span></label>
          <input type="text" name="market" placeholder="e.g. Southeast Asia, US, Global" required>
        </div>
        <div class="form-group">
          <label>Business Stage</label>
          <select name="stage">
            <option>Early Stage (Pre-revenue)</option>
            <option>Growth Stage ($0-$1M ARR)</option>
            <option>Scale Stage ($1M-$10M ARR)</option>
            <option>Enterprise ($10M+ ARR)</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>What does your business do? <span class="req">*</span></label>
        <textarea name="description" placeholder="Describe your product/service, who you serve, and your key value proposition..." required></textarea>
      </div>

      <div class="form-group">
        <label>Main Competitors (comma-separated)</label>
        <input type="text" name="competitors" placeholder="e.g. Salesforce, HubSpot, Zoho">
        <p class="hint">Leave blank and we'll identify them for you</p>
      </div>

      <div class="form-group">
        <label>Key Business Goals for Next 12 Months <span class="req">*</span></label>
        <textarea name="goals" placeholder="e.g. Expand to Japan, grow MRR 3x, launch enterprise tier..." required></textarea>
      </div>

      <div class="form-group">
        <label>Current Annual Revenue / Funding Stage</label>
        <input type="text" name="revenue" placeholder="e.g. Pre-revenue, $500K ARR, $2M raised">
      </div>

      <div class="row">
        <div class="form-group">
          <label>Team Size</label>
          <select name="team_size">
            <option value="">Select...</option>
            <option>Solo founder</option>
            <option>2–5 people</option>
            <option>6–20 people</option>
            <option>21–100 people</option>
            <option>100+ people</option>
          </select>
        </div>
        <div class="form-group">
          <label>Business Model</label>
          <select name="business_model">
            <option value="">Select...</option>
            <option>B2B SaaS</option>
            <option>B2C Product</option>
            <option>Marketplace</option>
            <option>Agency / Services</option>
            <option>E-commerce</option>
            <option>Subscription</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Current Biggest Challenges</label>
        <textarea name="challenges" placeholder="e.g. High customer acquisition cost, losing deals to competitors on price, unclear positioning in the market..." style="min-height:80px;"></textarea>
      </div>

      <div class="form-group">
        <label>Specific Questions for the Report</label>
        <textarea name="questions" placeholder="e.g. Is it the right time to expand to Singapore? Who are the emerging competitors we should watch? What pricing strategy should we use?" style="min-height:80px;"></textarea>
      </div>

      <div class="form-group">
        <label>Report Type</label>
        <select name="report_type">
          <option value="comprehensive">Comprehensive (Market + Competitors + SWOT + Strategy)</option>
          <option value="market">Market Analysis Focus</option>
          <option value="competitor">Competitor Deep Dive</option>
          <option value="strategy">Strategic Planning Report</option>
        </select>
      </div>

      <div class="form-group">
        <label>Upload Supporting Documents <span style="font-weight:400;color:#6b7c93;font-size:13px;">(optional)</span></label>
        <div id="uploadZone" style="border:2px dashed #d1d9e0;border-radius:10px;padding:28px;text-align:center;cursor:pointer;background:#fafbfc;transition:border-color 0.2s;"
          onclick="document.getElementById('fileInput').click()"
          ondragover="event.preventDefault();this.style.borderColor='#0a1628';"
          ondragleave="this.style.borderColor='#d1d9e0';"
          ondrop="event.preventDefault();this.style.borderColor='#d1d9e0';handleFiles(event.dataTransfer.files);">
          <div style="font-size:32px;margin-bottom:8px;">📎</div>
          <p style="font-size:14px;color:#4a5568;margin:0 0 4px;">Drag &amp; drop files here or <span style="color:#0a1628;font-weight:600;text-decoration:underline;">browse</span></p>
          <p style="font-size:12px;color:#9aa5b4;margin:0;">PDF, Word, PowerPoint, Excel, CSV, Images — Max 10MB each</p>
          <input type="file" id="fileInput" name="documents" multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.jpg,.jpeg,.png"
            style="display:none;" onchange="handleFiles(this.files)">
        </div>
        <div id="fileList" style="margin-top:10px;"></div>
        <p style="font-size:12px;color:#9aa5b4;margin-top:8px;">Upload your pitch deck, financial model, existing research, or competitive data — our AI will incorporate these into your report</p>
      </div>

      <button type="submit" class="submit-btn">Generate My Intelligence Report &rarr;</button>
    </form>
  </div>
</div>
<script>
  const params = new URLSearchParams(window.location.search);
  if (params.get('order')) document.getElementById('order_id').value = params.get('order');

  // File upload handling
  const uploadedFiles = [];
  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { alert(file.name + ' is too large (max 10MB)'); return; }
      if (!uploadedFiles.find(f => f.name === file.name)) uploadedFiles.push(file);
    });
    renderFileList();
  }
  function removeFile(name) {
    const i = uploadedFiles.findIndex(f => f.name === name);
    if (i > -1) uploadedFiles.splice(i, 1);
    renderFileList();
  }
  function renderFileList() {
    const list = document.getElementById('fileList');
    list.innerHTML = uploadedFiles.map(f => \`
      <div style="display:flex;align-items:center;gap:8px;background:#f0f4f8;border-radius:6px;padding:8px 12px;margin-bottom:6px;">
        <span style="font-size:16px;">\${getIcon(f.name)}</span>
        <span style="flex:1;font-size:13px;color:#2d3748;">\${f.name}</span>
        <span style="font-size:12px;color:#9aa5b4;">\${(f.size/1024).toFixed(0)}KB</span>
        <button type="button" onclick="removeFile('\${f.name}')" style="background:none;border:none;color:#e53e3e;cursor:pointer;font-size:16px;padding:0 4px;">×</button>
      </div>\`).join('');
  }
  function getIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    if (['jpg','jpeg','png','gif'].includes(ext)) return '🖼️';
    if (['pdf'].includes(ext)) return '📄';
    if (['doc','docx'].includes(ext)) return '📝';
    if (['xls','xlsx','csv'].includes(ext)) return '📊';
    if (['ppt','pptx'].includes(ext)) return '📊';
    return '📎';
  }

  // Override form submit to use FormData (supports files)
  document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.querySelector('.submit-btn');
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    const formData = new FormData(this);
    // Add all uploaded files
    uploadedFiles.forEach(file => formData.append('documents', file));

    try {
      const resp = await fetch('/intake', { method: 'POST', body: formData });
      const html = await resp.text();
      document.open(); document.write(html); document.close();
    } catch(err) {
      btn.textContent = 'Generate My Intelligence Report →';
      btn.disabled = false;
      alert('Error submitting form. Please try again.');
    }
  });
</script>
</body>
</html>`;

async function sendWelcomeEmail(to, name, orderId) {
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'hobbychan111@gmail.com', pass: 'cglkzcimgnhsbphs' } });
    const intakeLink = `https://app.stratexai.io/intake?order=${orderId}`;
    await transporter.sendMail({
      from: '"StratexAI" <hobbychan111@gmail.com>',
      to,
      subject: 'Your StratexAI Report is Ready to Generate 🚀',
      html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;">
<tr><td>
<table width="600" cellpadding="0" cellspacing="0" style="margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  <!-- Header -->
  <tr><td style="background:#0a1628;padding:40px 48px;text-align:center;">
    <div style="font-size:13px;color:#4a9eff;letter-spacing:4px;text-transform:uppercase;margin-bottom:12px;">StratexAI</div>
    <h1 style="color:white;font-size:28px;font-weight:800;margin:0;line-height:1.3;">Your Order is Confirmed ✅</h1>
    <p style="color:#8aabcc;font-size:15px;margin:12px 0 0;">AI Business Intelligence Report</p>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:48px;">
    <p style="font-size:16px;color:#2d3748;margin:0 0 16px;">Hi ${name || 'there'},</p>
    <p style="font-size:15px;color:#4a5568;line-height:1.7;margin:0 0 32px;">Thank you for your purchase! 🎉 To generate your personalized business intelligence report, we need a few details about your business. <strong style="color:#0a1628;">This takes about 3 minutes to fill in.</strong></p>

    <!-- CTA Button -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
      <tr><td style="text-align:center;">
        <a href="${intakeLink}" style="display:inline-block;background:#0a1628;color:white;padding:18px 48px;border-radius:10px;text-decoration:none;font-size:17px;font-weight:800;letter-spacing:0.3px;">Fill In Your Business Details →</a>
      </td></tr>
    </table>

    <!-- Steps -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:28px;margin-bottom:32px;">
      <tr><td>
        <p style="font-size:12px;font-weight:700;color:#0a1628;text-transform:uppercase;letter-spacing:1px;margin:0 0 20px;">What Happens Next</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;width:36px;padding-bottom:16px;">
              <div style="width:28px;height:28px;background:#0a1628;color:white;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;">1</div>
            </td>
            <td style="padding-left:14px;padding-bottom:16px;vertical-align:top;">
              <p style="font-size:15px;color:#2d3748;margin:0;line-height:1.5;"><strong>Fill your business details</strong> — industry, market, competitors, goals, and optional file uploads</p>
            </td>
          </tr>
          <tr>
            <td style="vertical-align:top;width:36px;padding-bottom:16px;">
              <div style="width:28px;height:28px;background:#0a1628;color:white;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;">2</div>
            </td>
            <td style="padding-left:14px;padding-bottom:16px;vertical-align:top;">
              <p style="font-size:15px;color:#2d3748;margin:0;line-height:1.5;"><strong>AI analyzes your market</strong> — competitors, opportunities, SWOT, strategic roadmap (60-90 seconds)</p>
            </td>
          </tr>
          <tr>
            <td style="vertical-align:top;width:36px;padding-bottom:16px;">
              <div style="width:28px;height:28px;background:#0a1628;color:white;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;">3</div>
            </td>
            <td style="padding-left:14px;padding-bottom:16px;vertical-align:top;">
              <p style="font-size:15px;color:#2d3748;margin:0;line-height:1.5;"><strong>View your report</strong> — professional 15-section report on your personal portal</p>
            </td>
          </tr>
          <tr>
            <td style="vertical-align:top;width:36px;">
              <div style="width:28px;height:28px;background:#0a1628;color:white;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;">4</div>
            </td>
            <td style="padding-left:14px;vertical-align:top;">
              <p style="font-size:15px;color:#2d3748;margin:0;line-height:1.5;"><strong>Submit feedback</strong> — one free revision included, revised report sent to your inbox</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- Secondary CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td style="text-align:center;">
        <a href="${intakeLink}" style="display:inline-block;background:white;color:#0a1628;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;border:2px solid #0a1628;">Start Now: app.stratexai.io/intake</a>
      </td></tr>
    </table>

    <p style="font-size:14px;color:#718096;text-align:center;margin:0;">Questions? Reply to this email or visit <a href="https://stratexai.io/faq" style="color:#0a1628;font-weight:600;">stratexai.io/faq</a></p>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#0a1628;padding:24px 48px;text-align:center;">
    <p style="color:#8aabcc;font-size:12px;margin:0;">© 2026 StratexAI · <a href="https://stratexai.io" style="color:#4a9eff;text-decoration:none;">stratexai.io</a> · <a href="mailto:hello@stratexai.io" style="color:#4a9eff;text-decoration:none;">hello@stratexai.io</a></p>
    <p style="color:#4a6280;font-size:11px;margin:8px 0 0;">Order ID: ${orderId}</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
    });
    console.log('[✓] Welcome email sent to', to);
    return true;
  } catch(err) {
    console.error('[✗] Welcome email failed:', err.message);
    return false;
  }
}

async function generateReport(data) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY
    || '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';
  if (!apiKey) throw new Error('No API key configured');

  const isOpenRouter = true; // Force OpenRouter since direct key works
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';
  const model = 'anthropic/claude-3-haiku';

  const prompt = `You are a senior strategy consultant. Generate a comprehensive, McKinsey-quality business intelligence report.

CLIENT:
- Business: ${data.business_name}
- Industry: ${data.industry}
- Market: ${data.market}
- Stage: ${data.stage || 'Not specified'}
- Description: ${data.description}
- Competitors: ${data.competitors || 'Please identify key competitors'}
- Goals: ${data.goals}
- Questions: ${data.questions || 'General strategic analysis'}

Generate a detailed HTML report (no markdown) with these sections. Each section must be substantive and specific to this business:

<section id="executive-summary">
<h2>Executive Summary</h2>
<p>[3-4 paragraphs covering: strategic position, key market findings, top 3 recommendations, immediate priority action]</p>
</section>

<section id="market-analysis">
<h2>Market Analysis</h2>
<h3>Market Size &amp; Growth</h3>
<p>[Specific TAM/SAM estimates, growth rates, key demand drivers for this industry/market]</p>
<h3>Industry Trends</h3>
<p>[5 major trends shaping this industry over next 2-3 years, specific and relevant]</p>
<h3>Market Dynamics</h3>
<p>[Competitive forces, barriers to entry, buyer power analysis]</p>
</section>

<section id="competitor-analysis">
<h2>Competitive Landscape</h2>
<p>[For each competitor (or identify 3-4 key ones): positioning, strengths, weaknesses, strategic direction, how to differentiate]</p>
<h3>Competitive Positioning</h3>
<p>[Where this business sits vs competitors, white space opportunities]</p>
</section>

<section id="swot">
<h2>SWOT Analysis</h2>
<div class="swot-grid">
<div class="swot-item strengths"><h3>Strengths</h3><ul>[5 specific strengths]</ul></div>
<div class="swot-item weaknesses"><h3>Weaknesses</h3><ul>[5 gaps to address]</ul></div>
<div class="swot-item opportunities"><h3>Opportunities</h3><ul>[5 specific market opportunities]</ul></div>
<div class="swot-item threats"><h3>Threats</h3><ul>[5 credible risks]</ul></div>
</div>
</section>

<section id="recommendations">
<h2>Strategic Recommendations</h2>
<p>[5 prioritized recommendations. For each: title, rationale, expected impact, timeline, success metrics]</p>
</section>

<section id="action-plan">
<h2>90-Day Action Plan</h2>
<p>[Specific actionable items for Days 1-30, 31-60, 61-90]</p>
</section>

Be specific, data-informed, and directly relevant to their business. No filler content.`;

  // Use https.request with timeout
  return new Promise((resolve, reject) => {
    const https = require('https');
    const reqBody = JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.7
    });

    const req = https.request(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(reqBody),
        'HTTP-Referer': 'https://stratexai.io'
      },
      timeout: 30000 // 30s timeout
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            return reject(new Error(`API ${res.statusCode}: ${data.slice(0, 200)}`));
          }
          const json = JSON.parse(data);
          const content = json.choices?.[0]?.message?.content;
          if (!content) throw new Error('No content in response');
          resolve(content);
        } catch(e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('API request timeout (30s)'));
    });

    req.on('error', (err) => {
      reject(new Error(`Network error: ${err.message}`));
    });

    req.write(reqBody);
    req.end();
  });
}

function parseFormData(body) {
  const data = {};
  body.split('&').forEach(pair => {
    const [k, v] = pair.split('=');
    if (k) data[decodeURIComponent(k)] = decodeURIComponent((v || '').replace(/\+/g, ' '));
  });
  return data;
}

function wrapReport(content, name) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>StratexAI Report — ${name}</title>
<style>
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f7fa;color:#1a2433;line-height:1.7;margin:0;}
  header{background:#0a1628;color:white;padding:24px 48px;display:flex;justify-content:space-between;align-items:center;}
  header h1{font-size:20px;font-weight:600;}
  .report-title{background:linear-gradient(135deg,#0a1628,#1a3050);color:white;padding:48px;text-align:center;}
  .report-title h2{font-size:30px;font-weight:700;margin-bottom:8px;}
  .report-title p{color:#8aabcc;}
  .content{max-width:860px;margin:0 auto;padding:32px 24px;}
  section{background:white;border-radius:12px;padding:40px;margin-bottom:24px;box-shadow:0 2px 16px rgba(0,0,0,0.06);}
  h2{font-size:22px;font-weight:700;color:#0a1628;margin-bottom:16px;padding-bottom:14px;border-bottom:2px solid #e8ecf0;}
  h3{font-size:16px;font-weight:600;color:#1a2433;margin:20px 0 10px;}
  p{margin-bottom:14px;font-size:15px;}
  ul,ol{padding-left:22px;margin-bottom:14px;}
  li{margin-bottom:6px;font-size:15px;}
  .swot-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px;}
  .swot-item{padding:20px;border-radius:8px;}
  .strengths{background:#f0fdf4;border-left:4px solid #22c55e;}
  .weaknesses{background:#fff7ed;border-left:4px solid #f97316;}
  .opportunities{background:#eff6ff;border-left:4px solid #3b82f6;}
  .threats{background:#fef2f2;border-left:4px solid #ef4444;}
  .swot-item h3{margin-top:0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;}
  footer{text-align:center;padding:32px;color:#8896a5;font-size:13px;}
</style>
</head>
<body>
<header><h1>StratexAI Intelligence Report</h1><div style="font-size:13px;color:#8899aa;">${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div></header>
<div class="report-title"><h2>${name}</h2><p>Confidential Business Intelligence Report</p></div>
<div class="content">${content}</div>
<footer>© 2026 StratexAI · stratexai.io</footer>
</body></html>`;
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  // Portal routes (logo upload, portal view, feedback, download)
  const portalHandled = await handlePortalRoutes(req, res, url, req.method);
  if (portalHandled) return;

  if (req.method === 'GET' && (url === '/' || url === '/intake')) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(INTAKE_HTML);
  }

  if (req.method === 'POST' && url === '/intake') {
    const contentType = req.headers['content-type'] || '';
    let data = {};
    let uploadedDocTexts = [];

    const processIntake = async () => {
      // Add document text summaries to the data for AI context
      if (uploadedDocTexts.length > 0) {
        data.uploaded_documents = uploadedDocTexts.join('\n\n---\n\n');
      }

    const parseIntakeBody = () => new Promise((resolve) => {
      if (contentType.includes('multipart/form-data')) {
        const boundary = contentType.split('boundary=')[1];
        let rawBody = Buffer.alloc(0);
        req.on('data', c => rawBody = Buffer.concat([rawBody, c]));
        req.on('end', () => {
          const parts = rawBody.toString('binary').split('--' + boundary);
          const fields = {};
          const files = [];
          for (const part of parts) {
            if (!part.includes('Content-Disposition')) continue;
            const [headerSec, ...contentParts] = part.split('\r\n\r\n');
            const content = contentParts.join('\r\n\r\n').replace(/\r\n$/, '');
            const nameMatch = headerSec.match(/name="([^"]+)"/);
            const filenameMatch = headerSec.match(/filename="([^"]+)"/);
            if (!nameMatch) continue;
            if (filenameMatch) {
              files.push({ fieldname: nameMatch[1], filename: filenameMatch[1], data: Buffer.from(content, 'binary'), contentType: (headerSec.match(/Content-Type: ([^\r\n]+)/) || [])[1] || '' });
            } else {
              fields[nameMatch[1]] = content;
            }
          }
          // Extract text from image files (save them; text extraction is basic)
          const docTexts = files.map(f => {
            if (f.filename) return `[Uploaded file: ${f.filename} (${(f.data.length/1024).toFixed(0)}KB) — please incorporate any business context from this document into the report analysis]`;
            return null;
          }).filter(Boolean);
          resolve({ fields, docTexts });
        });
      } else {
        let body = '';
        req.on('data', c => body += c.toString());
        req.on('end', () => resolve({ fields: parseFormData(body), docTexts: [] }));
      }
    });

    const { fields, docTexts } = await parseIntakeBody();
    data = fields;
    uploadedDocTexts = docTexts;
    await processIntake();
    }; // close processIntake

    // Kick off the full intake flow
    const runIntake = async () => {
      // Re-parse is handled above; data is set before this runs
    };

    // We need to restructure — call parseIntakeBody then proceed
    (() => {
      const contentType2 = contentType;
      let rawBody = Buffer.alloc(0);
      req.on('data', c => rawBody = Buffer.concat([rawBody, c]));
      req.on('end', async () => {
        if (contentType2.includes('multipart/form-data')) {
          const boundary = contentType2.split('boundary=')[1];
          const parts = rawBody.toString('binary').split('--' + boundary);
          for (const part of parts) {
            if (!part.includes('Content-Disposition')) continue;
            const [headerSec, ...cp] = part.split('\r\n\r\n');
            const content = cp.join('\r\n\r\n').replace(/\r\n$/, '');
            const nameMatch = headerSec.match(/name="([^"]+)"/);
            const filenameMatch = headerSec.match(/filename="([^"]+)"/);
            if (!nameMatch) continue;
            if (filenameMatch) {
              uploadedDocTexts.push(`[Uploaded: ${filenameMatch[1]}]`);
            } else {
              data[nameMatch[1]] = content;
            }
          }
        } else {
          data = parseFormData(rawBody.toString());
        }
        if (uploadedDocTexts.length > 0) {
          data.uploaded_documents = 'Client uploaded documents: ' + uploadedDocTexts.join(', ');
        }
      const reportId = Date.now().toString();
      
      fs.writeFileSync(path.join(REPORTS_DIR, reportId + '.status'), 'generating');
      // Save metadata (business name, email) for portal use
      fs.writeFileSync(path.join(REPORTS_DIR, reportId + '.meta.json'), JSON.stringify({
        business_name: data.business_name || '',
        email: data.email || '',
        order_id: data.order_id || reportId,
        created: new Date().toISOString()
      }));

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Generating Report...</title>
      <style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f7fa;margin:0;}
      .box{text-align:center;background:white;padding:60px;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.1);max-width:480px;}
      .spinner{width:48px;height:48px;border:4px solid #e8ecf0;border-top:4px solid #0a1628;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 24px;}
      @keyframes spin{to{transform:rotate(360deg)}}h2{color:#0a1628;margin-bottom:12px;}p{color:#6b7c93;font-size:15px;}</style>
      <script>function check(){fetch('/report-status/${reportId}').then(r=>r.json()).then(d=>{if(d.ready)location.href='/portal/${reportId}';else setTimeout(check,2500);}).catch(()=>setTimeout(check,2500));}setTimeout(check,4000);</script>
      </head><body><div class="box"><div class="spinner"></div><h2>Generating Your Report</h2>
      <p>Our AI is analyzing your market, mapping competitors, and building strategic recommendations. This takes 60–120 seconds.</p></div></body></html>`);

      try {
        const content = await generateReport(data);
        const html = wrapReport(content, data.business_name || 'Your Business');
        fs.writeFileSync(path.join(REPORTS_DIR, reportId + '.html'), html);
        fs.writeFileSync(path.join(REPORTS_DIR, reportId + '.status'), 'ready');
        console.log('Report generated:', reportId);
        // Send report-ready email to client
        const clientEmail = data.email || '';
        if (clientEmail && clientEmail.includes('@')) {
          try {
            const nodemailer = require('nodemailer');
            const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'hobbychan111@gmail.com', pass: 'cglkzcimgnhsbphs' } });
            await transporter.sendMail({
              from: '"StratexAI" <hobbychan111@gmail.com>',
              to: clientEmail,
              subject: `Your StratexAI Report is Ready — ${data.business_name || 'Business Intelligence Report'}`,
              html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                <div style="background:#0a1628;padding:28px 32px;border-radius:8px 8px 0 0;">
                  <img src="https://stratexai.io/favicon.ico" style="height:32px;margin-bottom:12px;" alt="StratexAI"><br>
                  <h2 style="color:white;margin:0;font-size:22px;">Your Report is Ready</h2>
                </div>
                <div style="padding:36px 32px;background:#f5f7fa;border-radius:0 0 8px 8px;">
                  <p style="font-size:16px;color:#2d3748;margin-bottom:16px;">Hello,</p>
                  <p style="font-size:15px;color:#4a5568;margin-bottom:24px;">Your Business Intelligence Report for <strong>${data.business_name || 'your business'}</strong> has been generated and is ready for review.</p>
                  <a href="https://app.stratexai.io/portal/${reportId}" style="display:inline-block;background:#0a1628;color:white;padding:16px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600;margin-bottom:24px;">View Your Report →</a>
                  <p style="font-size:14px;color:#6b7c93;">From your portal you can: view the full report, download it, and submit one round of feedback for a free revision.</p>
                  <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
                  <p style="font-size:13px;color:#a0aec0;">StratexAI · hello@stratexai.io · <a href="https://stratexai.io" style="color:#a0aec0;">stratexai.io</a></p>
                </div>
              </div>`
            });
            console.log('Report-ready email sent to', clientEmail);
          } catch(emailErr) { console.error('Email error:', emailErr.message); }
        }
      } catch (err) {
        console.error('Generation error:', err.message);
        fs.writeFileSync(path.join(REPORTS_DIR, reportId + '.status'), 'error');
      }
      }); // end req.on end
    })(); // end IIFE
    return;
  }

  if (req.method === 'GET' && url.startsWith('/report-status/')) {
    const id = url.replace('/report-status/', '');
    const sf = path.join(REPORTS_DIR, id + '.status');
    if (!fs.existsSync(sf)) return res.end(JSON.stringify({ ready: false }));
    const status = fs.readFileSync(sf, 'utf8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ready: status === 'ready', status }));
  }

  if (req.method === 'GET' && url.startsWith('/report/')) {
    const id = url.replace('/report/', '');
    const rf = path.join(REPORTS_DIR, id + '.html');
    if (!fs.existsSync(rf)) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end('<h2>Report generating... <script>setTimeout(()=>location.reload(),3000)</script></h2>');
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(fs.readFileSync(rf));
  }

  if (req.method === 'GET' && url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, port: PORT }));
  }

  // Stripe webhook — fires on payment_intent.succeeded or checkout.session.completed
  if (req.method === 'POST' && url === '/stripe-webhook') {
    let body = '';
    req.on('data', c => body += c.toString());
    req.on('end', async () => {
      try {
        const event = JSON.parse(body);
        console.log('Stripe webhook:', event.type);
        let customerEmail = '';
        let customerName = '';
        let orderId = '';

        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          customerEmail = session.customer_details?.email || session.customer_email || '';
          customerName = session.customer_details?.name || '';
          orderId = session.id;
        } else if (event.type === 'payment_intent.succeeded') {
          const pi = event.data.object;
          customerEmail = pi.receipt_email || pi.metadata?.email || '';
          customerName = pi.metadata?.name || '';
          orderId = pi.id;
        }

        if (customerEmail) {
          await sendWelcomeEmail(customerEmail, customerName, orderId);
        }
      } catch(e) { console.error('Webhook error:', e.message); }
      res.writeHead(200);
      res.end('ok');
    });
    return;
  }

  // Order success page — shown after Stripe checkout
  if (req.method === 'GET' && (url === '/success' || url === '/order-success')) {
    const successPage = fs.readFileSync(path.join(__dirname, '../../image-gallery/uploads/order-success.html'), 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(successPage);
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('StratexAI intake server: http://localhost:' + PORT);
});
