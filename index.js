import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js'
import { connectDB } from './db.js'
import { initSocket } from './socket.js';

connectDB();

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(3000, () => {
    console.log('Server on port', 3000);
});