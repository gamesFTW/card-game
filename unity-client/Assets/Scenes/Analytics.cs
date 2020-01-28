public class AnalyticsEventsCategory
{
    public static string App = "App";
    public static string Game = "Game";
}

public class AnalyticsEvents
{
    public static string AppRunned = "App runned";
    public static string EnteredTheGame = "Entered the game";
    public static string TurnEnded = "Turn ended";
    public static string GameEnded = "Game ended";
}

public class AnalyticsDemention
{
    public static int GameId = 1;       // [game]gameId
    public static int PlayerId = 2;     // [game]playerId
    public static int LobbyDeckId = 3;  // [lobby]deckId
    public static int GameType = 4;     // [game]gameType
}
