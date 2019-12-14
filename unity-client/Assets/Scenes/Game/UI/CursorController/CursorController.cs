using UnityEngine;

public class CursorController : MonoBehaviour
{
    public static void SetDefault()
    {
        Texture2D cursorTexture = (Texture2D)Resources.Load("Cursor_Basic2");
        Cursor.SetCursor(cursorTexture, new Vector2(19, 4), CursorMode.Auto);
    }

    public static void SetPointer()
    {
        Texture2D cursorTexture = (Texture2D)Resources.Load("Cursor_Hand");
        Cursor.SetCursor(cursorTexture, new Vector2(19, 6), CursorMode.Auto);
    }

    public static void SetAttack()
    {
        Texture2D cursorTexture = (Texture2D)Resources.Load("Cursor_Attack");
        Cursor.SetCursor(cursorTexture, new Vector2(19, 6), CursorMode.Auto);
    }

    public static void SetRangeAttack()
    {
        Texture2D cursorTexture = (Texture2D)Resources.Load("Cursor_shoot");
        Cursor.SetCursor(cursorTexture, new Vector2(5, 7), CursorMode.Auto);
    }
}
