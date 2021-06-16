// import {createServer} from 'http';
// import {Server} from 'socket.io';

// const httpServer = createServer();
// const io = new Server(httpServer);
// const recorderSpace = io.of('/recorder');

// recorderSpace.on('connection', socket => {
//     console.log('socket: connected on recorderSpace')
// })

// const ws = require('ws');
// const ws = WebSocket;
// console.log('socket: ',ws)
// const httpServer = require("http").createServer();
// const io = require("socket.io")(httpServer, {
//   wsEngine: ws,
//   path: '/socket'
// });

// httpServer.listen(3000)

export const bcastRecorder = (event, dataJson) => {
    console.log('socket: ', event, dataJson)
    // io.emit(event, dataJson)
}