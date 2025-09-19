/**
 * Minimal PeerJS signaling server (Express + ExpressPeerServer)
 * Deployable on Render/Heroku/Railway/Fly. TLS is terminated by the platform.
 */
const express = require('express');
const { ExpressPeerServer } = require('peer');

const PORT = process.env.PORT || 9000;
const PEER_PATH = process.env.PEER_PATH || '/peerjs';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();

// Basic health route
app.get('/', (req, res) => res.send('PeerJS signaling OK'));

// CORS headers (so clients from any domain can connect)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const server = app.listen(PORT, () => {
  console.log('[PeerJS] Signaling server on port', PORT, 'path', PEER_PATH);
});

const peerServer = ExpressPeerServer(server, {
  path: PEER_PATH,
  allow_discovery: true,
  proxied: true, // trust X-Forwarded-* headers behind proxy
  debug: true,
});

app.use(PEER_PATH, peerServer);

peerServer.on('connection', (client) => {
  const id = client.getId ? client.getId() : client.id;
  console.log('[PeerJS] Peer connected:', id);
});
peerServer.on('disconnect', (client) => {
  const id = client.getId ? client.getId() : client.id;
  console.log('[PeerJS] Peer disconnected:', id);
});
