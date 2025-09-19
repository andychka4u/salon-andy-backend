# ANDY PeerJS Signaling Server

A tiny, production-friendly PeerJS signaling server you can deploy on Render/Heroku/Railway.

## Deploy on Render (free plan)

1. Create a **New Web Service** from this folder (or zip it and connect to a repo).
2. Build Command: `npm install`
3. Start Command: `node server.js`
4. Environment Variables:
   - `PEER_PATH`: `/peerjs`
   - `CORS_ORIGIN`: `*`
5. After deploy, your signaling URL will be like: `https://YOUR-APP.onrender.com/peerjs`

## Deploy on Railway / Fly / Heroku
- Use the same `npm install` / `node server.js`. The server reads `PORT` from the platform.
- Keep `PEER_PATH=/peerjs`.

## Test
Open: `https://YOUR-APP.onrender.com/` → you should see `PeerJS signaling OK`.
