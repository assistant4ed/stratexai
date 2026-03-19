/**
 * StratexAI Landing Page — Original Design
 */
const fs = require('fs');
const path = require('path');

function buildLandingPage() {
  const filePath = path.join(__dirname, '../landing-page/index.html');
  let html = fs.readFileSync(filePath, 'utf8');
  // Fix the CTA link: /order → /intake
  html = html.replace('href="/order"', 'href="/intake"');
  return html;
}

module.exports = { buildLandingPage };
