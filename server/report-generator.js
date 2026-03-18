/**
 * StratexAI Report Generator
 * Generates comprehensive McKinsey-level business intelligence reports using Claude Sonnet 4.6
 */

const https = require('https');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_MODEL = 'anthropic/claude-3-5-sonnet'; // Sonnet 4.6 via OpenRouter

/**
 * Generate comprehensive business intelligence report
 * @param {Object} formData - Form submission data
 * @returns {Promise<string>} - HTML report
 */
async function generateReport(formData) {
  const {
    email,
    business_name,
    industry,
    market,
    stage,
    description,
    challenges,
    opportunities,
    target_customers,
    competitive_advantage
  } = formData;

  const prompt = `You are a senior McKinsey strategy consultant. Generate a comprehensive, professional Business Intelligence Report for the following business:

BUSINESS INFORMATION:
- Business Name: ${business_name}
- Industry: ${industry}
- Primary Market/Region: ${market}
- Business Stage: ${stage}
- Description: ${description || '(Not provided)'}
- Key Challenges: ${challenges || '(Not provided)'}
- Key Opportunities: ${opportunities || '(Not provided)'}
- Target Customers: ${target_customers || '(Not provided)'}
- Competitive Advantage: ${competitive_advantage || '(Not provided)'}

Generate a detailed, McKinsey-style HTML report with the following sections:

1. EXECUTIVE SUMMARY (2-3 paragraphs)
   - High-level business overview
   - Key market opportunity
   - Primary recommendation

2. MARKET ANALYSIS
   - Market size and growth trajectory
   - Market trends and drivers
   - Market segmentation
   - Regulatory environment

3. COMPETITIVE LANDSCAPE
   - 5-6 key competitors (realistic, based on industry/market)
   - For each competitor: brief profile, market positioning, strengths, weaknesses
   - Competitive intensity and barriers to entry

4. SWOT ANALYSIS
   - STRENGTHS: 4-5 items for this business
   - WEAKNESSES: 4-5 items for this business
   - OPPORTUNITIES: 4-5 items in the market
   - THREATS: 4-5 items to the business

5. STRATEGIC RECOMMENDATIONS
   - 3-5 actionable recommendations (prioritized)
   - Include: what, why, how, expected impact
   - Timeline and key metrics

6. FINANCIAL OUTLOOK & RISK ASSESSMENT
   - Growth potential ($M ARR 3-year projection)
   - Key risks and mitigation strategies
   - Critical success factors

FORMAT: Return ONLY valid HTML (no markdown, no code fences). 
- Use professional styling (blues, grays, clean typography)
- Include section headers with underlines
- Use tables for competitor analysis and SWOT
- Make it printable and visually polished
- Embed all CSS in <style> tag (no external stylesheets)
- Include company name and date in header
- Footer with disclaimer

START WITH: <!DOCTYPE html>
END WITH: </html>

Make it look like a $5,000 consulting report. Be specific to the industry and market provided.`;

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 8000,
      temperature: 0.7
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'HTTP-Referer': 'https://stratexai.io',
        'X-Title': 'StratexAI'
      },
      timeout: 60000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            return reject(new Error(`OpenRouter API ${res.statusCode}: ${data}`));
          }
          const json = JSON.parse(data);
          if (!json.choices || !json.choices[0]) {
            return reject(new Error('Invalid API response structure'));
          }
          const reportHtml = json.choices[0].message.content;
          
          // Validate HTML
          if (!reportHtml.includes('<!DOCTYPE html') && !reportHtml.includes('<!doctype html')) {
            return reject(new Error('API response is not valid HTML'));
          }
          
          // Inject metadata and styling enhancements
          const enhancedHtml = injectMetadataAndStyling(reportHtml, business_name, email);
          resolve(enhancedHtml);
        } catch (err) {
          reject(new Error(`Parse error: ${err.message}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.abort();
      reject(new Error('Report generation timeout (60s)'));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Inject metadata, styling, and company branding
 */
function injectMetadataAndStyling(html, businessName, email) {
  // Add extra styling if not present
  const styleInjection = `
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #2d3748; background: #f7fafc; }
  .container { max-width: 900px; margin: 0 auto; background: white; padding: 60px 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  header { border-bottom: 3px solid #0a1628; padding-bottom: 30px; margin-bottom: 40px; }
  h1 { font-size: 32px; color: #0a1628; margin: 0 0 8px 0; font-weight: 700; }
  h2 { font-size: 22px; color: #0a1628; margin: 40px 0 20px 0; border-bottom: 2px solid #4a9eff; padding-bottom: 10px; }
  h3 { font-size: 16px; color: #1a365d; margin: 24px 0 12px 0; }
  p { margin: 0 0 16px 0; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
  th { background: #edf2f7; font-weight: 600; color: #0a1628; }
  tr:hover { background: #f7fafc; }
  .section { margin-bottom: 40px; }
  .highlight { background: #fffaf0; padding: 20px; border-left: 4px solid #f6ad55; margin: 20px 0; }
  .footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096; }
  .report-meta { color: #718096; font-size: 14px; margin: 8px 0; }
  .generated-at { font-style: italic; color: #a0aec0; }
</style>
`;

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Insert metadata before closing body tag
  const metadata = `
<div class="footer">
  <p class="report-meta"><strong>Report for:</strong> ${businessName}</p>
  <p class="report-meta"><strong>Prepared:</strong> ${dateStr}</p>
  <p class="report-meta"><strong>Client Email:</strong> ${email}</p>
  <p class="generated-at">This report was generated by StratexAI, an AI-powered business intelligence platform. All analysis is based on provided information and industry research.</p>
</div>
`;

  // Inject styling after <head>
  let result = html;
  if (html.includes('</head>')) {
    result = html.replace('</head>', styleInjection + '</head>');
  } else if (html.includes('<body>')) {
    result = html.replace('<body>', '<head>' + styleInjection + '</head><body>');
  }
  
  // Inject footer before closing body
  if (result.includes('</body>')) {
    result = result.replace('</body>', metadata + '</body>');
  } else {
    result += metadata;
  }

  return result;
}

/**
 * Generate revision of report based on feedback
 */
async function reviseReport(originalHtml, feedback, businessName) {
  const prompt = `You are a senior McKinsey strategy consultant. A client has reviewed their business intelligence report and provided feedback for improvement.

FEEDBACK: "${feedback}"

Your task: Revise and improve the report based on this feedback. 
- Maintain the same professional McKinsey-style design and structure
- Focus specifically on what the client asked to improve
- Return the complete revised HTML report
- Keep all sections (Executive Summary, Market Analysis, Competitive Landscape, SWOT, Strategic Recommendations, Financial Outlook)
- Make improvements that directly address the feedback

Original report excerpt (first 5000 chars):
${originalHtml.slice(0, 5000)}

Return ONLY valid HTML. Start with <!DOCTYPE html> and end with </html>.`;

  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 8000,
      temperature: 0.7
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        'HTTP-Referer': 'https://stratexai.io',
        'X-Title': 'StratexAI'
      },
      timeout: 60000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            return reject(new Error(`API ${res.statusCode}`));
          }
          const json = JSON.parse(data);
          resolve(json.choices[0].message.content);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.abort();
      reject(new Error('Report revision timeout'));
    });

    req.write(postData);
    req.end();
  });
}

module.exports = { generateReport, reviseReport };
