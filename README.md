# ANDY PeerJS Signaling Server (Ready for Render)

This is a tiny PeerJS signaling server with correct mount/api split, compatible with PeerJS client 1.x.

## Deploy on Render (free)

1. Create a **new GitHub repo**, upload these files.
2. On Render → **New → Web Service** → connect the repo.
3. Settings:
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Environment Variables:
   - `PEER_MOUNT` = `/peerjs`
   - `PEER_API_PATH` = `/`
   - `CORS_ORIGIN` = `*`
5. Deploy. Your signaling URL base will be: `https://YOUR-APP.onrender.com/peerjs`

Test health: `https://YOUR-APP.onrender.com/` → should show `PeerJS signaling OK`.
