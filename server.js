/**
 * ANDY Combined Backend
 * - PeerJS signaling at /peerjs
 * - Twilio ICE at   /twilio-ice
 * - Health at       /health
 *
 * Env:
 *  TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET
 *  CORS_ORIGIN = *  (or your Netlify domain)
 *  PORT (Render provides)
 */
import express from 'express';
import cors from 'cors';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { ExpressPeerServer } = require('peer');

const app = express();
app.use(express.json());

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN }));

const PORT = process.env.PORT || 10000;
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const API_KEY_SID = process.env.TWILIO_API_KEY_SID;
const API_KEY_SECRET = process.env.TWILIO_API_KEY_SECRET;

// ---- Health ----
app.get('/health', (req,res)=> res.json({ ok: true }));

// ---- Twilio ICE ----
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
      body: new URLSearchParams({ Ttl: '3600' })
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

// ---- PeerJS signaling ----
const peerOptions = {
  path: '/',                 // we mount at /peerjs with root path
  proxied: true,             // trust proxy headers (Render)
  pingInterval: 25000,
  allow_discovery: true
};
const peerServer = ExpressPeerServer(app, peerOptions);
app.use('/peerjs', peerServer);

app.listen(PORT, () => {
  console.log(`[ANDY] listening on :${PORT} | peer at /peerjs | ice at /twilio-ice`);
});
