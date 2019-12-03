public class GameState
{
    static public string gameId;

    static public bool isMainPlayerFirstPlayer;

    public static string mainPlayerId = "";
    public static string enemyOfMainPlayerId = "";

    public static string playerIdWhoMakesMove;

    public static bool isMainPlayerTurn
    {
        get { return GameState.playerIdWhoMakesMove == GameState.mainPlayerId; }
    }

    public static GameData gameData;
}
