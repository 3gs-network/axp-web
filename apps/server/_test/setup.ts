// Vitest global setup for the server test suite. The AXP CRM is left
// unconfigured so no test can reach the real CRM; routes answer with their
// documented "unconfigured" fallbacks instead.

process.env.AXP_CRM_URL = "";
process.env.AXP_CRM_ANON_KEY = "";
