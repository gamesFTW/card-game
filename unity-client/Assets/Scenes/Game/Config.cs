﻿using UnityEngine;

public class Config : MonoBehaviour
{
    // private static string HOST = "localhost:3000/";
    // private static string HOST = "localhost:3000/";
    public static string HOST = "103.110.65.87/";

    public static string GAME_SERVER_URL = "http://" + HOST;
    public static string LOBBY_SERVER_URL = "http://" + HOST;
    public static string GAME_SERVER_SOCKET_IO = HOST;

    public static int GAME_SERVER_SOCKET_PORT = 3002;
}
