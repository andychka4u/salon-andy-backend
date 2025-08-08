
/**
 * Salon Andy - Backend (Render/Railway ready)
 * Exposes Socket.IO with CORS for Netlify frontend.
 * Default Admin PIN: 27132000 (can be overridden by env ROOM_ADMIN_PIN)
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// ENV
const PORT = process.env.PORT || 3000;
const ROOM_ADMIN_PIN = process.env.ROOM_ADMIN_PIN || '27132000';
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s=>s.trim())
  : ['http://localhost:8888', 'http://localhost:3000', 'https://YOUR-NETLIFY-SITE.netlify.app'];

// CORS for HTTP routes (if any)
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.get('/', (_, res)=> res.json({ ok:true, service:'Salon Andy Backend', origins: ALLOWED_ORIGINS, adminPinDefault: ROOM_ADMIN_PIN ? 'set' : 'unset' }));

// Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET','POST']
  }
});

// In-memory rooms
const rooms = {};
function createRoom() {
  let code = uuidv4().slice(0,6).toUpperCase();
  while (rooms[code]) code = uuidv4().slice(0,6).toUpperCase();
  rooms[code] = {
    valid: true,
    media: { type: null, src: null, playing: false, updatedAt: Date.now() },
    users: new Map(),
    createdAt: Date.now(),
  };
  return code;
}

io.on('connection', (socket)=>{
  socket.on('room:join', ({ code, name, pin })=>{
    code = (code||'').toUpperCase() || 'LOBBY';
    if (!rooms[code]) rooms[code] = {
      valid:true, media:{ type:null, src:null, playing:false, updatedAt:Date.now() },
      users:new Map(), createdAt:Date.now()
    };
    const room = rooms[code];
    if (!room.valid) return socket.emit('room:error', { message:'الرابط غير صالح. اطلب رابطًا جديدًا.' });
    // Admin rule: pin must match ROOM_ADMIN_PIN
    const role = (pin && pin.toString() === ROOM_ADMIN_PIN) ? 'admin' : 'guest';
    socket.data = { role, name: name || 'بدون اسم', code };
    socket.join(code);
    room.users.set(socket.id, { name: socket.data.name, role });
    io.to(code).emit('users:update', Array.from(room.users.values()));
    socket.emit('media:update', room.media);
    socket.emit('room:joined', { role, code, name: socket.data.name });
    io.to(code).emit('chat:message', { system:true, text:`${socket.data.name} انضم إلى الغرفة`, at:Date.now() });
  });

  socket.on('chat:send', ({ text })=>{
    const code = socket.data?.code;
    if (!code || !rooms[code]?.valid) return;
    const clean = (text||'').toString().slice(0,1000).trim();
    if (!clean) return;
    io.to(code).emit('chat:message', {
      name: socket.data.name, role: socket.data.role, text: clean, at: Date.now()
    });
  });

  socket.on('media:set', ({ type, src, playing })=>{
    const code = socket.data?.code;
    if (!code || !rooms[code]) return;
    if (socket.data.role !== 'admin') return;
    rooms[code].media = { type: type||null, src: src||null, playing: !!playing, updatedAt: Date.now() };
    io.to(code).emit('media:update', rooms[code].media);
    io.to(code).emit('chat:message', { system:true, text:`قام المشرف بتغيير المحتوى`, at:Date.now() });
  });

  socket.on('media:play', ()=>{
    const code = socket.data?.code;
    if (!code || !rooms[code]) return;
    if (socket.data.role !== 'admin') return;
    rooms[code].media.playing = true;
    rooms[code].media.updatedAt = Date.now();
    io.to(code).emit('media:play');
  });

  socket.on('media:pause', ()=>{
    const code = socket.data?.code;
    if (!code || !rooms[code]) return;
    if (socket.data.role !== 'admin') return;
    rooms[code].media.playing = false;
    rooms[code].media.updatedAt = Date.now();
    io.to(code).emit('media:pause');
  });

  socket.on('room:regenerate', ()=>{
    const code = socket.data?.code;
    if (!code || !rooms[code]) return;
    if (socket.data.role !== 'admin') return;
    rooms[code].valid = false;
    const newCode = createRoom();
    rooms[newCode].media = { ...rooms[code].media };
    io.to(code).emit('room:regenerated', { newCode });
    setTimeout(()=> io.in(code).socketsLeave(code), 10000);
  });

  socket.on('disconnect', ()=>{
    const code = socket.data?.code;
    if (!code || !rooms[code]) return;
    const room = rooms[code];
    const user = room.users.get(socket.id);
    if (user){
      room.users.delete(socket.id);
      io.to(code).emit('users:update', Array.from(room.users.values()));
      io.to(code).emit('chat:message', { system:true, text:`${user.name} غادر الغرفة`, at:Date.now() });
    }
  });
});

server.listen(PORT, ()=> console.log(`Salon Andy Backend on :${PORT}`));
