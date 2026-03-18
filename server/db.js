/**
 * StratexAI Database
 * Uses SQLite for local development, cloud storage ready
 */

const fs = require('fs');
const path = require('path');

// Simple JSON-based storage (SQLite alternative that works everywhere)
const DB_DIR = path.join(__dirname, 'db');
const REPORTS_FILE = path.join(DB_DIR, 'reports.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function getReportsDb() {
  if (!fs.existsSync(REPORTS_FILE)) {
    fs.writeFileSync(REPORTS_FILE, JSON.stringify({ reports: {} }));
  }
  return JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf8'));
}

function saveReportsDb(db) {
  fs.writeFileSync(REPORTS_FILE, JSON.stringify(db, null, 2));
}

// ─── Report Operations ───────────────────────────────────────────────────

function saveReport(orderId, html, meta) {
  const db = getReportsDb();
  db.reports[orderId] = {
    html,
    meta,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  saveReportsDb(db);
}

function getReport(orderId) {
  const db = getReportsDb();
  return db.reports[orderId] || null;
}

function getReportHtml(orderId) {
  const report = getReport(orderId);
  return report ? report.html : null;
}

function updateReportFeedback(orderId, feedback, rating) {
  const db = getReportsDb();
  if (db.reports[orderId]) {
    db.reports[orderId].feedback = feedback;
    db.reports[orderId].rating = rating;
    db.reports[orderId].feedbackAt = new Date().toISOString();
    saveReportsDb(db);
  }
}

function saveRevisedReport(orderId, revisedHtml) {
  const db = getReportsDb();
  if (db.reports[orderId]) {
    db.reports[orderId].revisedHtml = revisedHtml;
    db.reports[orderId].revisedAt = new Date().toISOString();
    saveReportsDb(db);
  }
}

function getRevisedReport(orderId) {
  const db = getReportsDb();
  const report = db.reports[orderId];
  return report ? report.revisedHtml : null;
}

function listReports() {
  const db = getReportsDb();
  return Object.entries(db.reports).map(([id, data]) => ({
    id,
    ...data.meta,
    hasReport: !!data.html,
    hasFeedback: !!data.feedback,
    hasRevision: !!data.revisedHtml
  }));
}

module.exports = {
  saveReport,
  getReport,
  getReportHtml,
  updateReportFeedback,
  saveRevisedReport,
  getRevisedReport,
  listReports
};
