
public class SocketIOConnection : SocketIO.SocketIOComponent
{
    protected string url = "ws://" + Config.GAME_SERVER_SOCKET_IO + "/socket.io/?EIO=4&transport=websocket";
}
