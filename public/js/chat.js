(function() {

    var socket = io.connect("http://localhost:8080"),
        joined = false;

    var joinForm = $("#join-form"),
        nick = $("#nick"),
        chatContainer = $("#chat-container"),
        chatDiv = $("#chat-container > div"),
        chatForm = $("#chat-form"),
        chatWindow = $("#chat-window"),
        chatMessage = $("#message"),
        chatStatusTpl = Handlebars.compile( $("#chat-status-template").html() ),
        chatMessageTpl = Handlebars.compile( $("#chat-message-template").html() );

    joinForm.on("submit", function(e) {

        e.preventDefault();

        var nickName = $.trim( nick.val() );

        if(nickName === "") {
            nick.addClass("invalid");
        } else {
            nick.removeClass("invalid");

            socket.emit("join", nickName);

            joinForm.hide();
            chatDiv.show();
            chatForm.show();

            // Initials
            $('.3d').hide();

            joined = true;
        }

    });

    chatForm.on("submit", function(e) {

        e.preventDefault();

        var message = $.trim( chatMessage.val() );

        if(message !== "") {
            socket.emit("message", message);
            chatMessage.val("");
        }

    });

    socket.on("status", function(data) {

        if(!joined) return;

        var html = chatStatusTpl({
            status: data.status,
            time: formatDate(data.time)
        });

        chatWindow.append(html);
        scrollToBottom();

    });

    socket.on("message", function(data) {

        if(!joined) return;

        var html = chatMessageTpl({
            time: formatDate(data.time),
            nick: data.nick,
            message: data.message
        });

        chatWindow.append(html);
        scrollToBottom();

    });

    socket.on("changeMode", function(md){
        $('.nav-tabs').trigger(md);
    });

    socket.on("state", function(st){
        
        //$('#drag-3d').trigger(st.state3d);
        console.log("Otrzymano:");
        console.log(st);

        let bg = $('#drag-2d');
        bg.css('backgroundPositionX', st.state2d.x);
        bg.css('backgroundPositionY', st.state2d.y);


        let img = $('#drag-3d');
        let slider = $('#rotate-3d');
        
        //img.html(st.state3d.n);

        img.children().attr('src', 'images/3d/'+st.state3d.n+'.jpg');
        slider.val(st.state3d.n);

        
    });


    // Handle 2D Move input
    $('#left').click(function(){
        update('2d', 'left');
    });

    $('#up').click(function(){
        update('2d', 'up');
    });

    $('#down').click(function(){
        update('2d', 'down');
    });

    $('#right').click(function(){
        update('2d', 'right');     
    });

    // Handle 3D Move input
    //

    $('#rotate-3d').on("input change", function() {
        let position = $(this).val();
        update('3d', position);
    });

    $('#choose-2d').click(function(){
        $('.nav-tabs').trigger('2d');
        notifyChangedTab('2D');
    });

    $('#choose-3d').click(function(){
        $('.nav-tabs').trigger('3d');
        notifyChangedTab('3D');
    });


    function scrollToBottom() {

        chatWindow.scrollTop( chatWindow.prop("scrollHeight") );

    }

    function formatDate(time) {

        var date = new Date(time),
            hours = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds();

        return (hours < 10 ? "0" + hours : hours) + ":" +
            (minutes < 10 ? "0" + minutes : minutes) + ":" +
            (seconds < 10 ? "0" + seconds : seconds);

    }

    function notifyChangedTab(mode) {
        socket.emit("changeMode", mode);
    }

    function update(mode, data) {
        let st2d, st3d;

        if (mode == '2d') {
            st2d = handle2dMovement(data);
            st3d = handle3dMovement(false);
        } else {
            st2d = handle2dMovement(false);
            st3d = handle3dMovement(data);
        }

        let state = {
            state2d: st2d,
            state3d: st3d
        };

        notifyMovement(state);
    }

    function handle2dMovement(direction) {
        let bg = $('#drag-2d');
        let backgroundPos = bg.css('backgroundPosition').split(" ");
        let xPos = parseInt(backgroundPos[0], 10),
            yPos = parseInt(backgroundPos[1], 10);

        switch (direction) {
            case 'up':
                yPos = yPos + 50;
                break;
            case 'down':
                yPos = yPos - 50;
                break;
            case 'left':
                xPos = xPos + 50;
                break;
            case 'right':
                xPos = xPos - 50;
                break;
            default:
                break;
        }

        let to_ret = { x: xPos, y: yPos };
        return to_ret;
    }

    function handle3dMovement(rotation) {
        let tmp;
        if (rotation) {
            tmp = rotation;
        } else {
            tmp = $('#rotate-3d').val();
        }
        let to_ret = { n: tmp };
        return to_ret;
    }

    function notifyMovement(state) {
        socket.emit("state", state);
    }

    $('.nav-tabs').on('2D', function(){
        set2d3d('2d');
    });

    $('.nav-tabs').on('3D', function(){
        set2d3d('3d');
    });

    function set2d3d(mode) {
        switch (mode) {
            case '2d':
                $('#choose-2d').addClass('active');
                $('#choose-3d').removeClass('active');
                $('.2d').show();
                $('.3d').hide();
                break;
            case '3d':
                $('#choose-3d').addClass('active');
                $('#choose-2d').removeClass('active');
                $('.3d').show();
                $('.2d').hide();
                break;
        }
    }

})();