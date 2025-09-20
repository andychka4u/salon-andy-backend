/**
 * ANDY Twilio ICE Bridge (Express)
 *  - GET /twilio-ice -> { iceServers: [...] }
 *  - GET /health     -> { ok: true }
 *
 * Env required:
 *  TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *  TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *  TWILIO_API_KEY_SECRET=your_api_key_secret
 * Optional:
 *  PORT=10000
 *  CORS_ORIGIN=*
 */
import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN }));

const PORT = process.env.PORT || 10000;
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/twilio-ice', async (req, res) => {
  try {
    if (!ACCOUNT_SID || !API_KEY_SID || !API_KEY_SECRET) {
    return res.status(500).json({ error: 'Missing Twilio env vars' });
    }
    const url = `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Tokens.json`;
    const auth = Buffer.from(`${API_KEY_SID}:${API_KEY_SECRET}`).toString('base64');

    const rsp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ Ttl: '3600' }) // 1h token
    });
    if (!rsp.ok) {
      const txt = await rsp.text();
      return res.status(502).json({ error: 'Twilio token request failed', status: rsp.status, details: txt });
    }
    const data = await rsp.json();
    const iceServers = (data.ice_servers || []).map(s => ({
      urls: s.urls,
      username: s.username,
      credential: s.credential
    }));
    res.json({ iceServers });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => console.log(`[ANDY ICE] listening on :${PORT}`));
