# ANDY Combined Backend (Render)
Provides:
- PeerJS server at `/peerjs`
- Twilio ICE at `/twilio-ice`
- Health at `/health`

## Render setup
- New Web Service → Upload this folder or connect repo.
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Environment:**
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_API_KEY_SID`
  - `TWILIO_API_KEY_SECRET`
  - `CORS_ORIGIN` = `*` (or your Netlify domain)

## Test
- `GET https://<your>.onrender.com/health`
- `GET https://<your>.onrender.com/twilio-ice`
- `GET https://<your>.onrender.com/peerjs/id`  → should return a random id (signal OK)

Then in frontend PeerJS options:
```js
host: '<your>.onrender.com',
path: '/peerjs',
port: 443,
secure: true,
config: (fetch from /twilio-ice, relay)
```
