using UnityEngine;

public class CursorController : MonoBehaviour
{
    public static void SetDefault()
    {
        Texture2D cursorTexture = (Texture2D)Resources.Load("Cursor_Basic2");
        Cursor.SetCursor(cursorTexture, new Vector2(19, 4), CursorMode.Auto);
    }
}
