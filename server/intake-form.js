/**
 * StratexAI Intake Form - Professional Consulting Design
 */

function buildIntakeForm(orderId) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>StratexAI — Business Intelligence Report</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf0 100%); min-height: 100vh; display: flex; flex-direction: column; }

header { background: #0a1628; color: white; padding: 24px 40px; }
header h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
header span { color: #4a9eff; }

main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 60px 20px; }

.container { max-width: 900px; width: 100%; }
.card { background: white; border-radius: 12px; padding: 60px 48px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); }

h2 { font-size: 32px; font-weight: 700; color: #0a1628; margin-bottom: 8px; }
.subtitle { font-size: 16px; color: #6b7c93; margin-bottom: 40px; border-bottom: 2px solid #e8ecf0; padding-bottom: 24px; }

.progress-steps { display: flex; gap: 16px; margin-bottom: 48px; }
.step { flex: 1; padding: 16px; background: #f0f4f8; border-radius: 8px; text-align: center; }
.step.active { background: #0a1628; color: white; }
.step-num { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
.step-label { font-size: 12px; font-weight: 500; }

.form-group { margin-bottom: 32px; }
label { display: block; font-weight: 600; font-size: 14px; color: #0a1628; margin-bottom: 10px; }
label .required { color: #e53e3e; }

input, select, textarea { width: 100%; padding: 14px 16px; border: 1.5px solid #d1d9e0; border-radius: 8px; font-size: 15px; color: #1a2433; background: #fafbfc; font-family: inherit; transition: all 0.2s; }
input:focus, select:focus, textarea:focus { border-color: #4a9eff; background: white; box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1); outline: none; }
input::placeholder, textarea::placeholder { color: #a0aec0; }

.row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.row.full { grid-template-columns: 1fr; }

textarea { resize: vertical; min-height: 100px; }

.hint { font-size: 12px; color: #8896a5; margin-top: 6px; }

.submit-btn { width: 100%; padding: 16px; background: #0a1628; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 24px; transition: all 0.2s; }
.submit-btn:hover { background: #1a3050; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(10, 22, 40, 0.2); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

footer { background: #fafbfc; border-top: 1px solid #e8ecf0; padding: 20px 40px; text-align: center; font-size: 12px; color: #8896a5; }

@media (max-width: 768px) {
  .card { padding: 40px 24px; }
  .row { grid-template-columns: 1fr; }
  .progress-steps { font-size: 12px; }
  h2 { font-size: 24px; }
}
</style>
</head>
<body>

<header>
  <h1>Strat<span>ex</span>AI</h1>
</header>

<main>
<div class="container">
  <div class="card">
    <h2>Tell Us About Your Business</h2>
    <p class="subtitle">Complete this form and our AI will generate a comprehensive business intelligence report.</p>
    
    <div class="progress-steps">
      <div class="step active">
        <div class="step-num">1</div>
        <div class="step-label">Business Info</div>
      </div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-label">Analysis Running</div>
      </div>
      <div class="step">
        <div class="step-num">3</div>
        <div class="step-label">Report Ready</div>
      </div>
    </div>

    <form method="POST" action="/intake" onsubmit="handleSubmit(event)">
      <input type="hidden" name="order_id" value="${orderId || ''}">
      
      <!-- Contact Information -->
      <div class="row">
        <div class="form-group">
          <label>Email Address <span class="required">*</span></label>
          <input type="email" name="email" placeholder="your@company.com" required>
          <p class="hint">We'll send your report here</p>
        </div>
        <div class="form-group">
          <label>Your Name <span class="required">*</span></label>
          <input type="text" name="name" placeholder="e.g., Sarah Chen" required>
          <p class="hint">So we know who to address the report to</p>
        </div>
      </div>

      <!-- Business Basics -->
      <div class="row">
        <div class="form-group">
          <label>Business Name <span class="required">*</span></label>
          <input type="text" name="business_name" placeholder="e.g., Acme Corporation" required>
        </div>
        <div class="form-group">
          <label>Industry <span class="required">*</span></label>
          <select name="industry" required>
            <option value="">Select your industry...</option>
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
            <option>Logistics / Supply Chain</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <!-- Market Information -->
      <div class="row">
        <div class="form-group">
          <label>Primary Market / Region <span class="required">*</span></label>
          <input type="text" name="market" placeholder="e.g., Southeast Asia, US, European Union" required>
          <p class="hint">Geographic focus or expansion region</p>
        </div>
        <div class="form-group">
          <label>Business Stage <span class="required">*</span></label>
          <select name="stage" required>
            <option value="">Select stage...</option>
            <option>Pre-revenue / Concept</option>
            <option>Early Stage ($0-$1M revenue)</option>
            <option>Growth Stage ($1M-$10M revenue)</option>
            <option>Scale Stage ($10M-$100M revenue)</option>
            <option>Enterprise ($100M+ revenue)</option>
          </select>
        </div>
      </div>

      <!-- Business Description -->
      <div class="form-group row full">
        <label>Business Description <span class="required">*</span></label>
        <textarea name="description" placeholder="What does your business do? Who are your customers? What is your key value proposition?" required></textarea>
        <p class="hint">2-3 sentences describing your business model and value proposition</p>
      </div>

      <!-- Competitive Landscape -->
      <div class="form-group row full">
        <label>Current Key Competitors (Optional)</label>
        <input type="text" name="competitors" placeholder="e.g., Competitor A, Competitor B, Competitor C">
        <p class="hint">Leave blank and we'll identify the main competitors in your market</p>
      </div>

      <!-- Business Challenges -->
      <div class="form-group row full">
        <label>Main Challenges & Pain Points</label>
        <textarea name="challenges" placeholder="What are your biggest business challenges? E.g., high customer acquisition cost, competitive pricing pressure, market entry barriers..."></textarea>
        <p class="hint">This helps us tailor recommendations specifically to your situation</p>
      </div>

      <!-- Opportunities -->
      <div class="form-group row full">
        <label>Growth Opportunities & Goals</label>
        <textarea name="opportunities" placeholder="What growth opportunities do you see? E.g., new market expansion, product line extension, operational efficiency gains..."></textarea>
        <p class="hint">The more specific, the more targeted our analysis will be</p>
      </div>

      <!-- Strategic Questions -->
      <div class="form-group row full">
        <label>Specific Questions for the Report (Optional)</label>
        <textarea name="questions" placeholder="E.g., Should we expand to the Japanese market? What's the ideal pricing strategy? How do we compete against company X?"></textarea>
        <p class="hint">We'll address these specifically in your report</p>
      </div>

      <button type="submit" class="submit-btn">Generate My Report →</button>
    </form>
  </div>
</div>
</main>

<footer>
  <p>StratexAI uses AI to generate strategic business intelligence. Your data is encrypted and never shared.</p>
</footer>

<script>
function handleSubmit(e) {
  e.preventDefault();
  const btn = document.querySelector('.submit-btn');
  btn.disabled = true;
  btn.textContent = 'Generating Report...';
  e.target.submit();
}
</script>

</body>
</html>`;
}

module.exports = { buildIntakeForm };
