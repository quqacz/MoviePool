import { Socket } from "socket.io"

exports = module.exports = function(io: Socket){
    io.on('connection', (socket)=>{
        console.log("user connected");
    
        socket.on('disconnect', () => {
            console.log("disconnect");
        });
    })
}