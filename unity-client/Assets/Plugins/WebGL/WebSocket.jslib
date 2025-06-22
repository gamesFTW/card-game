mergeInto(LibraryManager.library, {
    WebSocketConnect: function (url) {
        var urlStr = UTF8ToString(url);
        var socket = new WebSocket(urlStr);
        
        socket.onopen = function() {
            console.log('JS. Socket opened');
            unityInstance.SendMessage('WebSocketClient', 'OnWebSocketOpen');
        };
        socket.onmessage = function(e) {
            console.log('JS. Incoming message:', e.data);
            unityInstance.SendMessage('WebSocketClient', 'OnWebSocketMessage', e.data);
        };
        socket.onerror = function(e) {
            unityInstance.SendMessage('WebSocketClient', 'OnWebSocketError', e.message);
        };
        socket.onclose = function(e) {
            unityInstance.SendMessage('WebSocketClient', 'OnWebSocketClose');
        };
        window.socket = socket;
    },
    
    WebSocketSend: function (message) {
        if (window.socket) {
            var msgStr = UTF8ToString(message);
            window.socket.send(msgStr);
            console.log('JS. Send message:', message);
        }
    },
    
    WebSocketClose: function () {
        if (window.socket) {
            window.socket.close();
        }
    }
});
