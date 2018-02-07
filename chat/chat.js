function init(io) {

    var mode = "2D";
    var state = {
        state2d: {
            x: -300,
            y: -400
        },
        state3d: {
            n: "1"
        }
    };

    io.on("connection", function(socket) {
        socket.on("join", function(nick) {
            socket.nick = nick;
            io.emit("status", {
                time: Date.now(),
                status: nick + " dołączył do czatu."
            });
            io.emit("changeMode", mode);
            io.emit("state", state);
        });

        socket.on("disconnect", function() {
            io.emit("status", {
                time: Date.now(),
                status: socket.nick + " opuścił czat."
            });
        });


        socket.on("message", function(msg) {
            io.emit("message", {
                time: Date.now(),
                nick: socket.nick,
                message: msg
            });
        });

        socket.on("state", function(st){
            state = st;
            io.emit("state", st);
            
        });

        socket.on("changeMode", function(md){
            mode = md;
            io.emit("changeMode", md);
        });
    });
}

module.exports = init;