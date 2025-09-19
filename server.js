/**
 * ANDY — PeerJS Signaling Server (Render/Heroku/Railway ready)
 * Uses separate mount path (/peerjs) and internal API path (/)
 * Works with PeerJS client 1.x (WS ends up at /peerjs/peerjs)
 */
const express = require('express');
const { ExpressPeerServer } = require('peer');

const PORT        = process.env.PORT || 9000;
const MOUNT_PATH  = process.env.PEER_MOUNT    || '/peerjs'; // express mount
const API_PATH    = process.env.PEER_API_PATH || '/';       // internal api path
const CORS_ORIGIN = process.env.CORS_ORIGIN   || '*';

const app = express();

// Health
app.get('/', (_req, res) => res.send('PeerJS signaling OK'));

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const server = app.listen(PORT, () => {
  console.log('[PeerJS] Signaling server on port', PORT, 'mount', MOUNT_PATH, 'api', API_PATH);
});

const peerServer = ExpressPeerServer(server, {
  path: API_PATH,          // internal API path — keep "/" for client 1.x
  allow_discovery: true,
  proxied: true,           // trust reverse proxy (Render)
  debug: true,
});

app.use(MOUNT_PATH, peerServer);

peerServer.on('connection', (client) => {
  try {
    const id = client.getId ? client.getId() : client.id;
    console.log('[PeerJS] Peer connected:', id);
  } catch {}
});

peerServer.on('disconnect', (client) => {
  try {
    const id = client.getId ? client.getId() : client.id;
    console.log('[PeerJS] Peer disconnected:', id);
  } catch {}
});
