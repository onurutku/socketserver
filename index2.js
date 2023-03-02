const express = require("express")
const app = express()
const cors = require("cors")
var fs = require( 'fs' );
const options = {
        key: fs.readFileSync('private.key'),
        cert: fs.readFileSync('certificate.crt'),
        ca: fs.readFileSync('ca_bundle.crt'),
        requestCert: false,
        rejectUnauthorized: false
    }
const http = require('https').createServer(options,app);
// const http = require('http').Server(app);
// const PORT = 5000
const PORT = 443
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "*"
    }
});

app.use(cors())
let users = []

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`)
    
    socket.on("message", data => {
      socketIO.emit("messageResponse", data)
    })

    socket.on("typing", data => (
      socket.broadcast.emit("typingResponse", data)
    ))

    socket.on("newUser", data => {
      users.push(data)
      socketIO.emit("newUserResponse", users)
    })
    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
      users=users.filter(user=>(user.id!==socket.id)||(!user.id));
      socketIO.emit('disconnected',users)
      socket.disconnect()
    });
});

app.get("/users", (req, res) => {
  res.json(users)
});
http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});