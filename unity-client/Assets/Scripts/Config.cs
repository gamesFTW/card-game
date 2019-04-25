using UnityEngine;

public class Config : MonoBehaviour
{
    private static string HOST = "localhost";
    //private static string HOST = "game.ep1c.org";

    public static string GAME_SERVER_URL = "http://" + HOST + ":3000/";
    public static string LOBBY_SERVER_URL = "http://" + HOST + "/";
    public static string GAME_SERVER_SOCKET_URL = HOST;
    public static string GAME_SERVER_SOCKET_IO = HOST + ":3000/";
    public static int GAME_SERVER_SOCKET_PORT = 3002;
}
