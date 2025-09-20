# ANDY Twilio ICE Bridge

Exposes `/twilio-ice` to return fresh Twilio ICE (TURN/STUN) credentials safely from the server.

## Deploy (Render)

- New **Web Service** (Node 18+)
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Environment:**
  - `TWILIO_ACCOUNT_SID` = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  - `TWILIO_API_KEY_SID` = SKxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  - `TWILIO_API_KEY_SECRET` = (secret)
  - `CORS_ORIGIN` = `*` (or your Netlify domain)

### Test
- `GET https://<your-app>.onrender.com/health` → `{ "ok": true }`
- `GET https://<your-app>.onrender.com/twilio-ice` → `{ "iceServers": [ ... ] }`
