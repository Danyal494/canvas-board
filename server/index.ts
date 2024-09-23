const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);

// Importing types from 'socket.io'
import { Socket } from 'socket.io';

const io = new Server(server, {
  cors: {
    origin: '*', // In this case, anyone can join the server
  },
});

type Point = { x: number; y: number };

type DrawLine = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
};

io.on('connection', (socket: Socket) => {
  console.log('connection');

  socket.on('client-ready', () => {
    socket.broadcast.emit('get-canvas-state');
  });

  socket.on('canvas-state', (state: any) => {
    socket.broadcast.emit('canvas-state-from-server', state);
  });

  socket.on('draw-line', ({ prevPoint, currentPoint, color }: DrawLine) => {
    socket.broadcast.emit('draw-line', { prevPoint, currentPoint, color });
  });

  socket.on('clear', () => io.emit('clear'));
});

// When we fire an event after the connection, the websocket server listens to the event and takes data in every instance of its connections

server.listen(30001, () => {
  console.log('server listening on port 3001');
});
