/**
 * StratexAI Landing Page
 * Professional consulting-grade design
 */

function buildLandingPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>StratexAI — AI Business Intelligence Reports</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; color: #1a2433; line-height: 1.6; }

/* Navigation */
header { background: #0a1628; color: white; padding: 24px 40px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
header .logo { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
header .logo span { color: #4a9eff; }
nav { display: flex; gap: 32px; }
nav a { color: #8aabcc; text-decoration: none; font-size: 14px; transition: color 0.2s; }
nav a:hover { color: white; }

/* Hero Section */
.hero { background: linear-gradient(135deg, #0a1628 0%, #1a3d5c 100%); color: white; padding: 120px 40px; text-align: center; }
.hero h1 { font-size: 56px; font-weight: 800; margin-bottom: 16px; line-height: 1.2; }
.hero .subtitle { font-size: 20px; color: #8aabcc; margin-bottom: 32px; max-width: 700px; margin-left: auto; margin-right: auto; }
.hero-cta { display: inline-flex; gap: 16px; margin-top: 40px; }
.btn-primary { background: #4a9eff; color: white; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; cursor: pointer; border: none; transition: all 0.2s; }
.btn-primary:hover { background: #2a7eff; transform: translateY(-2px); box-shadow: 0 12px 24px rgba(74, 158, 255, 0.3); }
.btn-secondary { background: transparent; color: white; padding: 16px 48px; border: 2px solid #4a9eff; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; cursor: pointer; transition: all 0.2s; }
.btn-secondary:hover { background: #4a9eff; }

/* Features Section */
.features { padding: 120px 40px; background: #f5f7fa; }
.section-title { font-size: 42px; font-weight: 700; text-align: center; margin-bottom: 80px; color: #0a1628; }
.features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 48px; max-width: 1200px; margin: 0 auto; }
.feature-card { background: white; padding: 48px 32px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); transition: all 0.3s; }
.feature-card:hover { transform: translateY(-8px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
.feature-icon { font-size: 48px; margin-bottom: 16px; }
.feature-card h3 { font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #0a1628; }
.feature-card p { font-size: 15px; color: #6b7c93; line-height: 1.8; }

/* How It Works */
.how-it-works { padding: 120px 40px; background: white; }
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 32px; max-width: 1200px; margin: 0 auto; margin-top: 60px; }
.step-card { text-align: center; }
.step-num { width: 64px; height: 64px; background: #0a1628; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; margin: 0 auto 24px; }
.step-card h4 { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #0a1628; }
.step-card p { font-size: 14px; color: #6b7c93; }

/* Pricing */
.pricing { padding: 120px 40px; background: #f5f7fa; }
.pricing-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px; max-width: 1000px; margin: 0 auto; margin-top: 60px; }
.price-card { background: white; padding: 48px; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); position: relative; }
.price-card.featured { border: 3px solid #4a9eff; transform: scale(1.05); }
.price-card .badge { position: absolute; top: -16px; left: 24px; background: #4a9eff; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.price-card h4 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
.price-card .price { font-size: 48px; font-weight: 800; color: #0a1628; margin-bottom: 24px; }
.price-card .price span { font-size: 16px; color: #6b7c93; }
.price-card ul { list-style: none; margin-bottom: 32px; }
.price-card li { padding: 12px 0; color: #4a5568; display: flex; align-items: center; gap: 12px; }
.price-card li:before { content: '✓'; color: #4a9eff; font-weight: 700; }
.price-card .btn-primary { width: 100%; }

/* CTA Section */
.cta { padding: 80px 40px; background: linear-gradient(135deg, #0a1628 0%, #1a3d5c 100%); color: white; text-align: center; }
.cta h2 { font-size: 42px; font-weight: 700; margin-bottom: 24px; }
.cta p { font-size: 18px; color: #8aabcc; margin-bottom: 40px; }

/* Footer */
footer { background: #0a1628; color: #8aabcc; padding: 40px; text-align: center; font-size: 14px; }
footer a { color: #4a9eff; text-decoration: none; }

@media (max-width: 768px) {
  .hero h1 { font-size: 36px; }
  header { flex-direction: column; gap: 24px; }
  nav { flex-direction: column; gap: 16px; text-align: center; }
}
</style>
</head>
<body>

<!-- Header -->
<header>
  <div class="logo">Strat<span>ex</span>AI</div>
  <nav>
    <a href="#features">Features</a>
    <a href="#how">How It Works</a>
    <a href="#pricing">Pricing</a>
  </nav>
</header>

<!-- Hero -->
<section class="hero">
  <h1>AI-Powered Business Intelligence Reports</h1>
  <p class="subtitle">Get McKinsey-level strategic analysis in minutes, not weeks. Powered by Claude AI and designed for modern leaders.</p>
  <div class="hero-cta">
    <a href="/intake" class="btn-primary">Get Your Report →</a>
  </div>
</section>

<!-- Features -->
<section class="features" id="features">
  <h2 class="section-title">What You Get</h2>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">📊</div>
      <h3>Market Analysis</h3>
      <p>Deep dive into market size, growth trends, segmentation, and competitive dynamics specific to your industry.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔍</div>
      <h3>Competitor Intelligence</h3>
      <p>Comprehensive profiles of your top competitors, their positioning, strengths, and weaknesses.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🎯</div>
      <h3>Strategic Recommendations</h3>
      <p>Actionable insights and recommendations tailored to your specific business and market position.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">💰</div>
      <h3>Financial Outlook</h3>
      <p>3-year projections, growth potential analysis, and risk assessments for your business model.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">🔐</div>
      <h3>SWOT Analysis</h3>
      <p>Comprehensive strengths, weaknesses, opportunities, and threats assessment for your organization.</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">⚡</div>
      <h3>Fast & Accurate</h3>
      <p>AI-generated reports delivered in minutes, with the quality of top-tier strategy consultants.</p>
    </div>
  </div>
</section>

<!-- How It Works -->
<section class="how-it-works" id="how">
  <h2 class="section-title">How It Works</h2>
  <div class="steps">
    <div class="step-card">
      <div class="step-num">1</div>
      <h4>Fill Business Details</h4>
      <p>Tell us about your business, industry, market, and current challenges in a simple form.</p>
    </div>
    <div class="step-card">
      <div class="step-num">2</div>
      <h4>AI Analysis Runs</h4>
      <p>Our Claude AI engine analyzes your data and generates a comprehensive strategic report.</p>
    </div>
    <div class="step-card">
      <div class="step-num">3</div>
      <h4>View & Download</h4>
      <p>Access your professional report via our portal. Download, share, or request revisions.</p>
    </div>
  </div>
</section>

<!-- Pricing -->
<section class="pricing" id="pricing">
  <h2 class="section-title">Simple Pricing</h2>
  <div class="pricing-cards">
    <div class="price-card">
      <h4>Starter</h4>
      <div class="price">$99<span>/report</span></div>
      <ul>
        <li>Comprehensive AI Analysis</li>
        <li>Market & Competitor Intelligence</li>
        <li>Strategic Recommendations</li>
        <li>PDF Download</li>
        <li>Email Support</li>
      </ul>
      <a href="/intake" class="btn-primary">Get Started</a>
    </div>
    <div class="price-card featured">
      <div class="badge">POPULAR</div>
      <h4>Professional</h4>
      <div class="price">$249<span>/report</span></div>
      <ul>
        <li>Everything in Starter +</li>
        <li>Detailed SWOT Analysis</li>
        <li>Financial Projections</li>
        <li>Unlimited Revisions</li>
        <li>Priority Support</li>
        <li>Custom Branding</li>
      </ul>
      <a href="/intake" class="btn-primary">Get Started</a>
    </div>
    <div class="price-card">
      <h4>Enterprise</h4>
      <div class="price">Custom<span>/tailored</span></div>
      <ul>
        <li>Everything in Professional +</li>
        <li>Team Access</li>
        <li>API Integration</li>
        <li>Dedicated Account Manager</li>
        <li>Custom Analysis</li>
      </ul>
      <a href="mailto:sales@stratexai.io" class="btn-primary">Contact Sales</a>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="cta">
  <h2>Ready to Transform Your Strategy?</h2>
  <p>Get AI-powered business intelligence in minutes</p>
  <a href="/intake" class="btn-primary">Get Your Report Now →</a>
</section>

<!-- Footer -->
<footer>
  <p>&copy; 2026 StratexAI. All rights reserved. | <a href="#">Privacy</a> | <a href="#">Terms</a></p>
</footer>

</body>
</html>`;
}

module.exports = { buildLandingPage };
